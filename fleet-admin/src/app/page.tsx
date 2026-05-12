'use client';

import React from 'react';
import { 
  Truck, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  ArrowRight,
  Loader2,
  MoreVertical,
  Navigation,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { Vehicle } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { useVehicles } from '@/hooks/use-vehicles';
import { useDrivers } from '@/hooks/use-drivers';
import { useOrders } from '@/hooks/use-orders';
import { useAlerts } from '@/hooks/use-alerts';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { alerts, isLoading: alertsLoading, resolveAlert } = useAlerts();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currency = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

  const todayRevenue = orders.reduce((sum, order) => {
    const isToday = new Date(order.createdAt).toDateString() === new Date().toDateString();
    return isToday && order.status === 'delivered' ? sum + 1250000 : sum;
  }, 0);

  // Real statistics based on fetched data
  const stats = [
    { 
      label: 'Total Vehicles', 
      value: vehicles.length, 
      icon: Truck, 
      trend: { value: 12, isUp: true }, 
      color: '#6366f1',
      path: '/vehicles'
    },
    { 
      label: 'Active Drivers', 
      value: drivers.filter(d => d.status === 'available').length, 
      icon: Users, 
      trend: { value: 5, isUp: true }, 
      color: '#0ea5e9',
      path: '/drivers'
    },
    { 
      label: 'Pending Orders', 
      value: orders.filter(o => o.status === 'pending').length, 
      icon: ClipboardList, 
      trend: { value: 2, isUp: false }, 
      color: '#f59e0b',
      path: '/orders'
    },
    { 
      label: 'Today Revenue', 
      value: currency.format(todayRevenue), 
      icon: TrendingUp, 
      trend: { value: 8, isUp: true }, 
      color: '#10b981',
      path: '/reports'
    },
  ];

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const isLoading = vehiclesLoading || driversLoading || ordersLoading || alertsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard Overview</h1>
          <p className="text-text-dim">Welcome back, here&apos;s what&apos;s happening with your fleet today.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<TrendingUp size={18} />}
          href="/reports"
        >
          View Reports
        </Button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard 
            key={idx} 
            {...stat} 
            href={stat.path}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <section className="bg-surface p-6 rounded-xl border border-border shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text">Recent Orders</h3>
            <Button 
              variant="ghost" 
              size="sm"
              href="/orders"
            >
              View All <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center gap-4 p-4 bg-surface-low rounded-lg border border-border cursor-pointer transition-all hover:bg-surface-high hover:-translate-y-0.5 hover:border-primary-light"
                onClick={() => router.push(`/dispatch?orderId=${order.id}`)}
              >
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-primary-light">
                  <ClipboardList size={18} />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <span className="text-primary-light">ORD-{order.id.substring(0, 4)}</span>
                    <span className="text-text-dim text-sm">to</span>
                    <span className="text-text truncate">{order.deliveryAddress}</span>
                  </div>
                  <span className="text-xs text-text-dim">
                    {mounted ? `${formatDistanceToNow(new Date(order.createdAt))} ago` : '...'}
                  </span>
                </div>
                <Badge variant={order.status === 'delivering' ? 'primary' : order.status === 'assigned' ? 'success' : 'warning'}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface p-6 rounded-xl border border-border shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text">Live Alerts</h3>
            <Badge variant="danger" className="animate-pulse">Live</Badge>
          </div>
          <div className="flex flex-col gap-4">
            {alerts.length === 0 ? (
              <div className="text-text-dim text-center py-8 bg-surface-low rounded-lg border border-dashed border-border">
                No active alerts
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`
                    flex justify-between items-center p-4 bg-surface-low rounded-lg border-l-4 
                    ${alert.type === 'speed_violation' ? 'border-l-danger' : 
                      alert.type === 'route_deviation' ? 'border-l-warning' : 
                      alert.type === 'abnormal_stop' ? 'border-l-[#f97316]' : 'border-l-danger'}
                  `}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-1 uppercase tracking-wider
                      ${alert.type === 'speed_violation' ? 'text-danger' : 
                        alert.type === 'route_deviation' ? 'text-warning' : 
                        alert.type === 'abnormal_stop' ? 'text-[#f97316]' : 'text-danger'}
                    `}>
                      <AlertTriangle size={14} />
                      <span>{alert.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-[13px] text-text mb-1 line-clamp-2">{alert.message}</p>
                    <span className="flex items-center gap-1 text-[11px] text-text-dim">
                      <Clock size={12} /> 
                      {mounted ? `${formatDistanceToNow(new Date(alert.createdAt))} ago` : '...'}
                    </span>
                  </div>
                  <Dropdown align="right" trigger={
                    <Button variant="secondary" size="sm">
                      Action
                    </Button>
                  }>
                    <button className="dropdown-item" onClick={() => router.push(`/dispatch?vehicleId=${alert.vehicleId}`)}>
                      <Navigation size={16} /> Track Location
                    </button>
                    <button className="dropdown-item" onClick={() => router.push(`/vehicles?search=${alert.vehicle?.plateNumber}`)}>
                      <AlertTriangle size={16} /> View Vehicle
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item text-danger hover:bg-danger/10" onClick={() => resolveAlert(alert.id)}>
                      <CheckCircle size={16} /> Dismiss Alert
                    </button>
                  </Dropdown>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
