import 'tslib';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ApiGateway');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`API Gateway is running on: http://localhost:${port}`);
}

bootstrap();
