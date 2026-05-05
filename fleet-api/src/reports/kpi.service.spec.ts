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

  it('should update completion rate correctly', async () => {
    const mockKpi = { 
        driverId: 'd1', 
        totalTrips: 10, 
        completedTrips: 4, 
        completionRate: 40 
    };
    mockKpiRepository.findOne.mockResolvedValue(mockKpi);
    mockTripRepository.findOne.mockResolvedValue({ id: 't1', driver: { id: 'd1' } });

    await kpiService.handleTripStatusChange({ tripId: 't1', status: TripStatus.COMPLETED });

    expect(mockKpi.completedTrips).toBe(5);
    expect(mockKpi.completionRate).toBe(50); // (5/10) * 100
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
