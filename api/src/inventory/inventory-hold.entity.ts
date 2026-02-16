import { Column, Entity, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('inventory_hold')
@Index(['holdToken'], { unique: true })
@Index(['hotelId', 'status'])
@Index(['roomTypeId', 'status'])
@Index(['expireAt'])
export class InventoryHoldEntity extends BaseEntity {
  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'uuid', nullable: false, name: 'hotel_id', comment: '酒店ID' })
  hotelId?: string;

  @ManyToOne(() => RoomTypeEntity)
  @JoinColumn({ name: 'room_type_id' })
  roomType?: RoomTypeEntity;

  @Column({ type: 'uuid', nullable: false, name: 'room_type_id', comment: '房型ID' })
  roomTypeId?: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true, name: 'hold_token', comment: '锁定令牌（唯一标识）' })
  holdToken?: string;

  @Column({ type: 'date', nullable: false, comment: '入住日期' })
  checkIn?: Date;

  @Column({ type: 'date', nullable: false, comment: '离店日期' })
  checkOut?: Date;

  @Column({ type: 'int', nullable: false, comment: '锁定数量' })
  qty?: number;

  @Column({ type: 'varchar', length: 20, nullable: false, comment: '状态（ACTIVE/CONVERTED/EXPIRED/CANCELLED）' })
  status?: string;

  @Column({ type: 'timestamp', nullable: false, comment: '过期时间（15分钟后）' })
  expireAt?: Date;

  @Column({ type: 'uuid', nullable: true, name: 'order_id', comment: '订单ID' })
  orderId?: string;
}
