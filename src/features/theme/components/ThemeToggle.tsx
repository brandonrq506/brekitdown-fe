import { useTheme } from "../hooks/useTheme";
import { THEME } from "../types/theme";

const OPTIONS: { value: THEME; label: string }[] = [
  { value: THEME.LIGHT, label: THEME.LIGHT },
  { value: THEME.SYSTEM, label: THEME.SYSTEM },
  { value: THEME.DARK, label: THEME.DARK },
];

const SELECTED = "bg-primary/10 text-primary rounded px-3 py-1 text-sm";
const UNSELECTED = "hover:text-foreground rounded px-3 py-1 text-sm";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="group" aria-label="Color theme" className="inline-flex rounded border p-0.5">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={theme === value ? SELECTED : UNSELECTED}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
