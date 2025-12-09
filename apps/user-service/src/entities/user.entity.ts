import { AbstractEntity } from '@shared-ev/shared-common';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserEntity extends AbstractEntity {
  constructor(data?: Partial<UserEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ default: '', name: 'phone_number' })
  phoneNumber?: string;

  @Column({ default: '' })
  bio?: string;

  @Column({ default: '' })
  avatar?: string;
}
