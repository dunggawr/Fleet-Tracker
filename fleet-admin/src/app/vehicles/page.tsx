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
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useVehicles } from '@/hooks/use-vehicles';
import { Vehicle } from '@/types';

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required'),
  type: z.enum(['small', 'medium', 'large']),
  status: z.enum(['available', 'delivering', 'maintenance']),
  maxCapacityKg: z.number().min(100, 'Minimum capacity is 100kg'),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function VehiclesPage() {
  const { vehicles, isLoading, createVehicle, updateVehicle, deleteVehicle, isCreating, isUpdating, isDeleting } = useVehicles();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<Vehicle | null>(null);
  const isEditing = Boolean(selectedVehicle);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'available',
      type: 'medium',
      maxCapacityKg: 1000,
    }
  });

  const openCreateModal = () => {
    setSelectedVehicle(null);
    reset({ plateNumber: '', type: 'medium', status: 'available', maxCapacityKg: 1000 });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    reset({
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      status: vehicle.status,
      maxCapacityKg: vehicle.maxCapacityKg || 1000,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    reset();
  };

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      if (selectedVehicle) {
        await updateVehicle({ id: selectedVehicle.id, ...data });
      } else {
        await createVehicle(data);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save vehicle:', err);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.driver?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: 'Plate Number', accessor: 'plateNumber' as keyof Vehicle },
    { 
      header: 'Type', 
      accessor: (v: Vehicle) => <span className="capitalize">{v.type}</span> 
    },
    { 
      header: 'Status', 
      accessor: (v: Vehicle) => (
        <Badge variant={v.status === 'available' ? 'success' : v.status === 'delivering' ? 'primary' : 'warning'}>
          {v.status}
        </Badge>
      )
    },
    { header: 'Driver', accessor: (v: Vehicle) => v.driver?.fullName || 'Unassigned' },
    { header: 'Capacity (kg)', accessor: 'maxCapacityKg' as keyof Vehicle },
    {
      header: 'Actions',
      accessor: (v: Vehicle) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" icon={<Eye size={16} />} aria-label={`View ${v.plateNumber}`} />
          <Button variant="ghost" size="sm" icon={<Edit2 size={16} />} aria-label={`Edit ${v.plateNumber}`} onClick={() => openEditModal(v)} />
          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-danger" aria-label={`Delete ${v.plateNumber}`} onClick={() => setVehicleToDelete(v)} />
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-(--space-xl)">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Management</h1>
          <p className="text-(--color-text-dim)">Manage your fleet vehicles, maintenance schedules, and assignments.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={openCreateModal}>
          Add New Vehicle
        </Button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
        footer={(
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isCreating || isUpdating}>{isEditing ? 'Save Changes' : 'Create Vehicle'}</Button>
          </>
        )}
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-(--space-lg)">
            <Input 
              label="Plate Number" 
              placeholder="e.g. 29A-12345" 
              {...register('plateNumber')}
              error={errors.plateNumber?.message}
            />
            <Input 
              label="Max Capacity (kg)" 
              type="number"
              {...register('maxCapacityKg', { valueAsNumber: true })}
              error={errors.maxCapacityKg?.message}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-(--color-text-dim) font-medium">Vehicle Type</label>
              <select 
                className="bg-surface-low border border-border rounded-default text-text p-2.5 text-sm outline-none transition-colors focus:border-primary" 
                {...register('type')}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              {errors.type && <p className="text-danger text-xs mt-1">{errors.type.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-(--color-text-dim) font-medium">Status</label>
              <select 
                className="bg-surface-low border border-border rounded-default text-text p-2.5 text-sm outline-none transition-colors focus:border-primary" 
                {...register('status')}
              >
                <option value="available">Available</option>
                <option value="delivering">Delivering</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.status && <p className="text-danger text-xs mt-1">{errors.status.message}</p>}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(vehicleToDelete)}
        title="Delete vehicle"
        description={`Delete ${vehicleToDelete?.plateNumber || 'this vehicle'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={async () => {
          if (!vehicleToDelete) return;
          await deleteVehicle(vehicleToDelete.id);
          setVehicleToDelete(null);
        }}
      />

      <section className="card flex justify-between items-center px-(--space-lg) py-(--space-md)">
        <div className="flex-1 max-w-[400px]">
          <SearchInput
            placeholder="Search by plate number or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-(--space-lg)">
          <Button variant="secondary" size="md" icon={<Filter size={18} />}>Filters</Button>
          <div className="w-px h-6 bg-border" />
          <span className="text-(--color-text-dim)">
            Showing <span className="font-bold text-text">{filteredVehicles.length}</span> vehicles
          </span>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable data={filteredVehicles} columns={columns} />
        )}
      </section>
    </div>
  );
}
