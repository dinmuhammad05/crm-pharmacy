// src/core/entity/supply-invoice.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SupplyHistory } from './supply-history.entity';

@Entity()
export class SupplyInvoice extends BaseEntity {
  @OneToMany(() => SupplyHistory, (history) => history.invoice)
  items: SupplyHistory[];
}