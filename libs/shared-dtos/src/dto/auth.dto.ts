import {
  EmailField,
  PasswordField,
  StringField,
  TokenField,
} from '@shared-ev/shared-common';
import { Exclude, Expose } from 'class-transformer';

export class LoginReqDto {
  @EmailField()
  email: string;

  @PasswordField()
  password: string;
}

@Exclude()
export class LoginResDto {
  @Expose()
  @StringField()
  userId: string;

  @Expose()
  @StringField()
  accessToken: string;

  @Expose()
  @StringField()
  refreshToken: string;
}

export class RegisterReqDto {
  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @StringField()
  fullName: string;
}

@Exclude()
export class RegisterResDto {
  @Expose()
  @StringField()
  userId: string;
}

export class RefreshReqDto {
  @TokenField()
  refreshToken!: string;
}

export class RefreshResDto {
  @StringField()
  accessToken!: string;

  @StringField()
  refreshToken!: string;
}

export class ForgotPasswordReqDto {
  @EmailField()
  email!: string;
}

@Exclude()
export class ForgotPasswordResDto {
  @Expose()
  @EmailField()
  email!: string;
}

export class ResetPasswordReqDto {
  @StringField()
  token!: string;

  @PasswordField()
  newPassword!: string;
}

@Exclude()
export class ResetPasswordResDto {
  @Expose()
  @StringField()
  userId!: string;
}

@Exclude()
export class VerifyEmailResDto {
  @Expose()
  @EmailField()
  email!: string;

  @Expose()
  @StringField()
  userId!: string;
}

export class VerifyEmailReqDto {
  @StringField()
  token!: string;
}

export class ResendVerifyEmailReqDto {
  @EmailField()
  email!: string;
}

@Exclude()
export class ResendVerifyEmailResDto {
  @Expose()
  @EmailField()
  email!: string;
}
