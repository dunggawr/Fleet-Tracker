'use client';

import React from 'react';
import { Truck, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Vehicle } from '@/types';

interface DispatchVehiclesSidebarProps {
  availableVehicles: Vehicle[];
  isLoading: boolean;
  isAssigning: boolean;
  selectedOrder: string | null;
  onAssignVehicle: (vehicleId: string) => void;
}

export function DispatchVehiclesSidebar({
  availableVehicles,
  isLoading,
  isAssigning,
  selectedOrder,
  onAssignVehicle,
}: DispatchVehiclesSidebarProps) {
  return (
    <aside className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface-low">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-dim">Available Fleet</h3>
        <Badge variant="success">{availableVehicles.length}</Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size={24} />
          </div>
        ) : availableVehicles.length === 0 ? (
          <div className="text-center py-8 text-text-dim text-sm">No available vehicles</div>
        ) : (
          availableVehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="bg-surface-low border border-border rounded-lg p-3 transition-all hover:border-primary-light hover:bg-surface-high group"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Truck size={16} className="text-(--color-primary-light)" />
                  <span>{vehicle.plateNumber}</span>
                </div>
                <Badge variant="success" size="sm">{vehicle.status}</Badge>
              </div>
              
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <Users size={14} className="text-(--color-text-dim)" />
                  <span className="text-(--color-text-muted)">{vehicle.driver?.fullName || 'No driver assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin size={14} className="text-(--color-text-dim)" />
                  <span className="text-(--color-text-muted) capitalize">{vehicle.type}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={!selectedOrder || isAssigning}
                  isLoading={isAssigning}
                  icon={<CheckCircle2 size={16} />}
                  onClick={() => onAssignVehicle(vehicle.id)}
                >
                  Assign Order
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
