export type BlendMode = "cosine" | "crossfade" | "diamond";

export interface TextureSettings {
  size: number;
  enhance: boolean;
  enableBlend: boolean;
  blendMode: BlendMode;
  blendWidth: number;
  tileCount: number;
}
