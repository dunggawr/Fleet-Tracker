'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function SearchInput({ label, className = '', ...props }: SearchInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-text-muted">{label}</label>}
      <div className="flex items-center gap-2 w-full px-3.5 py-2.5 bg-surface-low border border-outline-variant rounded-md transition-all duration-150 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15">
        <Search size={18} className="text-text-dim flex-none" />
        <input 
          className={`w-full bg-transparent text-text text-sm outline-none placeholder:text-text-dim ${className}`} 
          {...props} 
        />
      </div>
    </div>
  );
}