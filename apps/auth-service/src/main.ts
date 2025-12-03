import 'tslib';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { AllConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);
  const logger = new Logger('AuthService');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, 'proto/auth.proto'),
      url: configService.get<string>('app.grpcUrl', { infer: true }),
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('app.port', { infer: true }) || 3001;
  await app.listen(port);

  logger.log(`Auth Service is running on port ${port}`);
  logger.log(
    `gRPC Server is listening on ${configService.get('app.grpcUrl', {
      infer: true,
    })}`
  );
}

bootstrap();
