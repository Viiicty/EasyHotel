import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { UserEntity } from '../user/user.entity';

@Entity('hotel')
export class HotelEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'merchant_id' })
  merchant?: UserEntity;

  @Column({ type: 'varchar', nullable: true, name: 'merchant_id', comment: 'user_id' })
  merchantId?: string;

  @Column({ type: 'varchar', length: 255, comment: '酒店中文名' })
  nameZh: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '酒店英文名' })
  nameEn?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '城市' })
  cityCode?: string;

  @Column({ type: 'varchar', length: 255, comment: '酒店地址' })
  address: string;

  @Column({ type: 'int', nullable: true, comment: '星级' })
  starLevel?: number;

  @Column({ type: 'timestamp', comment: '开业时间' })
  openedDate: Date;

  @Column({ type: 'decimal', precision: 24, scale: 6, nullable: true, comment: '精度' })
  lat?: number;

  @Column({ type: 'decimal', precision: 24, scale: 6, nullable: true, comment: '纬度' })
  lng?: number;

  @Column({ type: 'varchar', comment: '状态' })
  status: string;

  @Column({ type: 'int', nullable: true, comment: '最低价格' })
  minPrice?: number;

  @Column({ type: 'json', nullable: true, comment: '酒店设施' })
  facilities?: string[];

  @Column({ type: 'json', nullable: true, comment: '快捷标签' })
  tags?: string[];

  @Column({ type: 'timestamp', nullable: true, comment: '入住时间' })
  checkInTime?: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '离店时间' })
  checkOutTime?: Date;

  @Column({ type: 'varchar', nullable: true, comment: '取消政策' })
  cancelPolicy?: string;

  @Column({ type: 'varchar', nullable: true, comment: '修改政策' })
  changePolicy?: string;

  @Column({ type: 'varchar', nullable: true, comment: '加床政策' })
  extraBedPolicy?: string;

  @Column({ type: 'varchar', nullable: true, comment: '上架/下架' })
  available?: string;

  @Column({ type: 'varchar', nullable: true, comment: '酒店精选封面' })
  coverImage?: string;
}
