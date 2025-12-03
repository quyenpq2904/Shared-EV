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
  KAFKA_GROUP_ID: string;
}

export const appConfig = registerAs<AppConfig>('app', () => {
  console.info(`Register AppConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  const port = process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : 3002;

  return {
    name: process.env.APP_NAME || 'user-service',
    port,
    kafkaBroker: process.env.KAFKA_BROKER || 'localhost:29092',
    kafkaGroupId: process.env.KAFKA_GROUP_ID || 'user-service-group',
  };
});
