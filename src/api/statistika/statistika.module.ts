import { Module } from '@nestjs/common';
import { StatistikaService } from './statistika.service';
import { StatistikaController } from './statistika.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from 'src/core/entity/medicine.entity';
import { SaleItem } from 'src/core/entity/sale-item.entity';
import { Credit } from 'src/core/entity/credit.entity';
import { Sale } from 'src/core/entity/sale.entity';
import { Shift } from 'src/core/entity/shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine, SaleItem, Credit, Sale, Shift]),
  ],
  controllers: [StatistikaController],
  providers: [StatistikaService],
})
export class StatistikaModule {}
