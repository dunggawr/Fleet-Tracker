import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-medium text-text-muted">{label}</label>}
      <input 
        className={`
          w-full px-3.5 py-2.5 
          bg-surface-low border border-outline-variant rounded-md 
          text-text text-sm transition-all duration-150 outline-none
          focus:border-primary focus:ring-3 focus:ring-primary/15
          ${error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''} 
          placeholder:text-text-dim
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
