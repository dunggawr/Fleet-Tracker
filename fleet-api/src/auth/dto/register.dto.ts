import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'newuser@fleet.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.DRIVER })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
