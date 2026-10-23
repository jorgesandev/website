export type ThemePreference = "system" | "light" | "dark";

const storageKey = "jorgesandoval.theme.v1";
const changeEvent = "theme-preference-change";

function parsePreference(value: string | null | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function getThemePreference(): ThemePreference {
  return parsePreference(document.documentElement.dataset.theme);
}

export function getServerThemePreference(): ThemePreference {
  return "system";
}

function updateBrowserColor(preference: ThemePreference) {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", dark ? "#18221b" : "#f5f3ec");
  });
}

function applyPreference(preference: ThemePreference) {
  document.documentElement.dataset.theme = preference;
  updateBrowserColor(preference);
}

export function setThemePreference(preference: ThemePreference) {
  applyPreference(preference);
  try {
    if (preference === "system") window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, preference);
  } catch {
    // The selected theme still works for this page when storage is unavailable.
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => updateBrowserColor(getThemePreference());
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      applyPreference(parsePreference(event.newValue));
      onChange();
    }
  };
  window.addEventListener(changeEvent, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onSystemChange);
  updateBrowserColor(getThemePreference());
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onSystemChange);
  };
}

// Apply the saved preference before the page paints, without waiting for React.
export const themeInitializationScript = `(() => {
  let preference = "system";
  try {
    const saved = localStorage.getItem("${storageKey}");
    if (saved === "light" || saved === "dark") preference = saved;
  } catch {}
  document.documentElement.dataset.theme = preference;
  const dark = preference === "dark" || (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
    meta.setAttribute("content", dark ? "#18221b" : "#f5f3ec");
  });
})();`;
