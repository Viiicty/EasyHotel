import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('amenity')
export class AmenityEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '如"免费停车""亲子""泳池"' })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '可选：停车/亲子/商务…' })
  category?: string;
}
