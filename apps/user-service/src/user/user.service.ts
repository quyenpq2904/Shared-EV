import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { OffsetPaginatedDto, paginate, Uuid } from '@shared-ev/shared-common';
import { plainToInstance } from 'class-transformer';
import { ListUserReqDto, UserResDto } from '@shared-ev/shared-dtos';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findOne(id: Uuid): Promise<UserResDto> {
    if (!id) {
      throw new Error('id is required');
    }
    const user = await this.userRepository.findOneByOrFail({ id });
    return user.toDto(UserResDto);
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  async findAll(
    reqDto: ListUserReqDto
  ): Promise<OffsetPaginatedDto<UserResDto>> {
    const query = this.userRepository.createQueryBuilder('user');
    if (reqDto.q) {
      query.where(
        new Brackets((qb) => {
          qb.where('user.username ILIKE :q', { q: `%${reqDto.q}%` })
            .orWhere('user.fullName ILIKE :q', { q: `%${reqDto.q}%` })
            .orWhere('user.email ILIKE :q', { q: `%${reqDto.q}%` });
        })
      );
    }
    query.orderBy('user.createdAt', 'DESC');
    const [users, metaDto] = await paginate<UserEntity>(query, reqDto, {
      skipCount: false,
      takeAll: false,
    });
    return new OffsetPaginatedDto(plainToInstance(UserResDto, users), metaDto);
  }
}
