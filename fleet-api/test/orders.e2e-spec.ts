import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../src/entities/order.entity';
import { OrdersModule } from '../src/orders/orders.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { UserRole } from '../src/entities/user.entity';

describe('OrdersController (e2e)', () => {
  let app: INestApplication<App>;
  let mockOrderRepository: any;

  const mockUser = {
    id: 'admin-id',
    role: UserRole.ADMIN,
  };

  beforeEach(async () => {
    mockOrderRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((order) =>
        Promise.resolve({ id: 'new-order-id', ...order, createdAt: new Date() }),
      ),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider(getRepositoryToken(Order))
      .useValue(mockOrderRepository)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: () => true, // Already checked in mock JwtAuthGuard by setting req.user
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    const validOrderDto = {
      pickupAddress: '123 Start St',
      pickupLat: 10.1,
      pickupLng: 106.1,
      deliveryAddress: '456 End Rd',
      deliveryLat: 10.2,
      deliveryLng: 106.2,
      weightKg: 100,
      description: 'Test order',
    };

    it('should successfully create an order', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(validOrderDto)
        .expect(201);

      expect(response.body.id).toBe('new-order-id');
      expect(response.body.pickupAddress).toBe(validOrderDto.pickupAddress);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should fail if pickup and delivery addresses are identical', async () => {
      const invalidDto = {
        ...validOrderDto,
        deliveryAddress: '123 Start St', // Same as pickup
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBe(
        'Pickup address and delivery address cannot be the same',
      );
    });

    it('should fail if required fields are missing (DTO validation)', async () => {
      const missingFieldsDto = {
        pickupAddress: '123 Start St',
        // missing coords, delivery address, weight
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(missingFieldsDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(response.body.message).toContain('pickupLat should not be empty');
      expect(response.body.message).toContain('deliveryAddress should not be empty');
    });

    it('should fail if weight is non-positive', async () => {
      const invalidWeightDto = {
        ...validOrderDto,
        weightKg: -5,
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(invalidWeightDto)
        .expect(400);

      expect(response.body.message).toContain('weightKg must be a positive number');
    });
  });
});
