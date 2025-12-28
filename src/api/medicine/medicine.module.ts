import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from 'src/core/entity/medicine.entity';
import { MedicineController } from './medicine.controller';
import { MedicineService } from './medicine.service';
import { Settings } from 'src/core/entity/settings.entity';
import { SupplyHistory } from 'src/core/entity/supply-history.entity';
import { SupplyInvoice } from 'src/core/entity/supply-invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, Settings, SupplyHistory, SupplyInvoice])],
  controllers: [MedicineController],
  providers: [MedicineService],
})
export class MedicinesModule {}
