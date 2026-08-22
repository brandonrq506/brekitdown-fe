import { DARK_QUERY, THEME_STORAGE_KEY, THEMES } from "../constants/theme";
import { type ResolvedTheme, THEME } from "../types/theme";

/**
 * Narrows an unknown value to a {@link THEME}.
 *
 * @param value - Candidate value, typically straight out of `localStorage` or a `StorageEvent`.
 * @returns `true` when the value is one of the three known themes.
 */
export const isTheme = (value: unknown): value is THEME => THEMES.includes(value as THEME);

/**
 * Reads the persisted choice.
 *
 * @returns The stored theme, or `THEME.SYSTEM` when the key is absent, holds an
 * unknown value, or storage cannot be read at all.
 */
export const readStoredTheme = (): THEME => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : THEME.SYSTEM;
  } catch {
    return THEME.SYSTEM;
  }
};

/**
 * Mirrors the choice into `localStorage`.
 *
 * `THEME.SYSTEM` removes the key rather than storing it, so an absent key and an
 * explicit `system` are the same state — which is what lets the pre-paint script
 * in `index.html` treat "nothing stored" as "follow the OS".
 *
 * Failures are swallowed: storage can be unavailable in private mode while
 * in-session theming still works.
 *
 * @param theme - The theme to persist.
 */
export const persistTheme = (theme: THEME) => {
  try {
    if (theme === THEME.SYSTEM) {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {
    // Intentionally empty — see the note on storage failures above.
  }
};

/**
 * Replaces the concrete theme class on `<html>` and keeps native controls in sync.
 *
 * @param theme - The resolved light or dark theme to apply.
 */
export const applyTheme = (theme: ResolvedTheme) => {
  const root = document.documentElement;

  root.classList.remove(THEME.LIGHT, THEME.DARK);
  root.classList.add(theme);
  root.style.colorScheme = theme;
};

/**
 * Reads the OS color preference at this instant.
 *
 * @returns `true` when the OS is currently set to dark.
 */
export const prefersDark = () => window.matchMedia(DARK_QUERY).matches;

/**
 * Subscribes to OS color-preference changes.
 *
 * @param onChange - Called with the new match state each time the OS preference flips.
 * @returns The unsubscribe, suitable for returning straight from a `useEffect`.
 */
export const watchPrefersDark = (onChange: (matches: boolean) => void) => {
  const query = window.matchMedia(DARK_QUERY);
  const handler = (event: MediaQueryListEvent) => onChange(event.matches);

  query.addEventListener("change", handler);
  return () => query.removeEventListener("change", handler);
};

/**
 * Subscribes to theme changes made in other tabs.
 *
 * The `storage` event only fires in *other* documents, never in the tab that
 * wrote the value, so this cannot echo its own writes. A missing or unknown
 * value means the key was removed, which is how `THEME.SYSTEM` is stored.
 *
 * @param onChange - Called with the theme another tab just selected.
 * @returns The unsubscribe, suitable for returning straight from a `useEffect`.
 */
export const watchStoredTheme = (onChange: (theme: THEME) => void) => {
  const handler = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;

    onChange(isTheme(event.newValue) ? event.newValue : THEME.SYSTEM);
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

/**
 * Collapses `THEME.SYSTEM` down to whatever is actually on screen.
 *
 * @param theme - The stored choice.
 * @param systemPrefersDark - Current OS preference, from {@link prefersDark} or {@link watchPrefersDark}.
 * @returns The concrete theme being rendered right now.
 */
export const resolveTheme = (theme: THEME, systemPrefersDark: boolean): ResolvedTheme =>
  theme === THEME.SYSTEM ? (systemPrefersDark ? THEME.DARK : THEME.LIGHT) : theme;
