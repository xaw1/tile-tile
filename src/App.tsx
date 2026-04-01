import { useState } from 'react';
import { PromptInput } from './components/PromptInput';
import { PresetGrid } from './components/PresetGrid';
import { ActionBar } from './components/FloatingActionBar';
import { TextureOutput } from './components/TextureOutput';
import { TiledPreview } from './components/TiledPreview';
import { HowItWorks } from './components/HowItWorks';
import { EmptyState } from './components/EmptyState';
import { enhancePrompt, buildImageUrl } from './lib/pollinations';
import { PRESETS, PROMPT_STYLES } from './lib/presets';
import { TextureSettings } from './types';
import { Hexagon, Lock } from 'lucide-react';

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [seamlessUrl, setSeamlessUrl] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [seedLocked, setSeedLocked] = useState<boolean>(false);

  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

  const [promptStyleId, setPromptStyleId] = useState<string>('standard');

  const [customPresets, setCustomPresets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ts_custom_presets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<TextureSettings>({
    size: 256,
    enhance: false,
    enableBlend: true,
    blendMode: 'cosine',
    blendWidth: 0.35,
    tileCount: 3,
    showGridlines: false,
  });

  const handleSelectPreset = (p: string) => {
    setActivePreset(PRESETS.includes(p) ? p : '');
    setPrompt(p);
  }

  const saveCustomPreset = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...customPresets.filter(p => p !== trimmed)];
    setCustomPresets(updated);
    localStorage.setItem('ts_custom_presets', JSON.stringify(updated));
  };

  const deleteCustomPreset = (preset: string) => {
    const updated = customPresets.filter(p => p !== preset);
    setCustomPresets(updated);
    localStorage.setItem('ts_custom_presets', JSON.stringify(updated));
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (error) {
      console.error(error);
    }
    setIsEnhancing(false);
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setSourceUrl(null);
    setSeamlessUrl(null);

    try {
      const newSeed = seedLocked && seed !== null ? seed : Math.floor(Math.random() * 999999);
      setSeed(newSeed);
      setStatusText('Forging texture (10-30s)...');

      const style = PROMPT_STYLES.find(s => s.id === promptStyleId) ?? PROMPT_STYLES[0];
      const fullPrompt = `${prompt.trim()}, ${style.suffix}`;

      const url = buildImageUrl(fullPrompt, {
        width: settings.size,
        height: settings.size,
        seed: newSeed,
        enhance: settings.enhance
      });

      setSourceUrl(url);
      
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setStatusText('');
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-[var(--color-border)] py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-accent)] font-bold brand-font text-xl tracking-tight">
            <Hexagon className="fill-[var(--color-accent-bg)]" />
            <span>TEXTURE<span className="text-[var(--color-text-bright)]">SMITH</span></span>
          </div>
          <a
            href="https://pollinations.ai/"
            target="_blank"
            rel="noopener noreferrer" 
            className="text-xs uppercase font-mono text-[var(--color-text-dim)] border border-[var(--color-border)] px-2 py-1 rounded hover:text-[var(--color-text-bright)] hover:border-[var(--color-border-hi)] transition-colors"
          >
            Powered by Pollinations.ai
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mt-12 overflow-x-hidden">
        
        {/* Top Controls Container */}
        <div className="max-w-3xl mx-auto px-4 w-full">
          <PresetGrid
            activePreset={activePreset}
            onSelect={handleSelectPreset}
            promptStyleId={promptStyleId}
            setPromptStyleId={setPromptStyleId}
            customPresets={customPresets}
            onDeleteCustomPreset={deleteCustomPreset}
          />

          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            isLoading={isLoading}
            isEnhancing={isEnhancing}
            onSavePreset={saveCustomPreset}
          />
          
          <ActionBar 
            prompt={prompt}
            onGenerate={handleGenerate}
            onEnhance={handleEnhance}
            isLoading={isLoading}
            isEnhancing={isEnhancing}
            settings={settings}
            setSettings={setSettings}
          />
        </div>

        {/* Dual Pane Output Container */}
        <div className="w-full max-w-[1400px] mx-auto px-4 mt-10">
          {sourceUrl ? (
            <div className="flex flex-col gap-3 mb-10 w-full">
              <div className="flex items-center justify-between max-w-3xl mx-auto w-full px-2 mb-2">
                <span className="text-xs text-[var(--color-text-dim)] font-mono uppercase tracking-widest">
                  {isLoading && statusText ? 'Generating...' : 'Texture Output'}
                </span>
                {seed !== null && !isLoading && (
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={seedLocked}
                      onChange={(e) => setSeedLocked(e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border transition-colors ${seedLocked ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-hi)]'}`}>
                      <Lock size={10} />
                      Seed: {seed}
                    </span>
                  </label>
                )}
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full h-auto lg:h-[500px] xl:h-[650px]">
                {/* Left Side: Single Texture Output */}
                <div className="w-full lg:w-[35%] xl:w-[30%] flex flex-col shrink-0 min-h-[400px]">
                  <TextureOutput 
                    sourceUrl={sourceUrl}
                    enableBlend={settings.enableBlend}
                    blendMode={settings.blendMode}
                    blendWidth={settings.blendWidth}
                    isLoading={isLoading}
                    statusText={statusText}
                    onSeamlessGenerated={(url) => {
                      setSeamlessUrl(url);
                      setIsLoading(false);
                    }}
                  />
                </div>
                
                {/* Right Side: Tiled Preview */}
                <div className="w-full lg:w-[65%] xl:w-[70%] flex flex-col shrink-0 min-h-[400px]">
                  {!isLoading ? (
                    <TiledPreview 
                      seamlessUrl={seamlessUrl} 
                      settings={settings} 
                      setSettings={setSettings} 
                    />
                  ) : (
                    <div className="flex-1 w-full h-full min-h-[300px] border border-[var(--color-border)] border-dashed rounded-xl flex items-center justify-center text-[var(--color-text-dim)] bg-[#050505]/50">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-[var(--color-border-hi)] border-t-[var(--color-accent)] animate-spin"></div>
                        <p className="font-mono text-sm uppercase tracking-widest text-[var(--color-accent)]">Constructing Matrix...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full mb-10">
              <EmptyState />
            </div>
          )}
        </div>
        
        {/* Footer Container */}
        <div className="max-w-3xl mx-auto px-4 w-full">
          <HowItWorks />
          
          <footer className="mt-20 pt-8 border-t border-[var(--color-border)] text-sm text-[var(--color-text-dim)] flex flex-col md:flex-row items-start md:items-baseline justify-between gap-4 pb-20">
            <div className="flex flex-col gap-2">
              <div>Free & open — no API key required</div>
              <a 
                href="https://github.com/xaw1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 opacity-50 hover:opacity-100 hover:text-[var(--color-text-bright)] transition-all w-max"
                title="xaw1 on GitHub"
              >
                <GithubIcon size={14} /> xaw1
              </a>
            </div>
            <div>Flux Schnell + Mistral Small via Pollinations.ai</div>
          </footer>
        </div>
      </main>
    </div>
  );
}
