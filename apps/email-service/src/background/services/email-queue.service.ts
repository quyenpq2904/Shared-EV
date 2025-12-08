import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendEmailEvent } from '@shared-ev/shared-dtos';

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async addEmailJob(data: SendEmailEvent) {
    await this.emailQueue.add('send-email', data);
  }

  async addCronJob(name: string, cron: string, data: Record<string, any> = {}) {
    await this.emailQueue.add(name, data, {
      repeat: {
        pattern: cron,
      },
    });
  }
}
