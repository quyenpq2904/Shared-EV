import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { SendEmailEvent } from '@shared-ev/shared-dtos';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendEmailEvent, any, string>): Promise<any> {
    this.logger.log(
      `Processing job ${job.name} with data: ${JSON.stringify(job.data)}`
    );

    switch (job.name) {
      case 'send-email':
        await this.handleSendEmail(job.data);
        break;
      // Add other job types here if needed (e.g. for cron jobs)
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSendEmail(data: SendEmailEvent) {
    try {
      this.logger.log(
        `Sending email to ${data.to} with subject "${data.subject}"`
      );
      await this.mailService.sendMail({
        to: data.to,
        subject: data.subject,
        template: data.template,
        context: data.context,
      });
      this.logger.log(`Email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${data.to}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
