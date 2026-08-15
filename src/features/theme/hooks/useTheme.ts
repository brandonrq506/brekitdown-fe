import { useEffect, useState } from "react";
import type { THEME } from "../types/theme";
import {
  applyTheme,
  persistTheme,
  prefersDark,
  readStoredTheme,
  resolveTheme,
  watchPrefersDark,
  watchStoredTheme,
} from "../utils/theme";

/**
 * Owns the `data-theme` attribute on `<html>` and its `localStorage` mirror.
 *
 * Call this in exactly one place — each call keeps its own state, so two
 * callers would drift apart and fight over the attribute. Lift it into a
 * context if more than one component ever needs it.
 */
export function useTheme() {
  const [theme, setTheme] = useState<THEME>(readStoredTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(prefersDark);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  // Track the OS preference so `resolvedTheme` stays correct in `system` mode.
  useEffect(() => watchPrefersDark(setSystemPrefersDark), []);

  // Follow the choice made in other tabs, so they don't drift apart.
  useEffect(() => watchStoredTheme(setTheme), []);

  return { theme, setTheme, resolvedTheme: resolveTheme(theme, systemPrefersDark) };
}
