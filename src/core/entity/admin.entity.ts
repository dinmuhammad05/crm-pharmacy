import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Roles } from 'src/common/enum/roles.enum';
import { Exclude } from 'class-transformer';
import { Shift } from './shift.entity';

@Entity('admin')
export class AdminEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', default: '' })
  avatarUrl: string;

  @Column({ type: 'varchar', nullable: true })
  url: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.ADMIN })
  role: Roles;

  // shifts munosabati
  @OneToMany(() => Shift, (shift) => shift.admin)
  shifts: Shift[];
}
