import 'tslib';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const logger = new Logger('UserService');

  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService<AllConfigType>);

  const brokers = [
    configService.getOrThrow('app.kafkaBroker', { infer: true }),
  ];
  const groupId = configService.getOrThrow('app.kafkaGroupId', { infer: true });

  // Hybrid application approach
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: brokers,
      },
      consumer: {
        groupId: groupId,
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, 'proto/user.proto'),
      url: configService.get('app.grpcUrl', { infer: true }),
    },
  });

  await app.startAllMicroservices();

  await app.init();

  logger.log(`User Service is listening on Kafka Brokers: ${brokers}`);
  logger.log(`Consumer Group ID: ${groupId}`);
}

bootstrap();
