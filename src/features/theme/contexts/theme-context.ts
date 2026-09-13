import { createContext } from "react";

import type { ThemeContextType } from "../types/theme-context-type";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
