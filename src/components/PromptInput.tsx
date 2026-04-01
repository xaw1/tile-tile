import { useRef } from 'react';

interface Props {
  prompt: string;
  setPrompt: (p: string) => void;
  isLoading: boolean;
  isEnhancing: boolean;
}

export function PromptInput({ prompt, setPrompt, isLoading, isEnhancing }: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = () => {
    // If they press Enter, don't generate if prompt is blank
    // But generating is handled by FloatingActionBar mostly.
    // So we can let standard textarea enter insert whitespace.
  };

  return (
    <div className="flex flex-col gap-3 mb-6 relative">
      <div className="relative group">
        <textarea
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a material (e.g. wet cobblestone, futuristic alien metal)"
          className="w-full min-h-[100px] px-4 py-3 rounded-lg border-2 bg-[var(--color-surface)] border-[var(--color-border)] text-lg focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] text-[var(--color-text-bright)] transition-colors placeholder-[var(--color-border-hi)] resize-y"
          disabled={isLoading || isEnhancing}
        />
        <div className="absolute top-0 right-0 h-full w-2 bg-[var(--color-accent)] opacity-0 group-focus-within:opacity-100 transition-opacity rounded-r-md pointer-events-none"></div>
      </div>
    </div>
  );
}
