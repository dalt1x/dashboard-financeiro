export const themeStorageKey = "dashboard-theme";
export const themeChangeEvent = "dashboard-theme-change";

export type ThemeMode = "light" | "dark";

export const defaultTheme: ThemeMode = "light";

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function getThemeBootScript() {
  return `
    (() => {
      const storageKey = "${themeStorageKey}";
      const defaultTheme = "${defaultTheme}";

      try {
        const storedTheme = window.localStorage.getItem(storageKey);
        const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : defaultTheme;
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
      } catch {
        document.documentElement.dataset.theme = defaultTheme;
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;
}

export function readThemeFromDocument(): ThemeMode {
  if (typeof document === "undefined") {
    return defaultTheme;
  }

  return isThemeMode(document.documentElement.dataset.theme)
    ? document.documentElement.dataset.theme
    : defaultTheme;
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";

  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Ignore storage failures and keep the active document theme.
  }

  window.dispatchEvent(new CustomEvent(themeChangeEvent, { detail: { theme } }));
}
