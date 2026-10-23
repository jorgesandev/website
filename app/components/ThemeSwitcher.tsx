"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getServerThemePreference,
  getThemePreference,
  setThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "../lib/theme";

const choices: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function ThemeSwitcher() {
  const preference = useSyncExternalStore(
    subscribeToTheme,
    getThemePreference,
    getServerThemePreference,
  );
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !root.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <div
      className="theme-switcher"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          toggle.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="theme-toggle"
        ref={toggle}
        aria-label={`Choose color theme (${preference})`}
        aria-expanded={open}
        aria-controls="theme-options"
        title="Choose color theme"
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {open && (
        <fieldset id="theme-options" className="theme-options">
          <legend className="theme-legend">Color theme</legend>
          {choices.map(({ value, label }) => (
            <label className="theme-option" key={value}>
              <input
                type="radio"
                name="color-theme"
                value={value}
                checked={preference === value}
                onChange={() => setThemePreference(value)}
              />
              <span>{label}</span>
              <span className="theme-check" aria-hidden="true">
                {preference === value ? "✓" : ""}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}
