import 'tslib';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('ApiGateway');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://shared-ev.quyenpq.work'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    exposedHeaders: '*',
  });

  const config = new DocumentBuilder()
    .setTitle('Shared-EV')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Shared-EV',
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`API Gateway is running on: http://localhost:${port}`);
}

bootstrap();
