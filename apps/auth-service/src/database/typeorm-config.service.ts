import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AllConfigType } from '../config/config.type';
import { TypeOrmCustomLogger } from '@shared-ev/shared-common';

@Injectable()
export class TypeOrmConfigService implements TypeOrmConfigService {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get('database.type', { infer: true }),
      host: this.configService.get('database.host', { infer: true }),
      port: this.configService.get('database.port', { infer: true }),
      username: this.configService.get('database.username', { infer: true }),
      password: this.configService.get('database.password', { infer: true }),
      database: this.configService.get('database.name', { infer: true }),
      synchronize: this.configService.get('database.synchronize', {
        infer: true,
      }),
      dropSchema: false,
      keepConnectionAlive: true,
      autoLoadEntities: true,
      logger: TypeOrmCustomLogger.getInstance('default', [
        'error',
        'warn',
        'query',
        'schema',
      ]),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    } as TypeOrmModuleOptions;
  }
}
