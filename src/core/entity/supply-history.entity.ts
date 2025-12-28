// supply-history.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Medicine } from './medicine.entity';
import { BaseEntity } from './base.entity';
import { SupplyInvoice } from './supply-invoice.entity';

@Entity()
export class SupplyHistory extends BaseEntity {
  @Column('int')
  addedQuantity: number; // Exceldagi "Микдор"

  @Column('float')
  originalPrice: number; // Exceldagi "Нарх"

  @Column('float')
  price: number; // 10% li hisoblangan narx

  @ManyToOne(() => Medicine, (medicine) => medicine.histories)
  medicine: Medicine;

  @ManyToOne(() => SupplyInvoice, (invoice) => invoice.items)
  invoice: SupplyInvoice;
}
