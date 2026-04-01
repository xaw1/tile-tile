# CLAUDE.md — Texturesmith

## Project Overview

**Texturesmith** is a free web app that generates seamless, tileable textures using AI. It targets game developers, 3D artists, and designers who need quick material textures for their projects.

The pipeline: User describes a material → AI enhances the prompt → Flux Schnell generates a texture → client-side post-processing makes it seamlessly tileable → user previews tiled and downloads.

This app is built for submission to the **Pollinations.ai app directory** and must use Pollinations APIs exclusively for all AI functionality. No other AI providers. No API keys required from the user — everything runs on Pollinations' free tier.

---

## Tech Stack

- **Framework**: React (Vite + TypeScript)
- **Styling**: Tailwind CSS v4
- **Hosting**: Static site (Vercel, Netlify, or GitHub Pages)
- **AI APIs**: Pollinations.ai (free, no auth)
- **No backend** — everything runs client-side except API calls to Pollinations

---

## Pollinations API Reference

All endpoints are free, require no API key, and have no CORS restrictions.

### Image Generation

```
GET https://image.pollinations.ai/prompt/{prompt}
```

Query parameters:
- `width` — int, image width (default 1024)
- `height` — int, image height (default 1024)
- `model` — string, use `flux` (Flux Schnell — free, unlimited)
- `seed` — int, for reproducibility
- `nologo` — `true` to remove watermark
- `enhance` — `true` to let Pollinations enhance the prompt (we handle this ourselves, so set to `false` or omit)
- `negative_prompt` — string, things to avoid in the image (optional, may not be supported by Flux Schnell)

Returns: image file directly (PNG/JPEG)

**Important**: The prompt must be URL-encoded. The response is an image, not JSON.

Example:
```
https://image.pollinations.ai/prompt/red%20brick%20wall%20texture?width=512&height=512&model=flux&seed=42&nologo=true
```

### Text Generation (OpenAI-compatible)

```
POST https://text.pollinations.ai/openai
Content-Type: application/json
```

Body:
```json
{
  "model": "mistral-small",
  "messages": [
    { "role": "system", "content": "system prompt here" },
    { "role": "user", "content": "user message here" }
  ]
}
```

Returns: OpenAI-compatible JSON response:
```json
{
  "choices": [
    {
      "message": {
        "content": "response text"
      }
    }
  ]
}
```

Available free models: `mistral-small`, `amazon-nova-micro`. Use `mistral-small` — it's better at creative prompt rewriting.

### Rate Limits

- Anonymous: 1 request per 15 seconds
- Registered (Seed tier): 1 request per 5 seconds  
- Flux image generation is specifically free and unlimited across all tiers
- The app should handle rate limits gracefully with retry logic or user-facing cooldown indicators

---

## Core Algorithm: Making Textures Seamless

Flux Schnell cannot natively produce perfectly seamless/tileable textures. The app solves this with a **client-side offset-and-blend algorithm** run on an HTML Canvas.

### How it works:

1. **Generate** the raw texture image via Pollinations
2. **Load** it into an offscreen canvas
3. **Create an offset copy**: shift the image by 50% on both X and Y axes with wrapping (the four quadrants swap positions). This moves the original edges to the center and the original center to the edges.
4. **Blend the two versions**: Near the edges of the canvas, favor the offset version (which has no seams there). Near the center, favor the original version (which has no seams there). Use a gradient/falloff function to smoothly transition between them.
5. **Result**: A texture where every edge smoothly matches its opposite edge — it tiles perfectly.

### Blend modes to implement:

- **Cosine**: `alpha = 1 - (1 - cos_x) * (1 - cos_y)` where cos_x/cos_y are cosine falloffs from center to edge. Produces the most natural-looking results. **This should be the default.**
- **Crossfade**: Linear gradient, `alpha = max(fx, fy)` where fx/fy are linear distances from center. Simpler but can show subtle diamond artifacts.
- **Diamond**: `alpha = (dx + dy) / 2` — blends in a diamond shape from center.

### Blend width parameter:

A float from 0.1 to 0.5 representing what fraction of the image width/height is used for the blend zone. Higher values = smoother blending but more deviation from the original. Default: 0.35.

### Implementation notes:

