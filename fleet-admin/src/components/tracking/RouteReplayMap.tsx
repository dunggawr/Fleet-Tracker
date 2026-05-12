'use client';

import React, { useMemo } from 'react';
import { Map, Marker, NavigationControl, FullscreenControl, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, Activity } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface HistoryPoint {
  id: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  recordedAt: string;
}

interface RouteReplayMapProps {
  history: HistoryPoint[];
  currentIndex: number;
}

export default function RouteReplayMap({ history, currentIndex }: RouteReplayMapProps) {
  const mapRef = React.useRef<any>(null);

  const currentPoint = history[currentIndex];

  // Auto-center on current point as it moves
  React.useEffect(() => {
    if (currentPoint && mapRef.current) {
      mapRef.current.flyTo({
        center: [currentPoint.longitude, currentPoint.latitude],
        duration: 500, // Faster for replay
        essential: true
      });
    }
  }, [currentPoint]);
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-background text-text-dim">
        <Activity size={40} className="text-primary" />
        <p className="font-semibold text-text m-0">Mapbox token chưa được cấu hình</p>
      </div>
    );
  }

  const center = history.length > 0
    ? {
      lng: history[Math.floor(history.length / 2)].longitude,
      lat: history[Math.floor(history.length / 2)].latitude,
    }
    : { lng: 106.660172, lat: 10.762622 };

  const geoJson = useMemo(() => {
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: history.map(p => [p.longitude, p.latitude]),
      },
    };
  }, [history]);

  const pastGeoJson = useMemo(() => {
    if (!history || history.length === 0) return null;
    const pastHistory = history.slice(0, currentIndex + 1);
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: pastHistory.map(p => [p.longitude, p.latitude]),
      },
    };
  }, [history, currentIndex]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {/* Full Route Line (Grayed out) */}
        {history.length > 0 && (
          <Source type="geojson" data={geoJson}>
            <Layer
              id="route-bg"
              type="line"
              paint={{
                'line-color': '#475569',
                'line-width': 4,
                'line-opacity': 0.4,
                'line-dasharray': [2, 2],
              }}
            />
          </Source>
        )}

        {/* Traveled Route Line (Primary Color) */}
        {pastGeoJson && (
          <Source type="geojson" data={pastGeoJson}>
            <Layer
              id="route-active"
              type="line"
              paint={{
                'line-color': '#6366f1', // --color-primary
                'line-width': 5,
                'line-opacity': 0.9,
              }}
            />
          </Source>
        )}

        {currentPoint && (
          <Marker
            longitude={currentPoint.longitude}
            latitude={currentPoint.latitude}
            anchor="center"
          >
            <div
              title={`Speed: ${currentPoint.speedKmh}km/h`}
              className="w-9 h-9 rounded-full bg-success flex items-center justify-center border-[3px] border-white shadow-[0_2px_12px_rgba(34,197,94,0.4)] transition-all duration-300"
              style={{
                transform: `rotate(${currentPoint.heading || 0}deg)`,
              }}
            >
              <Truck size={16} className="text-white" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
