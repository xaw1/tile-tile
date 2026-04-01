import { PenTool, Wand2, Hammer, Grid } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <PenTool size={24} className="text-[var(--color-accent)]" />,
      title: "Describe",
      desc: "Enter a prompt or select a material preset."
    },
    {
      num: "02",
      icon: <Wand2 size={24} className="text-[var(--color-accent)]" />,
      title: "Enhance",
      desc: "Mistral AI optimizes the prompt for textures."
    },
    {
      num: "03",
      icon: <Hammer size={24} className="text-[var(--color-accent)]" />,
      title: "Generate",
      desc: "Flux Schnell creates the raw material image."
    },
    {
      num: "04",
      icon: <Grid size={24} className="text-[var(--color-accent)]" />,
      title: "Make Seamless",
      desc: "Canvas algorithm blends edges perfectly."
    }
  ];

  return (
    <div className="mt-16 mb-8 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-8">
      <h3 className="text-xl brand-font text-[var(--color-text-bright)] mb-6 tracking-wide">HOW IT WORKS</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 rounded-lg relative overflow-hidden group hover:border-[var(--color-accent-dim)] transition-colors">
            <div className="absolute top-2 right-4 text-4xl brand-font font-bold text-[var(--color-accent-bg)] opacity-30 select-none group-hover:scale-110 transition-transform">
              {step.num}
            </div>
            <div className="mb-4 h-12 w-12 rounded bg-[var(--color-accent-bg)] flex items-center justify-center border border-[var(--color-accent-dim)]">
              {step.icon}
            </div>
            <h4 className="text-[var(--color-text-bright)] font-bold mb-2 brand-font">{step.title}</h4>
            <p className="text-sm text-[var(--color-text-dim)]">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
