import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { RegisterDto, AccountCreatedEvent } from '@shared-ev/shared-dtos';
import { AccountEntity } from './entities/account.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AccountEntity) private repo: Repository<AccountEntity>,
    @Inject('KAFKA_CLIENT') private kafkaClient: ClientKafka
  ) {}

  async register(data: RegisterDto) {
    const exists = await this.repo.findOneBy({ email: data.email });
    if (exists) {
      return { status: 'Failed', error: 'Email already exists', userId: null };
    }

    const newAccount = this.repo.create({
      email: data.email,
      password: data.password,
    });

    const savedAccount = await this.repo.save(newAccount);

    const event = new AccountCreatedEvent(
      savedAccount.id,
      data.email,
      data.fullName
    );
    this.kafkaClient.emit('account_created', event);

    return { status: 'Success', userId: savedAccount.id, error: null };
  }
}
