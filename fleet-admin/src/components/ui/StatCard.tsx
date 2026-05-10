'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: string;
}

export function StatCard({ label, value, icon: Icon, trend, color = 'var(--color-primary)' }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-outline-variant">
      <div className="flex justify-between items-start">
        <div 
          className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center"
          style={{ color: color }}
        >
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${
            trend.isUp 
              ? 'bg-success/10 text-success' 
              : 'bg-danger/10 text-danger'
          }`}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">{label}</span>
        <h3 className="text-2xl font-bold text-text mt-1">{value}</h3>
      </div>
    </div>

  );
}
