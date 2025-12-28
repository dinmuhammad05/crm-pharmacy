import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  IsInt,
  MaxLength,
} from 'class-validator';

export class UpdateMedicineDto {

  @ApiProperty({
    description: 'Dori nomi',
    example: 'Paracetamol 500mg',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Nomi matn bo\'lishi kerak' })
  @MaxLength(255, { message: 'Nomi 255 belgidan oshmasligi kerak' })
  name?: string;

  @ApiProperty({
    description: 'Kelish narxi (pachka uchun)',
    example: 25000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Kelish narxi raqam bo\'lishi kerak' })
  @Min(0, { message: 'Kelish narxi 0 dan kichik bo\'lmasligi kerak' })
  originalPrice?: number;

  @ApiProperty({
    description: 'Sotish narxi (pachka uchun)',
    example: 35000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Sotish narxi raqam bo\'lishi kerak' })
  @Min(0, { message: 'Sotish narxi 0 dan kichik bo\'lmasligi kerak' })
  price?: number;

  @ApiProperty({
    description: 'Butun pachkalar soni',
    example: 5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Pachkalar soni butun son bo\'lishi kerak' })
  @Min(0, { message: 'Pachkalar soni 0 dan kichik bo\'lmasligi kerak' })
  quantity?: number;

  @ApiProperty({
    description: 'Ochilgan pachkadagi qoldiq donalar soni',
    example: 7,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Qoldiq donalar soni butun son bo\'lishi kerak' })
  @Min(0, { message: 'Qoldiq donalar soni 0 dan kichik bo\'lmasligi kerak' })
  fractionalQuantity?: number;

  @ApiProperty({
    description: 'Yaroqlilik muddati (ISO 8601 format)',
    example: '2025-12-31T23:59:59.000Z',
    required: false,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Yaroqlilik muddati to\'g\'ri sana formatida bo\'lishi kerak (ISO 8601)' })
  expiryDate?: string;

  @ApiProperty({
    description: 'Bir pachkadagi donalar soni',
    example: 20,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Bir pachkadagi donalar soni butun son bo\'lishi kerak' })
  @Min(1, { message: 'Bir pachkadagi donalar soni kamida 1 bo\'lishi kerak' })
  unitCount?: number;
}