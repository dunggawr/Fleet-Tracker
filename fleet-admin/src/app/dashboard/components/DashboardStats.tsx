import React from 'react';
import { Truck, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Vehicle, Driver, Order } from '@/types';

interface DashboardStatsProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  orders: Order[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  vehicles,
  drivers,
  orders,
}) => {
  const currency = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).toDateString();
    const todayDate = new Date().toDateString();
    return orderDate === todayDate;
  });

  // Fallback to all orders if no orders created today (supports seeded db)
  const targetOrders = todayOrders.length > 0 ? todayOrders : orders;

  const todayRevenue = targetOrders.reduce((sum, order) => {
    if (order.status !== 'delivered') return sum;
    // Dynamic calculation: 850 VND per kg + 200,000 VND base fare per order
    const orderRevenue = Math.round(Number(order.weightKg) * 850) + 200000;
    return sum + orderRevenue;
  }, 0);

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
      value: drivers.filter(d => d.status !== 'off_duty').length, 
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

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-lg">
      {stats.map((stat, idx) => (
        <StatCard 
          key={idx} 
          {...stat} 
          href={stat.path}
        />
      ))}
    </section>
  );
};
