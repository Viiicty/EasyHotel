import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('room_type_picture')
export class RoomtypePictureEntity extends BaseEntity {
  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'varchar', nullable: true, name: 'hotel_id', comment: '酒店ID' })
  hotelId?: string;

  @ManyToOne(() => RoomTypeEntity)
  @JoinColumn({ name: 'room_type_id' })
  roomType?: RoomTypeEntity;

  @Column({ type: 'varchar', nullable: true, name: 'room_type_id', comment: '房型ID' })
  roomTypeId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '图片地址' })
  url?: string;

  @Column({ type: 'int', nullable: true, comment: '排序号' })
  sortNo?: number;
}
