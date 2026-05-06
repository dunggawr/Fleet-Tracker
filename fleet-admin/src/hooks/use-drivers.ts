import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Online' | 'Offline' | 'Busy';
  rating: number;
  completedTrips: number;
  currentVehicleId?: string;
}

export function useDrivers() {
  const queryClient = useQueryClient();

  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get<Driver[]>('/drivers'),
  });

  const registerDriverMutation = useMutation({
    mutationFn: (data: Partial<Driver>) => api.post<Driver>('/drivers/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Driver> & { id: string }) => 
      api.patch<Driver>(`/drivers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  return {
    drivers: driversQuery.data || [],
    isLoading: driversQuery.isLoading,
    error: driversQuery.error,
    registerDriver: registerDriverMutation.mutateAsync,
    updateDriver: updateDriverMutation.mutateAsync,
    isRegistering: registerDriverMutation.isPending,
    isUpdating: updateDriverMutation.isPending,
  };
}
