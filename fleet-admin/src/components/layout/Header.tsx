'use client';

import React from 'react';
import { 
  Bell, 
  Search, 
  User as UserIcon,
  ChevronDown,
  Globe,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-header px-xl flex items-center justify-between sticky top-0 z-90 border-b border-border glass">
      <div className="flex items-center bg-surface-low border border-outline-variant rounded-default px-md w-100 transition-all duration-150 ease-out focus-within:border-primary focus-within:bg-surface-high focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]">
        <Search size={18} className="text-text-dim" />
        <input 
          type="text" 
          placeholder="Search for vehicles, drivers or orders..." 
          className="border-none bg-transparent text-text p-2.5 w-full outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-lg">
        <button className="bg-transparent border-none text-text-muted flex items-center gap-xs cursor-pointer p-2 rounded-sm transition-all duration-150 ease-out text-xs hover:bg-surface-high hover:text-text" aria-label="Language">
          <Globe size={20} />
          <span>EN</span>
        </button>
        
        <button className="bg-transparent border-none text-text-muted flex items-center gap-xs cursor-pointer p-2 rounded-sm transition-all duration-150 ease-out text-xs hover:bg-surface-high hover:text-text relative" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-1 right-1 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface">3</span>
        </button>

        <div className="flex items-center gap-sm bg-surface-low p-1 rounded-default border border-border">
          <div className="flex items-center gap-md py-1 px-2 rounded-sm cursor-pointer transition-[background] duration-150 ease-out hover:bg-surface-high">
            <div className="w-9 h-9 bg-surface-highest rounded-full flex items-center justify-center text-primary-light border border-border">
              <UserIcon size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text">{user?.fullName || 'Admin User'}</span>
              <span className="text-[12px] text-text-dim">{user?.role || 'Fleet Manager'}</span>
            </div>
            <ChevronDown size={16} className="text-text-dim" />
          </div>
          
          <button 
            className="bg-transparent border-none text-text-dim flex items-center justify-center w-9 h-9 rounded-sm cursor-pointer transition-all duration-150 ease-out hover:bg-[rgba(239,68,68,0.1)] hover:text-danger" 
            onClick={logout} 
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
