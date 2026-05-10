'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Trophy, 
  Fuel, 
  MapPin,
  Calendar
} from 'lucide-react';

const reportTabs = [
  { name: 'Overview', href: '/reports', icon: BarChart3 },
  { name: 'KPI Leaderboard', href: '/reports/kpi', icon: Trophy },
  { name: 'Fuel Analysis', href: '/reports/fuel', icon: Fuel },
  { name: 'Utilization', href: '/reports/utilization', icon: MapPin },
  { name: 'Trip Summary', href: '/reports/trips', icon: Calendar },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-(--space-xl)">
      <header className="flex flex-col gap-(--space-lg)">
        <div className="header-title">
          <h1 className="text-2xl font-bold text-text">Reports & Analytics</h1>
          <p className="text-(--color-text-dim)">Monitor fleet performance and driver KPIs</p>
        </div>
        
        <nav className="flex gap-(--space-md) border-b border-border pb-px">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <Link 
                key={tab.name} 
                href={tab.href}
                className={`
                  flex items-center gap-(--space-sm) py-3 px-(--space-md) font-medium relative transition-all duration-150
                  ${isActive ? 'text-primary-light' : 'text-text-dim hover:text-text'}
                `}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
                {isActive && <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-primary rounded-t-sm" />}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  );
}
