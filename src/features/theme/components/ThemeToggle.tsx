import { useTheme } from "../hooks/useTheme";
import { THEME } from "../types/theme";

const OPTIONS: { value: THEME; label: string }[] = [
  { value: THEME.LIGHT, label: THEME.LIGHT },
  { value: THEME.SYSTEM, label: THEME.SYSTEM },
  { value: THEME.DARK, label: THEME.DARK },
];

const SELECTED = "bg-accent/10 text-accent rounded px-3 py-1 text-sm";
const UNSELECTED = "hover:text-heading rounded px-3 py-1 text-sm";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col items-center gap-2">
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
      <p className="text-xs">
        stored: <code className="rounded bg-code px-1 py-0.5 font-mono">{theme}</code> · showing:{" "}
        <code className="rounded bg-code px-1 py-0.5 font-mono">{resolvedTheme}</code>
      </p>
    </div>
  );
}
