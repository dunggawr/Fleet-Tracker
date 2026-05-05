import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({ example: '2024-01-01' })
  @IsNotEmpty()
  @IsDateString()
  from: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsNotEmpty()
  @IsDateString()
  to: string;
}
