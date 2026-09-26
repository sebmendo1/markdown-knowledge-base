"use client";

import { useEffect, useMemo, type RefObject } from "react";
import { splitFrontmatter } from "@/lib/markdown/frontmatter";
import { addedLines } from "@/lib/store/line-diff";
import type { PageDoc } from "@/lib/workspace/tree";
import { pauseFollowing, type AgentSession } from "./agent-activity";
import { LazyMarkdownView } from "./lazy-markdown";

// The page as an agent edits it: live content, with the blocks changed in this session marked,
// and the view kept on the latest change.
export function AgentStage({
  session,
  value,
  docs,
  path,
  previewRef,
}: {
  session: AgentSession;
  value: string;
  docs: PageDoc[];
  path: string;
  previewRef: RefObject<HTMLDivElement | null>;
}) {
  const changed = useMemo(
    () => addedLines(session.before ? splitFrontmatter(session.before).body : "", splitFrontmatter(value).body),
    [session.before, value],
  );

  useEffect(() => {
    // Wait a frame for the new render, then bring the newest change into view.
    const frame = window.requestAnimationFrame(() => {
      const marks = previewRef.current?.querySelectorAll(".agent-change");
      const last = marks?.[marks.length - 1];
      if (!last) return;
      const rect = last.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) return;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      last.scrollIntoView({ behavior: motion, block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [value, previewRef]);

  const edits = `${session.edits} ${session.edits === 1 ? "edit" : "edits"}`;
  return (
    <div className="stage preview agent-stage" aria-busy={session.pending}>
      <div className={session.pending ? "agent-progress is-active" : "agent-progress"} aria-hidden="true" />
      <div className="preview-pane" ref={previewRef}>
        <article className="md-column">
          <div className="agent-bar" role="status" aria-live="polite">
            <span className="agent-pulse" aria-hidden="true" />
            <span className="agent-bar-text">
              <strong>{session.agent}</strong> is editing this page
              <span className="agent-bar-meta">
                {" · "}
                {session.pending ? "Applying an edit…" : edits}
              </span>
            </span>
            <button type="button" className="agent-bar-button" onClick={pauseFollowing}>
              Stop following
            </button>
          </div>
          <LazyMarkdownView source={value} docs={docs} path={path} changed={changed} />
        </article>
      </div>
    </div>
  );
}
