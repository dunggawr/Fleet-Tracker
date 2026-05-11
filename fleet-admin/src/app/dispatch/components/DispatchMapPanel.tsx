import { MapBox } from '@/components/ui/MapBox';
import type { MapMarker, MapLine } from '@/components/ui/MapBox';
import { Button } from '@/components/ui/Button';
import { 
  Truck, 
  Package, 
  Navigation, 
  Users 
} from 'lucide-react';
import { Order, Vehicle } from '@/types';

interface DispatchMapPanelProps {
  clusterView: boolean;
  onToggleClusterView: () => void;
  selectedMarkerId?: string | null;
  orders: Order[];
  vehicles: Vehicle[];
  // Dữ liệu để vẽ route line khi có suggestion
  selectedOrderData?: Order | null;
  suggestedVehicles?: Vehicle[];
}

/** Lấy tọa độ [lng, lat] từ GeoPoint hoặc GeoJSON coordinates */
function getCoords(loc: unknown, fallback: [number, number]): [number, number] {
  if (!loc) return fallback;
  const l = loc as Record<string, unknown>;
  // GeoJSON format: { type: 'Point', coordinates: [lng, lat] }
  if (Array.isArray(l.coordinates)) {
    const [lng, lat] = l.coordinates as number[];
    if (typeof lat === 'number' && typeof lng === 'number') return [lng, lat];
  }
  // Simple { lat, lng } format
  if (typeof l.lat === 'number' && typeof l.lng === 'number') {
    return [l.lng as number, l.lat as number];
  }
  return fallback;
}

export function DispatchMapPanel({ 
  clusterView, 
  onToggleClusterView,
  selectedMarkerId,
  orders,
  vehicles,
  selectedOrderData,
  suggestedVehicles = [],
}: DispatchMapPanelProps) {
  
  // ===== Vehicle markers =====
  const vehicleMarkers: MapMarker[] = vehicles.map(v => {
    const [lng, lat] = getCoords(v.lastKnownLocation, [105.83, 21.02]);
    const isSuggested = suggestedVehicles.some(sv => sv.id === v.id);
    return {
      id: v.id,
      lat,
      lng,
      label: v.plateNumber,
      color: isSuggested ? 'var(--color-success)' : 'var(--color-primary-light)',
      icon: <Truck size={18} />,
    };
  });

  // ===== Order markers =====
  const orderMarkers: MapMarker[] = orders.map(o => {
    const [lng, lat] = getCoords(o.pickupLocation, [105.86, 21.04]);
    const isSelected = selectedMarkerId === o.id;
    return {
      id: o.id,
      lat,
      lng,
      label: `Order ${o.id.split('-')[0]}`,
      color: isSelected ? 'var(--color-primary)' : 'var(--color-warning)',
      icon: <Package size={18} />,
    };
  });

  // ===== Route lines: vẽ đường từ top-3 xe gợi ý → điểm pickup của đơn hàng =====
  // SPEC: Khi chọn đơn hàng, hiển thị các xe phù hợp trên map (visual feedback)
  const routeLines: MapLine[] = [];
  if (selectedOrderData) {
    const [orderLng, orderLat] = getCoords(selectedOrderData.pickupLocation, [105.86, 21.04]);
    suggestedVehicles.slice(0, 3).forEach((vehicle, idx) => {
      const [vLng, vLat] = getCoords(vehicle.lastKnownLocation, [105.83, 21.02]);
      routeLines.push({
        id: `route-${vehicle.id}`,
        from: { lat: vLat, lng: vLng },
        to: { lat: orderLat, lng: orderLng },
        // Xe gợi ý đầu tiên → đường sáng hơn
        color: idx === 0 ? 'var(--color-success)' : 'rgba(99,102,241,0.4)',
        width: idx === 0 ? 3 : 1.5,
        dashed: idx > 0,
      });
    });
  }

  const allMarkers = [...vehicleMarkers, ...orderMarkers];

  return (
    <main className="dispatch-map-area">
      <div className="map-container-inner">
        <div className="map-overlay-top">
          <div className="map-search card">
            <Navigation size={18} />
            <input type="text" placeholder="Search map location..." />
          </div>
          {/* Legend khi đang trong Smart Suggest mode */}
          {selectedOrderData && suggestedVehicles.length > 0 && (
            <div className="map-legend card">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--color-success)' }} />
                <span>Xe gợi ý (gần nhất)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--color-warning)' }} />
                <span>Điểm lấy hàng</span>
              </div>
            </div>
          )}
        </div>

        <div className="real-map-wrapper">
          <MapBox 
            markers={allMarkers}
            lines={routeLines}
            zoom={13} 
            selectedMarkerId={selectedMarkerId} 
          />
        </div>

        <div className="map-overlay-bottom">
          <div className="map-controls card">
            <Button variant="secondary" size="sm" icon={<Users size={14} />} onClick={onToggleClusterView}>
              {clusterView ? 'Cluster View' : 'List View'}
            </Button>
            <div className="divider-v" />
            <Button variant="secondary" size="sm">2D/3D</Button>
            <Button variant="secondary" size="sm">Satellite</Button>
            <div className="divider-v" />
            <Button variant="secondary" size="sm">Traffic</Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dispatch-map-area {
          position: relative;
          background: #0a0a0a;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-border);
          height: 100%;
          min-height: 500px;
        }

        .map-container-inner {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .real-map-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .map-overlay-top {
          position: absolute;
          top: var(--space-lg);
          left: var(--space-lg);
          right: var(--space-lg);
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .map-search {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 8px var(--space-md);
          max-width: 300px;
          background: rgba(18, 33, 49, 0.9);
          backdrop-filter: blur(10px);
        }

        .map-search input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          font-size: 14px;
        }

        .map-legend {
          display: flex;
          gap: var(--space-md);
          padding: 8px var(--space-md);
          max-width: fit-content;
          background: rgba(18, 33, 49, 0.9);
          backdrop-filter: blur(10px);
          font-size: 12px;
          color: var(--color-text-dim);
          animation: fadeIn 0.2s ease;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .map-overlay-bottom {
          position: absolute;
          bottom: var(--space-lg);
          right: var(--space-lg);
          z-index: 10;
        }

        .map-controls {
          display: flex;
          gap: var(--space-xs);
          padding: 6px;
          background: rgba(18, 33, 49, 0.9);
          backdrop-filter: blur(10px);
        }

        .divider-v {
          width: 1px;
          background: var(--color-border);
          margin: 4px 0;
        }
      `}</style>
    </main>
  );
}
