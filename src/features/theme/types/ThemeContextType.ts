import type { THEME } from "./theme";

export interface ThemeContextType {
  theme: THEME;
  setTheme: (theme: THEME) => void;
}
