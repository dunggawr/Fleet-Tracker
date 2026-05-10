'use client';

import React from 'react';
import { DispatchOrdersSidebar, DispatchOrderGroup } from './components/DispatchOrdersSidebar';
import { DispatchVehiclesSidebar } from './components/DispatchVehiclesSidebar';
import { DispatchMapPanel } from './components/DispatchMapPanel';
import { useDispatch } from '@/hooks/use-dispatch';

export default function DispatchPage() {
  const { pendingOrders, availableVehicles, assignOrder, isLoading, isAssigning } = useDispatch();
  const [selectedOrder, setSelectedOrder] = React.useState<string | null>(null);
  const [clusterView, setClusterView] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredPendingOrders = React.useMemo(() => {
    return pendingOrders.filter((order) =>
      [order.id, order.pickupAddress, order.deliveryAddress]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
  }, [pendingOrders, searchQuery]);

  const clusterGroups = React.useMemo<DispatchOrderGroup[]>(() => {
    if (!clusterView) {
      return filteredPendingOrders.map((order) => ({
        key: order.id,
        label: `Order ${order.id.split('-')[0]}`,
        orders: [order],
      }));
    }

    const groups = new Map<string, typeof filteredPendingOrders>();

    filteredPendingOrders.forEach((order) => {
      const rawKey = order.pickupAddress.split(',').slice(-1)[0]?.trim() || order.pickupAddress.split(' ').slice(0, 2).join(' ');
      const key = rawKey || 'Cluster';
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, order]);
    });

    return Array.from(groups.entries()).map(([key, orders]) => ({
      key,
      label: key,
      orders,
    }));
  }, [clusterView, filteredPendingOrders]);

  const handleAssign = async (vehicleId: string) => {
    if (!selectedOrder) return;

    await assignOrder({ orderId: selectedOrder, vehicleId });
    setSelectedOrder(null);
  };

  return (
    <div className="grid grid-cols-[320px_1fr_320px] h-[calc(100vh-var(--header-height)-var(--space-xl)*2)] gap-[var(--space-md)] -m-[var(--space-md)] p-[var(--space-md)] overflow-hidden">
      <DispatchOrdersSidebar
        pendingOrderCount={pendingOrders.length}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedOrder={selectedOrder}
        onSelectOrder={setSelectedOrder}
        clusterView={clusterView}
        groups={clusterGroups}
      />

      <DispatchMapPanel
        clusterView={clusterView}
        onToggleClusterView={() => setClusterView((value) => !value)}
        pendingOrders={filteredPendingOrders}
        availableVehicles={availableVehicles}
      />

      <DispatchVehiclesSidebar
        availableVehicles={availableVehicles}
        isLoading={isLoading}
        isAssigning={isAssigning}
        selectedOrder={selectedOrder}
        onAssignVehicle={handleAssign}
      />
    </div>
  );
}