- Use `img.crossOrigin = "anonymous"` when loading from Pollinations to allow canvas pixel manipulation
- Process pixel-by-pixel using `getImageData` / `putImageData`
- The seamless processing should re-run when blend mode or blend width changes (without re-fetching the image)
- Store a reference to the loaded Image element so blend settings can be tweaked in real time

---

## Feature Requirements

### Must Have (MVP)

1. **Prompt input** — text field where user describes the material they want
2. **Material presets** — clickable buttons that populate the prompt field with common materials:
   - Stone Wall, Brick, Wood Planks, Metal, Concrete, Marble, Grass, Sand, Fabric, Rust, Sci-Fi Panel, Bark, Tiles, Leather, Lava, Ice, Moss, Pixel Art
3. **Smart Enhance toggle** — when ON (default), sends the user's prompt to Mistral Small to optimize it for texture generation before passing to Flux. The system prompt should instruct the model to output ONLY a rewritten prompt (no explanation) optimized for a flat, top-down, uniformly-lit, seamless material surface texture.
4. **Generate button** — triggers the pipeline. Disabled while loading.
5. **Size selector** — 256, 512, or 1024 pixels (square). Default 512.
6. **Raw vs Seamless toggle** — switch between viewing the raw Flux output and the post-processed seamless version
7. **Seamless processing** — the offset-blend algorithm described above
8. **Tiled preview** — shows the texture repeated in a grid (using CSS `background-repeat`) so the user can visually verify seamlessness. Adjustable tile count (2–8).
9. **Blend controls** — blend mode dropdown and blend width slider. Changes re-process in real time.
10. **Download buttons** — separate downloads for raw PNG and seamless PNG
11. **Loading states** — clear feedback during prompt enhancement and image generation (10-30 seconds typical)
12. **Error handling** — graceful handling of API failures, CORS issues, timeouts

### Nice to Have (Post-MVP)

- History/gallery of previously generated textures (stored in localStorage)
- Seed control — display and allow manual seed input for reproducibility
- "Regenerate" button that uses a new random seed with the same prompt
- Before/after comparison slider
- Normal map generation from the seamless texture (Sobel filter on canvas)
- Drag-and-drop upload of an existing texture to run only the seamless processing on it
- Export as JPEG with quality slider (smaller file sizes)
- Fullscreen tiled preview
- Copy the enhanced prompt to clipboard

---

## UI/UX Design Specification

### Aesthetic Direction

**Industrial-utilitarian dark theme** — like a material editor inside a game engine (Unity/Unreal). Monospaced type, muted colors, sharp corners, dense but organized layout. The accent color is electric lime/chartreuse to stand out against the dark background.

### Design Tokens

```
--bg:          #0a0a0b       (page background)
--surface:     #131315       (cards, panels)
--surface2:    #1a1a1e       (inputs, secondary panels)
--border:      #2a2a30       (default borders)
--border-hi:   #3a3a44       (hover/focus borders)
--accent:      #c5f026       (primary accent — lime/chartreuse)
--accent-dim:  #8aaa10       (muted accent for active states)
--accent-bg:   rgba(197, 240, 38, 0.08)  (accent backgrounds)
--text:        #c8c8c8       (body text)
--text-dim:    #666670       (secondary/label text)
--text-bright: #eeeef0       (headings, emphasis)
--danger:      #f04040       (errors)
```

### Typography

- **Headings / Brand**: `Space Grotesk` (Google Fonts) — bold, tight letter-spacing
- **Body / UI**: `JetBrains Mono` (Google Fonts) — monospaced, technical feel
- **Labels / Captions**: 10-11px, uppercase, wide letter-spacing, `--text-dim` color
- Load from Google Fonts CDN

### Layout

- Single column, max-width ~960px, centered
- Sticky header with logo and "Powered by Pollinations.ai" badge
- Sections stack vertically: Presets → Prompt Input → Settings Bar → Output → Tiled Preview → How It Works → Footer
- Mobile responsive — presets wrap, settings stack vertically on narrow screens

### Component Patterns

