import React from 'react';
import { 
  Activity, 
  Truck, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Order, Alert, Trip } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface RecentActivityCardProps {
  orders: Order[];
  alerts: Alert[];
  trips?: Trip[];
}

interface ActivityItem {
  id: string;
  type: 'order' | 'alert' | 'trip';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  meta?: any;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ 
  orders, 
  alerts, 
  trips = [] 
}) => {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Synthesize activities from orders, alerts, and trips
  const activities: ActivityItem[] = React.useMemo(() => {
    const items: ActivityItem[] = [];

    // 1. Map recent orders
    orders.forEach(order => {
      // Map creation
      items.push({
        id: `order-created-${order.id}`,
        type: 'order',
        title: `Order Created`,
        description: `New order ORD-${order.id.substring(0, 4)} to ${order.deliveryAddress}`,
        timestamp: new Date(order.createdAt),
        status: 'pending',
        meta: { orderId: order.id }
      });

      // Map transitions
      if (order.status !== 'pending') {
        let actionWord = 'updated';
        if (order.status === 'assigned') actionWord = 'assigned to driver';
        else if (order.status === 'picked_up') actionWord = 'picked up cargo';
        else if (order.status === 'delivering') actionWord = 'departed for delivery';
        else if (order.status === 'delivered') actionWord = 'successfully delivered';
        else if (order.status === 'failed') actionWord = 'failed delivery';
        else if (order.status === 'cancelled') actionWord = 'cancelled';

        items.push({
          id: `order-status-${order.id}-${order.status}`,
          type: 'order',
          title: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
          description: `Order ORD-${order.id.substring(0, 4)} ${actionWord}`,
          timestamp: new Date(order.updatedAt),
          status: order.status,
          meta: { orderId: order.id }
        });
      }
    });

    // 2. Map recent alerts
    alerts.forEach(alert => {
      items.push({
        id: `alert-${alert.id}`,
        type: 'alert',
        title: alert.type.replace('_', ' ').toUpperCase(),
        description: `${alert.message} (${alert.vehicle?.plateNumber || 'Unknown Vehicle'})`,
        timestamp: new Date(alert.createdAt),
        severity: alert.severity,
        meta: { vehicleId: alert.vehicleId, alertId: alert.id }
      });
    });

    // 3. Map recent trips
    trips.forEach(trip => {
      if (trip.startedAt) {
        items.push({
          id: `trip-start-${trip.id}`,
          type: 'trip',
          title: 'Trip Started',
          description: `Driver ${trip.driver?.fullName || 'Driver'} started trip on vehicle ${trip.vehicle?.plateNumber || ''}`,
          timestamp: new Date(trip.startedAt),
          status: 'in_progress',
          meta: { tripId: trip.id }
        });
      }
      if (trip.completedAt) {
        items.push({
          id: `trip-complete-${trip.id}`,
          type: 'trip',
          title: 'Trip Completed',
          description: `Driver ${trip.driver?.fullName || 'Driver'} finished trip. Distance: ${trip.totalDistanceKm || 0} km`,
          timestamp: new Date(trip.completedAt),
          status: 'completed',
          meta: { tripId: trip.id }
        });
      }
    });

    // Sort chronologically (most recent first)
    return items
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 7); // Display top 7 recent activities
  }, [orders, alerts, trips]);

  const getActivityIcon = (type: 'order' | 'alert' | 'trip', status?: string) => {
    switch (type) {
      case 'alert':
        return (
          <div className="w-9 h-9 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center text-danger animate-pulse">
            <AlertTriangle size={15} />
          </div>
        );
      case 'trip':
        return (
          <div className={`w-9 h-9 ${status === 'completed' ? 'bg-success/10 border border-success/20 text-success' : 'bg-primary/10 border border-primary/20 text-primary-light'} rounded-full flex items-center justify-center`}>
            <Truck size={15} />
          </div>
        );
      case 'order':
      default:
        return (
          <div className={`w-9 h-9 ${status === 'delivered' ? 'bg-success/10 border border-success/20 text-success' : status === 'pending' ? 'bg-warning/10 border border-warning/20 text-warning' : 'bg-info/10 border border-info/20 text-info'} rounded-full flex items-center justify-center`}>
            <ClipboardList size={15} />
          </div>
        );
    }
  };

  return (
    <section className="bg-surface p-lg rounded-xl border border-border shadow-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-primary-light" />
          <h3 className="text-lg font-semibold text-text">Recent Activity</h3>
        </div>
        <Badge variant="primary" className="font-mono text-[10px]">REAL-TIME</Badge>
      </div>

      <div className="relative flex-1 flex flex-col gap-lg pl-3 border-l border-border/60 ml-4 py-2">
        {activities.length === 0 ? (
          <div className="text-text-dim text-center py-8 bg-surface-low rounded-lg border border-dashed border-border ml-[-1rem]">
            No recent activities
          </div>
        ) : (
          activities.map((activity, idx) => (
            <div 
              key={activity.id} 
              className="relative flex gap-md group cursor-pointer"
              onClick={() => {
                if (activity.type === 'order' && activity.meta?.orderId) {
                  router.push(`/dispatch?orderId=${activity.meta.orderId}`);
                } else if (activity.type === 'alert' && activity.meta?.vehicleId) {
                  router.push(`/dispatch?vehicleId=${activity.meta.vehicleId}`);
                } else if (activity.type === 'trip' && activity.meta?.tripId) {
                  router.push(`/tracking`);
                }
              }}
            >
              {/* Timeline marker placement */}
              <div className="absolute left-[-29px] top-0 transition-transform group-hover:scale-110">
                {getActivityIcon(activity.type, activity.status)}
              </div>

              <div className="flex-1 flex flex-col min-w-0 bg-surface-low hover:bg-surface-high p-md rounded-lg border border-border/40 hover:border-primary-light/30 transition-all duration-200">
                <div className="flex justify-between items-start gap-sm mb-1">
                  <span className="font-semibold text-sm text-text-high group-hover:text-primary-light transition-colors">
                    {activity.title}
                  </span>
                  <span className="text-[10px] text-text-dim flex items-center gap-1 shrink-0 font-mono">
                    <Clock size={10} />
                    {mounted ? `${formatDistanceToNow(activity.timestamp)} ago` : '...'}
                  </span>
                </div>
                
                <p className="text-xs text-text-dim leading-relaxed truncate group-hover:text-text transition-colors">
                  {activity.description}
                </p>

                {activity.status && (
                  <div className="mt-2 flex items-center justify-between">
                    <Badge 
                      variant={
                        activity.status === 'delivered' || activity.status === 'completed' ? 'success' :
                        activity.status === 'pending' ? 'warning' :
                        activity.status === 'failed' || activity.status === 'cancelled' ? 'danger' :
                        'primary'
                      }
                      className="text-[9px] px-1.5 py-0.5"
                    >
                      {activity.status}
                    </Badge>

                    <span className="text-[9px] text-primary-light opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity font-medium">
                      Detail <ArrowRight size={10} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
