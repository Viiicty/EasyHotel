import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RoomRatePlanEntity } from '../room-rate-plan/room-rate-plan.entity';

@Entity('room_price_calendar')
export class RoomPriceCalendarEntity extends BaseEntity {
  @ManyToOne(() => RoomRatePlanEntity)
  @JoinColumn({ name: 'rate_plan_id' })
  ratePlan?: RoomRatePlanEntity;

  @Column({ type: 'varchar', nullable: true, name: 'rate_plan_id', comment: 'rate_plan_id' })
  ratePlanId?: string;

  @Column({ type: 'timestamp', nullable: true, comment: '日期' })
  date?: Date;

  @Column({ type: 'decimal', precision: 24, scale: 6, nullable: true, comment: '单晚价格' })
  price?: number;

  @Column({ type: 'int', nullable: true, comment: '当日可售库存' })
  inventory?: number;
}
