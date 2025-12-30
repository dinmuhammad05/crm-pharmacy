import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    example: '2026-07-01',
    description: 'Muddati (ixtiyoriy)',
    required: false,
  })
  @IsNotEmpty()
  @IsDateString(
    {},
    {
      message:
        'Qachon sotilgan muddati yaroqli sana formatida bo‘lishi kerak (YYYY-MM-DD)',
    },
  )
  date: string;

  @ApiProperty({ description: 'nechta sotilgani', example: 1 })
  @IsNumber({}, { message: 'Quantity faqat raqam bo‘lishi kerak' })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'mijozning telefon raqami' })
  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @ApiProperty({ description: "mijozning to'liq ismi" })
  @IsString()
  @IsNotEmpty()
  clientFullname: string;

  @ApiProperty({ description: 'mijozning manzili' })
  @IsString()
  @IsNotEmpty()
  clientAddress: string;

  //   passport nomeri
  @ApiProperty({ description: 'passport nomeri' })
  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  // dori nomi
  @ApiProperty({ description: 'dori nomi' })
  @IsString()
  @IsNotEmpty()
  medicine: string;
}
