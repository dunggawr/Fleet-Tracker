import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export interface PerformanceTrend {
  date: string;
  trips: number;
  distance: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface TripsByVehicle {
  vehiclePlate: string;
  count: number;
}

export interface FleetPerformanceData {
  totalTrips: number;
  totalDistance: number;
  totalFuelCost: number;
  completionRate: number;
  performanceTrend: PerformanceTrend[];
  statusDistribution: StatusDistribution[];
  tripsByVehicle: TripsByVehicle[];
}

export interface DriverKPI {
  driverId: string;
  driverName: string;
  score: number;
  totalTrips: number;
  onTimeRate: number;
  rating: number;
}

export interface VehicleUtilizationStats {
  plateNumber: string;
  utilization: number;
  status: string;
}

export interface UtilizationData {
  activeCount: number;
  idleCount: number;
  averageUtilization: number;
  vehicleStats: VehicleUtilizationStats[];
}

export interface FuelCostByVehicleType {
  type: string;
  cost: number;
}

export interface FuelCostTrend {
  date: string;
  cost: number;
}

export interface VehicleFuelStats {
  vehiclePlate: string;
  type: string;
  cost: number;
  distance: number;
  efficiency: number;
}

export interface FuelCostData {
  totalCost: number;
  averageCostPerTrip: number;
  costByVehicleType: FuelCostByVehicleType[];
  costTrend: FuelCostTrend[];
  vehicleFuelStats: VehicleFuelStats[];
}

interface ReportState {
  performanceData: FleetPerformanceData | null;
  driverKPIs: DriverKPI[];
  utilizationData: UtilizationData | null;
  fuelCostData: FuelCostData | null;
  loading: boolean;
  error: string | null;
  fetchFleetPerformance: (params: { from: string; to: string }) => Promise<void>;
  fetchDriverKPIs: () => Promise<void>;
  fetchVehicleUtilization: (params: { from: string; to: string }) => Promise<void>;
  fetchFuelCost: (params: { from: string; to: string }) => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const useReportStore = create<ReportState>((set) => ({
  performanceData: null,
  driverKPIs: [],
  utilizationData: null,
  fuelCostData: null,
  loading: false,
  error: null,

  fetchFleetPerformance: async (params) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/reports/fleet-performance`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ performanceData: response.data.data || response.data, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch performance data';
      set({ error: message, loading: false });
    }
  },

  fetchDriverKPIs: async () => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/reports/driver-kpis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ driverKPIs: response.data.data || response.data, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch driver KPIs';
      set({ error: message, loading: false });
    }
  },

  fetchVehicleUtilization: async (params) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/reports/vehicle-utilization`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ utilizationData: response.data.data || response.data, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch utilization data';
      set({ error: message, loading: false });
    }
  },

  fetchFuelCost: async (params) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/reports/fuel-cost`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ fuelCostData: response.data.data || response.data, loading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch fuel cost data';
      set({ error: message, loading: false });
    }
  },
}));
