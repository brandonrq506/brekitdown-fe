import userEvent from "@testing-library/user-event";
import { act } from "react";

import { ThemeToggle } from "../components/ThemeToggle";
import { DARK_QUERY, THEME_STORAGE_KEY } from "../constants/theme";
import { ThemeProvider } from "./ThemeProvider";
import { render, screen, waitFor } from "@/test/test-utils";

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: DARK_QUERY,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
  } as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQueryList),
  );

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches, media: DARK_QUERY } as MediaQueryListEvent;

      listeners.forEach((listener) => listener(event));
    },
  };
}

beforeEach(() => {
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.style.colorScheme = "";
});

afterEach(() => {
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.style.colorScheme = "";
});

it("treats a missing storage key as system and follows live OS changes", async () => {
  const media = installMatchMedia(false);

  renderTheme();

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(screen.getByRole("button", { name: "system" })).toHaveAttribute("aria-pressed", "true");
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

  act(() => media.setMatches(true));

  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(document.documentElement).not.toHaveClass("light");
  expect(document.documentElement.style.colorScheme).toBe("dark");
});

it("persists explicit choices and removes the key when returning to system", async () => {
  const user = userEvent.setup();
  const media = installMatchMedia(true);
  localStorage.setItem(THEME_STORAGE_KEY, "dark");

  renderTheme();

  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(screen.getByRole("button", { name: "dark" })).toHaveAttribute("aria-pressed", "true");

  await user.click(screen.getByRole("button", { name: "light" }));

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

  act(() => media.setMatches(false));
  act(() => media.setMatches(true));
  expect(document.documentElement).toHaveClass("light");

  await user.click(screen.getByRole("button", { name: "system" }));

  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  expect(screen.getByRole("button", { name: "system" })).toHaveAttribute("aria-pressed", "true");
});

it("falls back from invalid storage and follows theme changes from another tab", async () => {
  installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, "sepia");

  renderTheme();

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "dark" }));
  });

  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(screen.getByRole("button", { name: "dark" })).toHaveAttribute("aria-pressed", "true");

  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: null }));
  });

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(screen.getByRole("button", { name: "system" })).toHaveAttribute("aria-pressed", "true");
});
