'use client';

import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ReportChartWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number | string;
}

export function ReportChartWrapper({ 
  title, 
  subtitle, 
  children, 
  isLoading, 
  isEmpty, 
  height = 300 
}: ReportChartWrapperProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-[var(--space-lg)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex justify-between items-start">
        <div className="header-info">
          <h3 className="text-lg font-semibold text-[var(--color-text)] leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--color-text-dim)] mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="relative w-full" style={{ height }}>
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-[var(--space-md)]">
            <LoadingSpinner size={32} />
            <p className="text-sm text-[var(--color-text-muted)]">Loading chart data...</p>
          </div>
        ) : isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-[var(--space-md)]">
            <p className="text-sm text-[var(--color-text-muted)]">No data available for the selected range</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
