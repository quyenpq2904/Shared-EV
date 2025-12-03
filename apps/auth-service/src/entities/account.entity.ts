import { AbstractEntity, Uuid } from '@shared-ev/shared-common';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hashPassword } from '../utils/password.util';
import { SessionEntity } from './session.entity';

export enum AccountStatus {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  BANNED = 'BANNED',
}

export enum AccountRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('account')
export class AccountEntity extends AbstractEntity {
  constructor(data?: Partial<AccountEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_id' })
  id!: Uuid;

  @Column({
    length: 50,
    nullable: true,
  })
  @Index('UQ_user_username', {
    where: '"deleted_at" IS NULL',
    unique: true,
  })
  username: string;

  @Column()
  @Index('UQ_user_email', { where: '"deleted_at" IS NULL', unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.UNVERIFIED,
  })
  status: AccountStatus;

  @Column({
    type: 'enum',
    enum: AccountRole,
    default: AccountRole.USER,
  })
  role: AccountRole;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    default: null,
  })
  deletedAt: Date;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions?: SessionEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }
}
