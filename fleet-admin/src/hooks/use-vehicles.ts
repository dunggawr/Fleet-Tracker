import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Vehicle } from '@/types';

export function useVehicles(queryParams?: Record<string, any>) {
  const queryClient = useQueryClient();

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', queryParams],
    queryFn: async () => {
      const res = await api.get<Vehicle[]>('/vehicles', { params: queryParams });
      return Array.isArray(res) ? res : ((res as any).data || []);
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => api.post<Vehicle>('/vehicles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Vehicle> & { id: string }) => 
      api.patch<Vehicle>(`/vehicles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  return {
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    error: vehiclesQuery.error,
    createVehicle: createVehicleMutation.mutateAsync,
    updateVehicle: updateVehicleMutation.mutateAsync,
    deleteVehicle: deleteVehicleMutation.mutateAsync,
    isCreating: createVehicleMutation.isPending,
    isUpdating: updateVehicleMutation.isPending,
    isDeleting: deleteVehicleMutation.isPending,
  };
}
