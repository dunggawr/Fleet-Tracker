'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { connectSocket, disconnectSocket, SOCKET_EVENTS } from '@/lib/socket';
import { api } from '@/lib/api';
import {
  Activity,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  Navigation,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Dynamic import to avoid SSR issues with Mapbox
const LiveTrackingMap = dynamic(() => import('@/components/tracking/LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="map-loading-spinner" />
      <span>Đang tải bản đồ...</span>
    </div>
  ),
});

interface VehiclePosition {
  vehicleId: string;
  driverId: string;
  licensePlate: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: 'active' | 'idle' | 'offline';
  lastUpdate: string;
  currentTripId?: string;
  ordersCount?: number;
}

interface Alert {
  id: string;
  type: 'sos' | 'geofence' | 'speeding' | 'idle';
  vehicleId: string;
  driverName: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function LiveTrackingPage() {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePosition | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'idle' | 'offline'>('all');
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);

  const initSocket = useCallback(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Subscribe to all vehicles
      socket.emit(SOCKET_EVENTS.GPS_SUBSCRIBE, { all: true });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time GPS updates from all drivers
    socket.on(SOCKET_EVENTS.GPS_UPDATE, (data: any) => {
      const update: VehiclePosition = {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        licensePlate: data.licensePlate || `VH-${data.vehicleId.slice(0, 6)}`,
        driverName: data.driverName || 'Unknown Driver',
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed || 0,
        heading: data.heading || 0,
        status: data.status || 'active',
        lastUpdate: new Date().toISOString(),
        currentTripId: data.currentTripId,
        ordersCount: data.ordersCount,
      };

      setVehicles(prev => {
        const idx = prev.findIndex(v => v.vehicleId === update.vehicleId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = update;
          return next;
        }
        return [...prev, update];
      });
    });

    // Alerts from backend
    socket.on(SOCKET_EVENTS.ALERT_NEW, (data: any) => {
      const alert: Alert = {
        id: data.id || `alert-${Date.now()}`,
        type: data.type === 'SOS' ? 'sos' : 'idle', // Map to known types, fallback to idle or generic
        vehicleId: data.vehicleId || 'N/A',
        driverName: data.driver?.fullName || data.driverId || 'Unknown',
        message: data.message || `🚨 Có cảnh báo mới từ ${data.vehicleId}`,
        timestamp: data.createdAt || new Date().toISOString(),
        resolved: data.isResolved || false,
      };
      setAlerts(prev => [alert, ...prev.slice(0, 19)]);
    });

    // Driver status changes
    socket.on(SOCKET_EVENTS.DRIVER_STATUS_CHANGED, (data: any) => {
      setVehicles(prev =>
        prev.map(v =>
          v.driverId === data.driverId ? { ...v, status: data.status } : v
        )
      );
    });

    return socket;
  }, []);

  // Load initial vehicle list from REST API
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const [vehiclesData, driversData] = await Promise.all([
          api.get<any[]>('/vehicles', { params: { status: 'ACTIVE' } }),
          api.get<any[]>('/drivers', { params: { status: 'ACTIVE' } }),
        ]);

        // Build initial positions from DB data (no GPS yet)
        const initial: VehiclePosition[] = vehiclesData.map((v: any) => {
          const driver = driversData.find((d: any) => d.id === v.currentDriverId);
          return {
            vehicleId: v.id,
            driverId: v.currentDriverId || '',
            licensePlate: v.licensePlate,
            driverName: driver ? driver.fullName : 'Chưa phân công',
            latitude: 10.762622 + (Math.random() - 0.5) * 0.1, // placeholder
            longitude: 106.660172 + (Math.random() - 0.5) * 0.1,
            speed: 0,
            heading: 0,
            status: v.status === 'ACTIVE' ? 'idle' : 'offline',
            lastUpdate: new Date().toISOString(),
          };
        });
        setVehicles(initial);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      }
    };

    loadVehicles();
    initSocket();

    return () => {
      disconnectSocket();
    };
  }, [initSocket]);

  const filteredVehicles = vehicles.filter(v =>
    filter === 'all' ? true : v.status === filter
  );

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
    offline: vehicles.filter(v => v.status === 'offline').length,
    alerts: alerts.filter(a => !a.resolved).length,
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  return (
    <div className="tracking-page">
      {/* Header */}
      <div className="tracking-header">
        <div className="tracking-title">
          <Navigation size={24} />
          <h1>Theo dõi đội xe trực tiếp</h1>
          <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
          </div>
        </div>

        <div className="tracking-filters">
          {(['all', 'active', 'idle', 'offline'] as const).map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Tất cả' : f === 'active' ? 'Đang chạy' : f === 'idle' ? 'Chờ' : 'Offline'}
              <span className="filter-count">
                {f === 'all' ? stats.total : stats[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="tracking-stats">
        <div className="stat-card">
          <Truck size={20} className="stat-icon blue" />
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng xe</div>
          </div>
        </div>
        <div className="stat-card">
          <Activity size={20} className="stat-icon green" />
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Đang vận chuyển</div>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={20} className="stat-icon yellow" />
          <div>
            <div className="stat-value">{stats.idle}</div>
            <div className="stat-label">Chờ việc</div>
          </div>
        </div>
        <div className="stat-card">
          <AlertTriangle size={20} className="stat-icon red" />
          <div>
            <div className="stat-value">{stats.alerts}</div>
            <div className="stat-label">Cảnh báo</div>
          </div>
        </div>
      </div>

      <div className="tracking-body">
        {/* Map */}
        <div className="map-container">
          <LiveTrackingMap
            vehicles={filteredVehicles}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={setSelectedVehicle}
          />
        </div>

        {/* Sidebar */}
        <div className="tracking-sidebar">
          {/* Active Alerts */}
          {alerts.filter(a => !a.resolved).length > 0 && (
            <div className="sidebar-section alerts-section">
              <h3 className="section-title">
                <AlertTriangle size={16} className="text-red" />
                Cảnh báo ({alerts.filter(a => !a.resolved).length})
              </h3>
              {alerts.filter(a => !a.resolved).slice(0, 5).map(alert => (
                <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                  <div className="alert-content">
                    <span className="alert-message">{alert.message}</span>
                    <span className="alert-time">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <button
                    className="alert-resolve"
                    onClick={() => resolveAlert(alert.id)}
                    title="Đánh dấu đã xử lý"
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Vehicle List */}
          <div className="sidebar-section">
            <h3 className="section-title">
              <Truck size={16} />
              Danh sách xe ({filteredVehicles.length})
            </h3>
            <div className="vehicle-list">
              {filteredVehicles.length === 0 ? (
                <div className="empty-list">Không có xe nào</div>
              ) : (
                filteredVehicles.map(vehicle => (
                  <div
                    key={vehicle.vehicleId}
                    className={`vehicle-item ${selectedVehicle?.vehicleId === vehicle.vehicleId ? 'selected' : ''}`}
                    onClick={() => setSelectedVehicle(
                      selectedVehicle?.vehicleId === vehicle.vehicleId ? null : vehicle
                    )}
                  >
                    <div className={`vehicle-status-dot status-${vehicle.status}`} />
                    <div className="vehicle-info">
                      <div className="vehicle-plate">{vehicle.licensePlate}</div>
                      <div className="vehicle-driver">{vehicle.driverName}</div>
                      <div className="vehicle-meta">
                        <MapPin size={12} />
                        {vehicle.speed > 0 ? `${vehicle.speed.toFixed(0)} km/h` : 'Đang đứng'}
                        {vehicle.ordersCount !== undefined && (
                          <span className="orders-badge">{vehicle.ordersCount} đơn</span>
                        )}
                      </div>
                    </div>
                    <button className="vehicle-focus-btn" title="Xem trên bản đồ">
                      <Eye size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Vehicle Detail */}
          {selectedVehicle && (
            <div className="sidebar-section vehicle-detail">
              <h3 className="section-title">Chi tiết xe</h3>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Biển số</span>
                  <span className="detail-value">{selectedVehicle.licensePlate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tài xế</span>
                  <span className="detail-value">{selectedVehicle.driverName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tốc độ</span>
                  <span className="detail-value">{selectedVehicle.speed.toFixed(1)} km/h</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tọa độ</span>
                  <span className="detail-value">
                    {selectedVehicle.latitude.toFixed(5)}, {selectedVehicle.longitude.toFixed(5)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Cập nhật</span>
                  <span className="detail-value">
                    {formatDistanceToNow(new Date(selectedVehicle.lastUpdate), { addSuffix: true })}
                  </span>
                </div>
                {selectedVehicle.currentTripId && (
                  <div className="detail-row">
                    <span className="detail-label">Chuyến</span>
                    <span className="detail-value trip-link">
                      #{selectedVehicle.currentTripId.slice(0, 8)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .tracking-page {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
          min-height: 0;
        }

        .tracking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .tracking-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-primary);
        }

        .tracking-title h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .connection-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .connection-badge.connected {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .connection-badge.disconnected {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .tracking-filters {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .filter-btn:hover:not(.active) {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .filter-count {
          background: rgba(255,255,255,0.2);
          padding: 1px 6px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .filter-btn:not(.active) .filter-count {
          background: var(--bg-secondary);
          color: var(--text-muted);
        }

        .tracking-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          flex-shrink: 0;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .stat-icon { flex-shrink: 0; }
        .stat-icon.blue { color: #3b82f6; }
        .stat-icon.green { color: #22c55e; }
        .stat-icon.yellow { color: #f59e0b; }
        .stat-icon.red { color: #ef4444; }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .tracking-body {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 16px;
          flex: 1;
          min-height: 0;
        }

        .map-container {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          position: relative;
          min-height: 500px;
        }

        .map-loading {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--bg-card);
          color: var(--text-muted);
        }

        .map-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .tracking-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          min-height: 0;
        }

        .sidebar-section {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 16px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 12px 0;
        }

        .text-red { color: #ef4444; }

        .alerts-section { border-left: 3px solid #ef4444; }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .alert-item.alert-sos {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .alert-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .alert-message { color: var(--text-primary); font-weight: 500; }
        .alert-time { color: var(--text-muted); font-size: 11px; }

        .alert-resolve {
          background: none;
          border: none;
          color: #22c55e;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .alert-resolve:hover { background: rgba(34, 197, 94, 0.1); }

        .vehicle-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 300px;
          overflow-y: auto;
        }

        .empty-list {
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          padding: 20px;
        }

        .vehicle-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .vehicle-item:hover {
          background: var(--bg-secondary);
          border-color: var(--border-color);
        }

        .vehicle-item.selected {
          background: rgba(99, 102, 241, 0.1);
          border-color: var(--accent-primary);
        }

        .vehicle-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-active { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
        .status-idle { background: #f59e0b; }
        .status-offline { background: #6b7280; }

        .vehicle-info { flex: 1; }

        .vehicle-plate {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .vehicle-driver {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .vehicle-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .orders-badge {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          padding: 1px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .vehicle-focus-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .vehicle-focus-btn:hover {
          background: var(--accent-primary);
          color: white;
        }

        .vehicle-detail { border-top: 3px solid var(--accent-primary); }

        .detail-grid { display: flex; flex-direction: column; gap: 8px; }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .detail-label { color: var(--text-muted); }
        .detail-value { color: var(--text-primary); font-weight: 500; font-family: monospace; }
        .trip-link { color: var(--accent-primary); }
      `}</style>
    </div>
  );
}
