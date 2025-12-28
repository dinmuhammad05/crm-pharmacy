// ============================================
// 1. dto/create-sale.dto.ts
// ============================================
import { IsEnum, IsInt, IsString, ValidateNested, IsArray, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum SaleType {
  PACK = 'pack',
  UNIT = 'unit',
}

export class SaleItemDto {
  @IsString()
  medicineId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsEnum(SaleType)
  type: SaleType;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  // Sotuvchi tomonidan qo'lda kiritilgan yoki tasdiqlangan yakuniy summa
  @IsNumber()
  @Min(0)
  totalPrice: number; 
}