import { PRESETS } from '../lib/presets';
import { Sparkles } from 'lucide-react';

interface Props {
  onSelect: (preset: string) => void;
  activePreset: string;
}

export function PresetGrid({ onSelect, activePreset }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 text-[var(--color-text-dim)] text-xs font-bold tracking-widest uppercase">
        <Sparkles size={14} /> Material Presets
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const isActive = p === activePreset;
          return (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className={`
                px-3 py-1.5 text-sm rounded-md border transition-all truncate max-w-[150px] font-medium
                ${isActive 
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)] shadow-[0_0_10px_rgba(197,240,38,0.2)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-border-hi)] hover:text-[var(--color-text-bright)]'
                }
              `}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  );
}
