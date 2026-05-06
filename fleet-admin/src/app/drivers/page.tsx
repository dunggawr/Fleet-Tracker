'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Edit2, 
  Trash2, 
  Phone,
  Star
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Online' | 'Offline' | 'Busy';
  rating: number;
  completedTrips: number;
}

export default function DriversPage() {
  const drivers: Driver[] = [
    { id: '1', name: 'Nguyen Van A', email: 'vana@fleet.com', phone: '0901234567', status: 'Online', rating: 4.8, completedTrips: 124 },
    { id: '2', name: 'Tran Thi B', email: 'thib@fleet.com', phone: '0907654321', status: 'Busy', rating: 4.9, completedTrips: 210 },
    { id: '3', name: 'Le Van C', email: 'vanc@fleet.com', phone: '0912233445', status: 'Offline', rating: 4.5, completedTrips: 85 },
    { id: '4', name: 'Pham Minh D', email: 'minhd@fleet.com', phone: '0988776655', status: 'Online', rating: 4.7, completedTrips: 156 },
  ];

  const columns = [
    { 
      header: 'Driver', 
      accessor: (d: Driver) => (
        <div className="driver-info">
          <div className="driver-avatar">
            <User size={16} />
          </div>
          <div className="driver-details">
            <span className="driver-name">{d.name}</span>
            <span className="driver-email">{d.email}</span>
          </div>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone' as keyof Driver },
    { 
      header: 'Status', 
      accessor: (d: Driver) => (
        <Badge variant={d.status === 'Online' ? 'success' : d.status === 'Busy' ? 'primary' : 'neutral'}>
          {d.status}
        </Badge>
      )
    },
    { 
      header: 'Rating', 
      accessor: (d: Driver) => (
        <div className="rating">
          <Star size={14} className="star-icon" />
          <span>{d.rating}</span>
        </div>
      )
    },
    { header: 'Trips', accessor: 'completedTrips' as keyof Driver },
    {
      header: 'Actions',
      accessor: () => (
        <div className="action-buttons">
          <Button variant="ghost" size="sm" icon={<Phone size={16} />} />
          <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-danger" />
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Driver Management</h1>
          <p className="text-dim">Monitor driver performance, status, and contact information.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />}>
          Register New Driver
        </Button>
      </header>

      <section className="filters-bar card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search by name, email or phone..." />
        </div>
        <div className="filter-actions">
          <Button variant="secondary" size="md" icon={<Filter size={18} />}>Filters</Button>
          <div className="divider" />
          <span className="results-count">Total <b>{drivers.length}</b> drivers</span>
        </div>
      </section>

      <section className="table-section">
        <DataTable data={drivers} columns={columns} />
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

        .search-icon {
          color: var(--color-text-dim);
        }

        .driver-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .driver-avatar {
          width: 32px;
          height: 32px;
          background: var(--color-surface-highest);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-light);
        }

        .driver-details {
          display: flex;
          flex-direction: column;
        }

        .driver-name {
          font-weight: 600;
          color: var(--color-text);
        }

        .driver-email {
          font-size: 12px;
          color: var(--color-text-dim);
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--color-warning);
          font-weight: 600;
        }

        .star-icon {
          fill: var(--color-warning);
        }

        .action-buttons {
          display: flex;
          gap: 4px;
        }

        .divider {
          width: 1px;
          height: 24px;
          background: var(--color-border);
        }

        .results-count {
          font: var(--font-label-sm);
          color: var(--color-text-dim);
        }
      `}</style>
    </div>
  );
}
