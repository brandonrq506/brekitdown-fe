import { THEME } from "../types/theme";

/** Kept in sync with the pre-paint script in `index.html`. */
export const THEME_STORAGE_KEY = "theme";

export const THEMES: readonly THEME[] = [THEME.LIGHT, THEME.DARK, THEME.SYSTEM];

export const DARK_QUERY = "(prefers-color-scheme: dark)";
