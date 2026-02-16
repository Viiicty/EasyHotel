import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, comment: '用户名' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '手机号' })
  phone?: string;

  @Column({ type: 'varchar', length: 255, comment: '邮箱' })
  email: string;

  @Column({ type: 'varchar', length: 255, comment: '密码' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '角色（用户/商户/管理员）' })
  role?: string;

  @Column({ type: 'varchar', length: 32, nullable: true, comment: '状态（active/disabled）' })
  status?: string;

  @Column({ type: 'varchar', length: 18, nullable: true, comment: '身份证号' })
  idCard?: string;
}
