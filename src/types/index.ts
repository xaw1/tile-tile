export type BlendMode = "cosine" | "crossfade" | "diamond";

export interface PromptStyle {
  id: string;
  label: string;
  suffix: string;
}

export interface TextureSettings {
  size: number;
  enhance: boolean;
  enableBlend: boolean;
  blendMode: BlendMode;
  blendWidth: number;
  tileCount: number;
  showGridlines: boolean;
}
