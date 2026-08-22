import { use } from "react";

import { ThemeContext } from "../contexts/ThemeContext";
import type { ThemeContextType } from "../types/ThemeContextType";

/**
 * Reads the application theme state owned by {@link ThemeProvider}.
 */
export function useTheme(): ThemeContextType {
  const context = use(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
