import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { ViolationDetectorService } from './violation-detector.service';
import { Alert } from '../entities/alert.entity';
import { Trip } from '../entities/trip.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Driver } from '../entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Trip, Vehicle, Driver])],
  providers: [AlertsService, ViolationDetectorService],
  controllers: [AlertsController],
  exports: [AlertsService, ViolationDetectorService],
})
export class AlertsModule {}
