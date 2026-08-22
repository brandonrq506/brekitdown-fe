import { createContext } from "react";

import type { ThemeContextType } from "../types/ThemeContextType";

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
