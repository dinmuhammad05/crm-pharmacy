import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('documents')
export class Document extends BaseEntity {
  @Column({ type: 'varchar' })
  medicine: string;

  @Column({ type: 'varchar' })
  clientFullname: string;

  @Column({ type: 'varchar' })
  clientPhone: string;

  @Column({ type: 'varchar' })
  passportNumber: string;

  @Column({ type: 'smallint' })
  quantity: number;

  @Column({ type: 'date' , default: new Date()})
  date: Date;

  @Column({ type: 'varchar', default: '' })
  clientAddress: string;
}
