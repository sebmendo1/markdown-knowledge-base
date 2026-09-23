"use client";

import type { Heading } from "@/lib/markdown/outline";

export function OutlinePanel({
  headings,
  activeHeading,
  onJump,
}: {
  headings: Heading[];
  activeHeading: string | null;
  onJump: (id: string) => void;
}) {
  return (
    <aside className="outline" aria-label="Outline">
      <h2>Outline</h2>
      {headings.length === 0 ? <p className="outline-empty">No headings</p> : null}
      {headings.map((heading) => (
        <button
          key={heading.id}
          type="button"
          className={heading.id === activeHeading ? "is-active" : undefined}
          style={{ paddingLeft: 8 + (heading.depth - 1) * 12 }}
          onClick={() => onJump(heading.id)}
        >
          {heading.text}
        </button>
      ))}
    </aside>
  );
}
