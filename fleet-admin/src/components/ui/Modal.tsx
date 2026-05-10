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
}

const sizeClasses = {
  sm: 'max-w-[400px]',
  md: 'max-w-[600px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1000px]',
};

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-1000 p-4" 
      onClick={onClose}
    >
      <div 
        className={`
          bg-surface border border-border rounded-2xl 
          flex flex-col max-h-[90vh] w-full shadow-2xl 
          animate-modal-in 
          ${sizeClasses[size]}
        `.trim()} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="p-6 border-b border-border flex justify-between items-center">
          <h3 id="modal-title" className="text-xl font-semibold text-text">
            {title}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<X size={20} />} 
            onClick={onClose} 
            aria-label="Close modal" 
          />
        </header>
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <footer className="p-6 border-t border-border flex justify-end gap-4 bg-surface-low rounded-b-2xl">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

