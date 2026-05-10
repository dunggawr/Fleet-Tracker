'use client';

import React from 'react';
import { 
  Plus, 
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
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useOrders } from '@/hooks/use-orders';
import { format } from 'date-fns';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Order } from '@/types';

const orderSchema = z.object({
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  weightKg: z.number().min(0.1, 'Weight must be greater than 0'),
  description: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrdersPage() {
  const { orders, isLoading, createOrder, isCreating } = useOrders();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      weightKg: 1
    }
  });

  const onSubmit = async (data: OrderFormValues) => {
    try {
      await createOrder({
        ...data,
        pickupLat: 10.762622,
        pickupLng: 106.660172,
        deliveryLat: 10.772622,
        deliveryLng: 106.670172,
      } as any);
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'delivering': return 'primary';
      case 'assigned': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'cancelled': return 'neutral';
      default: return 'neutral';
    }
  };

  const columns = [
    { 
      header: 'Order ID', 
      accessor: (o: Order) => (
        <div className="flex items-center gap-2 text-(--color-primary-light) font-semibold">
          <Package size={16} />
          <span>{o.id.split('-')[0]}</span>
        </div>
      )
    },
    { 
      header: 'Route', 
      accessor: (o: Order) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs max-w-[150px] overflow-hidden truncate">
            <MapPin size={12} className="text-primary" />
            <span>{o.pickupAddress}</span>
          </div>
          <ChevronRight size={14} className="text-(--color-text-dim)" />
          <div className="flex items-center gap-1.5 text-xs max-w-[150px] overflow-hidden truncate">
            <MapPin size={12} className="text-success" />
            <span>{o.deliveryAddress}</span>
          </div>
        </div>
      )
    },
    { header: 'Weight (kg)', accessor: 'weightKg' as keyof Order },
    { 
      header: 'Status', 
      accessor: (o: Order) => (
        <Badge variant={getStatusVariant(o.status)}>
          {o.status?.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      header: 'Created At', 
      accessor: (o: Order) => (
        <div className="flex items-center gap-1.5 text-xs text-(--color-text-dim)">
          <Clock size={14} />
          <span>{format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm')}</span>
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
    <div className="flex flex-col gap-(--space-xl)">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-(--color-text-dim)">Create, track and manage delivery orders for your fleet.</p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Create New Order
        </Button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Order"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isCreating}>Create Order</Button>
          </>
        )}
      >
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-(--space-lg)">
            <Input 
              label="Weight (kg)" 
              type="number"
              step="0.1"
              {...register('weightKg', { valueAsNumber: true })}
              error={errors.weightKg?.message}
            />
            <Input 
              label="Description (Optional)" 
              placeholder="E.g. Fragile items" 
              {...register('description')}
              error={errors.description?.message}
            />
            <div className="sm:col-span-2 space-y-4">
              <Input 
                label="Pickup Address" 
                placeholder="Address or coordinates" 
                {...register('pickupAddress')}
                error={errors.pickupAddress?.message}
              />
              <Input 
                label="Delivery Address" 
                placeholder="Address or coordinates" 
                {...register('deliveryAddress')}
                error={errors.deliveryAddress?.message}
              />
            </div>
          </div>
        </form>
      </Modal>

      <section className="card flex justify-between items-center px-(--space-lg) py-(--space-md)">
        <div className="flex-1 max-w-[400px]">
          <SearchInput
            placeholder="Search by ID or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-(--space-lg)">
          <Button variant="secondary" size="md" icon={<Filter size={18} />}>Filters</Button>
          <div className="w-px h-6 bg-border" />
          <span className="text-(--color-text-dim)">
            Total <span className="font-bold text-text">{filteredOrders.length}</span> orders
          </span>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable data={filteredOrders} columns={columns} />
        )}
      </section>
    </div>
  );
}
