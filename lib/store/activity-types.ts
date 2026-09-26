// Activity shapes shared by the MCP server, the app's API, and the browser. No Node imports here.
export type ActivityOp = "browse" | "read" | "search" | "create_project" | "create" | "update" | "mkdir" | "move" | "trash";

export type ActivityEvent = {
  id: string;
  at: number;
  agent: string;
  op: ActivityOp;
  project?: string;
  path?: string;
  from?: string;
};

export const EDIT_OPS: ReadonlySet<ActivityOp> = new Set(["create", "update", "move", "trash", "mkdir", "create_project"]);

const AGENT_NAMES: [RegExp, string][] = [
  [/claude[-_ ]?code/i, "Claude Code"],
  [/claude/i, "Claude"],
  [/cursor/i, "Cursor"],
  [/codex/i, "Codex"],
  [/windsurf/i, "Windsurf"],
  [/inspector/i, "MCP Inspector"],
];

export function agentName(client?: { name?: string } | null): string {
  const raw = client?.name?.trim();
  if (!raw) return "An agent";
  for (const [pattern, name] of AGENT_NAMES) if (pattern.test(raw)) return name;
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
