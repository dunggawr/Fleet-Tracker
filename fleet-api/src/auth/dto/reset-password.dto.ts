import { IsNotEmpty, MinLength, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'driver@fleettracker.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'abc123def456' })
  @IsString()
  @IsNotEmpty()
  resetCode: string;

  @ApiProperty({ example: 'newPassword789', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}
