
export const POLLINATIONS_API_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY as string;

export const IMAGE_MODELS = [
  { id: 'flux',       label: 'Flux Schnell',     free: true  },
  { id: 'zimage',     label: 'Z-Image Turbo',    free: false },
  { id: 'klein',      label: 'FLUX.2 Klein 4B',  free: false },
  { id: 'gptimage',   label: 'GPT Image 1 Mini', free: false },
  { id: 'qwen-image', label: 'Qwen Image Plus',  free: false },
] as const;

export type ImageModelId = typeof IMAGE_MODELS[number]['id'];

// Enhance a texture prompt using Mistral Small
export async function enhancePrompt(rawPrompt: string, apiKey?: string): Promise<string> {
  const systemPrompt = `You are a texture prompt optimizer for AI image generation. Given a texture description, output ONLY an enhanced prompt (no explanation, no quotes, no markdown). The prompt should describe a seamless tileable material surface texture, top-down flat view, uniform lighting with no cast shadows, no perspective, no objects, no scene — just the raw material surface filling the entire frame. Keep it under 60 words.`;

  try {
    const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey ?? POLLINATIONS_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rawPrompt },
        ],
      }),
    });

    if (!res.ok) throw new Error("Prompt enhancement failed");
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || rawPrompt;
  } catch (error) {
    console.error("Enhancement failed, using raw prompt", error);
    return rawPrompt;
  }
}

// Build a Pollinations image URL
export function buildImageUrl(prompt: string, options: {
  width?: number;
  height?: number;
  seed?: number;
  enhance?: boolean;
  model?: string;
}): string {
  const { width = 512, height = 512, seed = Math.floor(Math.random() * 999999), enhance = false, model = 'flux' } = options;
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    seed: String(seed),
    nologo: "true",
    enhance: String(enhance),
  });
  return `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${params}`;
}
