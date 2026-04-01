import { useRef, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { BlendMode } from '../types';
import { makeSeamless } from '../lib/seamless';
import { POLLINATIONS_API_KEY } from '../lib/pollinations';

interface Props {
  sourceUrl: string | null;
  enableBlend: boolean;
  blendMode: BlendMode;
  blendWidth: number;
  isLoading: boolean;
  statusText: string;
  onSeamlessGenerated: (url: string) => void;
}

export function TextureOutput({ sourceUrl, enableBlend, blendMode, blendWidth, isLoading, statusText, onSeamlessGenerated }: Props) {
  const [viewMode, setViewMode] = useState<'raw' | 'seamless'>('raw');
  const [seamlessDataUrl, setSeamlessDataUrl] = useState<string | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load image and render seamless whenever sourceUrl changes
  useEffect(() => {
    if (!sourceUrl || !canvasRef.current) return;

    let objectUrl: string | null = null;
    let isCancelled = false;

    const fetchImage = async () => {
      try {
        const res = await fetch(sourceUrl, {
          headers: {
            "Authorization": `Bearer ${POLLINATIONS_API_KEY}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch image");
        const blob = await res.blob();
        if (isCancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setRawImageUrl(objectUrl);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (isCancelled) return;
          imgRef.current = img;
          renderSeamless();
        };
        img.src = objectUrl;
      } catch (err) {
        console.error("Failed to load image with auth", err);
        if (!isCancelled) {
          onSeamlessGenerated("");
        }
      }
    };

    fetchImage();

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sourceUrl]);

  // Re-render when blend settings change
  useEffect(() => {
    if (imgRef.current) {
      renderSeamless();
    }
  }, [enableBlend, blendMode, blendWidth]);

  const renderSeamless = () => {
    if (!imgRef.current || !canvasRef.current) return;

    if (!enableBlend) {
      setSeamlessDataUrl(null);
      if (rawImageUrl) onSeamlessGenerated(rawImageUrl);
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = imgRef.current.width;
    canvas.height = imgRef.current.height;

    makeSeamless(canvas, imgRef.current, blendMode, blendWidth);

    const dataUrl = canvas.toDataURL("image/png");
    setSeamlessDataUrl(dataUrl);
    onSeamlessGenerated(dataUrl);
  };

  const handleDownload = () => {
    const urlText = viewMode === 'raw' ? rawImageUrl : seamlessDataUrl;
    if (!urlText) return;

    const a = document.createElement("a");
    a.href = urlText;
    a.download = `tiletile-${viewMode}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden">

      {/* Header bar */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)] bg-[#0d0d0f]">
        <div className="flex bg-[var(--color-surface-2)] p-1 rounded border border-[var(--color-border)]">
          {(['raw', 'seamless'] as const).map(mode => (
            <button
              key={mode}
              disabled={isLoading || !sourceUrl}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1 text-sm brand-font font-bold uppercase rounded-sm transition-colors ${viewMode === mode
                  ? 'bg-[var(--color-border-hi)] text-white'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={handleDownload}
          disabled={!sourceUrl || isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded hover:border-[var(--color-accent-dim)] hover:text-[var(--color-accent)] transition-colors text-[var(--color-text)]"
        >
          <Download size={16} /> Download {viewMode}
        </button>
      </div>

      {/* Image container */}
      <div className="relative w-full aspect-square bg-[#050505] flex items-center justify-center overflow-hidden">

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-grid-anim z-20 flex flex-col items-center justify-center text-center p-8 bg-black/60 backdrop-blur-sm">
            <div className="w-12 h-12 rounded border-2 border-[var(--color-accent)] border-t-transparent animate-spin mb-6"></div>
            <h3 className="brand-font text-xl text-[var(--color-accent)] mb-2 uppercase tracking-widest">{statusText}</h3>
            <p className="text-[var(--color-text-dim)] text-sm font-mono max-w-sm">
              Processing request via Pollinations.ai infrastructure. This usually takes 10-30 seconds.
            </p>
          </div>
        )}

        {/* The generated images */}
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain hidden"
        />

        {rawImageUrl && !isLoading && (
          <img
            src={viewMode === 'raw' ? rawImageUrl : (seamlessDataUrl || rawImageUrl)}
            alt="Generated texture"
            className="w-full h-full object-contain select-none z-10 block pointer-events-none fade-in"
          />
        )}
      </div>

    </div>
  );
}
