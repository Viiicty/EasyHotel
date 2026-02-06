import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { UserEntity } from '../user/user.entity';

@Entity('hotel_submission')
export class HotelSubmissionEntity extends BaseEntity {
  @ManyToOne(() => HotelEntity)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;

  @Column({ type: 'varchar', nullable: true, name: 'hotel_id', comment: 'hotel_id' })
  hotelId?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'merchant_id' })
  merchant?: UserEntity;

  @Column({ type: 'varchar', nullable: true, name: 'merchant_id', comment: 'merchant_id' })
  merchantId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'payloadJson', comment: '存酒店+房型+图片等"待审核快照"' })
  payloadJson?: string;

  @Column({ type: 'varchar', length: 32, nullable: true, name: 'status', comment: '待审核/通过/拒绝' })
  status?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'rejectReason', comment: '不通过原因' })
  rejectReason?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: UserEntity;

  @Column({ type: 'varchar', nullable: true, name: 'reviewed_by', comment: '审核人ID' })
  reviewedBy?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'reviewedAt', comment: '审核时间' })
  reviewedAt?: Date;
}
