import { TextureSettings, BlendMode } from '../types';
import { Grip, Sliders } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface Props {
  seamlessUrl: string | null;
  settings: TextureSettings;
  setSettings: (s: TextureSettings) => void;
}

interface GridStyle {
  color: string;
  width: number;
  opacity: number;
}

interface MenuState {
  open: boolean;
  x: number;
  y: number;
}

const GRID_COLOR_PRESETS = ['#c5f026', '#ffffff', '#ff4444', '#22d3ee', '#f97316'];

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function TiledPreview({ seamlessUrl, settings, setSettings }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  const panRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const [gridStyle, setGridStyle] = useState<GridStyle>({ color: '#c5f026', width: 2, opacity: 0.6 });
  const [menu, setMenu] = useState<MenuState>({ open: false, x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(0);

  const bgPos = () => `calc(50% + ${panRef.current.x}px) calc(50% + ${panRef.current.y}px)`;

  // Close context menu on outside click or Escape
  useEffect(() => {
    if (!menu.open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(m => ({ ...m, open: false }));
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(m => ({ ...m, open: false }));
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu.open]);

  // Pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    panRef.current.x += e.movementX;
    panRef.current.y += e.movementY;
    const pos = bgPos();
    if (previewRef.current) previewRef.current.style.backgroundPosition = pos;
    if (overlayRef.current) overlayRef.current.style.backgroundPosition = pos;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Track container width so grid overlay can use pixel-based square tile size
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Wheel zoom
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const current = settingsRef.current.tileCount;
      const zoomFactor = Math.exp(e.deltaY * 0.0015);
      let newCount = Math.max(0.5, Math.min(5, Number((current * zoomFactor).toFixed(2))));

      if (newCount !== current) {
        const scaleChange = current / newCount;
        panRef.current.x *= scaleChange;
        panRef.current.y *= scaleChange;
        const pos = bgPos();
        const size = `${100 / newCount}%`;
        const px = `${el.clientWidth / newCount}px`;
        el.style.backgroundPosition = pos;
        el.style.backgroundSize = size;
        if (overlayRef.current) {
          overlayRef.current.style.backgroundPosition = pos;
          overlayRef.current.style.backgroundSize = `${px} ${px}`;
        }
        settingsRef.current = { ...settingsRef.current, tileCount: newCount };
        setSettings(settingsRef.current);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setSettings]);

  if (!seamlessUrl) return null;

  const tileSize = `${100 / settings.tileCount}%`;
  const tilePx = containerWidth > 0 ? `${containerWidth / settings.tileCount}px` : tileSize;
  const pos = bgPos();
  const lineColor = hexToRgba(gridStyle.color, gridStyle.opacity);
  const gridImage = [
    `linear-gradient(to right, ${lineColor} ${gridStyle.width}px, transparent ${gridStyle.width}px)`,
    `linear-gradient(to bottom, ${lineColor} ${gridStyle.width}px, transparent ${gridStyle.width}px)`,
  ].join(', ');

  // Keep context menu inside viewport
  const menuW = 200;
  const menuX = menu.x + menuW > window.innerWidth ? menu.x - menuW : menu.x;

  return (
    <div className="flex flex-col h-full border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden">

      {/* Header bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-3 border-b border-[var(--color-border)] bg-[#0d0d0f] gap-4">
        <h3 className="text-sm font-bold brand-font tracking-widest uppercase flex items-center gap-2 shrink-0">
          <Grip size={16} className="text-[var(--color-accent)]" /> Tiled Preview
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto xl:ml-auto">

          <div className="flex items-center gap-4 shrink-0 mt-2 sm:mt-0">
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="blend-toggle"
                checked={settings.enableBlend}
                onChange={(e) => setSettings({ ...settings, enableBlend: e.target.checked })}
                className="w-3.5 h-3.5 rounded-sm border-[var(--color-border)] bg-[#050505] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-[#0a0a0b] cursor-pointer"
              />
              <label htmlFor="blend-toggle" className="cursor-pointer select-none text-xs uppercase tracking-widest font-bold text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]">Blend</label>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="grid-toggle"
                checked={settings.showGridlines}
                onChange={(e) => setSettings({ ...settings, showGridlines: e.target.checked })}
                className="w-3.5 h-3.5 rounded-sm border-[var(--color-border)] bg-[#050505] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-[#0a0a0b] cursor-pointer"
              />
              <label
                htmlFor="grid-toggle"
                className="cursor-pointer select-none text-xs uppercase tracking-widest font-bold text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ open: true, x: e.clientX, y: e.clientY });
                }}
                title="Right-click to customise"
              >
                Gridlines
              </label>
            </div>
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
              <option value="circular">◉ Circular</option>
              <option value="gaussian">✦ Gaussian</option>
              <option value="mirror">⬡ Mirror</option>
            </select>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)] hidden md:block w-8 text-right shrink-0">
                {settings.blendMode === 'mirror' ? 'Off' : 'Width'}
              </span>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.01"
                value={settings.blendWidth}
                onChange={(e) => setSettings({ ...settings, blendWidth: parseFloat(e.target.value) })}
                className="w-16 md:w-20"
                title={settings.blendMode === 'mirror'
                  ? `Mirror Offset: ${(settings.blendWidth * 100).toFixed(0)}%`
                  : `Blend Width: ${(settings.blendWidth * 100).toFixed(0)}%`}
              />
            </div>
          </div>

          <div className="w-full sm:w-px h-px sm:h-6 bg-[var(--color-border)]"></div>

          <div className="flex items-center gap-2 w-full sm:w-auto text-xs uppercase font-bold text-[var(--color-text-dim)] shrink-0">
            <span className="whitespace-nowrap w-24">Scale: {settings.tileCount.toFixed(1)}x</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={settings.tileCount}
              onChange={(e) => {
                const newCount = parseFloat(e.target.value);
                const current = settings.tileCount;
                if (newCount !== current) {
                  const scaleChange = current / newCount;
                  panRef.current.x *= scaleChange;
                  panRef.current.y *= scaleChange;
                  const pos = bgPos();
                  const size = `${100 / newCount}%`;
                  const px = previewRef.current ? `${previewRef.current.clientWidth / newCount}px` : size;
                  if (previewRef.current) {
                    previewRef.current.style.backgroundPosition = pos;
                    previewRef.current.style.backgroundSize = size;
                  }
                  if (overlayRef.current) {
                    overlayRef.current.style.backgroundPosition = pos;
                    overlayRef.current.style.backgroundSize = `${px} ${px}`;
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

      {/* Preview area */}
      <div className="relative w-full flex-1 min-h-[400px]">
        <div
          ref={previewRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            backgroundImage: `url(${seamlessUrl})`,
            backgroundRepeat: 'repeat',
            backgroundPosition: pos,
            backgroundSize: tileSize,
            imageRendering: 'pixelated',
          }}
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-150"
          style={{
            opacity: settings.showGridlines ? 1 : 0,
            backgroundImage: gridImage,
            backgroundRepeat: 'repeat',
            backgroundPosition: pos,
            backgroundSize: `${tilePx} ${tilePx}`,
          }}
        />
      </div>

      {/* Gridline style context menu */}
      {menu.open && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-border-hi)] rounded-lg shadow-2xl p-3 flex flex-col gap-3"
          style={{ top: menu.y, left: menuX, width: menuW }}
        >
          <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-dim)]">Gridline Style</div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">Color</span>
            <div className="flex items-center gap-1.5">
              {GRID_COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  onClick={() => setGridStyle(g => ({ ...g, color: c }))}
                  className="w-5 h-5 rounded-sm border-2 transition-all shrink-0"
                  style={{
                    backgroundColor: c,
                    borderColor: gridStyle.color === c ? '#fff' : 'transparent',
                  }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={gridStyle.color}
                onChange={(e) => setGridStyle(g => ({ ...g, color: e.target.value }))}
                className="w-5 h-5 rounded-sm cursor-pointer border-0 bg-transparent p-0"
                title="Custom colour"
              />
            </div>
          </div>

          {/* Width */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">Width</span>
              <span className="text-[10px] font-mono text-[var(--color-text-dim)]">{gridStyle.width}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={gridStyle.width}
              onChange={(e) => setGridStyle(g => ({ ...g, width: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Opacity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-dim)]">Opacity</span>
              <span className="text-[10px] font-mono text-[var(--color-text-dim)]">{Math.round(gridStyle.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={gridStyle.opacity}
              onChange={(e) => setGridStyle(g => ({ ...g, opacity: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
