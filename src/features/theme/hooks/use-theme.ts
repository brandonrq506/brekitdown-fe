import { use } from "react";

import { ThemeContext } from "../contexts/theme-context";
import type { ThemeContextType } from "../types/theme-context-type";

/**
 * Reads the application theme state owned by {@link ThemeProvider}.
 */
export function useTheme(): ThemeContextType {
  const context = use(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
