import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('inventory_hold')
@Index(['holdToken'], { unique: true })
export class InventoryHoldEntity extends BaseEntity {
  @ManyToOne(() => RoomTypeEntity)
  @JoinColumn({ name: 'room_type_id' })
  roomType?: RoomTypeEntity;

  @Column({ type: 'uuid', nullable: true, name: 'room_type_id', comment: '房型ID' })
  roomTypeId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true, name: 'hold_token', comment: '锁定令牌' })
  holdToken?: string;

  @Column({ type: 'date', nullable: true, comment: '入住日期' })
  checkIn?: Date;

  @Column({ type: 'date', nullable: true, comment: '离店日期' })
  checkOut?: Date;

  @Column({ type: 'int', nullable: true, comment: '数量' })
  qty?: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '状态（ACTIVE/CONVERTED/EXPIRED）' })
  status?: string;

  @Column({ type: 'timestamp', nullable: true, comment: '过期时间' })
  expireAt?: Date;
}
