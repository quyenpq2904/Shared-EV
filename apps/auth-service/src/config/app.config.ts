import process from 'node:process';
import { registerAs } from '@nestjs/config';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { AppConfig } from './app-config.type';
import { IsMs, validateConfig } from '@shared-ev/shared-common';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  APP_NAME: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  @IsOptional()
  KAFKA_BROKER: string;

  @IsString()
  @IsOptional()
  GRPC_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  FORGOT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  FORGOT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  CONFIRM_EMAIL_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  CONFIRM_EMAIL_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number;
}

export const appConfig = registerAs<AppConfig>('app', () => {
  console.info(`Register AppConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  const port = process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : 3001;

  return {
    name: process.env.APP_NAME || 'app',
    port,
    kafkaBroker: process.env.KAFKA_BROKER!,
    grpcUrl: process.env.GRPC_URL!,
    secret: process.env.JWT_SECRET!,
    expires: process.env.JWT_TOKEN_EXPIRES_IN!,
    refreshSecret: process.env.REFRESH_SECRET!,
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES_IN!,
    forgotSecret: process.env.FORGOT_SECRET!,
    forgotExpires: process.env.FORGOT_TOKEN_EXPIRES_IN!,
    confirmEmailSecret: process.env.CONFIRM_EMAIL_SECRET!,
    confirmEmailExpires: process.env.CONFIRM_EMAIL_TOKEN_EXPIRES_IN!,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : undefined,
  };
});
