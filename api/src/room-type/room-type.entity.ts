import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';

@Entity('room_type')
export class RoomTypeEntity extends BaseEntity {
  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'varchar', nullable: true, name: 'hotel_id', comment: 'hotel_id' })
  hotelId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '房型名称' })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '房型规格' })
  bedType?: string;

  @Column({ type: 'varchar', length: 32, nullable: true, comment: '是否含早' })
  breakfast?: string;

  @Column({ type: 'decimal', precision: 24, scale: 6, nullable: true, comment: '房间大小' })
  areaSqm?: number;

  @Column({ type: 'int', nullable: true, comment: '最多可入住人数' })
  maxGuests?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0, comment: '默认价格（元）' })
  defaultPrice?: number;

  @Column({ type: 'int', nullable: true, default: 0, comment: '默认库存量' })
  defaultInventory?: number;

  @Column({ type: 'varchar',nullable: true, comment: '审核状态' })
  status: string;
}


