import { KpiService, KPI_PENALTIES } from './kpi.service';
import { TripStatus } from '../entities/trip.entity';

describe('KpiService Logic', () => {
  let kpiService: KpiService;
  let mockKpiRepository: any;
  let mockTripRepository: any;

  beforeEach(() => {
    mockKpiRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    mockTripRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
    };
    kpiService = new KpiService(mockKpiRepository, mockTripRepository);
  });

  it('should calculate penalty correctly for speed violation', async () => {
    const mockKpi = { driverId: 'd1', kpiScore: 100, totalViolations: 0, speedViolations: 0 };
    mockKpiRepository.findOne.mockResolvedValue(mockKpi);

    await kpiService.handleViolation({ driverId: 'd1', type: 'speed_violation' });

    expect(mockKpi.kpiScore).toBe(100 - KPI_PENALTIES.speed_violation);
    expect(mockKpi.totalViolations).toBe(1);
    expect(mockKpi.speedViolations).toBe(1);
    expect(mockKpiRepository.save).toHaveBeenCalledWith(mockKpi);
  });

  it('should not let score go below 0', async () => {
    const mockKpi = { driverId: 'd1', kpiScore: 5, totalViolations: 0, incidentViolations: 0 };
    mockKpiRepository.findOne.mockResolvedValue(mockKpi);

    await kpiService.handleViolation({ driverId: 'd1', type: 'incident' });

    expect(mockKpi.kpiScore).toBe(0); // 5 - 10 = -5 -> 0
  });

    it('should increment completedTrips on COMPLETED status', async () => {
      const mockDriver = { id: 'driver-1' };
      const mockTrip = { id: 'trip-1', driver: mockDriver };
      const mockKpi = { driverId: 'driver-1', totalTrips: 1, completedTrips: 0, completionRate: 0 };

      mockTripRepository.findOne.mockResolvedValue(mockTrip);
      mockKpiRepository.findOne.mockResolvedValue(mockKpi);

      await kpiService.handleTripStatusChange({ id: 'trip-1', status: TripStatus.COMPLETED });

      expect(mockKpi.completedTrips).toBe(1);
      expect(mockKpi.completionRate).toBe(100);
      expect(mockKpiRepository.save).toHaveBeenCalled();
    });

    it('should increment totalTrips on ACCEPTED status', async () => {
      const mockDriver = { id: 'driver-1' };
      const mockTrip = { id: 'trip-1', driver: mockDriver };
      const mockKpi = { driverId: 'driver-1', totalTrips: 0, completedTrips: 0, completionRate: 0 };

      mockTripRepository.findOne.mockResolvedValue(mockTrip);
      mockKpiRepository.findOne.mockResolvedValue(mockKpi);

      await kpiService.handleTripStatusChange({ id: 'trip-1', status: TripStatus.ACCEPTED });

      expect(mockKpi.totalTrips).toBe(1);
      expect(mockKpiRepository.save).toHaveBeenCalled();
    });

  it('should return leaderboard sorted by kpiScore DESC', async () => {
    const mockLeaderboard = [
      { driverId: 'd1', kpiScore: 100 },
      { driverId: 'd2', kpiScore: 90 }
    ];
    mockKpiRepository.find.mockResolvedValue(mockLeaderboard);

    const result = await kpiService.getKpiLeaderboard();

    expect(mockKpiRepository.find).toHaveBeenCalledWith(expect.objectContaining({
      order: { kpiScore: 'DESC' },
      take: 10,
    }));
    expect(result).toEqual(mockLeaderboard);
  });
});
