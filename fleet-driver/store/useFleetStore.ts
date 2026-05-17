import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export enum DriverStatus {
  AVAILABLE = 'available',
  ON_TRIP = 'on_trip',
  OFF_DUTY = 'off_duty',
}

export enum VehicleType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  DELIVERING = 'delivering',
  MAINTENANCE = 'maintenance',
}

export interface Driver {
  id: string;
  userId: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
  licenseClass?: string;
  licenseExpiry?: string;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  maxCapacityKg: number;
  currentLoadKg: number;
  driverId: string | null;
  driver?: Driver | null;
  status: VehicleStatus;
  deviceId: string | null;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface FleetState {
  drivers: Driver[];
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  fetchDrivers: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  createDriver: (data: any) => Promise<void>;
  createVehicle: (data: any) => Promise<void>;
  updateDriver: (id: string, data: any) => Promise<void>;
  updateVehicle: (id: string, data: any) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  assignDriverToVehicle: (driverId: string, vehicleId: string) => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const useFleetStore = create<FleetState>((set, get) => ({
  drivers: [],
  vehicles: [],
  loading: false,
  error: null,

  fetchDrivers: async () => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ drivers: response.data.data || response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ vehicles: response.data.data || response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createDriver: async (data) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.post(`${API_URL}/drivers`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(state => ({ 
        drivers: [response.data.data || response.data, ...state.drivers], 
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createVehicle: async (data) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.post(`${API_URL}/vehicles`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(state => ({ 
        vehicles: [response.data.data || response.data, ...state.vehicles], 
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateDriver: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.patch(`${API_URL}/drivers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = response.data.data || response.data;
      set(state => ({
        drivers: state.drivers.map(d => d.id === id ? updated : d),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateVehicle: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await axios.patch(`${API_URL}/vehicles/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = response.data.data || response.data;
      set(state => ({
        vehicles: state.vehicles.map(v => v.id === id ? updated : v),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteDriver: async (id) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      await axios.delete(`${API_URL}/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(state => ({
        drivers: state.drivers.filter(d => d.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      await axios.delete(`${API_URL}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(state => ({
        vehicles: state.vehicles.filter(v => v.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  assignDriverToVehicle: async (driverId, vehicleId) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      await axios.post(`${API_URL}/vehicles/${vehicleId}/assign/${driverId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh both
      const store = get();
      await store.fetchDrivers();
      await store.fetchVehicles();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
