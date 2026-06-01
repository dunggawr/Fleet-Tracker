'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useVehicles } from '@/hooks/use-vehicles';
import { useDrivers } from '@/hooks/use-drivers';
import { useOrders } from '@/hooks/use-orders';
import { useAlerts } from '@/hooks/use-alerts';
import { useTrips } from '@/hooks/use-trips';

// Extracted Components
import { DashboardHeader } from './dashboard/components/DashboardHeader';
import { DashboardStats } from './dashboard/components/DashboardStats';
import { RecentOrdersCard } from './dashboard/components/RecentOrdersCard';
import { RecentActivityCard } from './dashboard/components/RecentActivityCard';
import { LiveAlertsCard } from './dashboard/components/LiveAlertsCard';

export default function DashboardPage() {
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { alerts, isLoading: alertsLoading, resolveAlert } = useAlerts();
  const { data: trips, isLoading: tripsLoading } = useTrips();

  const isLoading = vehiclesLoading || driversLoading || ordersLoading || alertsLoading || tripsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xl">
      <DashboardHeader />

      <DashboardStats 
        vehicles={vehicles}
        drivers={drivers}
        orders={orders}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <RecentOrdersCard orders={orders} />
        <RecentActivityCard orders={orders} alerts={alerts} trips={trips || []} />
        <LiveAlertsCard alerts={alerts.filter(a => a.type !== 'speed_violation')} onResolve={resolveAlert} />
      </div>
    </div>
  );
}
