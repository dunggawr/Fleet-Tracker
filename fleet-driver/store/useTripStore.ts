import { create } from 'zustand';

export enum TripStatus {
  ASSIGNED = 'assigned',
  STARTED = 'started',
  PICKED_UP = 'picked_up',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

interface Order {
  id: string;
  customerName: string;
  address: string;
  status: string;
  photoUrl?: string;
}

interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  status: TripStatus;
  totalDistanceKm: number;
  orders: Order[];
  createdAt: string;
}

interface TripState {
  activeTrip: Trip | null;
  pendingTrips: Trip[];
  tripHistory: Trip[];
  setActiveTrip: (trip: Trip | null) => void;
  setPendingTrips: (trips: Trip[]) => void;
  setTripHistory: (trips: Trip[]) => void;
  updateTripStatus: (status: TripStatus) => void;
}

export const useTripStore = create<TripState>((set) => ({
  activeTrip: null,
  pendingTrips: [],
  tripHistory: [],
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setPendingTrips: (trips) => set({ pendingTrips: trips }),
  setTripHistory: (trips) => set({ tripHistory: trips }),
  updateTripStatus: (status) => set((state) => ({
    activeTrip: state.activeTrip ? { ...state.activeTrip, status } : null
  })),
}));
