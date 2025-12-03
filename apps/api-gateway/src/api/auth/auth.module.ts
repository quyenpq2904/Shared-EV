import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth',
            protoPath: join(__dirname, 'proto/auth.proto'),
            url: config.get<string>('AUTH_GRPC_URL'),
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
