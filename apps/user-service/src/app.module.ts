import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserEntity } from './entities/user.entity';
import { appConfig } from './config/app.config';
import { databaseConfig } from './database/config/database.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';

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
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AppController],
})
export class AppModule {}
