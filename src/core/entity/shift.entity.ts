// src/core/entity/shift.entity.ts
import { Entity, Column, ManyToOne, OneToMany, Admin } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Sale } from './sale.entity';
import { AdminEntity } from './admin.entity';

@Entity()
export class Shift extends BaseEntity {
  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column('float', { default: 0 })
  totalCash: number; // Smenadagi tushum

  // Admin bilan bog'lash
  @ManyToOne(() => AdminEntity, (admin) => admin.shifts)
  admin: AdminEntity;

  @OneToMany(() => Sale, (sale) => sale.shift)
  sales: Sale[];
}
