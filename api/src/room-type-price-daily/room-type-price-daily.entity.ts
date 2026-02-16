import { Column, Entity, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('room_type_price_daily')
@Index(['hotelId', 'date'])
@Index(['roomTypeId', 'date'])
@Unique(['hotelId', 'roomTypeId', 'date'])
export class RoomTypePriceDailyEntity extends BaseEntity {
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

  @Column({ type: 'date', nullable: false, comment: '日期' })
  date?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, comment: '单晚价格（元）' })
  price?: number;
}
