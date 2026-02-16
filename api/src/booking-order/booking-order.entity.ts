import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { UserEntity } from '../user/user.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('booking_order')
export class BookingOrderEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '订单编号' })
  orderNo?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ type: 'varchar', nullable: true, name: 'user_id', comment: 'user_id' })
  userId?: string;

  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'varchar', nullable: true, name: 'hotel_id', comment: 'hotel_id' })
  hotelId?: string;

  @ManyToOne(() => RoomTypeEntity)
  @JoinColumn({ name: 'room_type_id' })
  roomType?: RoomTypeEntity;

  @Column({ type: 'varchar', nullable: true, name: 'room_type_id', comment: 'room_type_id' })
  roomTypeId?: string;

  @Column({ type: 'timestamp', nullable: true, comment: '入住日期' })
  checkinDate?: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '退房日期' })
  checkoutDate?: Date;

  @Column({ type: 'int', nullable: true, comment: '晚数' })
  nights?: number;

  @Column({ type: 'int', nullable: true, comment: '间数' })
  rooms?: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '入住人' })
  guestName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '入住人手机号' })
  guestPhone?: string;

  @Column({ type: 'varchar', length: 18, nullable: true, comment: '入住人身份证号' })
  idCard?: string;

  @Column({ type: 'decimal', precision: 24, scale: 6, nullable: true, comment: '总价' })
  totalAmount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '成交单价快照' })
  unitPrice?: number;

  @Column({ type: 'jsonb', nullable: true, comment: '按天价格明细' })
  priceDetail?: any;

  @Column({ type: 'varchar', length: 32, nullable: true, comment: '订单状态' })
  status?: string;
}
