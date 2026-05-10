'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  fullWidth,
  icon, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-glow",
    secondary: "bg-transparent text-text border border-outline-variant hover:bg-surface-high hover:border-outline",
    danger: "bg-transparent text-danger border border-danger/30 hover:bg-danger/10",
    ghost: "bg-transparent text-text-dim hover:bg-surface-high hover:text-text"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base"
  };

  const combinedClasses = `
    ${baseStyles} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${fullWidth ? 'w-full' : ''} 
    ${isLoading ? 'opacity-80 pointer-events-none' : ''} 
    ${className}
  `.trim();


  return (
    <button 
      className={combinedClasses}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-current rounded-full animate-spin" />
      )}
      {!isLoading && icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
