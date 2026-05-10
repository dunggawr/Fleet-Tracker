'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DateRange {
  from: string;
  to: string;
}

interface DateRangeFilterProps {
  onRangeChange: (range: DateRange) => void;
}

const PRESET_RANGES = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'This Month', days: 'current_month' },
];

export function DateRangeFilter({ onRangeChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('Last 7 Days');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    const to = new Date();
    let from = new Date();

    if (preset.days === 'current_month') {
      from = new Date(to.getFullYear(), to.getMonth(), 1);
    } else {
      from.setDate(to.getDate() - (preset.days as number));
    }

    const range = {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };

    setSelectedLabel(preset.label);
    onRangeChange(range);
    setIsOpen(false);
  };

  const handleApply = () => {
    if (!customFrom || !customTo) return;
    
    setSelectedLabel(`${customFrom} to ${customTo}`);
    onRangeChange({ from: customFrom, to: customTo });
    setIsOpen(false);
  };

  return (
    <div className="relative w-[220px]">
      <div 
        className="flex items-center gap-(--space-sm) py-[10px] px-(--space-md) bg-[var(--color-surface-high)] border border-[var(--color-border)] rounded-[var(--radius-default)] cursor-pointer text-[var(--color-text)] font-medium text-sm transition-all duration-150 hover:border-[var(--color-primary)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={18} className="text-[var(--color-primary-light)]" />
        <span>{selectedLabel}</span>
        <ChevronDown size={16} className={`ml-auto transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] z-[100] p-[var(--space-sm)] animate-in fade-in slide-in-from-top-2 duration-200">
          {PRESET_RANGES.map((preset) => (
            <div 
              key={preset.label} 
              className="py-[10px] px-[var(--space-md)] rounded-[var(--radius-sm)] cursor-pointer text-[var(--color-text-dim)] transition-all duration-150 hover:bg-[var(--color-surface-high)] hover:text-[var(--color-text)]"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </div>
          ))}
          <div className="h-[1px] bg-[var(--color-border)] my-[var(--space-sm)]" />
          <div className="py-[var(--space-sm)] px-[var(--space-md)]">
            <span className="block text-[12px] text-[var(--color-text-muted)] mb-2 uppercase font-semibold">Custom Range</span>
            <div className="flex items-center gap-[var(--space-xs)] text-[12px] text-[var(--color-text-muted)]">
              <input 
                type="date" 
                className="flex-1 bg-[var(--color-surface-high)] border border-[var(--color-border)] rounded-sm p-[6px] color-[var(--color-text)] text-[12px] outline-none focus:border-[var(--color-primary)]" 
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span>to</span>
              <input 
                type="date" 
                className="flex-1 bg-[var(--color-surface-high)] border border-[var(--color-border)] rounded-sm p-[6px] color-[var(--color-text)] text-[12px] outline-none focus:border-[var(--color-primary)]" 
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
            <Button 
              size="sm" 
              fullWidth 
              className="mt-3"
              onClick={handleApply}
              disabled={!customFrom || !customTo}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
