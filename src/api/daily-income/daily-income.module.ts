import { Module } from '@nestjs/common';
import { DailyIncomeService } from './daily-income.service';
import { DailyIncomeController } from './daily-income.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyIncome } from 'src/core/entity/daily-income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyIncome])],
  controllers: [DailyIncomeController],
  providers: [DailyIncomeService],
})
export class DailyIncomeModule {}
