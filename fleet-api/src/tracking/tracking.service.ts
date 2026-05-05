import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GpsLocation } from '../entities/gps-location.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Trip, TripStatus } from '../entities/trip.entity';
import { GpsUpdateDto } from './dto/gps-update.dto';
import { ViolationDetectorService } from '../alerts/violation-detector.service';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectRepository(GpsLocation)
    private readonly gpsRepository: Repository<GpsLocation>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly violationDetector: ViolationDetectorService,
  ) {}

  async processGpsUpdate(data: GpsUpdateDto) {
    const { vehicleId, tripId, latitude, longitude, speed, heading, timestamp } = data;

    // 1. Create PostGIS Point
    const point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    // 2. Save GPS Location history
    const gpsLocation = this.gpsRepository.create({
      vehicleId,
      tripId,
      location: point,
      speedKmh: speed,
      heading,
      recordedAt: new Date(timestamp),
    });
    await this.gpsRepository.save(gpsLocation);

    // 3. Update Vehicle's last known location
    await this.vehicleRepository.update(vehicleId, {
      lastKnownLocation: () => `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
    } as any);

    // 4. Trigger Violation Detection (Async)
    if (tripId) {
      this.violationDetector.checkViolations(data)
        .catch(err => this.logger.error(`Violation check failed: ${err.message}`));
    }

    // 5. Return processed data for broadcasting
    return {
      vehicleId,
      tripId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp,
    };
  }

  async getVehicleHistory(vehicleId: string, from?: Date, to?: Date) {
    const query = this.gpsRepository.createQueryBuilder('gps')
      .where('gps.vehicleId = :vehicleId', { vehicleId });

    if (from) {
      query.andWhere('gps.recordedAt >= :from', { from });
    }
    if (to) {
      query.andWhere('gps.recordedAt <= :to', { to });
    }

    return query.orderBy('gps.recordedAt', 'ASC').getMany();
  }

  async getAllLiveLocations() {
    return this.vehicleRepository.find({
      select: ['id', 'plateNumber', 'type', 'status', 'lastKnownLocation'],
      // Only get active vehicles or those on trips
    });
  }
}
