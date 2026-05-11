import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DispatchSuggestion } from '@/types';

/**
 * Hook để gọi API /dispatch/suggest — lấy Top 5 xe phù hợp nhất cho một đơn hàng.
 * Dựa trên SPEC: AC-DIS-01 & TC-02 (fleet_tracker_spec.md)
 * Tiêu chí: gần nhất + đủ tải + tài xế rảnh + bằng lái còn hạn
 */
export function useDispatchSuggest(orderId: string | null) {
  return useQuery<DispatchSuggestion[]>({
    queryKey: ['dispatch', 'suggest', orderId],
    queryFn: () => api.post<DispatchSuggestion[]>('/dispatch/suggest', { orderId }),
    enabled: !!orderId,
    staleTime: 30_000, // 30s — fresh enough for dispatch decisions
    retry: 1,
  });
}

/**
 * Hook để gọi API /dispatch/cluster — nhóm đơn hàng gần nhau trong bán kính 3km
 * Dựa trên DESIGN.md: Mục 3.4, CLUSTER_RADIUS_METERS = 3000
 */
export function useDispatchCluster(radiusKm: number = 3) {
  return useQuery<{ clusters: Array<{ orderIds: string[]; centroid: { lat: number; lng: number } }> }>({
    queryKey: ['dispatch', 'cluster', radiusKm],
    queryFn: () => api.post('/dispatch/cluster', { radiusKm }),
    staleTime: 60_000, // 1 min
    retry: 1,
  });
}

/**
 * Hook mutation để gán đơn hàng vào xe — tạo Trip mới
 * Dựa trên SPEC: AC-DIS-02 & Flow 1 (fleet_tracker_spec.md)
 */
export function useDispatchAssign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderIds, vehicleId }: { orderIds: string[]; vehicleId: string }) =>
      api.post('/dispatch/assign', { orderIds, vehicleId }),
    onSuccess: () => {
      // Invalidate liên quan để refresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch'] });
    },
  });
}
