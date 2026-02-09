import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RoomRatePlanEntity } from './room-rate-plan.entity';

@Entity('room_rate_plan_daily')
@Index(['ratePlanId', 'd'])
export class RoomRatePlanDailyEntity extends BaseEntity {
  @ManyToOne(() => RoomRatePlanEntity)
  @JoinColumn({ name: 'rate_plan_id' })
  ratePlan?: RoomRatePlanEntity;

  @Column({ type: 'uuid', nullable: true, name: 'rate_plan_id', comment: '房价计划ID' })
  ratePlanId?: string;

  @Column({ type: 'date', nullable: true, comment: '日期' })
  d?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '价格' })
  price?: number;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '货币（CNY）' })
  currency?: string;
}
