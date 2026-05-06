'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye 
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  lastService: string;
  driver?: string;
}

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const vehicles: Vehicle[] = [
    { id: '1', plateNumber: 'VN-10292', type: 'Truck (Long Haul)', status: 'Active', lastService: '2024-03-15', driver: 'Nguyen Van A' },
    { id: '2', plateNumber: 'VN-88210', type: 'Van (City)', status: 'Active', lastService: '2024-04-02', driver: 'Tran Thi B' },
    { id: '3', plateNumber: 'VN-55612', type: 'Truck (Refrigerated)', status: 'Maintenance', lastService: '2024-04-20' },
    { id: '4', plateNumber: 'VN-33901', type: 'Van (Electric)', status: 'Inactive', lastService: '2024-02-10' },
  ];

  const columns = [
    { header: 'Plate Number', accessor: 'plateNumber' as keyof Vehicle },
    { header: 'Type', accessor: 'type' as keyof Vehicle },
    { 
      header: 'Status', 
      accessor: (v: Vehicle) => (
        <Badge variant={v.status === 'Active' ? 'success' : v.status === 'Maintenance' ? 'warning' : 'neutral'}>
          {v.status}
        </Badge>
      )
    },
    { header: 'Driver', accessor: (v: Vehicle) => v.driver || 'Unassigned' },
    { header: 'Last Service', accessor: 'lastService' as keyof Vehicle },
    {
      header: 'Actions',
      accessor: () => (
        <div className="action-buttons">
          <Button variant="ghost" size="sm" icon={<Eye size={16} />} />
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
          <h1>Vehicle Management</h1>
          <p className="text-dim">Manage your fleet vehicles, maintenance schedules, and assignments.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />}>
          Add New Vehicle
        </Button>
      </header>

      <section className="filters-bar card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by plate number or driver..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <Button variant="secondary" size="md" icon={<Filter size={18} />}>Filters</Button>
          <div className="divider" />
          <span className="results-count">Showing <b>{vehicles.length}</b> vehicles</span>
        </div>
      </section>

      <section className="table-section">
        <DataTable data={vehicles} columns={columns} />
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

        .filter-actions {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
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

        .action-buttons {
          display: flex;
          gap: 4px;
        }
      `}</style>
    </div>
  );
}
