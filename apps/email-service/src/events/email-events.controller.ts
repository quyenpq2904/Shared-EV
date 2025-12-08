import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailQueueService } from '../background/services/email-queue.service';
import { SendEmailEvent } from '@shared-ev/shared-dtos';

@Controller()
export class EmailEventsController {
  constructor(private readonly emailQueueService: EmailQueueService) {}

  @EventPattern('email.send')
  async handleSendEmailEvent(@Payload() data: SendEmailEvent) {
    console.log('Received email.send event', data);
    await this.emailQueueService.addEmailJob(data);
  }
}