- **Preset buttons**: Small pills, `--surface2` background, `--border` border. Active state: `--accent-dim` border, `--accent` text, `--accent-bg` background.
- **Generate button**: `--accent` background, dark text, uppercase, bold. Hover: slight lift (translateY). Disabled: 40% opacity.
- **Toggle switches**: 36×20px track, 16px knob. Off: `--border` track. On: `--accent-dim` track with knob translated right.
- **Size selector**: Button group (first/last have rounded ends). Active state matches preset active state.
- **Tab buttons** (Raw/Seamless): Same button group pattern as size selector.
- **Sliders**: Custom styled — 4px `--border` track, 14px `--accent` circular thumb.
- **Download buttons**: `--surface2` background, `--border` border, hover turns accent-colored.

### Loading State

When generating, show an animated grid background (CSS `background-image` with repeating linear gradients, animated with `background-position`). Overlay text pulses: "Enhancing prompt with AI..." then "Forging texture...". Subtext: "This can take 10-30 seconds".

### Empty State

Dashed border container with large muted icon, instructional text: "Pick a preset or describe a material".

### How It Works Section

4-step horizontal grid at the bottom: Describe → Enhance → Generate → Make Seamless. Each step has a step number (01-04 in accent-dim), icon, title, and one-line description.

### Footer

Two-column: "Free & open — no API key required" on the left, "Flux Schnell + Mistral Small via Pollinations.ai" on the right.

---

## Project Structure

```
texturesmith/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── public/
│   └── favicon.svg          (⚒ icon or custom)
├── src/
│   ├── main.tsx
│   ├── App.tsx               (root layout + header/footer)
│   ├── index.css             (tailwind directives + custom CSS vars + custom component styles)
│   ├── components/
│   │   ├── PromptInput.tsx       (text input + generate button)
│   │   ├── PresetGrid.tsx        (material preset buttons)
│   │   ├── SettingsBar.tsx       (size, enhance toggle, blend mode, blend width)
│   │   ├── TextureOutput.tsx     (raw/seamless toggle + image display + download buttons)
│   │   ├── TiledPreview.tsx      (CSS background-repeat preview with tile count slider)
│   │   ├── HowItWorks.tsx        (4-step explanation)
│   │   └── EmptyState.tsx        (placeholder when no texture generated)
│   ├── lib/
│   │   ├── pollinations.ts       (API wrapper functions)
│   │   ├── seamless.ts           (canvas-based seamless algorithm)
│   │   └── presets.ts            (preset data)
│   └── types/
│       └── index.ts              (shared TypeScript types)
```

---

## API Wrapper (`src/lib/pollinations.ts`)

```typescript
// Enhance a texture prompt using Mistral Small
export async function enhancePrompt(rawPrompt: string): Promise<string> {
  const systemPrompt = `You are a texture prompt optimizer for AI image generation. Given a texture description, output ONLY an enhanced prompt (no explanation, no quotes, no markdown). The prompt should describe a seamless tileable material surface texture, top-down flat view, uniform lighting with no cast shadows, no perspective, no objects, no scene — just the raw material surface filling the entire frame. Keep it under 60 words.`;

  const res = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral-small",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rawPrompt },
      ],
    }),
  });

  if (!res.ok) throw new Error("Prompt enhancement failed");
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || rawPrompt;
}

// Build a Pollinations image URL
export function buildImageUrl(prompt: string, options: {
  width?: number;
  height?: number;
  seed?: number;
}): string {
  const { width = 512, height = 512, seed = Math.floor(Math.random() * 999999) } = options;
  const textureSuffix = "seamless tileable texture, flat surface, uniform lighting, top down, material";
  const fullPrompt = `${prompt}, ${textureSuffix}`;
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model: "flux",
    seed: String(seed),
    nologo: "true",
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?${params}`;
}
```

---

## Seamless Algorithm (`src/lib/seamless.ts`)

```typescript
type BlendMode = "cosine" | "crossfade" | "diamond";

