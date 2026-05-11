import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'driver@fleettracker.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
