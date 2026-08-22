import userEvent from "@testing-library/user-event";
import { act } from "react";

import { ThemeToggle } from "../components/ThemeToggle";
import { DARK_QUERY, THEME_STORAGE_KEY } from "../constants/theme";
import { ThemeProvider } from "./ThemeProvider";
import { render, screen, waitFor } from "@/test/test-utils";
import { THEME_LABELS } from "../types/theme";

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

async function openThemeMenu(user: ReturnType<typeof userEvent.setup>) {
  screen.getByRole("button", { name: "Change color theme" }).focus();
  await user.keyboard("{ArrowDown}");
}

async function expectSelectedTheme(user: ReturnType<typeof userEvent.setup>, theme: THEME_LABELS) {
  await openThemeMenu(user);
  expect(await screen.findByRole("menuitemradio", { name: theme })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await user.keyboard("{Escape}");
}

async function selectTheme(user: ReturnType<typeof userEvent.setup>, theme: THEME_LABELS) {
  await openThemeMenu(user);
  await user.click(await screen.findByRole("menuitemradio", { name: theme }));
  await waitFor(() => {
    expect(screen.queryByRole("menuitemradio", { name: theme })).not.toBeInTheDocument();
  });
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
  const user = userEvent.setup();
  const media = installMatchMedia(false);

  renderTheme();

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  await expectSelectedTheme(user, THEME_LABELS.SYSTEM);
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
  await expectSelectedTheme(user, THEME_LABELS.DARK);

  await selectTheme(user, THEME_LABELS.LIGHT);

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

  act(() => media.setMatches(false));
  act(() => media.setMatches(true));
  expect(document.documentElement).toHaveClass("light");

  await selectTheme(user, THEME_LABELS.SYSTEM);

  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  await expectSelectedTheme(user, THEME_LABELS.SYSTEM);
});

it("falls back from invalid storage and follows theme changes from another tab", async () => {
  const user = userEvent.setup();
  installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, "sepia");

  renderTheme();

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "dark" }));
  });

  await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
  await expectSelectedTheme(user, THEME_LABELS.DARK);

  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: null }));
  });

  await waitFor(() => expect(document.documentElement).toHaveClass("light"));
  await expectSelectedTheme(user, THEME_LABELS.SYSTEM);
});
