// src/core/entity/medicine.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SaleItem } from './sale-item.entity';
import { SupplyHistory } from './supply-history.entity';

@Entity()
export class Medicine extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column('float')
  originalPrice: number; // Kelish narxi (pachka uchun)

  @Column('float')
  price: number; // Sotish narxi (pachka uchun)

  @Column('int')
  quantity: number; // BUTUN PACHKALAR SONI (Masalan: 5 ta pachka)

  @Column('int', { default: 0 })
  fractionalQuantity: number; // OCHILGAN PACHKADAGI QOLDIQ DONALAR (Masalan: 7 dona)

  @Column({ nullable: true })
  expiryDate: string;

  @Column('int', { default: 1 })
  unitCount: number; // BITTA PACHKADA NECHTA DONA BOR (Masalan: 10 ta)

  @OneToMany(() => SupplyHistory, (history) => history.medicine)
  histories: SupplyHistory[];

  @OneToMany(() => SaleItem, (item) => item.medicine)
  saleItems: SaleItem[];
}
