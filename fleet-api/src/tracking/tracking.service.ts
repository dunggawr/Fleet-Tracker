import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GpsLocation } from '../entities/gps-location.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Trip, TripStatus } from '../entities/trip.entity';
import { GpsUpdateDto } from './dto/gps-update.dto';
import { ViolationDetectorService } from '../alerts/violation-detector.service';

@Injectable()
export class TrackingService implements OnModuleDestroy {
  private readonly logger = new Logger(TrackingService.name);
  private gpsBuffer: any[] = [];
  private readonly BATCH_INTERVAL = 5000; // 5 seconds
  private flushInterval: NodeJS.Timeout;

  constructor(
    @InjectRepository(GpsLocation)
    private readonly gpsRepository: Repository<GpsLocation>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly violationDetector: ViolationDetectorService,
  ) {
    // Start batch processing
    this.flushInterval = setInterval(
      () => this.flushBuffer(),
      this.BATCH_INTERVAL,
    );
  }

  onModuleDestroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }

  private async flushBuffer() {
    if (this.gpsBuffer.length === 0) return;

    const batch = [...this.gpsBuffer];
    this.gpsBuffer = [];

    try {
      await this.gpsRepository.save(batch);
      this.logger.debug(`Flushed ${batch.length} GPS points to DB`);
    } catch (error) {
      this.logger.error(`Failed to flush GPS buffer: ${error.message}`);
      // In production, might want to retry or put back in buffer
    }
  }

  async processGpsUpdate(data: GpsUpdateDto) {
    const {
      vehicleId,
      tripId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp,
    } = data;

    // 1. Create PostGIS Point
    const point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    // 2. Add to buffer for batch insert
    const gpsLocation = this.gpsRepository.create({
      vehicleId,
      tripId,
      location: point,
      speedKmh: speed,
      heading,
      recordedAt: new Date(timestamp),
    });
    this.gpsBuffer.push(gpsLocation);

    // 3. Update Vehicle's last known location
    await this.vehicleRepository.update(vehicleId, {
      lastKnownLocation: () =>
        `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
    });

    // 4. Trigger Violation Detection (Async)
    if (tripId) {
      this.violationDetector
        .checkViolations(data)
        .catch((err) =>
          this.logger.error(`Violation check failed: ${err.message}`),
        );
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
    const query = this.gpsRepository
      .createQueryBuilder('gps')
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
