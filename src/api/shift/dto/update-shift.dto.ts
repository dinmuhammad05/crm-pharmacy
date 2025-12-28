import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateShiftDto {
    @ApiProperty()
    @IsNumber()
    totalCash: number
}
