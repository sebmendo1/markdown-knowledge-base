"use client";

import { useState } from "react";
import { formatBytes, resetKeys, summarizeStorage } from "@/lib/settings/storage";
import { Pane, Row, Subhead } from "./parts";

function readEntries(): [string, string][] {
  try {
    const entries: [string, string][] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key) entries.push([key, window.localStorage.getItem(key) ?? ""]);
    }
    return entries;
  } catch {
    return [];
  }
}

export function GeneralSettings({ kbDir }: { kbDir: string | null }) {
  // The pane mounts only in the browser, when Settings opens, so it can read storage directly.
  const [stats] = useState(() => summarizeStorage(readEntries()));
  const [confirming, setConfirming] = useState(false);

  function reset() {
    for (const key of resetKeys(readEntries().map(([key]) => key))) window.localStorage.removeItem(key);
    window.location.reload();
  }

  return (
    <Pane title="General" lead="This copy stays on this machine.">
      <Row
        label="Pages"
        detail="Pages you create or edit live in this browser, one project at a time. Export a project from the Pages menu to keep a copy or move it to another device."
      />
      <Subhead>Storage</Subhead>
      <dl className="settings-stats" aria-label="This browser's storage">
        <div>
          <dt>Projects saved here</dt>
          <dd>{stats.projects}</dd>
        </div>
        <div>
          <dt>Pages changed here</dt>
          <dd>{stats.pagesChangedHere}</dd>
        </div>
        <div>
          <dt>Saved versions</dt>
          <dd>{stats.versions}</dd>
        </div>
        <div>
          <dt>Space used</dt>
          <dd>{formatBytes(stats.bytes)}</dd>
        </div>
      </dl>
      {kbDir ? (
        <Row label="Folder on disk" detail="Projects in this folder are shared with your agents. Edits here are written back to it.">
          <code className="settings-path" title={kbDir}>
            {/* The mark keeps the trailing slash at the end while the start of the path is cut. */}
            {`${kbDir}\u200E`}
          </code>
        </Row>
      ) : null}
      <Row
        label="Reset this browser's copy"
        detail="Removes the pages, saved versions, and project list kept in this browser. Files on disk and in the repository are not touched. Pages that exist only in this browser are lost."
      >
        {confirming ? (
          <div className="settings-confirm" role="group" aria-label="Confirm reset">
            <button type="button" className="settings-button is-danger" onClick={reset}>
              Reset and reload
            </button>
            <button type="button" className="settings-button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="settings-button" onClick={() => setConfirming(true)}>
            Reset this browser&apos;s copy
          </button>
        )}
      </Row>
    </Pane>
  );
}
