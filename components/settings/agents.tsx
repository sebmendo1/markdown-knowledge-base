"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivityEvent } from "@/lib/store/activity-types";
import type { McpSnippets } from "@/lib/mcp/snippets";
import { describeWork, useAgentActivity, type AgentWork } from "../agent-activity";
import { setPreference, usePreferences } from "../preferences";
import { notify } from "../toast-host";
import { Pane, Row, Subhead, Switch } from "./parts";

const RECENT = 10;
const TOOLS = "list_projects, create_project, list_files, read_file, create_file, update_file, create_folder, move_file, delete_file, search";

function ago(at: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

// Past tense for the list; the live indicator uses describeWork's present tense.
function pastTense(work: AgentWork): string {
  return describeWork(work)
    .replace(" is writing ", " wrote ")
    .replace(" is editing ", " edited ")
    .replace(" is moving ", " moved ")
    .replace(" is adding a folder", " added a folder")
    .replace(" is creating a project", " created a project")
    .replace(" is reading ", " read ")
    .replace(" is searching", " searched")
    .replace(" is looking around", " listed pages");
}

function sameEvent(a: AgentWork, b: AgentWork) {
  return a.at === b.at && a.op === b.op && a.path === b.path && a.agent === b.agent;
}

export function AgentsSettings({ snippets, local }: { snippets: McpSnippets; local: boolean }) {
  const preferences = usePreferences();
  const { working, recent: live } = useAgentActivity();
  const [loaded, setLoaded] = useState<AgentWork[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let gone = false;
    void fetch(`/api/activity?recent=${RECENT}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const body = (await response.json()) as { events: ActivityEvent[] };
        if (gone) return;
        setLoaded(body.events.map((event): AgentWork => ({ agent: event.agent, op: event.op, project: event.project, path: event.path, at: event.at })));
      })
      .catch(() => undefined);
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      gone = true;
      window.clearInterval(timer);
    };
  }, []);

  // What the log held when the pane opened, plus what this tab has seen live since.
  const recent = useMemo(
    () => [...live, ...loaded.filter((item) => !live.some((entry) => sameEvent(entry, item)))].sort((a, b) => b.at - a.at).slice(0, RECENT),
    [live, loaded],
  );

  const last = recent[0];

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    notify(`Copied ${label} settings`);
  }

  return (
    <Pane title="Agents" lead="Agents read and edit your pages through MCP. Watch what they do, and choose how the app follows them.">
      <div className="settings-status" role="status">
        <span className={working ? "agent-pulse" : "settings-status-dot"} aria-hidden="true" />
        <span>
          {last ? (
            <>
              <strong>{last.agent}</strong> · last seen {ago(last.at, now)}
            </>
          ) : (
            "No agent has connected yet."
          )}
        </span>
      </div>

      <Row inline label="Follow agents to the page they edit" detail="Off keeps you on your page and offers Watch instead.">
        <Switch label="Follow agents to the page they edit" checked={preferences.followAgents} onChange={(next) => setPreference("followAgents", next)} />
      </Row>
      <Row inline label="Highlight what agents change" detail="Mark new and changed blocks while an agent edits a page.">
        <Switch label="Highlight what agents change" checked={preferences.highlightAgentChanges} onChange={(next) => setPreference("highlightAgentChanges", next)} />
      </Row>

      <Subhead>Recent activity</Subhead>
      {recent.length ? (
        <ol className="settings-activity" aria-label="Recent agent activity">
          {recent.map((item) => (
            <li key={`${item.at}-${item.op}-${item.path ?? ""}`}>
              <span>
                {pastTense(item)}
                {item.project ? <small> · {item.project}</small> : null}
              </span>
              <time dateTime={new Date(item.at).toISOString()}>{ago(item.at, now)}</time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="settings-empty">Nothing yet. Actions show here as agents use the knowledge base.</p>
      )}

      <Subhead>Connect an agent</Subhead>
      <p className="settings-note">
        {local
          ? `These settings point agents at ${snippets.kbDir}. Paste one into Cursor, Claude Code, or Codex.`
          : "Run npm run dev on this machine to fill in the folder paths. Paste one of these into Cursor, Claude Code, or Codex."}
      </p>
      {(
        [
          ["Cursor", snippets.cursor],
          ["Claude Code", snippets.claude],
          ["Codex", snippets.codex],
        ] as const
      ).map(([label, text]) => (
        <div className="mcp-block" key={label}>
          <header>
            <div className="settings-label">{label}</div>
            <button type="button" className="mcp-copy" onClick={() => void copy(label, text)}>
              Copy
            </button>
          </header>
          <pre>{text}</pre>
        </div>
      ))}
      <p className="settings-note">Tools: {TOOLS}.</p>
    </Pane>
  );
}
