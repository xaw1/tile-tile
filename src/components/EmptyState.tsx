import { ImagePlus } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text-dim)]">
      <ImagePlus size={64} className="mb-4 opacity-50" />
      <p className="text-lg brand-font text-center px-4">
        Pick a preset or describe a material<br />
        <span className="text-sm opacity-70">to start forging your texture</span>
      </p>
    </div>
  );
}
