import {
  Column,
  CreateDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid', { comment: 'user_id' })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '创建人' })
  createdBy?: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true, comment: '创建时间' })
  createdTime?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '更新人' })
  updatedBy?: string;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, comment: '更新时间' })
  updatedTime?: Date;
}
