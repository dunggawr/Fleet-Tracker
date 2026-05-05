import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../entities/order.entity';

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  pickup_address: string;

  @ApiProperty()
  delivery_address: string;

  @ApiProperty()
  weight_kg: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
