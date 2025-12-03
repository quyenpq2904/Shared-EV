import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountEntity } from './entities/account.entity';
import { SessionEntity } from './entities/session.entity';
import { appConfig } from './config/app.config';
import { databaseConfig } from './database/config/database.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return new DataSource(options).initialize();
      },
    }),
    TypeOrmModule.forFeature([AccountEntity, SessionEntity]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService<AllConfigType>) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [
                configService.getOrThrow('app.kafkaBroker', { infer: true }),
              ],
            },
            consumer: {
              groupId: 'auth-producer-group',
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
