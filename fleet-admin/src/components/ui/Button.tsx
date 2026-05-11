'use client';

import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  href?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  fullWidth,
  icon, 
  href,
  className = '', 
  type = 'button',
  ...props 
}: ButtonProps) {
  const content = (
    <>
      {isLoading && <span className="spinner-sm" />}
      {!isLoading && icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </>
  );

  const baseClassName = `btn btn-${variant} btn-${size} ${fullWidth ? 'full-width' : ''} ${className} ${isLoading ? 'loading' : ''}`;

  const styles = (
    <style jsx>{`
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      
      .btn:active {
        transform: scale(0.98);
      }

      .btn-primary:hover {
        filter: brightness(1.1);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .btn-ghost:hover {
        background: rgba(255, 255, 255, 0.03);
      }

      .btn-icon {
        display: flex;
        align-items: center;
      }

      .full-width {
        width: 100%;
      }

      .spinner-sm {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName} {...(props as any)}>
        {content}
        {styles}
      </Link>
    );
  }

  return (
    <button 
      type={type}
      className={baseClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {content}
      {styles}
    </button>
  );
}
