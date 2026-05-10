'use client';

import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Order } from '@/types';

export interface DispatchOrderGroup {
  key: string;
  label: string;
  orders: Order[];
}

interface DispatchOrdersSidebarProps {
  pendingOrderCount: number;
  isLoading: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedOrder: string | null;
  onSelectOrder: (orderId: string) => void;
  clusterView: boolean;
  groups: DispatchOrderGroup[];
}

export function DispatchOrdersSidebar({
  pendingOrderCount,
  isLoading,
  searchQuery,
  onSearchQueryChange,
  selectedOrder,
  onSelectOrder,
  clusterView,
  groups,
}: DispatchOrdersSidebarProps) {
  return (
    <aside className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface-low">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-dim">Pending Orders</h3>
        <Badge variant="warning">{pendingOrderCount}</Badge>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="w-full">
              <SearchInput
                placeholder="Search pending orders..."
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
            </div>
            
            {groups.length === 0 ? (
              <div className="text-center py-8 text-(--color-text-dim) text-sm">No pending orders</div>
            ) : (
              <div className="space-y-6">
                {groups.map((group) => (
                  <div key={group.key} className="space-y-3">
                    {clusterView && (
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-dim)">{group.label}</span>
                        <Badge variant="neutral" size="sm">{group.orders.length}</Badge>
                      </div>
                    )}
                    <div className="space-y-2">
                      {group.orders.map((order) => (
                        <div
                          key={order.id}
                          className={`
                            bg-surface-low border rounded-lg p-3 cursor-pointer transition-all 
                            hover:border-primary-light hover:bg-surface-high
                            ${selectedOrder === order.id ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_var(--color-primary)]' : 'border-border'}
                          `.trim()}
                          onClick={() => onSelectOrder(order.id)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-primary-light text-sm">{order.id.split('-')[0]}</span>
                            <span className="text-[11px] text-text-dim font-medium">{order.weightKg}kg</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-text truncate max-w-27.5">
                              <MapPin size={12} className="text-primary shrink-0" />
                              <span className="truncate">{order.pickupAddress}</span>
                            </div>
                            <ChevronRight size={14} className="text-text-dim shrink-0" />
                            <div className="flex items-center gap-1.5 text-[11px] text-text truncate max-w-27.5">
                              <MapPin size={12} className="text-success shrink-0" />
                              <span className="truncate">{order.deliveryAddress}</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-border">
                            <Button variant="ghost" size="sm" fullWidth className="h-7 text-xs">Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
