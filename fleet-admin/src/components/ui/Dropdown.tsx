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
      <div className="cursor-pointer" onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}>
        {trigger}
      </div>
    );
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {renderTrigger()}
      
      {isOpen && (
        <div 
          className={`absolute top-[calc(100%+8px)] min-w-[200px] bg-surface border border-border rounded-md shadow-lg p-2 z-1000 animate-in fade-in slide-in-from-top-2 duration-200 glass ${align === 'right' ? 'right-0' : 'left-0'}`} 
          onClick={() => setIsOpen(false)}
        >
          <div className="flex flex-col gap-1 dropdown-content">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