export function makeSeamless(
  canvas: HTMLCanvasElement,
  sourceImg: HTMLImageElement,
  mode: BlendMode = "cosine",
  blendWidth: number = 0.35
): void {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;

  // 1. Draw original image
  ctx.drawImage(sourceImg, 0, 0, w, h);
  const original = ctx.getImageData(0, 0, w, h);

  // 2. Create offset version (shifted by half in both axes, wrapping)
  const offCanvas = document.createElement("canvas");
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext("2d")!;
  const hw = Math.floor(w / 2);
  const hh = Math.floor(h / 2);
  // Swap the four quadrants
  offCtx.drawImage(sourceImg, hw, hh, w - hw, h - hh, 0, 0, w - hw, h - hh);       // bottom-right → top-left
  offCtx.drawImage(sourceImg, 0, hh, hw, h - hh, w - hw, 0, hw, h - hh);            // bottom-left → top-right
  offCtx.drawImage(sourceImg, hw, 0, w - hw, hh, 0, h - hh, w - hw, hh);            // top-right → bottom-left
  offCtx.drawImage(sourceImg, 0, 0, hw, hh, w - hw, h - hh, hw, hh);                // top-left → bottom-right
  const offset = offCtx.getImageData(0, 0, w, h);

  // 3. Blend pixel-by-pixel
  const result = ctx.createImageData(w, h);
  const bw = Math.floor(w * blendWidth);
  const bh = Math.floor(h * blendWidth);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const dx = Math.abs(x - hw) / (bw || 1);
      const dy = Math.abs(y - hh) / (bh || 1);

      let alpha: number; // 0 = use offset, 1 = use original

      if (mode === "crossfade") {
        alpha = Math.max(0, Math.min(1, Math.max(dx, dy)));
      } else if (mode === "diamond") {
        alpha = Math.max(0, Math.min(1, (dx + dy) / 2));
      } else {
        // cosine (default) — smoothest results
        const fx = Math.max(0, Math.min(1, dx));
        const fy = Math.max(0, Math.min(1, dy));
        const cx = (1 - Math.cos(fx * Math.PI)) / 2;
        const cy = (1 - Math.cos(fy * Math.PI)) / 2;
        alpha = 1 - (1 - cx) * (1 - cy);
      }

      alpha = Math.max(0, Math.min(1, alpha));
      for (let c = 0; c < 3; c++) {
        result.data[i + c] = Math.round(
          original.data[i + c] * alpha + offset.data[i + c] * (1 - alpha)
        );
      }
      result.data[i + 3] = 255;
    }
  }

  ctx.putImageData(result, 0, 0);
}
```

---

## Key Implementation Notes

1. **CORS**: Set `img.crossOrigin = "anonymous"` before setting `img.src` on images loaded from Pollinations. Without this, canvas `getImageData` will throw a security error.

2. **Image loading**: Pollinations image URLs take 10-30 seconds to return. Use the `onload` / `onerror` events on an `Image` element. Show loading state during this time.

3. **Re-processing**: When the user changes blend mode or blend width, re-run `makeSeamless` on the already-loaded image (don't re-fetch). Store the `HTMLImageElement` reference in a React ref.

4. **Downloads**: Convert canvas to data URL with `canvas.toDataURL("image/png")`. For raw image download, use the Pollinations URL directly. Create a temporary `<a>` element with `download` attribute.

5. **Prompt enhancement fallback**: If the Mistral Small call fails (rate limit, network error), fall back silently to the user's original prompt. Don't block generation.

6. **Texture keywords**: Always append `"seamless tileable texture, flat surface, uniform lighting, top down, material"` to the final prompt sent to Flux, regardless of whether enhancement is on. This significantly improves output quality.

7. **Seed management**: Generate a random seed per generation. Display it in the UI so users can note it down for reproducibility. Allow manual seed input as a nice-to-have.

8. **Mobile**: The app should be usable on mobile. Presets should wrap. Settings bar should stack. Tiled preview should be touch-scrollable.

---

## Deployment Notes

- Deploy as a static site (no server needed)
- Add `<meta>` tags for SEO and social sharing (Open Graph)
- Title: "Texturesmith — AI Seamless Texture Generator"
- Description: "Generate seamless, tileable textures with AI. Free, no sign-up. Powered by Pollinations.ai."
- Consider adding a `manifest.json` for PWA installability (optional)

---

## Pollinations App Directory Submission

When submitting to the Pollinations app directory, include:
- **App name**: Texturesmith
- **Description**: AI-powered seamless texture generator for game developers and designers. Describe any material — Flux Schnell generates it, smart post-processing makes it tile perfectly. Free, no API key needed.
- **Category**: Tools / Design
- **URL**: The deployed site URL
- **APIs used**: Image Generation (Flux Schnell), Text Generation (Mistral Small)
- **Screenshot**: A screenshot showing a generated texture with the tiled preview visible
