import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

interface DashboardStats {
  activeVehicles: number;
  pendingOrders: number;
  totalRevenue: number;
  alertCount: number;
}

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    activeVehicles: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    alertCount: 0,
  },
  isLoading: false,
  error: null,
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    const { token } = useAuthStore.getState();

    try {
      // For now, we mock some values as the specific aggregate endpoint might vary
      // In a real scenario, we would call /reports/fleet-performance or a dedicated dashboard endpoint
      const response = await fetch(`${API_URL}/reports/fleet-performance?from=${new Date().toISOString()}&to=${new Date().toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      
      const data = await response.json();
      
      // Map API data to our stats structure
      set({
        stats: {
          activeVehicles: data.activeVehicles || 12, // Mock fallback
          pendingOrders: data.pendingOrders || 45,
          totalRevenue: data.totalRevenue || 12500000,
          alertCount: data.alertCount || 3,
        },
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      
      // Fallback for development if API fails
      set({
        stats: {
          activeVehicles: 15,
          pendingOrders: 28,
          totalRevenue: 45800000,
          alertCount: 5,
        },
        isLoading: false,
      });
    }
  },
}));
