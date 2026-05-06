'use client';

import React from 'react';
import { 
  Plus, 
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
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';

import { useDrivers, Driver } from '@/hooks/use-drivers';

export default function DriversPage() {
  const { drivers, isLoading } = useDrivers();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedDriver, setSelectedDriver] = React.useState<Driver | null>(null);

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

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
      accessor: (d: Driver) => (
        <div className="action-buttons">
          <Button variant="ghost" size="sm" icon={<Phone size={16} />} aria-label={`Call ${d.name}`} />
          <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} aria-label={`Edit ${d.name}`} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-danger" aria-label={`Delete ${d.name}`} />
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

      <Modal
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        title="Driver Details"
      >
        {selectedDriver && (
          <div className="driver-detail">
            <div className="driver-detail-header">
              <div className="driver-avatar large">
                <User size={24} />
              </div>
              <div>
                <h3>{selectedDriver.name}</h3>
                <p className="text-dim">{selectedDriver.email}</p>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span>{selectedDriver.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <Badge variant={selectedDriver.status === 'Online' ? 'success' : selectedDriver.status === 'Busy' ? 'primary' : 'neutral'}>
                  {selectedDriver.status}
                </Badge>
              </div>
              <div className="detail-item">
                <span className="detail-label">Rating</span>
                <span>{selectedDriver.rating}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completed Trips</span>
                <span>{selectedDriver.completedTrips}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <section className="filters-bar card">
        <SearchInput
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="filter-actions">
          <Button variant="secondary" size="md" icon={<Filter size={18} />}>Filters</Button>
          <div className="divider" />
          <span className="results-count">Total <b>{filteredDrivers.length}</b> drivers</span>
        </div>
      </section>

      <section className="table-section">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable data={filteredDrivers} columns={columns} onRowClick={(driver) => setSelectedDriver(driver)} />
        )}
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

        .filters-bar :global(.search-input-group) {
          flex: 1;
          max-width: 400px;
        }

        .driver-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .driver-detail {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .driver-detail-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .driver-avatar.large {
          width: 56px;
          height: 56px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--space-md);
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: var(--space-md);
          background: var(--color-surface-low);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-default);
        }

        .detail-label {
          font: var(--font-label-sm);
          color: var(--color-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
