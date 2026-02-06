import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';

@Entity('home_banner')
export class HomeBannerEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '可做分城市 Banner' })
  cityCode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '' })
  imageUrl?: string;

  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'varchar', nullable: true, comment: 'hotel_id' })
  hotelId?: string;

  @Column({ type: 'int', nullable: true, comment: '排序' })
  sortNo?: number;

  @Column({ type: 'timestamp', nullable: true, comment: '投放开始时间' })
  startAt?: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '投放结束时间' })
  endAt?: Date;

  @Column({ type: 'varchar', length: 1, nullable: true, comment: '上/下线状态' })
  status?: string;
}
