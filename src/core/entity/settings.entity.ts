// src/core/entity/settings.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Settings extends BaseEntity {
  @Column({ unique: true })
  key: string; // Masalan: "global_markup_percent"

  @Column()
  value: string; // Masalan: "15" (string qilib saqlagan qulay)
}
