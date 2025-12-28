import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class PayPartiallyDto {
  @ApiProperty({ example: 200000, description: 'To‘lanayotgan summa' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'To‘lov summasi 1 dan kam bo‘lmasligi kerak' })
  amount: number;
}
