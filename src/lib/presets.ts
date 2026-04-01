import { PromptStyle } from '../types';

export const PRESETS = [
  "Stone Wall", "Brick", "Wood Planks", "Metal",
  "Concrete", "Marble", "Grass", "Sand",
  "Fabric", "Rust", "Sci-Fi Panel", "Bark",
  "Tiles", "Leather", "Lava", "Ice",
  "Moss", "Pixel Art"
];

export const PROMPT_STYLES: PromptStyle[] = [
  {
    id: "standard",
    label: "Standard",
    suffix: "seamless tileable texture, flat surface, no shadows, top down, material",
  },
  {
    id: "game-asset",
    label: "Game Asset",
    suffix: "video game asset, tileable texture, seamless infinite blend, PBR material",
  },
];
