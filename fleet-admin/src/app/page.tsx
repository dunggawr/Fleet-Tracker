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
  Loader2
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useVehicles } from '@/hooks/use-vehicles';
import { useDrivers } from '@/hooks/use-drivers';
import { useOrders } from '@/hooks/use-orders';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { vehicles, isLoading: vehiclesLoading } = useVehicles();
  const { drivers, isLoading: driversLoading } = useDrivers();
  const { orders, isLoading: ordersLoading } = useOrders();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = vehiclesLoading || driversLoading || ordersLoading;

  // Use memo to prevent re-calculations and potential hydration issues
  const { stats, recentOrders, alerts } = React.useMemo(() => {
    if (!mounted) return { stats: [], recentOrders: [], alerts: [] };

    const currency = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });

    const today = new Date().toDateString();
    const todayRevenue = orders.reduce((sum, order) => {
      const isToday = new Date(order.createdAt).toDateString() === today;
      return isToday && order.status === 'delivered' ? sum + 1250000 : sum;
    }, 0);

    const statsData = [
      { 
        label: 'Total Vehicles', 
        value: vehicles.length, 
        icon: Truck, 
        trend: { value: 12, isUp: true }, 
        color: '#6366f1' 
      },
      { 
        label: 'Active Drivers', 
        value: drivers.filter(d => d.status === 'available').length, 
        icon: Users, 
        trend: { value: 5, isUp: true }, 
        color: '#0ea5e9' 
      },
      { 
        label: 'Pending Orders', 
        value: orders.filter(o => o.status === 'pending').length, 
        icon: ClipboardList, 
        trend: { value: 2, isUp: false }, 
        color: '#f59e0b' 
      },
      { 
        label: 'Today Revenue', 
        value: currency.format(todayRevenue), 
        icon: TrendingUp, 
        trend: { value: 8, isUp: true }, 
        color: '#10b981' 
      },
    ];

    const sortedOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const alertsData = [
      { type: 'speed' as const, message: 'Vehicle VN-102 exceeding speed limit (85km/h)', time: '2 mins ago' },
      { type: 'route' as const, message: 'Vehicle VN-045 diverted from planned route', time: '15 mins ago' },
      { type: 'stop' as const, message: 'Vehicle VN-088 unplanned stop > 30 mins', time: '40 mins ago' },
    ];

    return { stats: statsData, recentOrders: sortedOrders, alerts: alertsData };
  }, [mounted, vehicles, drivers, orders]);

  if (!mounted || isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <div className="flex flex-col gap-xl">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-text-dim">Welcome back, here&apos;s what&apos;s happening with your fleet today.</p>
        </div>
        <Button variant="primary" icon={<TrendingUp size={18} />}>
          View Reports
        </Button>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-lg">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-lg">
        <section className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="text-xl font-semibold">Recent Orders</h3>
            <Button variant="ghost" size="sm">View All <ArrowRight size={14} /></Button>
          </div>
          <div className="flex flex-col gap-md">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-md p-md bg-surface-low rounded-default border border-border">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-primary-light">
                  <ClipboardList size={18} />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex gap-1.5 font-medium">
                    <span className="text-primary-light">ORD-{order.id.substring(0, 4)}</span>
                    <span className="text-text-dim">to</span>
                    <span className="text-text">{order.deliveryAddress}</span>
                  </div>
                  <span className="text-[12px] text-text-dim">
                    {formatDistanceToNow(new Date(order.createdAt))} ago
                  </span>
                </div>
                <Badge variant={order.status === 'delivering' ? 'primary' : order.status === 'assigned' ? 'success' : 'warning'}>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="text-xl font-semibold">Live Alerts</h3>
            <Badge variant="danger">Live</Badge>
          </div>
          <div className="flex flex-col gap-md">
            {alerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`
                  flex justify-between items-center p-md bg-surface-low rounded-default border-l-4
                  ${alert.type === 'speed' ? 'border-l-danger' : alert.type === 'route' ? 'border-l-warning' : 'border-l-orange-500'}
                `}
              >
                <div className="flex-1">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-1 ${alert.type === 'speed' ? 'text-danger' : alert.type === 'route' ? 'text-warning' : 'text-orange-500'}`}>
                    <AlertTriangle size={16} />
                    <span>{alert.type.toUpperCase()}</span>
                  </div>
                  <p className="text-[13px] text-text mb-1">{alert.message}</p>
                  <span className="flex items-center gap-1 text-[11px] text-text-dim"><Clock size={12} /> {alert.time}</span>
                </div>
                <Button variant="secondary" size="sm">Action</Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

