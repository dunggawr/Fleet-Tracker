import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Trip } from './trip.entity';
import { Order } from './order.entity';

@Entity('trip_orders')
export class TripOrder {
  @PrimaryColumn({ name: 'trip_id' })
  tripId: string;

  @PrimaryColumn({ name: 'order_id' })
  orderId: string;

  @Column()
  sequence: number;

  @ManyToOne(() => Trip, (trip) => trip.tripOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
