"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  BarChart3,
  Navigation,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Dispatch Center", href: "/dispatch", icon: MapIcon },
  { name: "Live Tracking", href: "/tracking", icon: Navigation },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside 
      className="fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col transition-all duration-200 z-100"
      style={{ width: collapsed ? 'var(--width-sidebar-collapsed)' : 'var(--width-sidebar)' }}
    >
      <div className={`h-header border-b border-border flex items-center justify-between px-lg ${collapsed ? "justify-center px-md" : ""}`}>
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 bg-primary text-white rounded-sm flex items-center justify-center font-bold text-sm">FT</div>
          {!collapsed && (
            <span className="font-bold text-lg text-text">
              Fleet<span className="text-primary-light">Tracker</span>
            </span>
          )}
        </div>
        <button
          className={`bg-surface-high border border-border text-text-muted w-6 h-6 rounded-sm flex items-center justify-center cursor-pointer transition-all hover:text-primary-light hover:border-primary ${collapsed ? "absolute -right-3 top-[72px] bg-primary text-white rounded-full border-none shadow-sm" : ""}`}
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-lg px-sm flex flex-col gap-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-md p-md text-text-muted no-underline rounded-default transition-all relative font-medium text-body-md hover:bg-surface-high hover:text-text ${isActive ? "bg-primary/10 text-primary-light" : ""} ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
              {isActive && <div className="absolute left-0 top-1/5 bottom-1/5 w-[3px] bg-primary rounded-r-md" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-lg px-sm border-t border-border flex flex-col gap-xs">
        <Link
          href="/settings"
          className={`flex items-center gap-md p-md text-text-muted no-underline rounded-default transition-all relative font-medium text-body-md hover:bg-surface-high hover:text-text ${pathname.startsWith("/settings") ? "bg-primary/10 text-primary-light" : ""} ${collapsed ? "justify-center" : ""}`}
        >
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
          {pathname.startsWith("/settings") && (
            <div className="absolute left-0 top-1/5 bottom-1/5 w-[3px] bg-primary rounded-r-md" />
          )}
        </Link>
        <button 
          className={`flex items-center gap-md p-md py-lg text-danger opacity-80 no-underline rounded-default transition-all relative font-medium text-body-md hover:bg-danger/10 hover:opacity-100 bg-transparent border-none w-full cursor-pointer ${collapsed ? "justify-center" : ""}`} 
          onClick={logout}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
