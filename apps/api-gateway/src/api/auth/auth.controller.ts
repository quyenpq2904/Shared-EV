import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Query,
} from '@nestjs/common';
import {
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
  VerifyEmailResDto,
} from '@shared-ev/shared-dtos';
import { JwtPayloadType } from '@shared-ev/shared-common';
import { lastValueFrom, Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiPublic } from '../../decorators/http-decorators';
import { CurrentUser } from '../../decorators/current-user.decorator';

interface AuthServiceGrpc {
  register(data: RegisterReqDto): Observable<RegisterResDto>;
  signIn(data: LoginReqDto): Observable<LoginResDto>;
  logout(data: JwtPayloadType): Observable<void>;
  refreshToken(data: RefreshReqDto): Observable<RefreshResDto>;
  forgotPassword(data: ForgotPasswordReqDto): Observable<ForgotPasswordResDto>;
  resetPassword(data: ResetPasswordReqDto): Observable<ResetPasswordResDto>;
  verifyEmail(data: { token: string }): Observable<VerifyEmailResDto>;
  resendVerifyEmail(
    data: ResendVerifyEmailReqDto
  ): Observable<ResendVerifyEmailResDto>;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  @ApiPublic({
    type: LoginResDto,
    summary: 'Sign in',
  })
  @Post('login')
  async signIn(@Body() loginDto: LoginReqDto): Promise<LoginResDto> {
    return await lastValueFrom(this.authService.signIn(loginDto));
  }

  @ApiPublic({
    type: RegisterResDto,
    summary: 'Register',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterReqDto): Promise<RegisterResDto> {
    return await lastValueFrom(this.authService.register(registerDto));
  }

  @ApiAuth({
    summary: 'Logout',
    errorResponses: [400, 401, 403, 500],
  })
  @Post('logout')
  async logout(@CurrentUser() userToken: JwtPayloadType): Promise<void> {
    await lastValueFrom(this.authService.logout(userToken));
  }

  @ApiPublic({
    type: RefreshResDto,
    summary: 'Refresh token',
  })
  @Post('refresh')
  async refresh(@Body() dto: RefreshReqDto): Promise<RefreshResDto> {
    return await lastValueFrom(this.authService.refreshToken(dto));
  }

  @ApiPublic({
    type: ForgotPasswordResDto,
    summary: 'Forgot password',
  })
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordReqDto
  ): Promise<ForgotPasswordResDto> {
    return await lastValueFrom(this.authService.forgotPassword(dto));
  }

  @ApiPublic({
    type: ResetPasswordResDto,
    summary: 'Reset password',
  })
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordReqDto
  ): Promise<ResetPasswordResDto> {
    return await lastValueFrom(this.authService.resetPassword(dto));
  }

  @ApiPublic({
    type: VerifyEmailResDto,
    summary: 'Verify user email',
  })
  @Get('verify/email')
  async verifyEmail(@Query('token') token: string): Promise<VerifyEmailResDto> {
    if (!token) {
      throw new BadRequestException('Token is required.');
    }
    return await lastValueFrom(this.authService.verifyEmail({ token }));
  }

  @ApiPublic({
    type: ResendVerifyEmailResDto,
    summary: 'Resend verify email',
  })
  @Post('verify/email/resend')
  async resendVerifyEmail(
    @Body() dto: ResendVerifyEmailReqDto
  ): Promise<ResendVerifyEmailResDto> {
    return await lastValueFrom(this.authService.resendVerifyEmail(dto));
  }
}
