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

  const handleSearchSelect = (coord: {lat: number, lng: number}, address: string) => {
    if (selectionMode === 'pickup') {
      setPickupCoord(coord);
      setValue('pickupAddress', address);
      setSelectionMode('none');
    } else if (selectionMode === 'delivery') {
      setDeliveryCoord(coord);
      setValue('deliveryAddress', address);
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
        <div className="flex items-center gap-(--space-sm) text-primary-light font-semibold">
          <Package size={16} />
          <span>{o.id.split('-')[0]}</span>
        </div>
      )
    },
    { 
      header: 'Route', 
      accessor: (o: Order) => (
        <div className="flex items-center gap-(--space-md)">
          <div className="flex items-center gap-1.5 text-sm max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
            <MapPin size={12} className="text-primary" />
            <span>{o.pickupAddress}</span>
          </div>
          <ChevronRight size={14} className="text-dim" />
          <div className="flex items-center gap-1.5 text-sm max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
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
        <div className="flex items-center gap-1.5 text-sm text-dim">
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
    <div className="flex flex-col gap-(--space-xl)">
      <header className="flex justify-between items-center">
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-(--space-xl) min-h-[450px]">
          <form className="flex flex-col gap-(--space-xl)" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-(--space-md)">
              <h3 className="text-xs font-bold text-dim uppercase tracking-wider border-b border-border pb-1">General Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-(--space-md)">
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

            <div className="flex flex-col gap-(--space-md)">
              <h3 className="text-xs font-bold text-dim uppercase tracking-wider border-b border-border pb-1">Route Selection</h3>
              <div className="flex flex-col gap-(--space-md)">
                <div className={`flex items-end gap-(--space-sm) p-(--space-sm) rounded-default transition-colors ${selectionMode === 'pickup' ? 'bg-primary-faint outline outline-primary' : ''}`}>
                  <Input 
                    label="Pickup Address" 
                    placeholder="Click map to select location" 
                    {...register('pickupAddress')}
                    error={errors.pickupAddress?.message}
                    readOnly
                    className="flex-1"
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

                <div className={`flex items-end gap-(--space-sm) p-(--space-sm) rounded-default transition-colors ${selectionMode === 'delivery' ? 'bg-primary-faint outline outline-primary' : ''}`}>
                  <Input 
                    label="Delivery Address" 
                    placeholder="Click map to select location" 
                    {...register('deliveryAddress')}
                    error={errors.deliveryAddress?.message}
                    readOnly
                    className="flex-1"
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
              <div className="flex items-center gap-2 px-3 py-2 bg-warning-faint text-warning rounded-default text-xs animate-pulse">
                <LocateFixed size={14} />
                <span>Click anywhere on the map to set <b>{selectionMode}</b> location</span>
              </div>
            )}
          </form>

          <div className="relative h-full min-h-[400px] lg:min-h-full border border-border rounded-lg overflow-hidden">
            <MapBox 
              markers={markers}
              onClick={handleMapClick}
              showSearch={selectionMode !== 'none'}
              onSearchSelect={handleSearchSelect}
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
          <div className="flex flex-col gap-(--space-lg) py-(--space-sm)">
            <div className="flex justify-between items-center pb-(--space-md) border-b border-border">
              <span className="text-dim font-(--font-label-md)">Status</span>
              <Badge variant={getStatusVariant(viewingOrder.status)}>
                {viewingOrder.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex justify-between items-center pb-(--space-md) border-b border-border">
              <span className="text-dim font-(--font-label-md)">Pickup</span>
              <span className="text-text font-medium">{viewingOrder.pickupAddress}</span>
            </div>
            <div className="flex justify-between items-center pb-(--space-md) border-b border-border">
              <span className="text-dim font-(--font-label-md)">Delivery</span>
              <span className="text-text font-medium">{viewingOrder.deliveryAddress}</span>
            </div>
            <div className="flex justify-between items-center pb-(--space-md) border-b border-border">
              <span className="text-dim font-(--font-label-md)">Weight</span>
              <span className="text-text font-medium">{viewingOrder.weightKg} kg</span>
            </div>
            <div className="flex justify-between items-center pb-(--space-md) border-b border-border">
              <span className="text-dim font-(--font-label-md)">Description</span>
              <span className="text-text font-medium">{viewingOrder.description || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center pb-(--space-md) border-b border-border last:border-b-0">
              <span className="text-dim font-(--font-label-md)">Created At</span>
              <span className="text-text font-medium">{format(new Date(viewingOrder.createdAt), 'PPPP p')}</span>
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

      <section className="card flex justify-between items-center px-(--space-lg) py-(--space-md)">
        <SearchInput
          placeholder="Search by ID or address..."
          value={searchQuery}
          className="flex-1 max-w-[400px]"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <select 
            className="bg-surface-low border border-border rounded-default text-text px-3 py-2 font-(--font-label-md) outline-none cursor-pointer transition-colors focus:border-primary" 
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
          <div className="w-px h-6 bg-border" />
          <span className="text-xs text-dim">Total <b>{filteredOrders.length}</b> orders</span>
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

    </div>
  );
}
