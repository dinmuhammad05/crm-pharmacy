import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2025-12-17' })
  @IsDateString()
  expenseDate: string;

  @ApiProperty({ example: 'Internet to‘lovi' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Dekabr oyi', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
