// dto/create-medicine.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ example: 'Analgin 500mg', description: 'Dori nomi' })
  @IsString({ message: 'Name faqat matn bo‘lishi kerak' })
  @IsNotEmpty({ message: 'Name bo‘sh bo‘lishi mumkin emas' })
  name: string;

  @ApiProperty({ example: 100, description: 'Nechta keldi' })
  @IsNumber({}, { message: 'Quantity faqat raqam bo‘lishi kerak' })
  @Min(1, { message: 'Quantity 1 dan kam bo‘lmasligi kerak' })
  @IsNotEmpty({ message: 'Quantity bo‘sh bo‘lishi mumkin emas' })
  quantity: number;

  @ApiProperty({ example: 5000, description: 'Kelish narxi (ustamasiz)' })
  @IsNumber({}, { message: 'Original price faqat raqam bo‘lishi kerak' })
  @Min(0, { message: 'Original price manfiy bo‘la olmaydi' })
  @IsNotEmpty({ message: 'Original price bo‘sh bo‘lishi mumkin emas' })
  originalPrice: number;

  @ApiProperty({
    example: '2026-07-01',
    description: 'Muddati (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'Expiry date yaroqli sana formatida bo‘lishi kerak (YYYY-MM-DD)',
    },
  )
  expiryDate?: string;

  // unitcount
  @ApiProperty({
    example: 1,
    description: 'Dori soni (ixtiyoriy, agar berilmasa 1 bo‘lishi kerak)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Unit count faqat raqam bo‘lishi kerak' })
  @Min(1, { message: 'Unit count 1 dan kam bo‘lmasligi kerak' })
  unitCount?: number;

  @ApiProperty({
    example: 15,
    description:
      'Ustama foizi (ixtiyoriy, agar berilmasa global ustama qo‘llanadi)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Markup percent faqat raqam bo‘lishi kerak' })
  @Min(0, { message: "Markup percent manfiy bo'la olmaydi" })
  markupPercent?: number;
}
