export interface FleetPerformanceData {
  totalTrips: number;
  totalDistance: number;
  totalFuelCost: number;
  completionRate: number;
  tripsTrend: {
    date: string;
    count: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  tripsByVehicle: {
    vehiclePlate: string;
    count: number;
  }[];
  performanceTrend: {
    date: string;
    trips: number;
    distance: number;
  }[];
}

export interface KpiLeaderboardItem {
  driverId: string;
  driverName: string;
  score: number;
  tripsCount: number;
  completionRate: number;
  violationsCount: number;
  rank: number;
}

export interface FuelCostReport {
  totalCost: number;
  costByVehicleType: {
    type: string;
    cost: number;
  }[];
  costTrend: {
    date: string;
    cost: number;
  }[];
  averageCostPerTrip: number;
  vehicleFuelStats: {
    vehiclePlate: string;
    type: string;
    cost: number;
    distance: number;
    efficiency: number;
  }[];
}

export interface TripRecord {
  id: string;
  date: string;
  vehiclePlate: string;
  driverName: string;
  status: 'completed' | 'ongoing' | 'cancelled' | 'delayed';
  distance: number;
  duration: string;
  startLocation: string;
  endLocation: string;
  trail?: { lat: number; lng: number }[];
  violations?: { type: string; time: string; location: string }[];
  timeline?: { status: string; time: string; location: string }[];
}

export interface TripSummaryData {
  totalTrips: number;
  activeTrips: number;
  delayedTrips: number;
  trips: TripRecord[];
}
