import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as crypto from 'crypto';

import {
  AccountCreatedEvent,
  ForgotPasswordReqDto,
  ForgotPasswordResDto,
  LoginReqDto,
  LoginResDto,
  RefreshReqDto,
  RefreshResDto,
  RegisterReqDto,
  RegisterResDto,
  ResendVerifyEmailReqDto,
  ResendVerifyEmailResDto,
  ResetPasswordReqDto,
  ResetPasswordResDto,
  VerifyEmailReqDto,
  VerifyEmailResDto,
} from '@shared-ev/shared-dtos';
import {
  JwtPayloadType,
  Branded,
  JwtRefreshPayloadType,
  Uuid,
} from '@shared-ev/shared-common';

import { AccountEntity, AccountRole } from './entities/account.entity';
import { SessionEntity } from './entities/session.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SendEmailEvent } from '@shared-ev/shared-dtos';
import { AllConfigType } from './config/config.type';
import { verifyPassword } from './utils/password.util';
import { CacheKey, EmailTemplate } from '@shared-ev/shared-common';
import { createCacheKey } from './utils/cache.util';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');

type Token = Branded<
  {
    accessToken: string;
    refreshToken: string;
  },
  'token'
>;

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
    @InjectRepository(AccountEntity)
    private readonly userRepository: Repository<AccountEntity>,
    @Inject('KAFKA_CLIENT') private kafkaClient: ClientKafka,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Sign in user
   * @param dto LoginReqDto
   * @returns LoginResDto
   */
  async signIn(dto: LoginReqDto): Promise<LoginResDto> {
    const { email, password } = dto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });

    const isPasswordValid =
      user && (await verifyPassword(password, user.password));

    if (!isPasswordValid) {
      throw new RpcException({
        code: 16,
        message: 'Invalid credentials',
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = new SessionEntity({
      hash,
      userId: user.id,
    });
    await session.save();

    const token = await this.createToken({
      id: user.id,
      sessionId: session.id,
      role: user.role,
      hash,
    });

    return plainToInstance(LoginResDto, {
      userId: user.id,
      ...token,
    });
  }

  async register(dto: RegisterReqDto): Promise<RegisterResDto> {
    const isExistUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (isExistUser) {
      throw new RpcException({
        code: 6, // ALREADY_EXISTS
        message: 'Email already exists',
      });
    }

    const user = new AccountEntity({
      email: dto.email,
      password: dto.password,
    });

    await user.save();

    const event = new AccountCreatedEvent(user.id, dto.email, dto.fullName);
    this.kafkaClient.emit('account_created', event);

    const emailToken = await this.createVerificationToken({ id: user.id });
    await this.sendVerificationEmail(dto.email, emailToken);

    return plainToInstance(RegisterResDto, {
      userId: user.id,
    });
  }

  async logout(userToken: JwtPayloadType): Promise<void> {
    //TODO: add deleted session to blacklist
    await SessionEntity.delete(userToken.sessionId);
  }

  async refreshToken(dto: RefreshReqDto): Promise<RefreshResDto> {
    const { sessionId, hash } = this.verifyRefreshToken(dto.refreshToken);
    const session = await SessionEntity.findOneBy({ id: sessionId });

    if (!session || session.hash !== hash) {
      throw new RpcException({
        code: 16,
        message: 'Invalid or expired session',
      });
    }

    const user = await this.userRepository.findOneOrFail({
      where: { id: session.userId },
      select: ['id', 'role'],
    });

    const newHash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await SessionEntity.update(session.id, { hash: newHash });

    return await this.createToken({
      id: user.id,
      sessionId: session.id,
      role: user.role,
      hash: newHash,
    });
  }

  async forgotPassword(
    dto: ForgotPasswordReqDto
  ): Promise<ForgotPasswordResDto> {
    const user = await this.userRepository.findOneOrFail({
      where: { email: dto.email },
      select: ['id', 'email'],
    });

    const token = await this.createForgotPasswordToken({ id: user.id });
    await this.sendForgotPasswordEmail(user.email, token);

    return plainToInstance(ForgotPasswordResDto, {
      email: user.email,
    });
  }

  async resetPassword(dto: ResetPasswordReqDto): Promise<ResetPasswordResDto> {
    const { id } = await this.verifyForgotPasswordToken(dto.token);

    const storedToken = await this.cacheManager.get<string>(
      createCacheKey(CacheKey.FORGOT_PASSWORD, id)
    );
    if (!storedToken || storedToken !== dto.token) {
      throw new RpcException({
        code: 16,
        message: 'Invalid or expired reset token',
      });
    }

    const user = await this.userRepository.findOneOrFail({
      where: { id: id as Uuid },
    });

    user.password = dto.newPassword;
    await user.save();

    await this.cacheManager.del(createCacheKey(CacheKey.FORGOT_PASSWORD, id));

    // Revoke all sessions? Optional based on requirements.

    return plainToInstance(ResetPasswordResDto, {
      userId: user.id,
    });
  }

  async verifyEmail(dto: VerifyEmailReqDto): Promise<VerifyEmailResDto> {
    const { id } = await this.verifyVerificationToken(dto.token);

    const storedToken = await this.cacheManager.get<string>(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, id)
    );
    if (!storedToken || storedToken !== dto.token) {
      throw new RpcException({
        code: 16,
        message: 'Invalid or expired verification token',
      });
    }

    // Logic to verify user, e.g., update user.isVarified = true
    await this.cacheManager.del(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, id)
    );

    return plainToInstance(VerifyEmailResDto, {
      userId: id,
    });
  }

  async resendVerifyEmail(
    data: ResendVerifyEmailReqDto
  ): Promise<ResendVerifyEmailResDto> {
    const user = await this.userRepository.findOneOrFail({
      where: { email: data.email },
    });

    // Check rate limit using cache if needed

    const token = await this.createVerificationToken({ id: user.id });
    await this.sendVerificationEmail(user.email, token);

    return { email: data.email };
  }

  private async sendVerificationEmail(email: string, token: string) {
    const event = new SendEmailEvent(
      email,
      'Welcome to Shared EV',
      EmailTemplate.VERIFY_EMAIL,
      {
        email,
        url: `${this.configService.getOrThrow('app.clientUrl', {
          infer: true,
        })}/confirm-email?token=${token}`,
      }
    );
    this.kafkaClient.emit('email.send', event);
  }

  private async sendForgotPasswordEmail(email: string, token: string) {
    const event = new SendEmailEvent(
      email,
      'Reset Password',
      EmailTemplate.RESET_PASSWORD,
      {
        email,
        url: `${this.configService.getOrThrow('app.clientUrl', {
          infer: true,
        })}/reset-password?token=${token}`,
      }
    );
    this.kafkaClient.emit('email.send', event);
  }

  private async createToken(data: {
    id: string;
    role: AccountRole;
    sessionId: string;
    hash: string;
  }): Promise<Token> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('app.secret', { infer: true }),
          expiresIn: this.configService.getOrThrow('app.expires', {
            infer: true,
          }),
        }
      ),
      this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('app.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('app.refreshExpires', {
            infer: true,
          }),
        }
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    } as Token;
  }

  private async createVerificationToken(data: { id: string }): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        id: data.id,
      },
      {
        secret: this.configService.getOrThrow('app.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('app.confirmEmailExpires', {
          infer: true,
        }),
      }
    );
    const expiresIn = this.configService.getOrThrow<string>(
      'app.confirmEmailExpires',
      {
        infer: true,
      }
    );
    const ttl = ms(expiresIn);
    await this.cacheManager.set(
      createCacheKey(CacheKey.EMAIL_VERIFICATION, data.id),
      token,
      ttl
    );
    return token;
  }

  private async createForgotPasswordToken(data: {
    id: string;
  }): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        id: data.id,
      },
      {
        secret: this.configService.getOrThrow('app.forgotSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('app.forgotExpires', {
          infer: true,
        }),
      }
    );
    const expiresIn = this.configService.getOrThrow<string>(
      'app.forgotExpires',
      {
        infer: true,
      }
    );
    const ttl = ms(expiresIn);
    await this.cacheManager.set(
      createCacheKey(CacheKey.FORGOT_PASSWORD, data.id),
      token,
      ttl
    );
    return token;
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadType> {
    let payload: JwtPayloadType;
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('app.secret', { infer: true }),
      });
    } catch (error) {
      console.error('Error verifying access token:', error);
      throw new RpcException({
        code: 16, // UNAUTHENTICATED
        message: 'Invalid or expired token',
      });
    }

    return payload;
  }

  private verifyRefreshToken(token: string): JwtRefreshPayloadType {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('app.refreshSecret', {
          infer: true,
        }),
      });
    } catch {
      throw new RpcException({
        code: 16,
        message: 'Invalid refresh token',
      });
    }
  }

  private async verifyForgotPasswordToken(
    token: string
  ): Promise<{ id: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('app.forgotSecret', {
          infer: true,
        }),
      });
      return { id: payload.id };
    } catch {
      throw new RpcException({
        code: 16,
        message: 'Invalid reset token',
      });
    }
  }

  private async verifyVerificationToken(
    token: string
  ): Promise<{ id: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('app.confirmEmailSecret', {
          infer: true,
        }),
      });
      return { id: payload.id };
    } catch {
      throw new RpcException({
        code: 16,
        message: 'Invalid verification token',
      });
    }
  }
}
