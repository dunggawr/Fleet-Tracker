import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { GpsUpdateDto } from '../tracking/dto/gps-update.dto';
import { Alert, AlertSeverity, AlertType } from '../entities/alert.entity';
import { AlertsService } from './alerts.service';

@Injectable()
export class ViolationDetectorService {
  private readonly logger = new Logger(ViolationDetectorService.name);
  private readonly MAX_SPEED = 80; // km/h
  private readonly IDLE_THRESHOLD = 10 * 60 * 1000; // 10 minutes in ms
  private readonly ROUTE_DEVIATION_THRESHOLD = 500; // meters
  private stopStartTimeMap = new Map<string, number>(); // vehicleId -> timestamp

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly alertsService: AlertsService,
  ) {}

  async checkViolations(gpsData: GpsUpdateDto) {
    const { speed, tripId, vehicleId, latitude, longitude } = gpsData;

    // 1. Abnormal Stop Check
    if (speed === 0) {
      if (!this.stopStartTimeMap.has(vehicleId)) {
        this.stopStartTimeMap.set(vehicleId, Date.now());
      } else {
        const stopDuration = Date.now() - (this.stopStartTimeMap.get(vehicleId) || Date.now());
        if (stopDuration > this.IDLE_THRESHOLD) {
          // Trigger alert if not already alerted (simple debounce)
          if (stopDuration < this.IDLE_THRESHOLD + 30000) { // Alert once when threshold passed
            await this.alertsService.createAlert({
              tripId,
              vehicleId,
              type: AlertType.ABNORMAL_STOP,
              severity: AlertSeverity.LOW,
              message: `Xe dừng bất thường hơn 10 phút`,
              location: { type: 'Point', coordinates: [longitude, latitude] },
            });
          }
        }
      }
    } else {
      this.stopStartTimeMap.delete(vehicleId);
    }

    // 2. Speed Violation Check
    if (speed > this.MAX_SPEED) {
      await this.alertsService.createAlert({
        tripId,
        vehicleId,
        type: AlertType.SPEED_VIOLATION,
        severity: AlertSeverity.MEDIUM,
        message: `Vượt quá tốc độ cho phép: ${speed.toFixed(1)} km/h (Giới hạn: ${this.MAX_SPEED} km/h)`,
        location: { type: 'Point', coordinates: [longitude, latitude] },
      });
    }

    // 3. Route Deviation Check
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (trip && trip.plannedRoute) {
      const distance = await this.calculateDistanceFromRoute(latitude, longitude, trip.id);
      if (distance > this.ROUTE_DEVIATION_THRESHOLD) {
        await this.alertsService.createAlert({
          tripId,
          vehicleId,
          type: AlertType.ROUTE_DEVIATION,
          severity: AlertSeverity.HIGH,
          message: `Xe đi sai lộ trình: Cách tuyến đường chính ${distance.toFixed(0)}m`,
          location: { type: 'Point', coordinates: [longitude, latitude] },
        });
      }
    }
  }

  private async calculateDistanceFromRoute(lat: number, lng: number, tripId: string): Promise<number> {
    const result = await this.tripRepository.query(
      `SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        planned_route::geography
      ) as distance
      FROM trips WHERE id = $3`,
      [lng, lat, tripId],
    );
    return result[0]?.distance || 0;
  }
}
