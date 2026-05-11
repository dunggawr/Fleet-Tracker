'use client';

import React from 'react';
import { 
  Plus, 
  Filter, 
  MapPin, 
  Package, 
  Clock,
  MoreVertical,
  ChevronRight,
  Eye,
  Truck as TruckIcon,
  XCircle
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

import { useOrders } from '@/hooks/use-orders';
import { format } from 'date-fns';

import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Order } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const orderSchema = z.object({
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  weightKg: z.number().min(0.1, 'Weight must be greater than 0'),
  description: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrdersPage() {
  const router = useRouter();
  const { orders, isLoading, createOrder, cancelOrder, isCreating, isCancelling } = useOrders();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [viewingOrder, setViewingOrder] = React.useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = React.useState<Order | null>(null);

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

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      await cancelOrder(orderToCancel.id);
      setOrderToCancel(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <div className="order-id-cell">
          <Package size={16} />
          <span>{o.id.split('-')[0]}</span>
        </div>
      )
    },
    { 
      header: 'Route', 
      accessor: (o: Order) => (
        <div className="route-cell">
          <div className="route-point">
            <MapPin size={12} className="text-primary" />
            <span>{o.pickupAddress}</span>
          </div>
          <ChevronRight size={14} className="text-dim" />
          <div className="route-point">
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
        <div className="time-cell">
          <Clock size={14} />
          <span>{format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm')}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (o: Order) => (
        <Dropdown align="right" trigger={
          <Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} />
        }>
          <button className="dropdown-item" onClick={() => router.push(`/dispatch?orderId=${o.id}`)}>
            <TruckIcon size={16} /> Dispatch Order
          </button>
          <button className="dropdown-item" onClick={() => setViewingOrder(o)}>
            <Eye size={16} /> View Details
          </button>
          <div className="dropdown-divider" />
          <button 
            className="dropdown-item danger" 
            disabled={o.status === 'cancelled' || o.status === 'delivered'}
            onClick={() => setOrderToCancel(o)}
          >
            <XCircle size={16} /> Cancel Order
          </button>
        </Dropdown>
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
        <form className="order-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
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
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        title={`Order Details - ${viewingOrder?.id.split('-')[0]}`}
      >
        {viewingOrder && (
          <div className="order-details-view">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <Badge variant={getStatusVariant(viewingOrder.status)}>
                {viewingOrder.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="detail-row">
              <span className="detail-label">Pickup</span>
              <span className="detail-value">{viewingOrder.pickupAddress}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Delivery</span>
              <span className="detail-value">{viewingOrder.deliveryAddress}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Weight</span>
              <span className="detail-value">{viewingOrder.weightKg} kg</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Description</span>
              <span className="detail-value">{viewingOrder.description || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created At</span>
              <span className="detail-value">{format(new Date(viewingOrder.createdAt), 'PPPP p')}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(orderToCancel)}
        title="Cancel Order"
        description={`Are you sure you want to cancel order ${orderToCancel?.id.split('-')[0]}? This action cannot be undone.`}
        confirmLabel="Cancel Order"
        confirmVariant="danger"
        isLoading={isCancelling}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleCancelOrder}
      />

      <section className="filters-bar card">
        <SearchInput
          placeholder="Search by ID or address..."
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
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="delivering">Delivering</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="divider" />
          <span className="results-count">Total <b>{filteredOrders.length}</b> orders</span>
        </div>
      </section>

      <section className="table-section">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <DataTable 
            data={filteredOrders} 
            columns={columns} 
            onRowClick={(order) => setViewingOrder(order as Order)}
          />
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

        .order-details-view {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          padding: var(--space-sm) 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--color-border);
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: var(--color-text-dim);
          font: var(--font-label-md);
        }
        .detail-value {
          color: var(--color-text);
          font-weight: 500;
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

        .divider {
          width: 1px;
          height: 24px;
          background: var(--color-border);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }

        .select-filter {
          background: var(--color-surface-low);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-default);
          color: var(--color-text);
          padding: 8px 12px;
          font: var(--font-label-md);
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .select-filter:focus {
          border-color: var(--color-primary);
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
