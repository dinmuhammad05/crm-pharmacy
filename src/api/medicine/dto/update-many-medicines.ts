import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateManyMedicineDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsNotEmpty()
  id!: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsNotEmpty()
    unitCount!: number;
}
