import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { BackgroundModule } from './background/background.module';
import { EventsModule } from './events/events.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    MailModule,
    BackgroundModule,
    EventsModule,
  ],
})
export class AppModule {}
