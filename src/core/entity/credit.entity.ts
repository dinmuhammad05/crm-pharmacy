import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum CreditStatus {
  PAID = 'tolangan',
  UNPAID = 'tolanmagan',
  PARTIALLY_PAID = 'qismiTolangan',
  OVERDUE = 'vozKechildi',
}

@Entity('credits')
export class Credit extends BaseEntity {
  // Mijoz ismi
  @Column()
  customerName: string;

  // Mijoz telefon raqami
  @Column({ nullable: true })
  customerPhone: string;

  // Sotuvchi mijozni qanday nom bilan tanishi
  @Column({ nullable: true })
  knownAs: string;

  // Kreditning umumiy summasi
  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  // Hozirgacha to‘langan jami summa
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  // Har bir to‘lovlar (qachon va qancha)
  @Column({ type: 'jsonb', nullable: true })
  payments: {
    amount: number;
    date: string;
  }[];

  // Kredit holati
  @Column({
    type: 'enum',
    enum: CreditStatus,
    default: CreditStatus.UNPAID,
  })
  status: CreditStatus;

  // Qachongacha olgani
  @Column({ type: 'date' })
  dueDate: Date;
}
