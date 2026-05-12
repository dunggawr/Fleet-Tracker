'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-[400px]',
  md: 'max-w-[600px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1000px]',
};

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = 'md',
  className = ""
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-1000 p-md" 
      onClick={onClose}
    >
      <div 
        className={`bg-surface border border-border rounded-lg flex flex-col max-h-[90vh] w-full shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 ${sizeClasses[size]} ${className}`} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="p-lg border-b border-border flex justify-between items-center">
          <h3 id="modal-title" className="text-h3 m-0 font-bold">{title}</h3>
          <Button variant="ghost" size="sm" icon={<X size={20} />} onClick={onClose} aria-label="Close modal" />
        </header>
        
        <div className="p-lg overflow-y-auto">
          {children}
        </div>

        {footer && (
          <footer className="p-lg border-t border-border flex justify-end gap-md bg-surface-low rounded-b-lg">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
