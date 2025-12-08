import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';
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
  VerifyEmailReqDto,
  VerifyEmailResDto,
} from '@shared-ev/shared-dtos';
import { JwtPayloadType } from '@shared-ev/shared-common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('AuthService', 'Register')
  register(data: RegisterReqDto): Promise<RegisterResDto> {
    return this.appService.register(data);
  }

  @GrpcMethod('AuthService', 'SignIn')
  signIn(data: LoginReqDto): Promise<LoginResDto> {
    return this.appService.signIn(data);
  }

  @GrpcMethod('AuthService', 'Logout')
  logout(data: JwtPayloadType): Promise<void> {
    return this.appService.logout(data);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  refreshToken(data: RefreshReqDto): Promise<RefreshResDto> {
    return this.appService.refreshToken(data);
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  forgotPassword(data: ForgotPasswordReqDto): Promise<ForgotPasswordResDto> {
    return this.appService.forgotPassword(data);
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  resetPassword(data: ResetPasswordReqDto): Promise<ResetPasswordResDto> {
    return this.appService.resetPassword(data);
  }

  @GrpcMethod('AuthService', 'VerifyEmail')
  verifyEmail(data: VerifyEmailReqDto): Promise<VerifyEmailResDto> {
    return this.appService.verifyEmail(data);
  }

  @GrpcMethod('AuthService', 'ResendVerifyEmail')
  resendVerifyEmail(
    data: ResendVerifyEmailReqDto
  ): Promise<ResendVerifyEmailResDto> {
    return this.appService.resendVerifyEmail(data);
  }
}
