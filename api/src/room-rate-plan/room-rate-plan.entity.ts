import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Entity('room_rate_plan')
export class RoomRatePlanEntity extends BaseEntity {
  @ManyToOne(() => RoomTypeEntity)
  @JoinColumn({ name: 'room_type_id' })
  roomType?: RoomTypeEntity;

  @Column({ type: 'varchar', nullable: true, name: 'room_type_id', comment: 'room_type_id' })
  roomTypeId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '如"含双早-可取消"' })
  planName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '取消政策' })
  cancelPolicy?: string;
}
