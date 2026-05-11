'use client';

import React from 'react';
import { Truck, Users, MapPin, CheckCircle2, Zap, AlertTriangle, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Vehicle, Order, DispatchSuggestion } from '@/types';

interface DispatchVehiclesSidebarProps {
  availableVehicles: Vehicle[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  isLoading: boolean;
  isAssigning: boolean;
  selectedOrder: string | null;
  selectedOrderData?: Order | null; // order object để kiểm tra weight
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  onAssignVehicle: (vehicleId: string) => void;
  // Suggestions từ API /dispatch/suggest (sorted by distance)
  suggestions?: DispatchSuggestion[];
  isSuggestLoading?: boolean;
}

export function DispatchVehiclesSidebar({
  availableVehicles,
  searchQuery,
  onSearchQueryChange,
  isLoading,
  isAssigning,
  selectedOrder,
  selectedOrderData,
  selectedVehicleId,
  onSelectVehicle,
  onAssignVehicle,
  suggestions,
  isSuggestLoading,
}: DispatchVehiclesSidebarProps) {
  // Khi đang chọn đơn hàng + có suggestions → hiển thị chế độ Smart Suggest
  const isSmartMode = !!selectedOrder && !!suggestions && suggestions.length > 0;

  // Kiểm tra xe có đủ tải trọng cho đơn hàng không (AC-DIS-01: Xe không đủ tải → không cho gán)
  const checkCapacity = (vehicle: Vehicle): { ok: boolean; freeKg: number; needed: number } => {
    const freeKg = (vehicle.maxCapacityKg || 0) - (vehicle.currentLoadKg || 0);
    const needed = selectedOrderData?.weightKg || 0;
    return { ok: needed === 0 || freeKg >= needed, freeKg, needed };
  };

  // Kiểm tra bằng lái hết hạn (AC-DIS-01)
  const checkLicense = (vehicle: Vehicle): boolean => {
    const expiry = vehicle.driver?.licenseExpiry;
    if (!expiry) return true; // Không có data → không block
    return new Date(expiry) > new Date();
  };

  const renderVehicleCard = (vehicle: Vehicle, suggestion?: DispatchSuggestion) => {
    const capacity = checkCapacity(vehicle);
    const licenseOk = checkLicense(vehicle);
    const isSelected = selectedVehicleId === vehicle.id;
    const canAssign = selectedOrder && capacity.ok && licenseOk;

    return (
      <div
        key={vehicle.id}
        className={`dispatch-card vehicle-card ${isSelected ? 'selected' : ''} ${!capacity.ok ? 'over-capacity' : ''}`}
        onClick={() => onSelectVehicle(vehicle.id)}
      >
        {/* Header: Biển số + badge trạng thái */}
        <div className="card-header">
          <div className="vehicle-info">
            <Truck size={16} />
            <span className="vehicle-plate">{vehicle.plateNumber}</span>
            <span className="vehicle-type">{vehicle.type}</span>
          </div>
          <Badge variant={capacity.ok ? 'success' : 'danger'}>{vehicle.status}</Badge>
        </div>

        {/* Tài xế */}
        <div className="vehicle-meta-row">
          <Users size={13} className="icon-dim" />
          <span>{vehicle.driver?.fullName || 'Chưa gán tài xế'}</span>
          {!licenseOk && (
            <span className="license-warning">
              <AlertTriangle size={12} /> Bằng lái hết hạn
            </span>
          )}
        </div>

        {/* Tải trọng — cảnh báo nếu không đủ */}
        <div className={`vehicle-meta-row ${!capacity.ok ? 'text-danger' : ''}`}>
          <Scale size={13} className="icon-dim" />
          <span>
            Tải trọng còn: <strong>{capacity.freeKg.toFixed(0)} kg</strong>
            {selectedOrderData && (
              <> / cần <strong>{capacity.needed} kg</strong></>
            )}
          </span>
          {!capacity.ok && (
            <span className="overweight-badge">
              <AlertTriangle size={12} /> Quá tải
            </span>
          )}
        </div>

        {/* Khoảng cách (chỉ hiện trong Smart Mode) */}
        {suggestion && (
          <div className="vehicle-meta-row suggestion-row">
            <MapPin size={13} className="icon-dim" />
            <span>Cách điểm lấy: <strong>{suggestion.distanceKm.toFixed(1)} km</strong></span>
            {suggestion.kpiScore > 0 && (
              <span className="kpi-chip">KPI {suggestion.kpiScore.toFixed(0)}</span>
            )}
          </div>
        )}

        {/* Footer: nút Assign */}
        <div className="card-footer">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            disabled={!canAssign || isAssigning}
            isLoading={isAssigning}
            icon={<CheckCircle2 size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onAssignVehicle(vehicle.id);
            }}
          >
            {!selectedOrder ? 'Chọn đơn hàng trước' : !capacity.ok ? 'Quá tải trọng' : !licenseOk ? 'Bằng lái hết hạn' : 'Gán đơn hàng'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <aside className="dispatch-sidebar vehicles-list">
      <div className="sidebar-header">
        <h3>Available Fleet</h3>
        <Badge variant="success">{availableVehicles.length}</Badge>
      </div>

      <div className="sidebar-content">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size={24} />
          </div>
        ) : (
          <>
            <div className="dispatch-search">
              <SearchInput
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
            </div>

            {/* === Smart Suggest Mode: hiện khi đã chọn đơn hàng === */}
            {selectedOrder && (
              <div className="suggest-banner">
                <Zap size={14} />
                <span>
                  {isSuggestLoading
                    ? 'Đang tìm xe phù hợp...'
                    : isSmartMode
                    ? `Top ${suggestions!.length} xe phù hợp nhất (gần nhất + đủ tải)`
                    : 'Sắp xếp theo khoảng cách & tải trọng'}
                </span>
                {isSuggestLoading && <LoadingSpinner size={14} />}
              </div>
            )}

            {isSmartMode ? (
              // Render danh sách theo thứ tự suggestions từ API (đã sắp xếp theo khoảng cách)
              <>
                <div className="section-label">Gợi ý thông minh</div>
                {suggestions!.map((s) =>
                  renderVehicleCard(s.vehicle, s)
                )}
                {/* Hiển thị phần còn lại nếu có */}
                {availableVehicles.filter(
                  (v) => !suggestions!.some((s) => s.vehicle.id === v.id)
                ).length > 0 && (
                  <>
                    <div className="section-label other-section">Xe khác</div>
                    {availableVehicles
                      .filter((v) => !suggestions!.some((s) => s.vehicle.id === v.id))
                      .filter((v) =>
                        [v.id, v.plateNumber, v.type, v.driver?.fullName]
                          .join(' ')
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((v) => renderVehicleCard(v))}
                  </>
                )}
              </>
            ) : availableVehicles.length === 0 ? (
              <div className="text-center py-8 text-dim">
                {searchQuery ? (
                  <>No vehicles matching "<strong>{searchQuery}</strong>"</>
                ) : (
                  'No available vehicles'
                )}
              </div>
            ) : (
              // Normal mode: sắp xếp xe đủ tải lên trên
              [...availableVehicles]
                .sort((a, b) => {
                  const capA = checkCapacity(a).ok ? 0 : 1;
                  const capB = checkCapacity(b).ok ? 0 : 1;
                  return capA - capB;
                })
                .map((vehicle) => renderVehicleCard(vehicle))
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .dispatch-search {
          margin-bottom: var(--space-sm);
        }

        .dispatch-search :global(.search-input-group) {
          width: 100%;
        }

        .suggest-banner {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 8px var(--space-sm);
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--color-primary-light);
          margin-bottom: var(--space-sm);
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--color-text-muted);
          margin: var(--space-sm) 0 var(--space-xs);
        }

        .other-section {
          margin-top: var(--space-md);
          padding-top: var(--space-sm);
          border-top: 1px solid var(--color-border);
        }

        .dispatch-card {
          background: var(--color-surface-low);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-default);
          padding: var(--space-md);
          transition: all var(--transition-fast);
          cursor: pointer;
          margin-bottom: var(--space-sm);
        }

        .dispatch-card:hover {
          border-color: var(--color-primary-light);
          background: var(--color-surface-high);
        }

        .dispatch-card.selected {
          border-color: var(--color-primary);
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 0 1px var(--color-primary);
        }

        .dispatch-card.over-capacity {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.04);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
        }

        .vehicle-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .vehicle-plate {
          font-weight: 700;
          color: var(--color-primary-light);
        }

        .vehicle-type {
          font-size: 11px;
          color: var(--color-text-muted);
          text-transform: capitalize;
          background: var(--color-surface-high);
          padding: 1px 6px;
          border-radius: 99px;
        }

        .vehicle-meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-text-dim);
          margin-top: 5px;
        }

        .vehicle-meta-row.text-danger {
          color: #ef4444;
        }

        .icon-dim {
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

        .license-warning,
        .overweight-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: #ef4444;
          font-weight: 600;
          margin-left: auto;
        }

        .suggestion-row {
          color: var(--color-success);
          margin-top: 6px;
        }

        .kpi-chip {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          color: var(--color-primary-light);
          background: rgba(99, 102, 241, 0.12);
          padding: 2px 7px;
          border-radius: 99px;
        }

        .card-footer {
          margin-top: var(--space-sm);
          border-top: 1px solid var(--color-border);
          padding-top: var(--space-sm);
        }
      `}</style>
    </aside>
  );
}
