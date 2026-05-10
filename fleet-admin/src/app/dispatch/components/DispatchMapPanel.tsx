'use client';

import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { Package, Truck, Users, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Order, Vehicle } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface DispatchMapPanelProps {
  clusterView: boolean;
  onToggleClusterView: () => void;
  pendingOrders: Order[];
  availableVehicles: Vehicle[];
}

const FALLBACK_CENTER = { lat: 10.7769, lng: 106.7009 }; // Ho Chi Minh City

function isValidCoordinate(lat?: number, lng?: number) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function DispatchMapPanel({
  clusterView,
  onToggleClusterView,
  pendingOrders = [],
  availableVehicles = [],
}: DispatchMapPanelProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const orderMarkers = React.useMemo(
    () =>
      pendingOrders
        .map((order) => ({
          id: order.id,
          lat: order.pickupLocation?.lat,
          lng: order.pickupLocation?.lng,
        }))
        .filter((marker) => isValidCoordinate(marker.lat, marker.lng)) as Array<{
        id: string;
        lat: number;
        lng: number;
      }>,
    [pendingOrders],
  );

  const vehicleMarkers = React.useMemo(
    () =>
      availableVehicles
        .map((vehicle) => ({
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          lat: vehicle.lastKnownLocation?.lat,
          lng: vehicle.lastKnownLocation?.lng,
        }))
        .filter((marker) => isValidCoordinate(marker.lat, marker.lng)) as Array<{
        id: string;
        plateNumber: string;
        lat: number;
        lng: number;
      }>,
    [availableVehicles],
  );

  const center = React.useMemo(() => {
    const allPoints = [...orderMarkers, ...vehicleMarkers];
    if (allPoints.length === 0) {
      return FALLBACK_CENTER;
    }

    const total = allPoints.reduce(
      (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
      { lat: 0, lng: 0 },
    );

    return {
      lat: total.lat / allPoints.length,
      lng: total.lng / allPoints.length,
    };
  }, [orderMarkers, vehicleMarkers]);

  return (
    <main className="relative bg-[#0a0a0a] rounded-xl overflow-hidden border border-slate-700/50">
      <div className="w-full h-full flex flex-col">
        <div className="absolute top-6 left-6 right-6 z-10">
          <div className="flex items-center gap-3 px-4 py-2 max-w-75 bg-surface/90  backdrop-blur-md rounded-xl border border-white/10">
            <Navigation size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search map location..." 
              className="bg-transparent border-none text-white outline-none text-sm w-full"
            />
          </div>
        </div>

        <div className="relative flex-1 min-h-90">
          {accessToken ? (
            <Map
              mapboxAccessToken={accessToken}
              initialViewState={{
                longitude: center.lng,
                latitude: center.lat,
                zoom: 11,
              }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              style={{ width: '100%', height: '100%' }}
            >
              <NavigationControl position="top-right" />

              {orderMarkers.map((marker) => (
                <Marker key={`order-${marker.id}`} longitude={marker.lng} latitude={marker.lat}>
                  <div className="flex flex-col items-center gap-1 animate-pulse-glow text-warning">
                    <Package size={18} />
                    <div className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap">
                      {marker.id.slice(0, 8)}
                    </div>
                  </div>
                </Marker>
              ))}

              {vehicleMarkers.map((marker) => (
                <Marker key={`vehicle-${marker.id}`} longitude={marker.lng} latitude={marker.lat}>
                  <div className="flex flex-col items-center gap-1 animate-pulse-glow text-primary-light">
                    <Truck size={18} />
                    <div className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap">
                      {marker.plateNumber}
                    </div>
                  </div>
                </Marker>
              ))}
            </Map>
          ) : (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-2 bg-surface/95 text-slate-200 text-center p-4 max-w-105 w-[calc(100%-48px)] rounded-xl border border-white/10">
              Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in fleet-admin environment.
            </div>
          )}
        </div>

        <div className="absolute bottom-6 right-6 z-10">
          <div className="flex gap-1 p-1.5 bg-surface/90 backdrop-blur-md rounded-xl border border-white/10">
            <Button variant="secondary" size="sm" icon={<Users size={14} />} onClick={onToggleClusterView}>
              {clusterView ? 'Cluster View' : 'List View'}
            </Button>
            <div className="w-px bg-white/10 my-1 mx-1" />
            <Button variant="secondary" size="sm">2D/3D</Button>
            <Button variant="secondary" size="sm">Satellite</Button>
            <div className="w-px bg-white/10 my-1 mx-1" />
            <Button variant="secondary" size="sm">Traffic</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
