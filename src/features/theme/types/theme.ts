import type { ObjectValues } from "@/types/core/helpers";

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

/** `system` means "no `data-theme` attribute" — the CSS falls back to `prefers-color-scheme`. */
export type THEME = ObjectValues<typeof THEME>;

/** What is actually on screen, with `system` collapsed to a concrete value. */
export type ResolvedTheme = Exclude<THEME, "system">;
