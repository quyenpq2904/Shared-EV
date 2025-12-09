import { Controller, Get, Inject, OnModuleInit, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { UserResDto, ListUserReqDto } from '@shared-ev/shared-dtos';
import { OffsetPaginatedDto, Uuid } from '@shared-ev/shared-common';
import { ApiAuth } from '../../decorators/http-decorators';
import { CurrentUser } from '../../decorators/current-user.decorator';

interface UserServiceGrpc {
  findOne(data: { id: string }): Observable<UserResDto>;
  findAll(data: ListUserReqDto): Observable<OffsetPaginatedDto<UserResDto>>;
}

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
export class UserController implements OnModuleInit {
  private userService: UserServiceGrpc;

  constructor(@Inject('USER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceGrpc>('UserService');
  }

  @Get('me')
  @ApiAuth({
    type: UserResDto,
    summary: 'Get current user',
  })
  async getCurrentUser(@CurrentUser('id') userId: Uuid): Promise<UserResDto> {
    return await lastValueFrom(this.userService.findOne({ id: userId }));
  }

  @Get()
  @ApiAuth({
    type: UserResDto,
    summary: 'List users',
    isPaginated: true,
  })
  async findAllUsers(
    @Query() reqDto: ListUserReqDto
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    return await lastValueFrom(this.userService.findAll(reqDto));
  }
}
