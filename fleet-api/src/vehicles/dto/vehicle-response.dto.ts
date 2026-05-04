import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  is_active: boolean;
}

export class VehicleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  plate_number: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  max_capacity_kg: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  image_url?: string;

  @ApiProperty({ required: false })
  current_driver_id?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
