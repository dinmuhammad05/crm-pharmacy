// src/core/entity/sale.entity.ts
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Shift } from './shift.entity';
import { SaleItem } from './sale-item.entity';

@Entity()
export class Sale extends BaseEntity {
  @Column('float')
  totalPrice: number; // Chekning umumiy summasi

  @ManyToOne(() => Shift, (shift) => shift.sales)
  shift: Shift; // Qaysi smenada sotildi

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];
}