'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function SearchInput({ label, className = '', ...props }: SearchInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[12px] font-medium text-(--color-text-muted) leading-4">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 w-full px-3.5 py-2.5 bg-surface-low border border-outline-variant rounded-lg transition-all duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]">
        <Search size={18} className="text-(--color-text-dim) shrink-0" />
        <input 
          className={`w-full bg-transparent border-none text-text text-sm outline-none placeholder:text-(--color-text-dim) ${className}`} 
          {...props} 
        />
      </div>
    </div>
  );
}