"use client";

import { useSyncExternalStore } from "react";

export type ThemeChoice = "system" | "light" | "dark";

const KEY = "markdown-kb:theme";
const EVENT = "markdown-kb-theme";

export function readTheme(): ThemeChoice {
  const value = window.localStorage.getItem(KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "dark";
}

export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(choice: ThemeChoice = readTheme()) {
  document.documentElement.dataset.theme = resolveTheme(choice);
}

export function setTheme(choice: ThemeChoice) {
  window.localStorage.setItem(KEY, choice);
  applyTheme(choice);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const onMedia = () => {
    if (readTheme() === "system") applyTheme("system");
    onStoreChange();
  };
  window.addEventListener(EVENT, onStoreChange);
  media.addEventListener("change", onMedia);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    media.removeEventListener("change", onMedia);
  };
}

export function useThemeChoice() {
  return useSyncExternalStore(subscribe, readTheme, () => "dark" as ThemeChoice);
}

export function useResolvedTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => "dark",
  );
}
