"use client";

import { useMemo, useState } from "react";
import type { Heading } from "@/lib/markdown/outline";
import { groupOutline, sectionOf } from "@/lib/markdown/outline-tree";

// The outline card from the Paper design (F08-REQ-036, F08-REQ-039, F08-REQ-040): the page title,
// then one row per H2 whose chevron shows or hides the headings under it.
export function OutlinePanel({
  headings,
  activeHeading,
  onJump,
}: {
  headings: Heading[];
  activeHeading: string | null;
  onJump: (id: string) => void;
}) {
  const tree = useMemo(() => groupOutline(headings), [headings]);
  // A section the owner opened or closed keeps that choice. Otherwise the section in view is open.
  const [chosen, setChosen] = useState<Map<string, boolean>>(() => new Map());
  const inView = sectionOf(tree, activeHeading);
  const isOpen = (id: string) => chosen.get(id) ?? id === inView;

  function toggle(id: string) {
    setChosen((current) => new Map(current).set(id, !isOpen(id)));
  }

  return (
    <aside className="outline" aria-label="Outline">
      <div className="outline-card">
        <h2>Outline</h2>
        {headings.length === 0 ? <p className="outline-empty">No headings</p> : null}
        {tree.title ? (
          <button
            type="button"
            className={tree.title.id === activeHeading ? "outline-title is-active" : "outline-title"}
            onClick={() => onJump(tree.title!.id)}
          >
            {tree.title.text}
          </button>
        ) : null}
        {tree.sections.map((section) => {
          const open = isOpen(section.heading.id);
          return (
            <div key={section.heading.id} className="outline-section">
              <div className="outline-row">
                <button
                  type="button"
                  className={section.heading.id === activeHeading ? "outline-jump is-active" : "outline-jump"}
                  onClick={() => onJump(section.heading.id)}
                >
                  {section.heading.text}
                </button>
                <span className="outline-toggle-slot">
                  {section.children.length ? (
                    <button
                      type="button"
                      className={open ? "outline-toggle is-open" : "outline-toggle"}
                      aria-expanded={open}
                      aria-label={`${open ? "Hide" : "Show"} ${section.heading.text} subsections`}
                      onClick={() => toggle(section.heading.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M3 4.5 6 7.5l3-3" />
                      </svg>
                    </button>
                  ) : null}
                </span>
              </div>
              {open
                ? section.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={child.id === activeHeading ? "outline-jump outline-child is-active" : "outline-jump outline-child"}
                      style={{ paddingLeft: 12 + (child.depth - 2) * 12 }}
                      onClick={() => onJump(child.id)}
                    >
                      {child.text}
                    </button>
                  ))
                : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
