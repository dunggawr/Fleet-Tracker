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
    <div className="bg-surface border border-border rounded-md p-(--space-lg) flex flex-col gap-(--space-lg)">
      <div className="flex justify-between items-start">
        <div className="header-info">
          <h3 className="text-lg font-semibold text-text leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-(--color-text-dim) mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="relative w-full" style={{ height }}>
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-(--space-md)">
            <LoadingSpinner size={32} />
            <p className="text-sm text-(--color-text-muted)">Loading chart data...</p>
          </div>
        ) : isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-(--space-md)">
            <p className="text-sm text-(--color-text-muted)">No data available for the selected range</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
