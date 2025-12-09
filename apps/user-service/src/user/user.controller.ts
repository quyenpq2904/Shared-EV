import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import {
  AccountCreatedEvent,
  ListUserReqDto,
  UserResDto,
} from '@shared-ev/shared-dtos';
import { OffsetPaginatedDto, Uuid } from '@shared-ev/shared-common';

interface FindOneUserRequest {
  id: string;
}

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @EventPattern('account_created')
  async handleAccountCreated(@Payload() data: AccountCreatedEvent) {
    console.log('User Service: Nhận data ->', data);

    await this.userService.create({
      id: data.accountId,
      email: data.email,
      fullName: data.fullName,
    });

    console.log('User Service: Đã lưu Profile thành công!');
  }

  @GrpcMethod('UserService', 'FindOne')
  async findOne(data: FindOneUserRequest): Promise<UserResDto> {
    return await this.userService.findOne(data.id as Uuid);
  }

  @GrpcMethod('UserService', 'FindAll')
  async findAll(data: ListUserReqDto): Promise<OffsetPaginatedDto<UserResDto>> {
    return await this.userService.findAll(data);
  }
}
