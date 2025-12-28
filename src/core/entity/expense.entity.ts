import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Harajat summasi
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  // Harajat sanasi
  @Column({ type: 'date' })
  expenseDate: Date;

  // Harajat sababi (ijara, internet, maosh, va h.k.)
  @Column()
  title: string;

  // Qo‘shimcha izoh
  @Column({ nullable: true })
  description: string;

  // Kim qo‘shgan
  @Column({ nullable: true })
  createdBy: string;

  // Yozuv yaratilgan vaqt
  @CreateDateColumn()
  createdAt: Date;
}
