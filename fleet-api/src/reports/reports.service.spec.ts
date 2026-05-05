import { ReportsService, FUEL_RATES, DEFAULT_FUEL_PRICE } from './reports.service';
import { TripStatus } from '../entities/trip.entity';
import { VehicleStatus } from '../entities/vehicle.entity';

describe('ReportsService Logic', () => {
  let reportsService: ReportsService;
  let mockTripRepo: any;
  let mockAlertRepo: any;
  let mockVehicleRepo: any;

  beforeEach(() => {
    mockTripRepo = { find: jest.fn() };
    mockAlertRepo = { find: jest.fn() };
    mockVehicleRepo = { count: jest.fn() };
    reportsService = new ReportsService(mockTripRepo, mockAlertRepo, mockVehicleRepo);
  });

  it('should calculate fleet performance correctly', async () => {
    const mockTrips = [
      { 
        status: TripStatus.COMPLETED, 
        totalDistanceKm: 100, 
        vehicle: { type: 'small' },
        startedAt: new Date('2024-01-01T08:00:00'),
        completedAt: new Date('2024-01-01T10:00:00') // 120 mins
      },
      { 
        status: TripStatus.COMPLETED, 
        totalDistanceKm: 200, 
        vehicle: { type: 'medium' } 
      },
      { 
        status: TripStatus.CANCELLED, 
        totalDistanceKm: 0, 
        vehicle: { type: 'large' } 
      }
    ];
    mockTripRepo.find.mockResolvedValue(mockTrips);
    mockAlertRepo.find.mockResolvedValue([]);

    const result = await reportsService.getFleetPerformance(new Date(), new Date());

    // Small: (100/100) * 8 * 25000 = 200,000
    // Medium: (200/100) * 12 * 25000 = 600,000
    // Total: 800,000
    expect(result.totalTrips).toBe(3);
    expect(result.completedTrips).toBe(2);
    expect(result.totalDistanceKm).toBe(300);
    expect(result.estimatedFuelCost).toBe(800000);
    expect(result.completionRate).toBe((2/3) * 100);
  });

  it('should calculate utilization rate correctly', async () => {
    mockVehicleRepo.count.mockImplementation((query) => {
        if (query?.where?.status === VehicleStatus.DELIVERING) return Promise.resolve(5);
        return Promise.resolve(10);
    });

    const result = await reportsService.getVehicleUtilization();
    expect(result.totalVehicles).toBe(10);
    expect(result.busyVehicles).toBe(5);
    expect(result.utilizationRate).toBe(50);
  });

  it('should calculate fuel cost report correctly', async () => {
    const mockTrips = [
      { 
        totalDistanceKm: 100, 
        vehicle: { type: 'small', plateNumber: '29A-12345' }
      },
      { 
        totalDistanceKm: 200, 
        vehicle: { type: 'medium', plateNumber: '29A-67890' } 
      }
    ];
    mockTripRepo.find.mockResolvedValue(mockTrips);

    const result = await reportsService.getFuelCostReport(new Date(), new Date());

    // Small (29A-12345): (100/100) * 8 * 25000 = 200000
    // Medium (29A-67890): (200/100) * 12 * 25000 = 600000
    expect(result['29A-12345'].cost).toBe(200000);
    expect(result['29A-12345'].distance).toBe(100);
    expect(result['29A-67890'].cost).toBe(600000);
    expect(result['29A-67890'].distance).toBe(200);
  });
});
