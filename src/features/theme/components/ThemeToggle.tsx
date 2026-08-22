import { useTheme } from "../hooks/useTheme";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { THEME, THEME_LABELS } from "../types/theme";
import { MoonIcon, SunIcon } from "lucide-react";
import { isTheme } from "../utils/theme";

const OPTIONS: { value: THEME; label: THEME_LABELS }[] = [
  { value: THEME.LIGHT, label: THEME_LABELS.LIGHT },
  { value: THEME.DARK, label: THEME_LABELS.DARK },
  { value: THEME.SYSTEM, label: THEME_LABELS.SYSTEM },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: unknown) => {
    if (isTheme(value)) setTheme(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" aria-label="Change color theme" />}
      >
        <SunIcon className="size-[1.2rem] scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
        <MoonIcon className="absolute size-[1.2rem] scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          {OPTIONS.map(({ value, label }) => (
            <DropdownMenuRadioItem key={value} value={value} closeOnClick>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
