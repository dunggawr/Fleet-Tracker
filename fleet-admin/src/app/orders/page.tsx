'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  Clock,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Order {
  id: string;
  customer: string;
  pickup: string;
  delivery: string;
  weight: number;
  status: 'Pending' | 'Assigned' | 'Picked_up' | 'Delivering' | 'Delivered' | 'Failed';
  createdAt: string;
}

export default function OrdersPage() {
  const orders: Order[] = [
    { id: 'ORD-8291', customer: 'Global Logistics', pickup: '123 Harbor St, City A', delivery: '456 Business Park, City B', weight: 1500, status: 'Delivering', createdAt: '2024-05-06 08:30' },
    { id: 'ORD-8290', customer: 'Fast Delivery Co', pickup: '789 Industrial Rd, City C', delivery: '101 Retail Mall, City A', weight: 450, status: 'Assigned', createdAt: '2024-05-06 09:15' },
    { id: 'ORD-8289', customer: 'Eco Systems', pickup: '222 Green Way, City B', delivery: '333 Solar Ave, City C', weight: 800, status: 'Pending', createdAt: '2024-05-06 10:00' },
    { id: 'ORD-8288', customer: 'Tech Parts Inc', pickup: '555 Silicon Blvd, City A', delivery: '666 Cloud Dr, City B', weight: 200, status: 'Delivered', createdAt: '2024-05-05 16:45' },
  ];

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Delivering': return 'primary';
      case 'Assigned': return 'success';
      case 'Pending': return 'warning';
      case 'Failed': return 'danger';
      default: return 'neutral';
    }
  };

  const columns = [
    { 
      header: 'Order ID', 
      accessor: (o: Order) => (
        <div className="order-id-cell">
          <Package size={16} />
          <span>{o.id}</span>
        </div>
      )
    },
    { header: 'Customer', accessor: 'customer' as keyof Order },
    { 
      header: 'Route', 
      accessor: (o: Order) => (
        <div className="route-cell">
          <div className="route-point">
            <MapPin size={12} className="text-primary" />
            <span>{o.pickup}</span>
          </div>
          <ChevronRight size={14} className="text-dim" />
          <div className="route-point">
            <MapPin size={12} className="text-success" />
            <span>{o.delivery}</span>
          </div>
        </div>
      )
    },
    { header: 'Weight (kg)', accessor: 'weight' as keyof Order },
    { 
      header: 'Status', 
      accessor: (o: Order) => (
        <Badge variant={getStatusVariant(o.status)}>
          {o.status.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      header: 'Created At', 
      accessor: (o: Order) => (
        <div className="time-cell">
          <Clock size={14} />
          <span>{o.createdAt}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: () => (
        <Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} />
      )
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Order Management</h1>
          <p className="text-dim">Create, track and manage delivery orders for your fleet.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />}>
          Create New Order
        </Button>
      </header>

      <section className="filters-bar card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search by ID, customer or address..." />
        </div>
        <div className="filter-actions">
          <Button variant="secondary" size="md" icon={<Filter size={18} />}>Filters</Button>
          <div className="divider" />
          <span className="results-count">Total <b>{orders.length}</b> orders</span>
        </div>
      </section>

      <section className="table-section">
        <DataTable data={orders} columns={columns} />
      </section>

      <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-id-cell {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--color-primary-light);
          font-weight: 600;
        }

        .route-cell {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .route-point {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .time-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--color-text-dim);
        }

        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-lg);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
          max-width: 400px;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: var(--color-text);
          font: var(--font-body-md);
          outline: none;
          width: 100%;
        }

        .divider {
          width: 1px;
          height: 24px;
          background: var(--color-border);
        }
      `}</style>
    </div>
  );
}
