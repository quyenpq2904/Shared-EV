import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountCreatedEvent } from '@shared-ev/shared-dtos';
import { UserEntity } from './entities/user.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserEntity) private repo: Repository<UserEntity>
  ) {}

  @EventPattern('account_created')
  async handleAccountCreated(@Payload() data: AccountCreatedEvent) {
    console.log('User Service: Nhận data ->', data);

    const user = this.repo.create({
      id: data.accountId,
      email: data.email,
      fullName: data.fullName,
    });

    await this.repo.save(user);
    console.log('User Service: Đã lưu Profile thành công!');
  }
}
