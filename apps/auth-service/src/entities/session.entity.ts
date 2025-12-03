import { AbstractEntity, Uuid } from '@shared-ev/shared-common';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { AccountEntity } from './account.entity';

@Entity('session')
export class SessionEntity extends AbstractEntity {
  constructor(data?: Partial<SessionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_session_id',
  })
  id!: Uuid;

  @Column({
    name: 'hash',
    type: 'varchar',
    length: 255,
  })
  hash!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: Uuid;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_session_user',
  })
  @ManyToOne(() => AccountEntity, (acc) => acc.sessions)
  user!: Relation<AccountEntity>;
}
