import fs from "node:fs";
import path from "node:path";
import type { ActivityEvent } from "./activity-types";

export { EDIT_OPS, agentName, type ActivityEvent, type ActivityOp } from "./activity-types";

// Agents (the MCP server) and the app run as separate processes, so agent activity is shared through a
// small append-only log in the knowledge-base folder. Listings skip dot files, so it is never a page.
export const ACTIVITY_FILE = ".activity.jsonl";
const KEEP = 400;
const TRIM_AT = 800;

let sequence = 0;

export function recordActivity(root: string, event: Omit<ActivityEvent, "id" | "at">, now = Date.now()): ActivityEvent {
  const entry: ActivityEvent = { id: `${now}-${process.pid}-${(sequence += 1)}`, at: now, ...event };
  const file = path.join(root, ACTIVITY_FILE);
  fs.mkdirSync(root, { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, "utf8");
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  if (lines.length > TRIM_AT) fs.writeFileSync(file, `${lines.slice(-KEEP).join("\n")}\n`, "utf8");
  return entry;
}

export function readActivity(root: string): ActivityEvent[] {
  const file = path.join(root, ACTIVITY_FILE);
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .flatMap((line) => {
      if (!line.trim()) return [];
      try {
        const event = JSON.parse(line) as ActivityEvent;
        return typeof event.id === "string" && typeof event.at === "number" && typeof event.op === "string" ? [event] : [];
      } catch {
        return [];
      }
    });
}

// Events after the cursor, in log order. The cursor is the last event sent; a trimmed log still works
// because events are also ordered by time.
export function activityAfter(events: ActivityEvent[], cursor: { id: string; at: number } | null): ActivityEvent[] {
  if (!cursor) return events;
  const index = events.findIndex((event) => event.id === cursor.id);
  if (index >= 0) return events.slice(index + 1);
  return events.filter((event) => event.at > cursor.at);
}
