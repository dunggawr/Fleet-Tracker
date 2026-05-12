import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Trip } from '@/types';

export function useTrips(params?: { driverId?: string; vehicleId?: string; status?: string }) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => api.get<Trip[]>('/trips', { params }),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => api.get<Trip>(`/trips/${id}`),
    enabled: !!id,
  });
}
