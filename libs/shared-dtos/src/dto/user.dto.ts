import {
  ClassField,
  EmailField,
  OffsetPageOptionsDto,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
  UUIDField,
} from '@shared-ev/shared-common';
import { Exclude, Expose } from 'class-transformer';
import { IsPhoneNumber } from 'class-validator';

@Exclude()
export class UserResDto {
  @UUIDField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  username: string;

  @EmailField()
  @Expose()
  email: string;

  @StringField()
  @Expose()
  fullName: string;

  @StringFieldOptional()
  @IsPhoneNumber('VN')
  @Expose()
  phoneNumber?: string;

  @URLFieldOptional()
  @Expose()
  avatar?: string;

  @StringFieldOptional()
  @Expose()
  bio?: string;

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;

  @ClassField(() => Date)
  @Expose()
  updatedAt: Date;
}

export class ListUserReqDto extends OffsetPageOptionsDto {}
