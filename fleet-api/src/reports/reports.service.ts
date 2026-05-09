import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip } from '../entities/trip.entity';
import { Alert } from '../entities/alert.entity';
import { Vehicle, VehicleStatus } from '../entities/vehicle.entity';
import { TripStatus } from '../entities/trip.entity';

export const FUEL_RATES = {
  small: 8, // L/100km
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
    const stats = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoin('trip.vehicle', 'vehicle')
      .select('COUNT(*)', 'total')
      .addSelect(
        'COUNT(CASE WHEN trip.status = :completed THEN 1 END)',
        'completed',
      )
      .addSelect(
        'COUNT(CASE WHEN trip.status = :cancelled THEN 1 END)',
        'failed',
      )
      .addSelect('SUM(trip.totalDistanceKm)', 'totalDistance')
      .addSelect(
        `
        SUM(
          (trip.totalDistanceKm / 100) * 
          CASE 
            WHEN vehicle.type = 'small' THEN ${FUEL_RATES.small}
            WHEN vehicle.type = 'large' THEN ${FUEL_RATES.large}
            ELSE ${FUEL_RATES.medium}
          END * ${DEFAULT_FUEL_PRICE}
        )
      `,
        'estimatedFuelCost',
      )
      .where('trip.createdAt BETWEEN :from AND :to', { from, to })
      .setParameters({
        completed: TripStatus.COMPLETED,
        cancelled: TripStatus.CANCELLED,
      })
      .getRawOne();

    const tripsByVehicle = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoin('trip.vehicle', 'vehicle')
      .select('vehicle.plateNumber', 'vehiclePlate')
      .addSelect('COUNT(*)', 'count')
      .where('trip.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('vehicle.plateNumber')
      .getRawMany();

    const statusDistribution = await this.tripRepository
      .createQueryBuilder('trip')
      .select('trip.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('trip.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('trip.status')
      .getRawMany();

    // Real trend data: Group by day
    const trendData = await this.tripRepository
      .createQueryBuilder('trip')
      .select("DATE(trip.createdAt)", "date")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(trip.totalDistanceKm)", "distance")
      .where('trip.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy("DATE(trip.createdAt)")
      .orderBy("DATE(trip.createdAt)", "ASC")
      .getRawMany();

    const performanceTrend = trendData.map(t => ({
      date: t.date,
      trips: parseInt(t.count),
      distance: parseFloat(t.distance || 0),
    }));

    return {
      totalTrips: parseInt(stats.total || 0),
      totalDistance: parseFloat(stats.totalDistance || 0),
      totalFuelCost: parseFloat(stats.estimatedFuelCost || 0),
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      tripsTrend: performanceTrend.map(t => ({ date: t.date, count: t.trips })),
      statusDistribution,
      tripsByVehicle,
      performanceTrend,
    };
  }

  async getFuelCostReport(from: Date, to: Date) {
    const stats = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoin('trip.vehicle', 'vehicle')
      .select('vehicle.plateNumber', 'vehiclePlate')
      .addSelect('vehicle.type', 'type')
      .addSelect('SUM(trip.totalDistanceKm)', 'distance')
      .where('trip.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('vehicle.plateNumber')
      .addGroupBy('vehicle.type')
      .getRawMany();

    let totalCost = 0;
    const vehicleFuelStats = stats.map(row => {
      const fuelRate = FUEL_RATES[row.type] || FUEL_RATES.medium;
      const cost = (parseFloat(row.distance) / 100) * fuelRate * DEFAULT_FUEL_PRICE;
      totalCost += cost;
      return {
        vehiclePlate: row.vehiclePlate,
        type: row.type,
        distance: parseFloat(row.distance),
        cost: cost,
        efficiency: fuelRate
      };
    });

    // Group by type
    const costByVehicleType = [];
    ['small', 'medium', 'large'].forEach(type => {
      const cost = vehicleFuelStats
        .filter(s => s.type === type)
        .reduce((sum, s) => sum + s.cost, 0);
      if (cost > 0) costByVehicleType.push({ type, cost });
    });

    return {
      totalCost,
      costByVehicleType,
      costTrend: [], // Placeholder
      averageCostPerTrip: totalCost / (vehicleFuelStats.length || 1),
      vehicleFuelStats
    };
  }

  async getVehicleUtilization() {
    const totalVehicles = await this.vehicleRepository.count();
    const busyVehicles = await this.vehicleRepository.count({
      where: { status: VehicleStatus.DELIVERING },
    });

    const vehicleStats = await this.vehicleRepository.find();

    return {
      totalVehicles,
      busyVehicles,
      activeCount: busyVehicles,
      idleCount: totalVehicles - busyVehicles,
      averageUtilization: totalVehicles > 0 ? Math.round((busyVehicles / totalVehicles) * 100) : 0,
      vehicleStats: vehicleStats.map(v => ({
        plateNumber: v.plateNumber,
        utilization: v.status === VehicleStatus.DELIVERING ? 100 : 0 // Real status based utilization
      }))
    };
  }

  async getTripSummary(from: Date, to: Date) {
    const trips = await this.tripRepository.find({
      where: { createdAt: Between(from, to) },
      relations: ['vehicle', 'driver'],
      order: { createdAt: 'DESC' }
    });

    return {
      totalTrips: trips.length,
      activeTrips: trips.filter(t => t.status === TripStatus.ONGOING).length,
      delayedTrips: trips.filter(t => t.status === TripStatus.DELAYED).length,
      trips: trips.map(t => ({
        id: t.id,
        date: t.createdAt.toISOString().split('T')[0],
        vehiclePlate: t.vehicle?.plateNumber || 'N/A',
        driverName: t.driver?.fullName || 'N/A',
        status: t.status,
        distance: t.totalDistanceKm,
        duration: 'N/A', // Calculated if needed
        startLocation: t.startLocation || 'N/A',
        endLocation: t.endLocation || 'N/A'
      }))
    };
  }
}
