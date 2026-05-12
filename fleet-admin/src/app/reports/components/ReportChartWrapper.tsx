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
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <div className="bg-surface border border-border rounded-md p-lg flex flex-col gap-lg">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-text leading-tight">{title}</h3>
          {subtitle && <p className="text-xs font-medium text-text-dim mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="relative w-full min-w-0 min-h-px flex-1 overflow-hidden" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-md">
            <LoadingSpinner size={32} />
            <p className="text-sm text-text-dim">Loading chart data...</p>
          </div>
        ) : isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-md">
            <p className="text-sm text-text-muted">No data available for the selected range</p>
          </div>
        ) : isMounted ? (
          children
        ) : null}
      </div>
    </div>
  );
}
