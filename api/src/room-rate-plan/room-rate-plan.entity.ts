import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('room_rate_plan')
@Index(['roomTypeId', 'status'])
export class RoomRatePlanEntity extends BaseEntity {
  @ManyToOne(() => RoomTypeEntity)
  @JoinColumn({ name: 'room_type_id' })
  roomType?: RoomTypeEntity;

  @Column({ type: 'uuid', nullable: true, name: 'room_type_id', comment: '房型ID' })
  roomTypeId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '计划名称（如：含早·可取消）' })
  planName?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '默认价格' })
  basePrice?: number;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '货币（CNY）' })
  currency?: string;

  @Column({ type: 'boolean', nullable: true, comment: '是否含早餐' })
  breakfastIncluded?: boolean;

  @Column({ type: 'boolean', nullable: true, comment: '是否可退款' })
  refundable?: boolean;

  @Column({ type: 'int', nullable: true, comment: '免费取消前小时数' })
  freeCancelBeforeHours?: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '取消政策' })
  cancelPolicy?: string;

  @Column({ type: 'int', nullable: true, comment: '最少入住晚数' })
  minNights?: number;

  @Column({ type: 'int', nullable: true, comment: '最多入住晚数' })
  maxNights?: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '状态（ACTIVE/INACTIVE）' })
  status?: string;

  @Column({ type: 'int', nullable: true, comment: '优先级' })
  priority?: number;
}
