import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';

@Entity('hotel_cover')
export class HotelCoverEntity extends BaseEntity {
  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'varchar', nullable: false, name: 'hotel_id', comment: 'hotel_id' })
  hotelId: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '图片url' })
  url?: string;
}
