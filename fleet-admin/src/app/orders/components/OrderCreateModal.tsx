import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapIcon, LocateFixed, Box, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MapBox, MapMarker } from '@/components/ui/MapBox';
import { orderSchema, OrderFormValues } from '../types';

const getDefaultDeadline = () => {
  const date = new Date(Date.now() + 2 * 3600000); // 2 hours from now
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

interface OrderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const OrderCreateModal: React.FC<OrderCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [selectionMode, setSelectionMode] = React.useState<'none' | 'pickup' | 'delivery'>('none');
  const [pickupCoord, setPickupCoord] = React.useState<{lat: number, lng: number} | null>(null);
  const [deliveryCoord, setDeliveryCoord] = React.useState<{lat: number, lng: number} | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      weightKg: 1,
      pickupAddress: '',
      deliveryAddress: '',
      recipientName: '',
      recipientPhone: '',
      category: 'other',
      priority: 'medium',
      deliveryDeadline: getDefaultDeadline(),
    }
  });

  // Reset state when modal closes/opens
  React.useEffect(() => {
    if (!isOpen) {
      reset();
      setPickupCoord(null);
      setDeliveryCoord(null);
      setSelectionMode('none');
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: OrderFormValues) => {
    if (!pickupCoord || !deliveryCoord) {
      alert('Please select both pickup and delivery locations on the map.');
      return;
    }

    await onSubmit({
      ...data,
      pickupLat: pickupCoord.lat,
      pickupLng: pickupCoord.lng,
      deliveryLat: deliveryCoord.lat,
      deliveryLng: deliveryCoord.lng,
      deliveryDeadline: new Date(data.deliveryDeadline).toISOString(),
    });
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create New Order"
      className="order-modal"
      size="xl"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            Create Order
          </Button>
        </>
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-xl min-h-[450px]">
        <form className="flex flex-col gap-xl max-h-[60vh] overflow-y-auto pr-sm custom-scrollbar" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex flex-col gap-md">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider border-b border-border pb-1">General Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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

          <div className="flex flex-col gap-md">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider border-b border-border pb-1">Cargo & Scheduling</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Category</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { label: 'Dạng thô (Bulk)', value: 'bulk', icon: <Box size={14} /> },
                        { label: 'Dễ vỡ (Fragile)', value: 'fragile', icon: <ShieldAlert size={14} className="text-warning" /> },
                        { label: 'Cồng kềnh (Bulky)', value: 'bulky', icon: <Box size={14} /> },
                        { label: 'Nguy hiểm (Dangerous)', value: 'dangerous', icon: <AlertTriangle size={14} className="text-danger" /> },
                        { label: 'Khác (Other)', value: 'other', icon: <HelpCircle size={14} /> },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.category && <p className="text-danger text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">Priority</label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { label: 'Low', value: 'low' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'High', value: 'high' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.priority && <p className="text-danger text-xs mt-1">{errors.priority.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <Input 
                  label="Delivery Deadline" 
                  type="datetime-local"
                  {...register('deliveryDeadline')}
                  error={errors.deliveryDeadline?.message}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-md">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider border-b border-border pb-1">Recipient Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <Input 
                label="Recipient Name" 
                placeholder="E.g. John Doe"
                {...register('recipientName')}
                error={errors.recipientName?.message}
              />
              <Input 
                label="Recipient Phone" 
                placeholder="E.g. 0987654321"
                {...register('recipientPhone')}
                error={errors.recipientPhone?.message}
              />
            </div>
          </div>

          <div className="flex flex-col gap-lg">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider border-b border-border pb-2">Route Selection</h3>
            <div className="flex flex-col gap-lg">
              <div className={`flex items-end gap-md p-md rounded-default transition-all duration-200 ${selectionMode === 'pickup' ? 'bg-primary/10 ring-1 ring-primary shadow-glow' : 'bg-surface-low'}`}>
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

              <div className={`flex items-end gap-md p-md rounded-default transition-all duration-200 ${selectionMode === 'delivery' ? 'bg-primary/10 ring-1 ring-primary shadow-glow' : 'bg-surface-low'}`}>
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
  );
};
