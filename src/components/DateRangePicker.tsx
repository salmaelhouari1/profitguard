import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRangePreset = '7d' | '30d' | '90d' | 'year' | 'all';

interface DateRangePickerProps {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
}

const presets: { id: DateRangePreset; label: string }[] = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-chalk border border-border p-1 shadow-xs">
      <div className="flex items-center gap-1.5 px-2.5 text-ink-muted border-r border-border/60 mr-1">
        <Calendar className="w-3.5 h-3.5 text-sage" />
        <span className="text-xs font-mono font-medium hidden sm:inline">Period:</span>
      </div>
      <div className="flex items-center gap-1">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.id)}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
              value === preset.id
                ? 'bg-ink text-chalk font-semibold shadow-xs'
                : 'text-ink-secondary hover:text-ink hover:bg-oyster'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
