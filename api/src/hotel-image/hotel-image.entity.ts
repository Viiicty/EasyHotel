import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';

@Entity('hotel_image')
export class HotelImageEntity extends BaseEntity {
  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'varchar', nullable: true, name: 'hotel_id', comment: 'hotel_id' })
  hotelId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '图片地址' })
  url?: string;

  @Column({ type: 'int', nullable: true, comment: '左右滑动顺序' })
  sortNo?: number;
}
