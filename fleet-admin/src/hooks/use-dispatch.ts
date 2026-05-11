import { useMemo } from 'react';
import { useOrders } from './use-orders';
import { useVehicles } from './use-vehicles';
import { Order, Vehicle } from '@/types';

export function useDispatch() {
  const { orders, isLoading: ordersLoading, assignOrder, isAssigning } = useOrders();
  // Fetch all vehicles up to 100, so we can filter locally and avoid enum case issues in API query
  const { vehicles: availableVehicles, isLoading: vehiclesLoading } = useVehicles({ 
    status: 'available',
    limit: 100 
  });

  const pendingOrders = useMemo<Order[]>(
    () => orders.filter((order: Order) => (order.status || '').toLowerCase() === 'pending'),
    [orders],
  );

  return {
    orders,
    availableVehicles,
    pendingOrders,
    assignOrder,
    isAssigning,
    isLoading: ordersLoading || vehiclesLoading,
  };
}