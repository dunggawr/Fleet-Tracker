'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  ClipboardList, 
  Map as MapIcon, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
  { name: 'Dispatch Center', href: '/dispatch', icon: MapIcon },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside 
      className={`
        h-screen bg-surface border-r border-border 
        flex flex-col transition-[width] duration-200 ease-in-out fixed left-0 top-0 z-100
        ${collapsed ? 'w-20' : 'w-sidebar'}
      `}
    >
      <div 
        className={`
          h-header flex items-center border-b border-border
          ${collapsed ? 'px-md justify-center' : 'px-lg justify-between'}
        `}
      >
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 bg-primary text-white rounded-sm flex items-center justify-center font-bold text-sm">FT</div>
          {!collapsed && (
            <span className="font-bold text-lg text-text">
              Fleet<span className="text-primary-light">Tracker</span>
            </span>
          )}
        </div>
        <button 
          className={`
            flex items-center justify-center cursor-pointer transition-all duration-150 ease-out
            ${collapsed 
              ? 'absolute -right-3 top-18 bg-primary text-white rounded-full border-none shadow-sm w-6 h-6' 
              : 'bg-surface-high border border-border text-text-muted w-6 h-6 rounded-sm hover:text-primary-light hover:border-primary'}
          `} 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 py-lg px-sm flex flex-col gap-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`
                flex items-center gap-md no-underline rounded-default 
                transition-all duration-150 ease-out relative w-full cursor-pointer text-sm font-medium
                ${collapsed ? 'justify-center p-3' : 'py-3 px-md'}
                ${isActive 
                  ? 'bg-[rgba(99,102,241,0.1)] text-primary-light' 
                  : 'bg-transparent text-text-muted hover:bg-surface-high hover:text-text'}
              `}
              title={collapsed ? item.name : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
              {isActive && (
                <div className="absolute left-0 top-[20%] bottom-[20%] w-0.75 bg-primary rounded-r-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="py-lg px-sm border-t border-border flex flex-col gap-xs">
        <Link 
          href="/settings" 
          className={`
            flex items-center gap-md no-underline rounded-default 
            transition-all duration-150 ease-out relative w-full cursor-pointer text-sm font-medium
            text-text-muted hover:bg-surface-high hover:text-text
            ${collapsed ? 'justify-center p-3' : 'py-3 px-md'}
          `}
        >
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button 
          className={`
            flex items-center gap-md no-underline rounded-default 
            transition-all duration-150 ease-out relative w-full cursor-pointer text-sm font-medium
            text-danger opacity-80 hover:bg-[rgba(239,68,68,0.1)] hover:opacity-100
            ${collapsed ? 'justify-center p-3' : 'py-3 px-md'}
            bg-transparent border-none
          `} 
          onClick={logout}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
