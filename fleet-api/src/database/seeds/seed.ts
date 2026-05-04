import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User, UserRole } from '../../entities/user.entity';
import { Driver } from '../../entities/driver.entity';
import { Vehicle, VehicleType, VehicleStatus } from '../../entities/vehicle.entity';
import { Order, OrderStatus } from '../../entities/order.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Driver, Vehicle, Order],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = dataSource.getRepository(User);
    const driverRepository = dataSource.getRepository(Driver);
    const vehicleRepository = dataSource.getRepository(Vehicle);
    const orderRepository = dataSource.getRepository(Order);

    // 1. Seed Admin
    const adminEmail = 'admin@fleettracker.com';
    let admin = await userRepository.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('Admin@123', salt);
      admin = userRepository.create({
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      });
      await userRepository.save(admin);
      console.log('Admin user seeded');
    }

    // 2. Seed Drivers + Users
    const driversData = [
      { email: 'driver1@fleettracker.com', fullName: 'Nguyen Van A', phone: '0912345678', licenseClass: 'C' },
      { email: 'driver2@fleettracker.com', fullName: 'Tran Thi B', phone: '0912345679', licenseClass: 'D' },
      { email: 'driver3@fleettracker.com', fullName: 'Le Van C', phone: '0912345680', licenseClass: 'E' },
      { email: 'driver4@fleettracker.com', fullName: 'Pham Van D', phone: '0912345681', licenseClass: 'C' },
      { email: 'driver5@fleettracker.com', fullName: 'Hoang Van E', phone: '0912345682', licenseClass: 'C' },
    ];

    for (const data of driversData) {
      let user = await userRepository.findOne({ where: { email: data.email } });
      if (!user) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('Driver@123', salt);
        user = userRepository.create({
          email: data.email,
          passwordHash,
          role: UserRole.DRIVER,
        });
        user = await userRepository.save(user);

        const driver = driverRepository.create({
          user,
          fullName: data.fullName,
          phone: data.phone,
          licenseClass: data.licenseClass,
          licenseExpiry: new Date('2030-01-01'),
          status: 'available' as any,
        });
        await driverRepository.save(driver);
        console.log(`Driver ${data.fullName} seeded`);
      }
    }

    // 3. Seed Vehicles
    const vehiclesData = [
      { plateNumber: '29A-12345', type: VehicleType.SMALL, maxCapacityKg: 1000 },
      { plateNumber: '29A-67890', type: VehicleType.MEDIUM, maxCapacityKg: 5000 },
      { plateNumber: '51C-11111', type: VehicleType.LARGE, maxCapacityKg: 15000 },
      { plateNumber: '51C-22222', type: VehicleType.MEDIUM, maxCapacityKg: 5000 },
      { plateNumber: '30E-33333', type: VehicleType.SMALL, maxCapacityKg: 1500 },
    ];

    for (const data of vehiclesData) {
      let vehicle = await vehicleRepository.findOne({ where: { plateNumber: data.plateNumber } });
      if (!vehicle) {
        vehicle = vehicleRepository.create({
          ...data,
          status: VehicleStatus.AVAILABLE,
        });
        await vehicleRepository.save(vehicle);
        console.log(`Vehicle ${data.plateNumber} seeded`);
      }
    }

    // 4. Seed Sample Orders (HCM area)
    const ordersData = [
      {
        pickupAddress: 'Linh Trung, Thu Duc, HCM',
        pickupLocation: { type: 'Point', coordinates: [106.78, 10.86] },
        deliveryAddress: 'Ben Thanh Market, District 1, HCM',
        deliveryLocation: { type: 'Point', coordinates: [106.69, 10.77] },
        weightKg: 50,
        description: 'Electronic parts',
      },
      {
        pickupAddress: 'Tan Binh Industrial Park, HCM',
        pickupLocation: { type: 'Point', coordinates: [106.63, 10.81] },
        deliveryAddress: 'Cat Lai Port, District 2, HCM',
        deliveryLocation: { type: 'Point', coordinates: [106.77, 10.76] },
        weightKg: 2000,
        description: 'Textile materials',
      },
    ];

    for (const data of ordersData) {
      const order = orderRepository.create({
        ...data,
        status: OrderStatus.PENDING,
      } as any);
      await orderRepository.save(order);
      console.log(`Order from ${data.pickupAddress} seeded`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
