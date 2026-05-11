'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderTrigger = () => {
    if (React.isValidElement(trigger)) {
      const element = trigger as React.ReactElement<any>;
      return React.cloneElement(element, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (element.props.onClick) element.props.onClick(e);
        }
      });
    }
    return (
      <div className="dropdown-trigger" onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}>
        {trigger}
      </div>
    );
  };

  return (
    <div className={`dropdown-container ${className}`} ref={containerRef}>
      {renderTrigger()}
      
      {isOpen && (
        <div className={`dropdown-content align-${align} glass`} onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}

      <style jsx>{`
        .dropdown-container {
          position: relative;
          display: inline-block;
        }

        .dropdown-trigger {
          cursor: pointer;
        }

        .dropdown-content {
          position: absolute;
          top: calc(100% + 8px);
          min-width: 200px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 8px;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }

        .align-right {
          right: 0;
        }

        .align-left {
          left: 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.dropdown-item) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--color-text-dim);
          text-decoration: none;
          font: var(--font-label-md);
          transition: all var(--transition-fast);
          cursor: pointer;
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
        }

        :global(.dropdown-item:hover) {
          background: var(--color-surface-high);
          color: var(--color-text);
        }

        :global(.dropdown-item.danger) {
          color: var(--color-danger);
        }

        :global(.dropdown-item.danger:hover) {
          background: rgba(239, 68, 68, 0.1);
        }

        :global(.dropdown-divider) {
          height: 1px;
          background: var(--color-border);
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
}
