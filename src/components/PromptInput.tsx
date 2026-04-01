import { useRef } from 'react';
import { Bookmark } from 'lucide-react';

interface Props {
  prompt: string;
  setPrompt: (p: string) => void;
  isLoading: boolean;
  isEnhancing: boolean;
  onSavePreset: () => void;
}

export function PromptInput({ prompt, setPrompt, isLoading, isEnhancing, onSavePreset }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col gap-2 mb-6 relative">
      <div className="relative group">
        <textarea
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a material (e.g. wet cobblestone, futuristic alien metal)"
          className="w-full min-h-[100px] px-4 py-3 rounded-lg border-2 bg-[var(--color-surface)] border-[var(--color-border)] text-lg focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-[var(--color-text-bright)] transition-colors placeholder-[var(--color-border-hi)] resize-y"
          disabled={isLoading || isEnhancing}
        />
        <div className="absolute top-0 right-0 h-full w-2 bg-[var(--color-accent)] opacity-0 group-focus-within:opacity-100 transition-opacity rounded-r-md pointer-events-none"></div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSavePreset}
          disabled={!prompt.trim() || isLoading || isEnhancing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)]"
        >
          <Bookmark size={12} />
          Save as preset
        </button>
      </div>
    </div>
  );
}
