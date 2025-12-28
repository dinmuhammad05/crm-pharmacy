// src/core/entity/supply-invoice.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SupplyHistory } from './supply-history.entity';

@Entity()
export class SupplyInvoice extends BaseEntity {
  @Column('float', { default: 0 })
  totalAmount: number; // ХАМАГИ (Shu yuklashdagi dorilarning umumiy summasi)

  @Column('float', { default: 0 })
  paidAmount: number; // ПАРДОХТИ ПУЛ (Yetkazib beruvchiga berilgan pul)

  @Column('float', { default: 0 })
  oldDebt: number; // КАРЗИ КУХНА (Avvalgi qarzi)

  @Column('float', { default: 0 })
  remainingDebt: number; // КАРЗИ БОКИМОНДА (Umumiy qolgan qarzi)

  @OneToMany(() => SupplyHistory, (history) => history.invoice)
  items: SupplyHistory[];
}