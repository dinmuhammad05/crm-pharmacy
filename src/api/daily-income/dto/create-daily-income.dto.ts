import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDailyIncomeDto {
  @ApiProperty({ example: 150000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2025-12-17' })
  @IsDateString()
  incomeDate: string;

  @ApiProperty({ example: 'Savdo daromadi', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
