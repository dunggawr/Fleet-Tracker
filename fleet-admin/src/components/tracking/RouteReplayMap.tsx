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
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        background: '#0f172a', color: '#94a3b8',
      }}>
        <Activity size={40} color="#6366f1" />
        <p style={{ fontWeight: 600, color: '#f8fafc', margin: 0 }}>Mapbox token chưa được cấu hình</p>
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
              'line-opacity': 0.5,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>
      )}

      {/* Traveled Route Line (Blue) */}
      {pastGeoJson && (
        <Source type="geojson" data={pastGeoJson}>
          <Layer
            id="route-active"
            type="line"
            paint={{
              'line-color': '#6366f1',
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
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#22c55e',
              border: '3px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(34,197,94,0.4)',
              rotate: `${currentPoint.heading || 0}deg`,
              transition: 'all 0.3s linear',
            }}
          >
            <Truck size={16} color="white" />
          </div>
        </Marker>
      )}
    </Map>
  );
}
