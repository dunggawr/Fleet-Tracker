import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GpsLocation } from '../entities/gps-location.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Trip } from '../entities/trip.entity';
import { ViolationDetectorService } from '../alerts/violation-detector.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: getRepositoryToken(GpsLocation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ViolationDetectorService,
          useValue: {
            checkViolations: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
