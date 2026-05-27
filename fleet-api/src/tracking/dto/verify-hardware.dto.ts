import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyHardwareDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  fingerprintId!: string;

  @ApiProperty({ example: 'device_001' })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}
