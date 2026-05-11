'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Map, Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, Activity } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

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

interface LiveTrackingMapProps {
  vehicles: VehiclePosition[];
  selectedVehicle: VehiclePosition | null;
  onVehicleSelect: (vehicle: VehiclePosition | null) => void;
}

const STATUS_COLORS = {
  active: '#22c55e',
  idle: '#f59e0b',
  offline: '#6b7280',
};

export default function LiveTrackingMap({
  vehicles,
  selectedVehicle,
  onVehicleSelect,
}: LiveTrackingMapProps) {
  if (!MAPBOX_TOKEN) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        background: '#0f172a', color: '#94a3b8',
      }}>
        <Activity size={40} color="#6366f1" />
        <p style={{ fontWeight: 600, color: '#f8fafc', margin: 0 }}>Mapbox token chưa được cấu hình</p>
        <p style={{ fontSize: 13, margin: 0 }}>
          Thêm <code style={{ color: '#818cf8', background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code> vào file <strong>.env.local</strong>
        </p>
        {/* Simulated vehicle list as fallback */}
        <div style={{ marginTop: 20, width: '90%', maxWidth: 400 }}>
          {vehicles.map(v => (
            <div key={v.vehicleId} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', background: '#1e293b', borderRadius: 8,
              marginBottom: 8, border: '1px solid #334155', cursor: 'pointer',
              borderLeft: `3px solid ${STATUS_COLORS[v.status]}`,
            }} onClick={() => onVehicleSelect(v)}>
              <Truck size={16} color={STATUS_COLORS[v.status]} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 13 }}>{v.licensePlate}</div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>{v.driverName}</div>
              </div>
              <span style={{
                fontSize: 11, background: STATUS_COLORS[v.status] + '20',
                color: STATUS_COLORS[v.status], padding: '2px 8px', borderRadius: 10, fontWeight: 600,
              }}>
                {v.status === 'active' ? 'Đang chạy' : v.status === 'idle' ? 'Chờ' : 'Offline'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate center from vehicles or default to HCMC
  const center = vehicles.length > 0
    ? {
      lng: vehicles.reduce((s, v) => s + v.longitude, 0) / vehicles.length,
      lat: vehicles.reduce((s, v) => s + v.latitude, 0) / vehicles.length,
    }
    : { lng: 106.660172, lat: 10.762622 };

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: center.lng,
        latitude: center.lat,
        zoom: 12,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      <NavigationControl position="top-right" />
      <FullscreenControl position="top-right" />

      {vehicles.map(vehicle => (
        <React.Fragment key={vehicle.vehicleId}>
          <Marker
            longitude={vehicle.longitude}
            latitude={vehicle.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onVehicleSelect(
                selectedVehicle?.vehicleId === vehicle.vehicleId ? null : vehicle
              );
            }}
          >
            <div
              title={`${vehicle.licensePlate} - ${vehicle.driverName}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: STATUS_COLORS[vehicle.status],
                border: `3px solid ${selectedVehicle?.vehicleId === vehicle.vehicleId ? '#6366f1' : 'white'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: `0 2px 12px ${STATUS_COLORS[vehicle.status]}66`,
                transform: selectedVehicle?.vehicleId === vehicle.vehicleId ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 0.2s, border-color 0.2s',
                rotate: `${vehicle.heading}deg`,
              }}
            >
              <Truck size={16} color="white" />
            </div>
          </Marker>

          {selectedVehicle?.vehicleId === vehicle.vehicleId && (
            <Popup
              longitude={vehicle.longitude}
              latitude={vehicle.latitude}
              anchor="bottom"
              offset={24}
              closeButton={true}
              onClose={() => onVehicleSelect(null)}
              style={{ zIndex: 10 }}
            >
              <div style={{
                padding: '12px', minWidth: 200, background: '#1e293b',
                color: '#f8fafc', borderRadius: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Truck size={16} color={STATUS_COLORS[vehicle.status]} />
                  <strong style={{ fontSize: 14 }}>{vehicle.licensePlate}</strong>
                  <span style={{
                    fontSize: 11, background: STATUS_COLORS[vehicle.status] + '30',
                    color: STATUS_COLORS[vehicle.status], padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                  }}>
                    {vehicle.status === 'active' ? 'Đang chạy' : vehicle.status === 'idle' ? 'Chờ' : 'Offline'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8 }}>
                  <div><strong style={{ color: '#e2e8f0' }}>Tài xế:</strong> {vehicle.driverName}</div>
                  <div><strong style={{ color: '#e2e8f0' }}>Tốc độ:</strong> {vehicle.speed.toFixed(0)} km/h</div>
                  {vehicle.ordersCount !== undefined && (
                    <div><strong style={{ color: '#e2e8f0' }}>Đơn hàng:</strong> {vehicle.ordersCount} đơn</div>
                  )}
                  {vehicle.currentTripId && (
                    <div>
                      <strong style={{ color: '#e2e8f0' }}>Chuyến:</strong>{' '}
                      <span style={{ color: '#818cf8' }}>#{vehicle.currentTripId.slice(0, 8)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </React.Fragment>
      ))}
    </Map>
  );
}
