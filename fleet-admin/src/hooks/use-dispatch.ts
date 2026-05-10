import { useMemo } from 'react';
import { useOrders } from './use-orders';
import { useVehicles } from './use-vehicles';
import { Order, Vehicle } from '@/types';

export function useDispatch() {
  const { orders, isLoading: ordersLoading, assignOrder, isAssigning } = useOrders();
  // Fetch all vehicles up to 100, so we can filter locally and avoid enum case issues in API query
  const { vehicles, isLoading: vehiclesLoading } = useVehicles({ limit: 100 });

  const pendingOrders = useMemo<Order[]>(
    () => orders.filter((order: Order) => (order.status || '').toLowerCase() === 'pending'),
    [orders],
  );

  const availableVehicles = useMemo<Vehicle[]>(
    () => vehicles.filter((vehicle: Vehicle) => (vehicle.status || '').toLowerCase() === 'available'),
    [vehicles],
  );

  return {
    orders,
    vehicles,
    pendingOrders,
    availableVehicles,
    assignOrder,
    isAssigning,
    isLoading: ordersLoading || vehiclesLoading,
  };
}