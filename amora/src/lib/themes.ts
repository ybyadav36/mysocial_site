// Card background gradients. A companion's `theme` column holds one of these keys.
export const THEMES = {
  sunset: { label: "Sunset", from: "#ff6a88", to: "#ffb86b" },
  midnight: { label: "Midnight", from: "#3a3f8f", to: "#8a5cf6" },
  ember: { label: "Ember", from: "#e8364f", to: "#f7a046" },
  ocean: { label: "Ocean", from: "#1c8fbf", to: "#5ee0d1" },
  plum: { label: "Plum", from: "#7a3e9d", to: "#e86fa6" },
  neon: { label: "Neon", from: "#ff4f8b", to: "#5b6cff" },
  wine: { label: "Wine", from: "#8e1f4f", to: "#f15f79" },
  mango: { label: "Mango", from: "#f58a1f", to: "#ffd25e" },
  mint: { label: "Mint", from: "#11998e", to: "#7be3a8" },
  rose: { label: "Rose", from: "#ff4f8b", to: "#ff9a8b" },
} as const;

export type ThemeKey = keyof typeof THEMES;

export function themeGradient(key: string, angle = 160): string {
  const theme = THEMES[key as ThemeKey] ?? THEMES.rose;
  return `linear-gradient(${angle}deg, ${theme.from}, ${theme.to})`;
}
