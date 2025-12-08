import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
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

  private async handleSendEmail(data: any) {
    // TODO: Use MailerService to send email
    this.logger.log(
      `Sending email to ${data.to} with subject "${data.subject}"`
    );
    // mocking delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.logger.log(`Email sent to ${data.to}`);
  }
}
