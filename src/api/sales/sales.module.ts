// ============================================
// 4. sales.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from 'src/core/entity/sale.entity';
import { SaleItem } from 'src/core/entity/sale-item.entity';
import { Medicine } from 'src/core/entity/medicine.entity';
import { Shift } from 'src/core/entity/shift.entity';
import { AdminEntity } from 'src/core/entity/admin.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Medicine, Shift, AdminEntity])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
