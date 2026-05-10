'use client';

import React from 'react';
import { 
  Plus, 
  Filter, 
  User as UserIcon, 
  Edit2, 
  Trash2, 
  Phone
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';

import { useDrivers } from '@/hooks/use-drivers';
import { Driver } from '@/types';

// For typing the backend response which includes the joined user
interface DriverWithUser extends Driver {
  user?: { email: string };
}

export default function DriversPage() {
  const { drivers, isLoading } = useDrivers();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedDriver, setSelectedDriver] = React.useState<DriverWithUser | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredDrivers = (drivers as DriverWithUser[]).filter(d => 
    d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  const columns = [
    { 
      header: 'Driver', 
      accessor: (d: DriverWithUser) => (
        <div className="flex items-center gap-[var(--space-md)]">
          <div className="w-8 h-8 bg-[var(--color-surface-highest)] rounded-full flex items-center justify-center text-[var(--color-primary-light)]">
            <UserIcon size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[var(--color-text)]">{d.fullName}</span>
            <span className="text-[12px] text-[var(--color-text-dim)]">{d.user?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone' as keyof DriverWithUser },
    { 
      header: 'License Class', 
      accessor: 'licenseClass' as keyof DriverWithUser 
    },
    { 
      header: 'Status', 
      accessor: (d: DriverWithUser) => (
        <Badge variant={d.status === 'available' ? 'success' : d.status === 'on_trip' ? 'primary' : 'neutral'}>
          {d.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (d: DriverWithUser) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" icon={<Phone size={16} />} aria-label={`Call ${d.fullName}`} />
          <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} aria-label={`Edit ${d.fullName}`} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-danger" aria-label={`Delete ${d.fullName}`} />
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-[var(--space-xl)]">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
          <p className="text-[var(--color-text-dim)]">Monitor driver performance, status, and contact information.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => {}}>
          Register New Driver
        </Button>
      </header>

      <Modal
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        title="Driver Details"
      >
        {selectedDriver && (
          <div className="flex flex-col gap-[var(--space-lg)]">
            <div className="flex items-center gap-[var(--space-md)]">
              <div className="w-14 h-14 bg-[var(--color-surface-highest)] rounded-full flex items-center justify-center text-[var(--color-primary-light)]">
                <UserIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedDriver.fullName}</h3>
                <p className="text-[var(--color-text-dim)]">{selectedDriver.user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[var(--space-md)]">
              <div className="flex flex-col gap-[6px] p-[var(--space-md)] bg-[var(--color-surface-low)] border border-[var(--color-border)] rounded-[var(--radius-default)]">
                <span className="text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">Phone</span>
                <span className="text-sm font-medium">{selectedDriver.phone}</span>
              </div>
              <div className="flex flex-col gap-[6px] p-[var(--space-md)] bg-[var(--color-surface-low)] border border-[var(--color-border)] rounded-[var(--radius-default)]">
                <span className="text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">Status</span>
                <Badge variant={selectedDriver.status === 'available' ? 'success' : selectedDriver.status === 'on_trip' ? 'primary' : 'neutral'}>
                  {selectedDriver.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex flex-col gap-[6px] p-[var(--space-md)] bg-[var(--color-surface-low)] border border-[var(--color-border)] rounded-[var(--radius-default)]">
                <span className="text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">License Class</span>
                <span className="text-sm font-medium">{selectedDriver.licenseClass}</span>
              </div>
              <div className="flex flex-col gap-[6px] p-[var(--space-md)] bg-[var(--color-surface-low)] border border-[var(--color-border)] rounded-[var(--radius-default)]">
                <span className="text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">Expiry</span>
                <span className="text-sm font-medium">{selectedDriver.licenseExpiry && mounted ? new Date(selectedDriver.licenseExpiry).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <section className="card flex justify-between items-center py-[var(--space-md)] px-[var(--space-lg)]">
        <div className="flex-1 max-w-[400px]">
          <SearchInput
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-[var(--space-lg)] ml-4">
          <Button variant="secondary" size="md" icon={<Filter size={18} />}>Filters</Button>
          <div className="w-[1px] h-6 bg-[var(--color-border)]" />
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-dim)]">Total <b className="text-[var(--color-text)]">{filteredDrivers.length}</b> drivers</span>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable data={filteredDrivers} columns={columns} onRowClick={(driver) => setSelectedDriver(driver as DriverWithUser)} />
        )}
      </section>
    </div>
  );
}
