import userEvent from "@testing-library/user-event";
import { act } from "react";
import { vi } from "vite-plus/test";

import { ThemeToggle } from "../../components/theme-toggle";
import { DARK_QUERY, THEME_STORAGE_KEY } from "../../constants/theme";
import { type ResolvedTheme, THEME, THEME_LABELS } from "../../types/theme";
import { ThemeProvider } from "../theme-provider";
import { render, screen } from "@/test/test-utils";

type User = ReturnType<typeof userEvent.setup>;

const ThemedApp = () => (
  <ThemeProvider>
    <ThemeToggle />
  </ThemeProvider>
);

/** Base UI only opens the menu from the keyboard in jsdom, so a click on the trigger is not enough. */
const openThemeMenu = async (user: User) => {
  screen.getByRole("button", { name: "Change color theme" }).focus();
  await user.keyboard("{ArrowDown}");
};

const selectTheme = async (user: User, theme: THEME_LABELS) => {
  await openThemeMenu(user);
  await user.click(await screen.findByRole("menuitemradio", { name: theme }));
};

/** The applied theme is only observable on `<html>`: the class Tailwind reads, plus the scheme native controls read. */
const expectAppliedTheme = (theme: ResolvedTheme) => {
  const otherTheme = theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;

  expect(document.documentElement).toHaveClass(theme);
  expect(document.documentElement).not.toHaveClass(otherTheme);
  expect(document.documentElement.style.colorScheme).toBe(theme);
};

/** jsdom has no `matchMedia`, and the OS preference has to be changeable mid-test. */
function installMatchMedia(osPrefersDark: boolean) {
  let matches = osPrefersDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return matches;
    },
    media: DARK_QUERY,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
  }));

  return {
    // `act` is required: the OS notifies its listeners from outside React.
    changeOsTheme(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches, media: DARK_QUERY } as MediaQueryListEvent;

      act(() => listeners.forEach((listener) => listener(event)));
    },
  };
}

// `act` is required: another tab's write arrives as a plain window event, outside React.
const changeThemeInAnotherTab = (newValue: string | null) => {
  act(() => {
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue }));
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.classList.remove(THEME.LIGHT, THEME.DARK);
  document.documentElement.style.colorScheme = "";
});

it("follows a light OS preference when no theme is stored", () => {
  installMatchMedia(false);

  render(<ThemedApp />);

  expectAppliedTheme(THEME.LIGHT);
});

it("marks System as the selected theme when no theme is stored", async () => {
  const user = userEvent.setup();
  installMatchMedia(false);
  render(<ThemedApp />);

  await openThemeMenu(user);

  expect(
    await screen.findByRole("menuitemradio", { name: THEME_LABELS.SYSTEM, checked: true }),
  ).toBeVisible();
});

it("turns dark when the OS turns dark while on system", () => {
  const media = installMatchMedia(false);
  render(<ThemedApp />);

  media.changeOsTheme(true);

  expectAppliedTheme(THEME.DARK);
});

it("starts in the theme stored on a previous visit", () => {
  installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, THEME.DARK);

  render(<ThemedApp />);

  expectAppliedTheme(THEME.DARK);
});

it("marks the stored theme as selected when the menu opens", async () => {
  const user = userEvent.setup();
  installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, THEME.DARK);
  render(<ThemedApp />);

  await openThemeMenu(user);

  expect(
    await screen.findByRole("menuitemradio", { name: THEME_LABELS.DARK, checked: true }),
  ).toBeVisible();
});

it("applies the theme the user picks", async () => {
  const user = userEvent.setup();
  installMatchMedia(true);
  render(<ThemedApp />);

  await selectTheme(user, THEME_LABELS.LIGHT);

  expectAppliedTheme(THEME.LIGHT);
});

it("stores the chosen theme so it survives a reload", async () => {
  const user = userEvent.setup();
  installMatchMedia(true);
  render(<ThemedApp />);

  await selectTheme(user, THEME_LABELS.LIGHT);

  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(THEME.LIGHT);
});

it("keeps the chosen theme when the OS scheme changes", () => {
  const media = installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, THEME.LIGHT);
  render(<ThemedApp />);

  media.changeOsTheme(true);

  expectAppliedTheme(THEME.LIGHT);
});

it("follows the OS scheme again when the user returns to system", async () => {
  const user = userEvent.setup();
  installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, THEME.DARK);
  render(<ThemedApp />);

  await selectTheme(user, THEME_LABELS.SYSTEM);

  expectAppliedTheme(THEME.LIGHT);
});

it("clears the stored theme when the user returns to system", async () => {
  const user = userEvent.setup();
  installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, THEME.DARK);
  render(<ThemedApp />);

  await selectTheme(user, THEME_LABELS.SYSTEM);

  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
});

it("falls back to the OS scheme when the stored theme is unknown", () => {
  installMatchMedia(true);
  localStorage.setItem(THEME_STORAGE_KEY, "sepia");

  render(<ThemedApp />);

  expectAppliedTheme(THEME.DARK);
});

it("clears an unknown stored theme", () => {
  installMatchMedia(true);
  localStorage.setItem(THEME_STORAGE_KEY, "sepia");

  render(<ThemedApp />);

  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
});

it("applies the theme another tab selected", () => {
  installMatchMedia(false);
  render(<ThemedApp />);

  changeThemeInAnotherTab(THEME.DARK);

  expectAppliedTheme(THEME.DARK);
});

it("returns to the OS scheme when another tab clears the theme", () => {
  installMatchMedia(false);
  localStorage.setItem(THEME_STORAGE_KEY, THEME.DARK);
  render(<ThemedApp />);

  changeThemeInAnotherTab(null);

  expectAppliedTheme(THEME.LIGHT);
});
