"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_PREFERENCES, parsePreferences, PREFERENCES_KEY, type Preferences } from "@/lib/settings/preferences";

const EVENT = "markdown-kb-prefs";
let cache: { raw: string | null; value: Preferences } = { raw: null, value: DEFAULT_PREFERENCES };

export function readPreferences(): Preferences {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PREFERENCES_KEY);
  } catch {
    return DEFAULT_PREFERENCES;
  }
  if (raw !== cache.raw) cache = { raw, value: parsePreferences(raw) };
  return cache.value;
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  const next = { ...readPreferences(), [key]: value };
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  } catch {
    /* Private mode or full storage: the choice lasts until reload. */
    cache = { raw: cache.raw, value: next };
  }
  applyMotion(next);
  window.dispatchEvent(new Event(EVENT));
}

// The root carries data-motion="reduce" when motion is turned off here; CSS and scrolling read it.
export function applyMotion(preferences: Preferences = readPreferences()) {
  if (preferences.motion === "reduce") document.documentElement.dataset.motion = "reduce";
  else delete document.documentElement.dataset.motion;
}

export function prefersReducedMotion(): boolean {
  return readPreferences().motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERENCES_KEY) {
      applyMotion();
      onChange();
    }
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, readPreferences, () => DEFAULT_PREFERENCES);
}
