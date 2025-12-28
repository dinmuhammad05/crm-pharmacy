import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { CreditStatus } from 'src/core/entity/credit.entity';

export class CreateCreditDto {
  @ApiProperty({ example: 'Ahmadov Jamshid', description: 'Mijoz ismi' })
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Mijoz telefon raqami',
    required: false,
  })
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({
    example: 'Jamoa',
    description: 'Sotuvchi mijozni qanday nom bilan tanishi',
    required: false,
  })
  @IsOptional()
  knownAs?: string;

  @ApiProperty({ example: 1000000, description: 'Umumiy kredit summasi' })
  @IsNumber()
  @Min(1)
  totalAmount: number;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Qachongacha olgani (muddat)',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    enum: CreditStatus,
    example: CreditStatus.UNPAID,
    description: 'Kredit holati',
    required: false,
  })
  @IsOptional()
  @IsEnum(CreditStatus)
  status?: CreditStatus;
}
