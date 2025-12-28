import { PartialType } from '@nestjs/swagger';
import { CreateDailyIncomeDto } from './create-daily-income.dto';

export class UpdateDailyIncomeDto extends PartialType(CreateDailyIncomeDto) {}
