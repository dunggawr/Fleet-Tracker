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
  XCircle,
  LocateFixed,
  Map as MapIcon
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MapBox, MapMarker } from '@/components/ui/MapBox';
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

  // Map Selection State
  const [selectionMode, setSelectionMode] = React.useState<'none' | 'pickup' | 'delivery'>('none');
  const [pickupCoord, setPickupCoord] = React.useState<{lat: number, lng: number} | null>(null);
  const [deliveryCoord, setDeliveryCoord] = React.useState<{lat: number, lng: number} | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      weightKg: 1,
      pickupAddress: '',
      deliveryAddress: ''
    }
  });

  const onSubmit = async (data: OrderFormValues) => {
    if (!pickupCoord || !deliveryCoord) {
      alert('Please select both pickup and delivery locations on the map.');
      return;
    }

    try {
      await createOrder({
        ...data,
        pickupLat: pickupCoord.lat,
        pickupLng: pickupCoord.lng,
        deliveryLat: deliveryCoord.lat,
        deliveryLng: deliveryCoord.lng,
      } as any);
      setIsModalOpen(false);
      reset();
      setPickupCoord(null);
      setDeliveryCoord(null);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  const handleMapClick = (coord: {lat: number, lng: number}) => {
    if (selectionMode === 'pickup') {
      setPickupCoord(coord);
      setValue('pickupAddress', `${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`);
      setSelectionMode('none');
    } else if (selectionMode === 'delivery') {
      setDeliveryCoord(coord);
      setValue('deliveryAddress', `${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`);
      setSelectionMode('none');
    }
  };

  const markers: MapMarker[] = React.useMemo(() => {
    const list: MapMarker[] = [];
    if (pickupCoord) {
      list.push({
        id: 'pickup',
        lat: pickupCoord.lat,
        lng: pickupCoord.lng,
        label: 'Pickup',
        color: 'var(--color-primary)'
      });
    }
    if (deliveryCoord) {
      list.push({
        id: 'delivery',
        lat: deliveryCoord.lat,
        lng: deliveryCoord.lng,
        label: 'Delivery',
        color: 'var(--color-success)'
      });
    }
    return list;
  }, [pickupCoord, deliveryCoord]);

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
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => {
          setPickupCoord(null);
          setDeliveryCoord(null);
          reset();
          setIsModalOpen(true);
        }}>
          Create New Order
        </Button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Order"
        className="order-modal"
        size="xl"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isCreating}>Create Order</Button>
          </>
        )}
      >
        <div className="modal-layout">
          <form className="order-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-section">
              <h3 className="section-title">General Info</h3>
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
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Route Selection</h3>
              <div className="location-inputs">
                <div className={`location-field ${selectionMode === 'pickup' ? 'active' : ''}`}>
                  <Input 
                    label="Pickup Address" 
                    placeholder="Click map to select location" 
                    {...register('pickupAddress')}
                    error={errors.pickupAddress?.message}
                    readOnly
                  />
                  <Button 
                    type="button" 
                    variant={selectionMode === 'pickup' ? 'primary' : 'secondary'}
                    size="sm"
                    icon={<MapIcon size={14} />}
                    onClick={() => setSelectionMode(selectionMode === 'pickup' ? 'none' : 'pickup')}
                  >
                    {selectionMode === 'pickup' ? 'Picking...' : 'Pick on Map'}
                  </Button>
                </div>

                <div className={`location-field ${selectionMode === 'delivery' ? 'active' : ''}`}>
                  <Input 
                    label="Delivery Address" 
                    placeholder="Click map to select location" 
                    {...register('deliveryAddress')}
                    error={errors.deliveryAddress?.message}
                    readOnly
                  />
                  <Button 
                    type="button" 
                    variant={selectionMode === 'delivery' ? 'primary' : 'secondary'}
                    size="sm"
                    icon={<MapIcon size={14} />}
                    onClick={() => setSelectionMode(selectionMode === 'delivery' ? 'none' : 'delivery')}
                  >
                    {selectionMode === 'delivery' ? 'Picking...' : 'Pick on Map'}
                  </Button>
                </div>
              </div>
            </div>

            {selectionMode !== 'none' && (
              <div className="selection-hint">
                <LocateFixed size={14} />
                <span>Click anywhere on the map to set <b>{selectionMode}</b> location</span>
              </div>
            )}
          </form>

          <div className="modal-map-container">
            <MapBox 
              markers={markers}
              onClick={handleMapClick}
              zoom={13}
              className="rounded-lg shadow-inner"
            />
          </div>
        </div>
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

        .modal-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: var(--space-xl);
          min-height: 450px;
        }

        .order-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 4px;
        }

        .location-inputs {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .location-field {
          display: flex;
          align-items: flex-end;
          gap: var(--space-sm);
          padding: var(--space-sm);
          border-radius: var(--radius-default);
          transition: background 0.2s;
        }

        .location-field.active {
          background: var(--color-primary-faint);
          outline: 1px solid var(--color-primary);
        }

        .location-field :global(.input-group) {
          flex: 1;
        }

        .selection-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--color-warning-faint);
          color: var(--color-warning);
          border-radius: var(--radius-default);
          font-size: 12px;
          animation: pulse 2s infinite;
        }

        .modal-map-container {
          position: relative;
          height: 100%;
          min-height: 400px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
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
          gap: var(--space-md);
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

        @media (max-width: 1000px) {
          .modal-layout {
            grid-template-columns: 1fr;
          }
          .modal-map-container {
            min-height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
