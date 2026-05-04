import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { VehicleType, VehicleStatus } from '../../entities/vehicle.entity';

export class VehicleQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: VehicleType })
  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;

  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @ApiPropertyOptional({ description: 'Search by plate number' })
  @IsString()
  @IsOptional()
  search?: string;
}
