'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Map, Marker, Source, Layer, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, AlertTriangle, Search, X, Loader2 } from 'lucide-react';

// Mapbox token from environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Coordinate {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface MapLine {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  color?: string;
  width?: number;
  dashed?: boolean;
}

interface MapBoxProps {
  path?: Coordinate[];
  markers?: MapMarker[];
  lines?: MapLine[];
  zoom?: number;
  selectedMarkerId?: string | null;
  className?: string;
  onClick?: (coord: Coordinate) => void;
  showSearch?: boolean;
  onSearchSelect?: (coord: Coordinate, address: string) => void;
}

/**
 * Resolves CSS variables like var(--color-primary) to their hex values.
 * Mapbox paint properties do not support CSS variables.
 */
function resolveColor(color: string | undefined): string {
  if (!color) return '#6366f1';
  if (!color.startsWith('var(')) return color;

  // Mapping of common project CSS variables to their hex values
  const colorMap: Record<string, string> = {
    '--color-primary': '#6366f1',
    '--color-primary-light': '#c0c1ff',
    '--color-success': '#22c55e',
    '--color-warning': '#f59e0b',
    '--color-danger': '#ef4444',
    '--color-secondary': '#0ea5e9',
    '--color-tertiary': '#10b981',
  };

  const variableName = color.match(/var\(([^)]+)\)/)?.[1];
  return variableName ? colorMap[variableName] || '#6366f1' : color;
}

/**
 * Interactive MapBox Component
 * Uses react-map-gl for real-time fleet tracking and trip visualization.
 */
export function MapBox({ 
  path = [], 
  markers = [], 
  lines = [],
  zoom = 12, 
  selectedMarkerId = null,
  className = "",
  onClick,
  showSearch = false,
  onSearchSelect
}: MapBoxProps) {
  const mapRef = React.useRef<any>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [viewState, setViewState] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    zoom: zoom
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    console.log('MapBox Initialized. Token:', MAPBOX_TOKEN ? 'Present (Starts with ' + MAPBOX_TOKEN.substring(0, 10) + '...)' : 'Missing');
    console.log('Markers count:', markers.length);
    
    if (!mapboxgl.supported()) {
      console.error('WebGL not supported by browser');
      setWebGLSupported(false);
    }
  }, []);

  // Update initial view state when markers or path change for the first time
  useEffect(() => {
    if (markers.length > 0) {
      setViewState(prev => ({
        ...prev,
        latitude: markers[0].lat,
        longitude: markers[0].lng
      }));
    } else if (path.length > 0) {
      setViewState(prev => ({
        ...prev,
        latitude: path[0].lat,
        longitude: path[0].lng
      }));
    }
  }, [markers.length > 0, path.length > 0]); // Trigger when data arrives

  // Fly to selected marker
  useEffect(() => {
    if (selectedMarkerId && mapRef.current) {
      const selectedMarker = markers.find(m => m.id === selectedMarkerId);
      if (selectedMarker) {
        mapRef.current.flyTo({
          center: [selectedMarker.lng, selectedMarker.lat],
          zoom: Math.max(viewState.zoom, 14),
          duration: 2000,
          essential: true
        });
      }
    }
  }, [selectedMarkerId]);

  // Create GeoJSON for path rendering
  const routeData: any = useMemo(() => {
    if (path.length < 2) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: path.map(p => [p.lng, p.lat])
      }
    };
  }, [path]);

  const handleMapClick = (evt: any) => {
    if (onClick) {
      onClick({
        lat: evt.lngLat.lat,
        lng: evt.lngLat.lng
      });
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
      setShowResults(true);
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (feature: any) => {
    const [lng, lat] = feature.center;
    const address = feature.place_name;

    setViewState(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      zoom: 15
    }));

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true
      });
    }

    if (onSearchSelect) {
      onSearchSelect({ lat, lng }, address);
    }

    setSearchQuery(address);
    setShowResults(false);
  };

  return (
    <div className={`map-wrapper ${className}`}>
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapLib={mapboxgl}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {/* Path Layer (trip route) */}
        {routeData && (
          <Source id="trip-route" type="geojson" data={routeData}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#6366f1',
                'line-width': 4,
                'line-opacity': 0.8
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
            />
          </Source>
        )}

        {/* Dispatch suggestion route lines (vehicle → order pickup) */}
        {lines.map((line) => {
          const geojson: any = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [line.from.lng, line.from.lat],
                [line.to.lng, line.to.lat],
              ],
            },
          };
          const dashArray = line.dashed ? [4, 3] : [1];
          return (
            <Source key={line.id} id={line.id} type="geojson" data={geojson}>
              <Layer
                id={`line-${line.id}`}
                type="line"
                paint={{
                  'line-color': resolveColor(line.color),
                  'line-width': line.width ?? 2,
                  'line-opacity': 0.75,
                  'line-dasharray': dashArray,
                }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              />
            </Source>
          );
        })}

        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            anchor="bottom"
          >
            <div className={`custom-marker ${selectedMarkerId === marker.id ? 'is-selected' : ''}`}>
              {marker.label && (
                <div className="marker-tooltip">
                  {marker.label}
                </div>
              )}
              <div className="marker-icon" style={{ color: resolveColor(marker.color) }}>
                {marker.icon || <MapPin size={selectedMarkerId === marker.id ? 32 : 24} fill="currentColor" stroke="white" strokeWidth={1} />}
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {showSearch && (
        <div className="map-search-overlay">
          <div className="search-container">
            <div className="search-input-wrapper">
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              <input 
                type="text" 
                placeholder="Search address or place..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 3 && setShowResults(true)}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}>
                  <X size={16} />
                </button>
              )}
            </div>

            {showResults && searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((result: any) => (
                  <li key={result.id} onClick={() => selectSearchResult(result)}>
                    <MapPin size={14} />
                    <span>{result.place_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!webGLSupported && (
        <div className="token-error">
          <div className="error-content">
            <AlertTriangle color="var(--color-danger)" size={32} />
            <h3>WebGL Not Supported</h3>
            <p>Your browser or hardware does not support WebGL, which is required for the map.</p>
          </div>
        </div>
      )}

      {!MAPBOX_TOKEN && (
        <div className="token-error">
          <div className="error-content">
            <h3>Mapbox Token Missing</h3>
            <p>Please provide NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .map-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 300px;
          border-radius: inherit;
          overflow: hidden;
          background: #0f172a;
        }

        .custom-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .marker-tooltip {
          background: rgba(15, 23, 42, 0.95);
          color: white;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 4px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          pointer-events: none;
        }

        .marker-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
          transition: transform 0.2s ease;
        }

        .marker-icon:hover {
          transform: scale(1.1);
        }

        .token-error {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          z-index: 100;
        }

        .error-content {
          text-align: center;
          padding: 24px;
          background: var(--color-surface);
          border: 1px solid var(--color-danger);
          border-radius: 12px;
          color: white;
        }

        .error-content h3 {
          color: var(--color-danger);
          margin-bottom: 8px;
        }

        .error-content p {
          color: var(--color-text-dim);
          font-size: 14px;
        }

        .map-search-overlay {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          width: 320px;
          max-width: calc(100% - 24px);
        }

        .search-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .search-input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          outline: none;
        }

        .search-input-wrapper input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input-wrapper button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper button:hover {
          color: white;
        }

        .search-results {
          list-style: none;
          padding: 4px;
          margin: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          max-height: 200px;
          overflow-y: auto;
        }

        .search-results li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .search-results li:hover {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }

        .search-results li span {
          line-height: 1.4;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
