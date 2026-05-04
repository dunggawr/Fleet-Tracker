import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Driver } from './driver.entity';
import { TripOrder } from './trip-order.entity';

export enum TripStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ name: 'driver_id' })
  driverId: string;

  @Column({
    name: 'planned_route',
    type: 'geography',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  plannedRoute: any;

  @Column({
    name: 'actual_route',
    type: 'geography',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  actualRoute: any;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.PENDING,
  })
  status: TripStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ name: 'total_distance_km', type: 'decimal', nullable: true })
  totalDistanceKm: number;

  @Column({ name: 'estimated_fuel_cost', type: 'decimal', nullable: true })
  estimatedFuelCost: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TripOrder, (tripOrder) => tripOrder.trip)
  tripOrders: TripOrder[];
}
