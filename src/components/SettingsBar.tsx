import { BlendMode, TextureSettings } from '../types';
import { Sliders, Maximize } from 'lucide-react';

interface Props {
  settings: TextureSettings;
  setSettings: (s: TextureSettings) => void;
  isLoading: boolean;
}

export function SettingsBar({ settings, setSettings, isLoading }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl mb-6">
      
      {/* Size Selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-dim)] flex items-center gap-1">
          <Maximize size={14} /> Size
        </label>
        <div className="flex bg-[var(--color-surface-2)] rounded-md border border-[var(--color-border)] overflow-hidden">
          {[256, 512, 1024].map((size) => (
            <button
              key={size}
              onClick={() => !isLoading && setSettings({ ...settings, size })}
              disabled={isLoading}
              className={`px-3 py-1 text-sm font-medium border-r border-[var(--color-border)] last:border-0 transition-colors ${
                settings.size === size 
                  ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]' 
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-px h-px md:h-8 bg-[var(--color-border)]"></div>

      {/* Blend Control */}
      <div className="flex flex-col xs:flex-row flex-1 items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-dim)] flex items-center gap-1">
            <Sliders size={14} /> Blend
          </label>
          <select 
            value={settings.blendMode}
            onChange={(e) => setSettings({ ...settings, blendMode: e.target.value as BlendMode })}
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-bright)] text-sm rounded px-2 py-1 outline-none focus:border-[var(--color-accent)]"
          >
            <option value="cosine">Cosine</option>
            <option value="crossfade">Crossfade</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs uppercase font-bold text-[var(--color-text-dim)] w-12 text-right">
            {(settings.blendWidth * 100).toFixed(0)}%
          </label>
          <input 
            type="range" 
            min="0.1" 
            max="0.5" 
            step="0.01"
            value={settings.blendWidth}
            onChange={(e) => setSettings({ ...settings, blendWidth: parseFloat(e.target.value) })}
            className="flex-1 w-full"
          />
        </div>
      </div>

    </div>
  );
}
