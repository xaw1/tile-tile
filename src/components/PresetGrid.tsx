import { PRESETS, PROMPT_STYLES } from '../lib/presets';
import { Sparkles, Bookmark, Layers, X } from 'lucide-react';

interface Props {
  onSelect: (preset: string) => void;
  activePreset: string;
  promptStyleId: string;
  setPromptStyleId: (id: string) => void;
  customPresets: string[];
  onDeleteCustomPreset: (preset: string) => void;
}

export function PresetGrid({ onSelect, activePreset, promptStyleId, setPromptStyleId, customPresets, onDeleteCustomPreset }: Props) {
  const activeClass = 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)] shadow-[0_0_10px_rgba(197,240,38,0.2)]';
  const inactiveClass = 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-border-hi)] hover:text-[var(--color-text-bright)]';

  return (
    <div className="mb-6">
      {/* Built-in Material Presets */}
      <div className="flex items-center gap-2 mb-3 text-[var(--color-text-dim)] text-xs font-bold tracking-widest uppercase">
        <Sparkles size={14} /> Material Presets
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-all truncate max-w-[150px] font-medium ${p === activePreset ? activeClass : inactiveClass}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Custom Saved Presets */}
      {customPresets.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3 text-[var(--color-text-dim)] text-xs font-bold tracking-widest uppercase">
            <Bookmark size={14} /> Saved
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {customPresets.map((p) => (
              <div key={p} className="relative group/custom flex-shrink-0">
                <button
                  onClick={() => onSelect(p)}
                  title={p}
                  className={`px-3 py-1.5 pr-7 text-sm rounded-md border transition-all font-medium max-w-[220px] truncate block ${p === activePreset ? activeClass : inactiveClass}`}
                >
                  {p}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteCustomPreset(p); }}
                  title="Remove preset"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/custom:opacity-100 transition-opacity text-[var(--color-text-dim)] hover:text-[var(--color-danger)]"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Prompt Style Selector */}
      <div className="flex items-center gap-2 mb-3 text-[var(--color-text-dim)] text-xs font-bold tracking-widest uppercase">
        <Layers size={14} /> Prompt Style
      </div>
      <div className="flex flex-wrap gap-2">
        {PROMPT_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setPromptStyleId(style.id)}
            title={style.suffix}
            className={`px-3 py-1.5 text-sm rounded-md border transition-all font-medium ${style.id === promptStyleId ? activeClass : inactiveClass}`}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}
