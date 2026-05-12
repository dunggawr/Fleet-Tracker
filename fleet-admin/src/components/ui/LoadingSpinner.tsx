'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 24, label, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center gap-2 text-text-muted ${className}`}>
      <span 
        className="rounded-full border-3 border-white/10 border-t-primary animate-spin" 
        style={{ width: size, height: size }}
        aria-hidden="true" 
      />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}