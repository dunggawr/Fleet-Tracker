'use client';

import React from 'react';
import { Navigation } from 'lucide-react';

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

interface MapBoxProps {
  path?: Coordinate[];
  markers?: MapMarker[];
  zoom?: number;
  className?: string;
}

/**
 * MapBox Placeholder Component
 * This is a visual placeholder for the interactive map.
 * In a production environment, this would use react-map-gl or leaflet.
 */
export function MapBox({ 
  path = [], 
  markers = [], 
  zoom = 12, 
  className = "" 
}: MapBoxProps) {
  return (
    <div className={`
      relative bg-[#0f172a] min-h-75 w-full overflow-hidden flex items-center justify-center rounded-inherit
      bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)]
      bg-size-[20px_20px]
      ${className}
    `.trim()}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.8)_100%)] pointer-events-none" />
      
      {/* Simulate a path */}
      <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points="20,80 40,60 60,70 80,20"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="0.5"
          strokeDasharray="2,1"
          className="animate-dash"
          style={{ strokeDashoffset: 100 }}
        />
      </svg>

      {/* Markers */}
      <div className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center gap-1 z-10" style={{ left: '20%', top: '80%' }}>
        <div className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-primary" />
        <div className="text-2.5 text-white bg-[#0f172a]/80 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">Start</div>
      </div>
      
      <div className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center gap-1 z-10" style={{ left: '80%', top: '20%' }}>
        <div className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-danger" />
        <div className="text-2.5 text-white bg-[#0f172a]/80 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">End</div>
      </div>

      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
        <div className="w-6 h-6 bg-[#1e293b]/90 border border-white/10 text-white flex items-center justify-center rounded cursor-pointer text-base hover:bg-[#1e293b] transition-colors">+</div>
        <div className="w-6 h-6 bg-[#1e293b]/90 border border-white/10 text-white flex items-center justify-center rounded cursor-pointer text-base hover:bg-[#1e293b] transition-colors">-</div>
      </div>

      <div className="absolute bottom-2.5 left-2.5 bg-[#0f172a]/90 px-2 py-1 rounded-full flex items-center gap-1.5 text-[11px] text-[#94a3b8] border border-white/10">
        <Navigation size={12} className="text-primary animate-pulse" />
        <span>Live Preview Mode</span>
      </div>
    </div>
  );
}
