import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[12px] font-medium text-text-muted leading-4">
          {label}
        </label>
      )}
      <input 
        className={`
          input
          ${error ? 'border-danger' : ''} 
          ${className}
        `.trim()}
        {...props}
      />
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </div>
  );
}
