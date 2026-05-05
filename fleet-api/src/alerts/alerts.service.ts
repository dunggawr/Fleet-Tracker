import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Alert, AlertType, AlertSeverity } from '../entities/alert.entity';
import { Trip } from '../entities/trip.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Driver } from '../entities/driver.entity';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createAlert(data: any) {
    const { tripId, vehicleId, type, severity, message, location } = data;

    // Get driverId from trip
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    const driverId = trip ? trip.driverId : undefined;

    const alert = this.alertRepository.create({
      tripId,
      vehicleId,
      driverId,
      type,
      severity,
      message,
      location,
      isResolved: false,
    });

    const savedAlert = await this.alertRepository.save(alert);
    
    // Emit event for real-time notification
    this.eventEmitter.emit('alert.new', savedAlert);

    this.logger.log(`New alert created: ${type} - ${message}`);
    return savedAlert;
  }

  async resolveAlert(id: string) {
    await this.alertRepository.update(id, {
      isResolved: true,
      resolvedAt: new Date(),
    });
    return this.alertRepository.findOne({ where: { id } });
  }

  async getActiveAlerts() {
    return this.alertRepository.find({
      where: { isResolved: false },
      order: { createdAt: 'DESC' },
      relations: ['vehicle', 'driver', 'trip'],
    });
  }

  async getAlertStats() {
    return this.alertRepository
      .createQueryBuilder('alert')
      .select('alert.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('alert.type')
      .getRawMany();
  }
}
