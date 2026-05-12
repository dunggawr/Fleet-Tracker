import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '@/types';
import { api } from '@/lib/api';
import { connectSocket, SOCKET_EVENTS } from '@/lib/socket';

export function useAlerts(params?: { driverId?: string; vehicleId?: string; isResolved?: boolean }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Alert[]>('/alerts', { params: { ...params, activeOnly: !params?.isResolved } });
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const resolveAlert = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/resolve`, {});
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (err: any) {
      console.error('Failed to resolve alert:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    let socket: any;

    const setupSocket = async () => {
      socket = await connectSocket();
      
      socket.on(SOCKET_EVENTS.ALERT_NEW, (newAlert: Alert) => {
        // Only add if it matches current filters
        const matchesDriver = !params?.driverId || newAlert.driverId === params.driverId;
        const matchesVehicle = !params?.vehicleId || newAlert.vehicleId === params.vehicleId;
        
        if (matchesDriver && matchesVehicle) {
          setAlerts(prev => [newAlert, ...prev]);
        }
      });

      socket.on(SOCKET_EVENTS.ALERT_RESOLVED, (resolvedAlert: Alert) => {
        setAlerts(prev => prev.filter(a => a.id !== resolvedAlert.id));
      });
    };

    setupSocket();
    
    const interval = setInterval(fetchAlerts, 60000);
    
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off(SOCKET_EVENTS.ALERT_NEW);
        socket.off(SOCKET_EVENTS.ALERT_RESOLVED);
      }
    };
  }, [fetchAlerts, params?.driverId, params?.vehicleId]);

  return {
    alerts,
    isLoading,
    error,
    resolveAlert,
    refreshAlerts: fetchAlerts,
  };
}

export function useDriverAlerts(driverId: string) {
  return useQuery({
    queryKey: ['driver-alerts', driverId],
    queryFn: () => api.get<Alert[]>('/alerts', { params: { driverId } }),
    enabled: !!driverId,
  });
}
