import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AllConfigType } from '../config/config.type';
import { MailService } from './mail.service';
import * as path from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        transport: {
          host: configService.getOrThrow('app.mailHost', { infer: true }),
          port: configService.getOrThrow('app.mailPort', { infer: true }),
          secure: configService.get('app.mailPort', { infer: true }) === 465,
          auth: {
            user: configService.getOrThrow('app.mailUser', { infer: true }),
            pass: configService.getOrThrow('app.mailPassword', { infer: true }),
          },
        },
        defaults: {
          from: `"${configService.getOrThrow('app.defaultName', {
            infer: true,
          })}" <${configService.getOrThrow('app.defaultEmail', {
            infer: true,
          })}>`,
        },
        template: {
          dir: path.join(__dirname, '..', 'assets'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
