import { Hammer, Sparkles, Maximize } from 'lucide-react';
import { TextureSettings } from '../types';

interface Props {
  prompt: string;
  onGenerate: () => void;
  onEnhance: () => void;
  isLoading: boolean;
  isEnhancing: boolean;
  settings: TextureSettings;
  setSettings: (s: TextureSettings) => void;
}

export function ActionBar({ prompt, onGenerate, onEnhance, isLoading, isEnhancing, settings, setSettings }: Props) {
  return (
    <div className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] p-4 md:p-5 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center gap-5 justify-between transition-all mb-8 mt-4">
      
      {/* Primary Actions */}
      <div className="flex w-full xl:w-auto gap-3 shrink-0">
        <button
          onClick={onEnhance}
          disabled={isLoading || isEnhancing || !prompt.trim()}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-xl brand-font font-bold uppercase tracking-wider text-sm
            ${(isLoading || isEnhancing || !prompt.trim())
              ? 'bg-[var(--color-surface-2)] text-[var(--color-border-hi)] cursor-not-allowed border border-[var(--color-border)]' 
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-bright)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] hover:text-[var(--color-accent)]'
            }
            transition-all flex-1 xl:flex-none
          `}
          title="Use AI to extend this prompt for texture generation"
        >
          {isEnhancing ? (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border-hi)] border-t-[var(--color-accent)] animate-spin"></div>
          ) : (
            <Sparkles size={18} />
          )}
          {isEnhancing ? 'Extending...' : 'Extend Prompt'}
        </button>
        
        <button
          onClick={onGenerate}
          disabled={isLoading || isEnhancing || !prompt.trim()}
          className={`
            flex items-center justify-center gap-3 px-10 py-3 rounded-xl brand-font font-bold uppercase tracking-wider text-sm
            ${(isLoading || isEnhancing || !prompt.trim())
              ? 'bg-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed' 
              : 'bg-[var(--color-accent)] text-[#0a0a0b] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(197,240,38,0.4)]'
            }
            transition-all border border-transparent flex-1 xl:flex-none
          `}
        >
          {isLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border-hi)] border-t-[var(--color-text-dim)] animate-spin"></div>
          ) : (
            <Hammer size={18} />
          )}
          {isLoading ? 'Forging...' : 'Generate'}
        </button>
      </div>

      <div className="w-full xl:w-px h-px xl:h-8 bg-[var(--color-border)] hidden xl:block"></div>

      {/* Settings Grid */}
      <div className="flex flex-wrap w-full xl:w-auto gap-5 items-center justify-between xl:justify-end text-xs uppercase tracking-widest font-bold text-[var(--color-text-dim)]">
        
        {/* Enhance Toggle */}
        <div className="relative group flex items-center gap-2 shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 rounded-lg hover:border-[var(--color-accent-dim)] hover:text-[var(--color-text-bright)] transition-colors cursor-help">
           <input 
             type="checkbox" 
             id="enhance-check"
             checked={settings.enhance}
             onChange={(e) => !isLoading && setSettings({ ...settings, enhance: e.target.checked })}
             disabled={isLoading}
             className="w-4 h-4 rounded-sm border-[var(--color-border)] bg-[#050505] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-[#0a0a0b] cursor-help inline-block align-middle m-0"
           />
           <label htmlFor="enhance-check" className="cursor-help select-none pl-1">Enhance API</label>
           
           {/* Custom Tooltip */}
           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-[#050505] border border-[var(--color-border)] rounded-lg shadow-2xl text-xs normal-case tracking-normal font-sans text-[var(--color-text-dim)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
             Toggles the built-in Pollinations prompt enhancement feature to automatically enrich details before generation.
             <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#050505] border-b border-r border-[var(--color-border)] transform rotate-45"></div>
           </div>
        </div>

        {/* Size Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Maximize size={14} className="hidden sm:block shrink-0" /> Size
          <div className="flex bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] overflow-hidden shrink-0">
            {[128, 256, 512, 1024].map((size) => (
              <button
                key={size}
                onClick={() => !isLoading && setSettings({ ...settings, size })}
                disabled={isLoading}
                className={`px-3 py-2 border-r border-[var(--color-border)] last:border-0 transition-colors ${
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
      </div>
    </div>
  );
}
