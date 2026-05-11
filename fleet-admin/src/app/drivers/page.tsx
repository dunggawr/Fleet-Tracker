'use client';

import React from 'react';
import { 
  Plus, 
  Filter, 
  User as UserIcon, 
  Edit2, 
  Trash2, 
  Phone,
  Star,
  Mail,
  CreditCard,
  Calendar
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useDrivers } from '@/hooks/use-drivers';
import { Driver } from '@/types';
import { useRouter } from 'next/navigation';

// For typing the backend response which includes the joined user
interface DriverWithUser extends Driver {
  user?: { email: string };
}

const driverSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  licenseClass: z.string().min(1, 'License class is required'),
  licenseExpiry: z.string().min(1, 'License expiry is required'),
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function DriversPage() {
  const router = useRouter();
  const { drivers, isLoading, registerDriver, updateDriver, deleteDriver, isRegistering, isUpdating, isDeleting } = useDrivers();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [editingDriver, setEditingDriver] = React.useState<DriverWithUser | null>(null);
  const [viewingDriver, setViewingDriver] = React.useState<DriverWithUser | null>(null);
  const [driverToDelete, setDriverToDelete] = React.useState<DriverWithUser | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
  });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle form population when editing
  React.useEffect(() => {
    if (editingDriver) {
      reset({
        fullName: editingDriver.fullName,
        email: editingDriver.user?.email || '',
        password: '', // Password is never populated
        phone: editingDriver.phone,
        licenseClass: editingDriver.licenseClass || '',
        licenseExpiry: editingDriver.licenseExpiry ? new Date(editingDriver.licenseExpiry).toISOString().split('T')[0] : '',
      });
      setIsModalOpen(true);
    }
  }, [editingDriver, reset]);

  const filteredDrivers = (drivers as DriverWithUser[]).filter(d => {
    const matchesSearch = d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const onSubmit = async (data: DriverFormValues) => {
    try {
      if (editingDriver) {
        // Remove email/password from update if they are empty/not supported
        const { email, password, ...updateData } = data;
        await updateDriver({ id: editingDriver.id, ...updateData });
      } else {
        await registerDriver(data as any);
      }
      setIsModalOpen(false);
      setEditingDriver(null);
      reset();
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const columns = [
    { 
      header: 'Driver', 
      accessor: (d: DriverWithUser) => (
        <div className="driver-info">
          <div className="driver-avatar">
            <UserIcon size={16} />
          </div>
          <div className="driver-details">
            <span className="driver-name">{d.fullName}</span>
            <span className="driver-email">{d.user?.email || 'N/A'}</span>
          </div>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone' as keyof DriverWithUser },
    { 
      header: 'License', 
      accessor: (d: DriverWithUser) => (
        <div className="flex flex-col">
          <span className="font-medium">{d.licenseClass || 'N/A'}</span>
          <span className="text-xs text-dim">{d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : ''}</span>
        </div>
      )
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
        <div className="action-buttons">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Edit2 size={16} />} 
            aria-label={`Edit ${d.fullName}`}
            onClick={(e) => {
              e.stopPropagation();
              setEditingDriver(d);
            }}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Trash2 size={16} />} 
            className="text-danger" 
            aria-label={`Delete ${d.fullName}`}
            onClick={(e) => {
              e.stopPropagation();
              setDriverToDelete(d);
            }}
          />
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
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => { 
          setEditingDriver(null);
          reset({
            fullName: '',
            email: '',
            password: '',
            phone: '',
            licenseClass: '',
            licenseExpiry: '',
          });
          setIsModalOpen(true); 
        }}>
          Register New Driver
        </Button>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDriver(null);
        }}
        title={editingDriver ? 'Edit Driver Information' : 'Register New Driver'}
        footer={(
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingDriver(null);
            }}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isRegistering || isUpdating}>
              {editingDriver ? 'Save Changes' : 'Register Driver'}
            </Button>
          </>
        )}
      >
        <form className="driver-form">
          <div className="form-grid">
            <Input 
              label="Full Name" 
              placeholder="Enter driver's full name" 
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            
            {!editingDriver && (
              <>
                <Input 
                  label="Email Address" 
                  type="email"
                  placeholder="driver@example.com" 
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input 
                  label="Password" 
                  type="password"
                  placeholder="Minimum 6 characters" 
                  {...register('password')}
                  error={errors.password?.message}
                />
              </>
            )}

            <Input 
              label="Phone Number" 
              placeholder="e.g. 0943..." 
              {...register('phone')}
              error={errors.phone?.message}
            />
            <Input 
              label="License Class" 
              placeholder="e.g. B2, C, D" 
              {...register('licenseClass')}
              error={errors.licenseClass?.message}
            />
            <Input 
              label="License Expiry" 
              type="date"
              {...register('licenseExpiry')}
              error={errors.licenseExpiry?.message}
            />
          </div>
          
          {editingDriver && (
            <div className="mt-4 p-3 bg-surface-high rounded-md flex items-start gap-3">
              <Mail size={16} className="text-dim mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-dim uppercase tracking-wider">Account Email</p>
                <p className="text-sm">{editingDriver.user?.email}</p>
                <p className="text-xs text-dim italic mt-1">Contact IT to change account credentials.</p>
              </div>
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(viewingDriver)}
        onClose={() => setViewingDriver(null)}
        title="Driver Details"
      >
        {viewingDriver && (
          <div className="driver-detail">
            <div className="driver-detail-header">
              <div className="driver-avatar large">
                <UserIcon size={24} />
              </div>
              <div>
                <h3>{viewingDriver.fullName}</h3>
                <p className="text-dim">{viewingDriver.user?.email}</p>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-dim" />
                  <span>{viewingDriver.phone}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <Badge variant={viewingDriver.status === 'available' ? 'success' : viewingDriver.status === 'on_trip' ? 'primary' : 'neutral'}>
                  {viewingDriver.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="detail-item">
                <span className="detail-label">License Class</span>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-dim" />
                  <span>{viewingDriver.licenseClass || 'N/A'}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Expiry Date</span>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-dim" />
                  <span>{viewingDriver.licenseExpiry && mounted ? new Date(viewingDriver.licenseExpiry).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(driverToDelete)}
        title="Delete driver"
        description={`Are you sure you want to delete ${driverToDelete?.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
        onClose={() => setDriverToDelete(null)}
        onConfirm={async () => {
          if (!driverToDelete) return;
          try {
            await deleteDriver(driverToDelete.id);
            setDriverToDelete(null);
          } catch (err) {
            console.error('Failed to delete driver:', err);
          }
        }}
      />

      <section className="filters-bar card">
        <SearchInput
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="filter-actions">
          <select 
            className="select-filter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="offline">Offline</option>
          </select>
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
          <DataTable data={filteredDrivers} columns={columns} onRowClick={(driver) => setViewingDriver(driver as DriverWithUser)} />
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
          margin-bottom: var(--space-md);
        }

        .driver-avatar.large {
          width: 56px;
          height: 56px;
          background: var(--color-primary-faint);
          color: var(--color-primary);
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
          background: var(--color-surface-high);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-default);
        }

        .detail-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .driver-avatar {
          width: 32px;
          height: 32px;
          background: var(--color-surface-high);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-light);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }

        @media (min-width: 640px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
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
          font-size: 12px;
          color: var(--color-text-dim);
        }

        .select-filter {
          background: var(--color-surface-low);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-default);
          color: var(--color-text);
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .select-filter:focus {
          border-color: var(--color-primary);
        }

        .mt-4 { margin-top: 1rem; }
        .p-3 { padding: 0.75rem; }
        .bg-surface-high { background: var(--color-surface-high); }
        .rounded-md { border-radius: 0.375rem; }
        .flex { display: flex; }
        .items-start { align-items: flex-start; }
        .gap-3 { gap: 0.75rem; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .font-semibold { font-weight: 600; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .italic { font-style: italic; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-0.5 { margin-top: 0.125rem; }
      `}</style>
    </div>
  );
}
