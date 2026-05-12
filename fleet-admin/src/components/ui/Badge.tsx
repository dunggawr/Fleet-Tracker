import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/15 text-primary-light',
    success: 'bg-tertiary/15 text-tertiary-light',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/15 text-danger',
    neutral: 'bg-text-muted/15 text-text-muted',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
