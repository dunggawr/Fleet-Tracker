import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Vehicle, VehicleType, VehicleStatus } from '../src/entities/vehicle.entity';
import { Driver } from '../src/entities/driver.entity';
import { User } from '../src/entities/user.entity';
import { Order } from '../src/entities/order.entity';
import { Trip } from '../src/entities/trip.entity';
import { TripOrder } from '../src/entities/trip-order.entity';
import { Alert } from '../src/entities/alert.entity';
import { DriverKpi } from '../src/entities/driver-kpi.entity';
import { GpsLocation } from '../src/entities/gps-location.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Driver, Vehicle, Order, Trip, TripOrder, Alert, DriverKpi, GpsLocation],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Sample locations around Ho Chi Minh City with coordinates [longitude, latitude]
const locations = [
  { name: 'Tân Bình (District 11)', lat: 10.8141, lng: 106.6841 },
  { name: 'Bình Tân (District 12)', lat: 10.7838, lng: 106.6353 },
  { name: 'Quận 1 (Downtown)', lat: 10.7769, lng: 106.7009 },
  { name: 'Quận 3 (Ben Thanh Market)', lat: 10.7694, lng: 106.6978 },
  { name: 'Quận 7 (Saigon South)', lat: 10.7529, lng: 106.7255 },
  { name: 'Bình Chánh (Outer District)', lat: 10.6816, lng: 106.4752 },
  { name: 'Thủ Đức (Eastern Area)', lat: 10.8015, lng: 106.7637 },
  { name: 'Gò Vấp (Northern Area)', lat: 10.8514, lng: 106.6735 },
  { name: 'Tân Phú (Western Area)', lat: 10.8094, lng: 106.6156 },
  { name: 'Phú Nhuận (Mid District)', lat: 10.7916, lng: 106.7442 },
];

async function seedVehicles() {
  try {
    await dataSource.initialize();
    console.log('Connected to database...');

    const vehicleRepository = dataSource.getRepository(Vehicle);

    // Check how many vehicles already exist
    const existingCount = await vehicleRepository.count();
    console.log(`Existing vehicles: ${existingCount}`);

    const newVehicles: Vehicle[] = [];

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const plateNumber = `HCM-${String(1000 + i).slice(-4)}`;

      // Check if vehicle already exists
      const exists = await vehicleRepository.findOne({
        where: { plateNumber },
      });

      if (!exists) {
        const vehicleData = {
          plateNumber,
          type: [VehicleType.SMALL, VehicleType.MEDIUM, VehicleType.LARGE][i % 3],
          maxCapacityKg: [500, 1000, 2000][i % 3],
          currentLoadKg: Math.random() * 500,
          status: [VehicleStatus.AVAILABLE, VehicleStatus.DELIVERING, VehicleStatus.MAINTENANCE][i % 3],
          lastKnownLocation: {
            type: 'Point',
            coordinates: [location.lng, location.lat],
          },
        };

        const vehicle = vehicleRepository.create(vehicleData);
        newVehicles.push(vehicle);
        console.log(`Created vehicle ${plateNumber} at ${location.name} (${location.lat}, ${location.lng})`);
      } else {
        console.log(`Vehicle ${plateNumber} already exists, skipping...`);
      }
    }

    if (newVehicles.length > 0) {
      await vehicleRepository.save(newVehicles);
      console.log(`\n✅ Added ${newVehicles.length} new vehicles to database`);
    } else {
      console.log('\n✅ All vehicles already exist in database');
    }

    // Display all vehicles
    const allVehicles = await vehicleRepository.find();
    console.log(`\nTotal vehicles in database: ${allVehicles.length}`);
    console.log('\nVehicles:');
    allVehicles.forEach((v) => {
      const coords = v.lastKnownLocation?.coordinates || [0, 0];
      console.log(`  ${v.plateNumber} - ${v.type} - Status: ${v.status} - Location: (${coords[1]}, ${coords[0]})`);
    });
  } catch (error) {
    console.error('Error during vehicle seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedVehicles();
