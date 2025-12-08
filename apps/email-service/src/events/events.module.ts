import { Module } from '@nestjs/common';
import { EmailEventsController } from './email-events.controller';
import { BackgroundModule } from '../background/background.module';

@Module({
  imports: [BackgroundModule],
  controllers: [EmailEventsController],
})
export class EventsModule {}
