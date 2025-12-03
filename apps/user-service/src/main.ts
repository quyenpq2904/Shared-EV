import 'tslib';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const logger = new Logger('UserService');

  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService<AllConfigType>);

  const brokers = [
    configService.getOrThrow('app.kafkaBroker', { infer: true }),
  ];
  const groupId = configService.getOrThrow('app.kafkaGroupId', { infer: true });

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: brokers,
        },
        consumer: {
          groupId: groupId,
        },
      },
    }
  );

  await appContext.close();
  await app.listen();

  logger.log(`User Service is listening on Kafka Brokers: ${brokers}`);
  logger.log(`Consumer Group ID: ${groupId}`);
}

bootstrap();
