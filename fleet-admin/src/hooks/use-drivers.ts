import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Driver } from '@/types';

export function useDrivers() {
  const queryClient = useQueryClient();

  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get<Driver[]>('/drivers'),
  });

  const registerDriverMutation = useMutation({
    mutationFn: (data: Partial<Driver> & { email?: string; password?: string }) => api.post<Driver>('/drivers', data),
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

  const deleteDriverMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/drivers/${id}`),
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
    deleteDriver: deleteDriverMutation.mutateAsync,
    isRegistering: registerDriverMutation.isPending,
    isUpdating: updateDriverMutation.isPending,
    isDeleting: deleteDriverMutation.isPending,
  };
}
