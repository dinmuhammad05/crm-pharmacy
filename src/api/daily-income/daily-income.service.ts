import { Injectable } from '@nestjs/common';
import { CreateDailyIncomeDto } from './dto/create-daily-income.dto';
import { UpdateDailyIncomeDto } from './dto/update-daily-income.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyIncome } from '../../core/entity/daily-income.entity';
import { BaseService } from 'src/infrastructure/baseService';

@Injectable()
export class DailyIncomeService extends BaseService<
  CreateDailyIncomeDto,
  UpdateDailyIncomeDto,
  DailyIncome
> {
  constructor(
    @InjectRepository(DailyIncome)
    private readonly dailyIncomeRepo: Repository<DailyIncome>,
  ) {
    super(dailyIncomeRepo, 'dailyIncome');
  }
}
