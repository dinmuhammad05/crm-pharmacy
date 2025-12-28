// src/core/entity/sale-item.entity.ts
import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Sale } from './sale.entity';
import { Medicine } from './medicine.entity';

export enum SaleType {
  PACK = 'pack', // Pachkalab sotildi
  UNIT = 'unit', // Donalab sotildi
}

@Entity()
export class SaleItem extends BaseEntity {
  @ManyToOne(() => Sale, (sale) => sale.items)
  sale: Sale;

  @ManyToOne(() => Medicine, (medicine) => medicine.saleItems)
  medicine: Medicine;

  @Column('int')
  amount: number; // Nechta sotildi (masalan 5)

  @Column({ type: 'enum', enum: SaleType })
  type: SaleType; // Pachkami yoki Donami?

  @Column('float')
  priceAtMoment: number; // Sotilgan paytdagi narxi (narx o'zgarib ketishi mumkin)

  @Column('float')
  totalPrice: number; // amount * priceAtMoment
}