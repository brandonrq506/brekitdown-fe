import type { ObjectValues } from "@/types/core/helpers";

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

/** `system` follows `prefers-color-scheme`; the provider applies the resolved root class. */
export type THEME = ObjectValues<typeof THEME>;

/** What is actually on screen, with `system` collapsed to a concrete value. */
export type ResolvedTheme = Exclude<THEME, "system">;
