import { BlendMode } from '../types';

export function makeSeamless(
  canvas: HTMLCanvasElement,
  sourceImg: HTMLImageElement,
  mode: BlendMode = "cosine",
  blendWidth: number = 0.35
): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // 1. Draw original image
  ctx.drawImage(sourceImg, 0, 0, w, h);
  const original = ctx.getImageData(0, 0, w, h);

  // 2. Create offset version (shifted by half in both axes, wrapping)
  const offCanvas = document.createElement("canvas");
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext("2d", { willReadFrequently: true })!;
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
        alpha = 1 - Math.max(0, Math.min(1, Math.max(dx, dy)));
      } else if (mode === "diamond") {
        alpha = Math.max(0, 1 - (dx + dy));
      } else {
        // cosine (default) — smoothest results
        const fx = Math.max(0, Math.min(1, dx));
        const fy = Math.max(0, Math.min(1, dy));
        const cx = (1 - Math.cos(fx * Math.PI)) / 2;
        const cy = (1 - Math.cos(fy * Math.PI)) / 2;
        alpha = (1 - cx) * (1 - cy);
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
