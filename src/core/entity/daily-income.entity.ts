import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('daily_incomes')
export class DailyIncome extends BaseEntity {
  // Kunlik daromad summasi
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  // Qaysi kundagi daromad
  @Column({ type: 'date' })
  incomeDate: Date;

  // Izoh (masalan: savdo, xizmat, va hokazo)
  @Column({ nullable: true })
  description: string;

  // Kim qo‘shgan (admin / sotuvchi)
  @Column({ nullable: true })
  createdBy: string;

}
