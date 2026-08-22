import { useEffect, useState, type PropsWithChildren } from "react";

import { ThemeContext } from "../contexts/ThemeContext";
import {
  applyTheme,
  persistTheme,
  prefersDark,
  readStoredTheme,
  resolveTheme,
  watchPrefersDark,
  watchStoredTheme,
} from "../utils/theme";

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState(readStoredTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(prefersDark);
  const resolvedTheme = resolveTheme(theme, systemPrefersDark);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  useEffect(() => watchPrefersDark(setSystemPrefersDark), []);
  useEffect(() => watchStoredTheme(setTheme), []);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}
