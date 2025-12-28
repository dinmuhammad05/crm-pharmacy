import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    example: 'global_markup_percent',
    description: 'Sozlama kaliti',
  })
  @IsString({ message: "Kalit satr turida bo'lishi kerak" })
  key: string;

  @ApiProperty({ example: '15', description: 'Sozlama qiymati' })
  @IsNumberString()
  value: string;
}
