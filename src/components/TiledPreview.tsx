import { TextureSettings, BlendMode } from '../types';
import { Grip, Sliders } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface Props {
  seamlessUrl: string | null;
  settings: TextureSettings;
  setSettings: (s: TextureSettings) => void;
}

export function TiledPreview({ seamlessUrl, settings, setSettings }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  const panRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    panRef.current.x += e.movementX;
    panRef.current.y += e.movementY;
    if (previewRef.current) {
      previewRef.current.style.backgroundPosition = `calc(50% + ${panRef.current.x}px) calc(50% + ${panRef.current.y}px)`;
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Keep ref in sync to avoid re-binding scroll listener
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Wheel zoom logic
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent page scroll
      
      const current = settingsRef.current.tileCount;
      
      // Use exponential scaling linked directly to deltaY magnitude.
      // This authentically replicates smooth trackpad pinch/scroll zoom.
      // deltaY > 0 (scroll down) = zoom out (increase tiles)
      // deltaY < 0 (scroll up) = zoom in (decrease tiles)
      const zoomSensitivity = 0.0015;
      const zoomFactor = Math.exp(e.deltaY * zoomSensitivity);
      
      let newCount = current * zoomFactor;
      newCount = Math.max(1, Math.min(5, Number(newCount.toFixed(2))));
      
      if (newCount !== current) {
        // Adjust pan coordinates so the center of the screen stays stationary
        const scaleChange = current / newCount;
        panRef.current.x *= scaleChange;
        panRef.current.y *= scaleChange;
        
        if (el) {
          el.style.backgroundPosition = `calc(50% + ${panRef.current.x}px) calc(50% + ${panRef.current.y}px)`;
          el.style.backgroundSize = `${100 / newCount}%`;
        }
        
        settingsRef.current = { ...settingsRef.current, tileCount: newCount };
        setSettings(settingsRef.current);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setSettings]);

  if (!seamlessUrl) return null;

  return (
    <div className="flex flex-col h-full border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden">
      
      {/* Header bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-3 border-b border-[var(--color-border)] bg-[#0d0d0f] gap-4">
        <h3 className="text-sm font-bold brand-font tracking-widest uppercase flex items-center gap-2 shrink-0">
          <Grip size={16} className="text-[var(--color-accent)]" /> Tiled Preview
        </h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto xl:ml-auto">
          
          <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
             <input 
               type="checkbox" 
               id="blend-toggle"
               checked={settings.enableBlend}
               onChange={(e) => setSettings({ ...settings, enableBlend: e.target.checked })}
               className="w-3.5 h-3.5 rounded-sm border-[var(--color-border)] bg-[#050505] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-[#0a0a0b] cursor-pointer inline-block align-middle m-0"
             />
             <label htmlFor="blend-toggle" className="cursor-pointer select-none pl-1 text-xs uppercase tracking-widest font-bold text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]">Enable Blend</label>
          </div>

          <div className={`flex items-center gap-2 shrink-0 border-l border-[var(--color-border)] pl-4 ml-2 transition-opacity ${settings.enableBlend ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <Sliders size={14} className="hidden md:block text-[var(--color-text-dim)]" />
              <select 
                value={settings.blendMode}
                onChange={(e) => setSettings({ ...settings, blendMode: e.target.value as BlendMode })}
                className="bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-bright)] text-xs rounded-md px-2 py-1 outline-none focus:border-[var(--color-accent)] uppercase font-bold tracking-wider"
              >
                <option value="cosine">● Cosine</option>
                <option value="crossfade">■ Crossfade</option>
                <option value="diamond">◆ Diamond</option>
              </select>
              <div className="flex items-center gap-1 w-16 md:w-20">
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.5" 
                  step="0.01"
                  value={settings.blendWidth}
                  onChange={(e) => setSettings({ ...settings, blendWidth: parseFloat(e.target.value) })}
                  className="w-full"
                  title={`Blend Width: ${(settings.blendWidth * 100).toFixed(0)}%`}
                />
              </div>
            </div>

          <div className="w-full sm:w-px h-px sm:h-6 bg-[var(--color-border)]"></div>

          {/* Tile Count */}
          <div className="flex items-center gap-2 w-full sm:w-auto text-xs uppercase font-bold text-[var(--color-text-dim)] shrink-0">
            <span className="whitespace-nowrap w-24">Scale: {settings.tileCount.toFixed(1)}x</span>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="0.2"
              value={settings.tileCount}
              onChange={(e) => {
                const newCount = parseFloat(e.target.value);
                const current = settings.tileCount;
                if (newCount !== current) {
                  const scaleChange = current / newCount;
                  panRef.current.x *= scaleChange;
                  panRef.current.y *= scaleChange;
                  if (previewRef.current) {
                    previewRef.current.style.backgroundPosition = `calc(50% + ${panRef.current.x}px) calc(50% + ${panRef.current.y}px)`;
                    previewRef.current.style.backgroundSize = `${100 / newCount}%`;
                  }
                  
                  settingsRef.current = { ...settings, tileCount: newCount };
                  setSettings(settingsRef.current);
                }
              }}
              className="w-full sm:w-24"
            />
          </div>

        </div>
      </div>

      <div 
        ref={previewRef}
        className="w-full flex-1 min-h-[400px] cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          backgroundImage: `url(${seamlessUrl})`,
          backgroundRepeat: 'repeat',
          backgroundPosition: `calc(50% + ${panRef.current.x}px) calc(50% + ${panRef.current.y}px)`,
          backgroundSize: `${100 / settings.tileCount}%`,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}
