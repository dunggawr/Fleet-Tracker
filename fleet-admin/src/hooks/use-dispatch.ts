import { useMemo } from 'react';
import { useOrders } from './use-orders';
import { useVehicles } from './use-vehicles';

export function useDispatch() {
  const { orders, isLoading: ordersLoading, assignOrder, isAssigning } = useOrders();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'Pending'),
    [orders],
  );

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === 'Active'),
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