import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('room_type_inventory_daily')
@Index(['roomTypeId', 'd'])
export class RoomTypeInventoryDailyEntity extends BaseEntity {
  @ManyToOne(() => RoomTypeEntity)
  @JoinColumn({ name: 'room_type_id' })
  roomType?: RoomTypeEntity;

  @Column({ type: 'uuid', nullable: true, name: 'room_type_id', comment: '房型ID' })
  roomTypeId?: string;

  @Column({ type: 'date', nullable: true, comment: '日期' })
  d?: Date;

  @Column({ type: 'int', nullable: true, comment: '总库存量' })
  totalQty?: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: '已使用量' })
  usedQty?: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: '锁定量' })
  holdQty?: number;

  @Column({ type: 'timestamp', nullable: true, comment: '更新时间' })
  updatedAt?: Date;
}
