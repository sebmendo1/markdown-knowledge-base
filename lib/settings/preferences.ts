// Machine preferences for the app, stored as one JSON value. Each value falls back to its default on its own,
// so one bad field does not reset the rest.
export const PREFERENCES_KEY = "markdown-kb:prefs";

export type Motion = "system" | "reduce";

export type Preferences = {
  followAgents: boolean;
  highlightAgentChanges: boolean;
  spellcheck: boolean;
  motion: Motion;
};

export const DEFAULT_PREFERENCES: Preferences = {
  followAgents: true,
  highlightAgentChanges: true,
  spellcheck: true,
  motion: "system",
};

export function parsePreferences(raw: string | null): Preferences {
  let stored: Record<string, unknown> = {};
  try {
    const value: unknown = raw ? JSON.parse(raw) : {};
    if (value && typeof value === "object" && !Array.isArray(value)) stored = value as Record<string, unknown>;
  } catch {
    /* Defaults below. */
  }
  const flag = (key: keyof Preferences, fallback: boolean) => (typeof stored[key] === "boolean" ? (stored[key] as boolean) : fallback);
  return {
    followAgents: flag("followAgents", DEFAULT_PREFERENCES.followAgents),
    highlightAgentChanges: flag("highlightAgentChanges", DEFAULT_PREFERENCES.highlightAgentChanges),
    spellcheck: flag("spellcheck", DEFAULT_PREFERENCES.spellcheck),
    motion: stored.motion === "reduce" ? "reduce" : "system",
  };
}
