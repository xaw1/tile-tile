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

  // Kaleidoscope mode — 8-fold symmetric: mirror 4 quadrants + diagonal reflection within each.
  // blendWidth shifts the crop origin so the slider rotates/offsets the pattern.
  if (mode === "kaleidoscope") {
    const hw = Math.floor(w / 2);
    const hh = Math.floor(h / 2);
    const ox = Math.floor(w * blendWidth) % w;
    const oy = Math.floor(h * blendWidth) % h;

    // Build the hw×hh quadrant crop with wrapping offset
    const crop = document.createElement("canvas");
    crop.width = hw;
    crop.height = hh;
    const cc = crop.getContext("2d")!;
    cc.drawImage(sourceImg, -ox, -oy, w, h);
    if (ox > 0) cc.drawImage(sourceImg, w - ox, -oy, w, h);
    if (oy > 0) cc.drawImage(sourceImg, -ox, h - oy, w, h);
    if (ox > 0 && oy > 0) cc.drawImage(sourceImg, w - ox, h - oy, w, h);

    // Build 8-fold quadrant: lower-left triangle from crop, upper-right triangle
    // from its diagonal reflection (swap x↔y).
    const quad = document.createElement("canvas");
    quad.width = hw;
    quad.height = hh;
    const qc = quad.getContext("2d")!;

    // Lower-left triangle: draw crop as-is
    qc.drawImage(crop, 0, 0);

    // Upper-right triangle (y < x): overwrite with diagonal reflection
    qc.save();
    qc.beginPath();
    qc.moveTo(0, 0);
    qc.lineTo(hw, 0);
    qc.lineTo(hw, hh);
    qc.closePath();
    qc.clip();
    qc.transform(0, 1, 1, 0, 0, 0); // swap x↔y: canvas(px,py) = crop(py,px)
    qc.drawImage(crop, 0, 0);
    qc.restore();

    // Mirror the 8-fold quadrant into all 4 positions
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(quad, 0, 0);
    ctx.save(); ctx.translate(w, 0);  ctx.scale(-1,  1); ctx.drawImage(quad, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(0, h);  ctx.scale( 1, -1); ctx.drawImage(quad, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(w, h);  ctx.scale(-1, -1); ctx.drawImage(quad, 0, 0); ctx.restore();
    return;
  }

  // Mirror mode — reflect quadrants instead of blending.
  // blendWidth is repurposed as a crop offset (0–0.5) to shift which region
  // of the source each reflected quadrant is drawn from.
  if (mode === "mirror") {
    const hw = Math.floor(w / 2);
    const hh = Math.floor(h / 2);
    const ox = Math.floor(w * blendWidth) % w;
    const oy = Math.floor(h * blendWidth) % h;

    // Build a hw×hh crop of the source at offset (ox, oy) with wrapping
    const crop = document.createElement("canvas");
    crop.width = hw;
    crop.height = hh;
    const cc = crop.getContext("2d")!;
    cc.drawImage(sourceImg, -ox, -oy, w, h);
    if (ox > 0) cc.drawImage(sourceImg, w - ox, -oy, w, h);
    if (oy > 0) cc.drawImage(sourceImg, -ox, h - oy, w, h);
    if (ox > 0 && oy > 0) cc.drawImage(sourceImg, w - ox, h - oy, w, h);

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(crop, 0, 0);                           // top-left: original
    ctx.save(); ctx.translate(w, 0); ctx.scale(-1, 1);
    ctx.drawImage(crop, 0, 0); ctx.restore();             // top-right: flip H
    ctx.save(); ctx.translate(0, h); ctx.scale(1, -1);
    ctx.drawImage(crop, 0, 0); ctx.restore();             // bottom-left: flip V
    ctx.save(); ctx.translate(w, h); ctx.scale(-1, -1);
    ctx.drawImage(crop, 0, 0); ctx.restore();             // bottom-right: flip HV
    return;
  }

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
        // L∞ distance — square blend zone, linear falloff
        alpha = 1 - Math.max(0, Math.min(1, Math.max(dx, dy)));
      } else if (mode === "diamond") {
        // L1 distance — diamond blend zone, linear falloff
        alpha = Math.max(0, 1 - (dx + dy));
      } else if (mode === "circular") {
        // L2 distance — circular blend zone, hard linear falloff (distinct from cosine)
        alpha = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      } else if (mode === "gaussian") {
        // Radial exponential falloff — tight central bloom, heavy edge blending
        const r2 = dx * dx + dy * dy;
        alpha = Math.exp(-3 * r2);
      } else {
        // cosine (default) — separable cosine smooth falloff, softest result
        const fx = Math.max(0, Math.min(1, dx));
        const fy = Math.max(0, Math.min(1, dy));
        const cx = (1 - Math.cos(fx * Math.PI)) / 2;
        const cy = (1 - Math.cos(fy * Math.PI)) / 2;
        alpha = (1 - cx) * (1 - cy);
      }

      alpha = Math.max(0, Math.min(1, alpha));

      const out_x = (x + hw) % w;
      const out_y = (y + hh) % h;
      const out_i = (out_y * w + out_x) * 4;

      for (let c = 0; c < 3; c++) {
        result.data[out_i + c] = Math.round(
          original.data[i + c] * alpha + offset.data[i + c] * (1 - alpha)
        );
      }
      result.data[out_i + 3] = 255;
    }
  }

  ctx.putImageData(result, 0, 0);
}
