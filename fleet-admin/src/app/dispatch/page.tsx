'use client';

import React from 'react';
import { 
  Package, 
  Truck, 
  Users, 
  MapPin, 
  ChevronRight, 
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DispatchPage() {
  const [selectedOrder, setSelectedOrder] = React.useState<string | null>(null);

  const pendingOrders = [
    { id: 'ORD-8289', customer: 'Eco Systems', pickup: 'City B', delivery: 'City C', weight: '800kg' },
    { id: 'ORD-8287', customer: 'Alpha Corp', pickup: 'City A', delivery: 'City D', weight: '1200kg' },
    { id: 'ORD-8285', customer: 'Beta Ltd', pickup: 'City C', delivery: 'City A', weight: '300kg' },
  ];

  const availableVehicles = [
    { id: 'VN-102', type: 'Truck', driver: 'Nguyen Van A', location: 'City A', status: 'Available' },
    { id: 'VN-882', type: 'Van', driver: 'Tran Thi B', location: 'City B', status: 'Available' },
    { id: 'VN-556', type: 'Reefer', driver: 'Le Van C', location: 'City C', status: 'Available' },
  ];

  return (
    <div className="dispatch-container">
      {/* Sidebar: Pending Orders */}
      <aside className="dispatch-sidebar orders-list">
        <div className="sidebar-header">
          <h3>Pending Orders</h3>
          <Badge variant="warning">{pendingOrders.length}</Badge>
        </div>
        <div className="sidebar-content">
          {pendingOrders.map((order) => (
            <div 
              key={order.id} 
              className={`dispatch-card ${selectedOrder === order.id ? 'selected' : ''}`}
              onClick={() => setSelectedOrder(order.id)}
            >
              <div className="card-header">
                <span className="order-id">{order.id}</span>
                <span className="order-weight">{order.weight}</span>
              </div>
              <div className="order-route">
                <div className="point">
                  <MapPin size={12} className="text-primary" />
                  <span>{order.pickup}</span>
                </div>
                <ChevronRight size={14} className="text-dim" />
                <div className="point">
                  <MapPin size={12} className="text-success" />
                  <span>{order.delivery}</span>
                </div>
              </div>
              <div className="card-footer">
                <span className="customer-name">{order.customer}</span>
                <Button variant="ghost" size="sm">Details</Button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Area: Map */}
      <main className="dispatch-map-area">
        <div className="map-placeholder">
          <div className="map-overlay-top">
            <div className="map-search card">
              <Navigation size={18} />
              <input type="text" placeholder="Search map location..." />
            </div>
          </div>
          
          {/* Mock Map Content */}
          <div className="mock-map">
            <div className="map-pin vehicle-pin" style={{ top: '30%', left: '40%' }}>
              <Truck size={20} />
              <div className="pin-label">VN-102</div>
            </div>
            <div className="map-pin order-pin" style={{ top: '50%', left: '60%' }}>
              <Package size={20} />
              <div className="pin-label">ORD-8289</div>
            </div>
            <div className="map-grid-pattern" />
          </div>

          <div className="map-overlay-bottom">
            <div className="map-controls card">
              <Button variant="secondary" size="sm" icon={<Users size={14} />}>Cluster View</Button>
              <div className="divider-v" />
              <Button variant="secondary" size="sm">2D/3D</Button>
              <Button variant="secondary" size="sm">Satellite</Button>
              <div className="divider-v" />
              <Button variant="secondary" size="sm">Traffic</Button>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar: Available Vehicles */}
      <aside className="dispatch-sidebar vehicles-list">
        <div className="sidebar-header">
          <h3>Available Fleet</h3>
          <Badge variant="success">{availableVehicles.length}</Badge>
        </div>
        <div className="sidebar-content">
          {availableVehicles.map((v) => (
            <div key={v.id} className="dispatch-card vehicle-card">
              <div className="card-header">
                <div className="vehicle-info">
                  <Truck size={18} />
                  <span className="vehicle-id">{v.id}</span>
                </div>
                <Badge variant="success">{v.status}</Badge>
              </div>
              <div className="driver-info">
                <Users size={14} className="text-dim" />
                <span>{v.driver}</span>
              </div>
              <div className="location-info">
                <MapPin size={14} className="text-dim" />
                <span>Currently in {v.location}</span>
              </div>
              <div className="card-footer">
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth 
                  disabled={!selectedOrder}
                  icon={<CheckCircle2 size={16} />}
                >
                  Assign Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <style jsx>{`
        .dispatch-container {
          display: grid;
          grid-template-columns: 320px 1fr 320px;
          height: calc(100vh - var(--header-height) - var(--space-xl) * 2);
          gap: var(--space-md);
          margin: -var(--space-md); /* Offset content padding to fill area */
          padding: var(--space-md);
          overflow: hidden;
        }

        .dispatch-sidebar {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          padding: var(--space-md) var(--space-lg);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-surface-low);
        }

        .sidebar-content {
          flex: 1;
          padding: var(--space-md);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .dispatch-card {
          background: var(--color-surface-low);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-default);
          padding: var(--space-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .dispatch-card:hover {
          border-color: var(--color-primary-light);
          background: var(--color-surface-high);
        }

        .dispatch-card.selected {
          border-color: var(--color-primary);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 0 1px var(--color-primary);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
        }

        .order-id { font-weight: 700; color: var(--color-primary-light); }
        .order-weight { font-size: 12px; color: var(--color-text-dim); }

        .order-route {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .point { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-text); }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-sm);
          border-top: 1px solid var(--color-border);
          padding-top: var(--space-sm);
        }

        .customer-name { font-size: 12px; font-weight: 500; }

        .vehicle-info { display: flex; align-items: center; gap: 8px; font-weight: 700; }
        .driver-info, .location-info { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-top: 4px; }

        .dispatch-map-area {
          position: relative;
          background: #0a0a0a;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .map-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .map-overlay-top {
          position: absolute;
          top: var(--space-lg);
          left: var(--space-lg);
          right: var(--space-lg);
          z-index: 10;
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

        .mock-map {
          flex: 1;
          position: relative;
          background: radial-gradient(circle, #1a1a1a 1px, transparent 1px);
          background-size: 30px 30px;
        }

        .map-pin {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          animation: pulse-glow 2s infinite;
        }

        .vehicle-pin { color: var(--color-primary-light); }
        .order-pin { color: var(--color-warning); }

        .pin-label {
          background: rgba(0, 0, 0, 0.8);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: white;
          white-space: nowrap;
        }

        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 2px currentColor); }
          50% { filter: drop-shadow(0 0 10px currentColor); }
          100% { filter: drop-shadow(0 0 2px currentColor); }
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

        .divider-v { width: 1px; background: var(--color-border); margin: 0 4px; }
      `}</style>
    </div>
  );
}
