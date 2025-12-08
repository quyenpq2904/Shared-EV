import process from 'node:process';
import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AppConfig } from './app-config.type';
import { validateConfig } from '@shared-ev/shared-common';

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
  MAIL_HOST: string;

  @IsString()
  @IsOptional()
  MAIL_PORT: string;

  @IsString()
  @IsOptional()
  MAIL_USER: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD: string;

  @IsString()
  @IsOptional()
  DEFAULT_EMAIL: string;

  @IsString()
  @IsOptional()
  DEFAULT_NAME: string;

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
    mailHost: process.env.MAIL_HOST!,
    mailPort: process.env.MAIL_PORT
      ? parseInt(process.env.MAIL_PORT, 10)
      : undefined,
    mailUser: process.env.MAIL_USER!,
    mailPassword: process.env.MAIL_PASSWORD!,
    defaultEmail: process.env.DEFAULT_EMAIL!,
    defaultName: process.env.DEFAULT_NAME!,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : undefined,
  };
});
