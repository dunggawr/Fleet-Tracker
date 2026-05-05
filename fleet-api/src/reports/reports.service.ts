import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { Alert } from '../entities/alert.entity';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';
import { TripStatus } from '../entities/trip.entity';

export const FUEL_RATES = {
  small: 8,  // L/100km
  medium: 12,
  large: 16,
};

export const DEFAULT_FUEL_PRICE = 25000; // VND/L

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async getFleetPerformance(from: Date, to: Date) {
    const qb = this.tripRepository.createQueryBuilder('trip')
      .leftJoinAndSelect('trip.vehicle', 'vehicle')
      .where('trip.createdAt BETWEEN :from AND :to', { from, to });

    const trips = await qb.getMany();

    const stats = await this.tripRepository.createQueryBuilder('trip')
      .select('COUNT(*)', 'total')
      .addSelect("COUNT(CASE WHEN trip.status = :completed THEN 1 END)", 'completed')
      .addSelect("COUNT(CASE WHEN trip.status = :cancelled THEN 1 END)", 'failed')
      .addSelect('SUM(trip.totalDistanceKm)', 'totalDistance')
      .where('trip.createdAt BETWEEN :from AND :to', { from, to })
      .setParameters({ completed: TripStatus.COMPLETED, cancelled: TripStatus.CANCELLED })
      .getRawOne();

    const totalTrips = parseInt(stats.total || 0);
    const completedTrips = parseInt(stats.completed || 0);
    const failedTrips = parseInt(stats.failed || 0);
    const totalDistanceKm = parseFloat(stats.totalDistance || 0);
    const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

    let estimatedFuelCost = 0;
    let totalDurationMinutes = 0;

    trips.forEach((trip) => {
      const fuelRate = FUEL_RATES[trip.vehicle?.type] || FUEL_RATES.medium;
      const tripFuel = (Number(trip.totalDistanceKm || 0) / 100) * fuelRate;
      estimatedFuelCost += tripFuel * DEFAULT_FUEL_PRICE;

      if (trip.status === TripStatus.COMPLETED && trip.startedAt && trip.completedAt) {
        const duration = (trip.completedAt.getTime() - trip.startedAt.getTime()) / (1000 * 60);
        totalDurationMinutes += duration;
      }
    });

    const averageTripDuration = completedTrips > 0 ? totalDurationMinutes / completedTrips : 0;

    const alertStats = await this.alertRepository.createQueryBuilder('alert')
      .select('type')
      .addSelect('COUNT(*)', 'count')
      .where('alert.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('type')
      .getRawMany();

    const alertsByType = {
      speed: alertStats.find(a => a.type === 'speed_violation')?.count || 0,
      route: alertStats.find(a => a.type === 'route_deviation')?.count || 0,
      stop: alertStats.find(a => a.type === 'abnormal_stop')?.count || 0,
      incident: alertStats.find(a => a.type === 'incident')?.count || 0,
    };

    const totalAlerts = alertStats.reduce((sum, a) => sum + parseInt(a.count), 0);

    return {
      totalTrips,
      completedTrips,
      failedTrips,
      completionRate,
      totalDistanceKm,
      estimatedFuelCost,
      averageTripDuration,
      totalAlerts,
      alertsByType,
    };
  }

  async getFuelCostReport(from: Date, to: Date) {
    const stats = await this.tripRepository.createQueryBuilder('trip')
      .leftJoin('trip.vehicle', 'vehicle')
      .select('vehicle.plateNumber', 'plate')
      .addSelect('vehicle.type', 'type')
      .addSelect('SUM(trip.totalDistanceKm)', 'totalDistance')
      .where('trip.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('vehicle.plateNumber')
      .addGroupBy('vehicle.type')
      .getRawMany();

    const report = {};

    stats.forEach((row) => {
      const plate = row.plate || 'Unknown';
      const distance = parseFloat(row.totalDistance || 0);
      const fuelRate = FUEL_RATES[row.type] || FUEL_RATES.medium;
      const fuel = (distance / 100) * fuelRate;
      const cost = fuel * DEFAULT_FUEL_PRICE;

      report[plate] = {
        distance,
        fuel,
        cost,
      };
    });

    return report;
  }

  async getVehicleUtilization() {
    // Percentage of time vehicles are 'on_trip' or 'delivering'
    const totalVehicles = await this.vehicleRepository.count();
    const busyVehicles = await this.vehicleRepository.count({
      where: { status: VehicleStatus.DELIVERING },
    });

    return {
      totalVehicles,
      busyVehicles,
      utilizationRate: totalVehicles > 0 ? (busyVehicles / totalVehicles) * 100 : 0,
    };
  }
}
