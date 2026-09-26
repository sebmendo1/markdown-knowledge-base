"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Heading } from "@/lib/markdown/outline";
import { groupOutline, sectionOf } from "@/lib/markdown/outline-tree";

// The outline card from the Paper design (F08-REQ-036, F08-REQ-039, F08-REQ-040): the page title,
// then one row per H2 whose chevron shows or hides the headings under it.
export function OutlinePanel({
  open,
  headings,
  activeHeading,
  onJump,
}: {
  open: boolean;
  headings: Heading[];
  activeHeading: string | null;
  onJump: (id: string) => void;
}) {
  const tree = useMemo(() => groupOutline(headings), [headings]);
  // A section the owner opened or closed keeps that choice. Otherwise the section in view is open.
  const [chosen, setChosen] = useState<Map<string, boolean>>(() => new Map());
  const inView = sectionOf(tree, activeHeading);
  const isOpen = (id: string) => chosen.get(id) ?? id === inView;
  const panel = useRef<HTMLElement>(null);

  // Keep the marked row in view inside the outline, without scrolling the page (F08-REQ-045).
  useEffect(() => {
    const root = panel.current;
    // A collapsed section hides the marked row, so its section row stands in for it.
    const find = (id: string | null) => {
      const found = id ? root?.querySelector<HTMLElement>(`[data-heading="${CSS.escape(id)}"]`) : null;
      return found && !found.closest(".outline-children:not(.is-open)") ? found : null;
    };
    const row = find(activeHeading) ?? find(inView);
    if (!open || !root || !row) return;
    const view = root.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    const margin = 24;
    if (box.top < view.top + margin) root.scrollTop -= view.top + margin - box.top;
    else if (box.bottom > view.bottom - margin) root.scrollTop += box.bottom - (view.bottom - margin);
  }, [activeHeading, inView, open]);

  function toggle(id: string) {
    setChosen((current) => new Map(current).set(id, !isOpen(id)));
  }

  return (
    <aside ref={panel} className={open ? "outline" : "outline is-closed"} aria-label="Outline" aria-hidden={!open} inert={!open}>
      <div className="outline-card">
        <h2>Outline</h2>
        {headings.length === 0 ? <p className="outline-empty">No headings</p> : null}
        {tree.title ? (
          <button
            type="button"
            data-heading={tree.title.id}
            aria-current={tree.title.id === activeHeading ? "location" : undefined}
            className={tree.title.id === activeHeading ? "outline-title is-active" : "outline-title"}
            onClick={() => onJump(tree.title!.id)}
          >
            {tree.title.text}
          </button>
        ) : null}
        {tree.sections.map((section) => {
          const expanded = isOpen(section.heading.id);
          const marked = section.heading.id === activeHeading || (!expanded && section.heading.id === inView);
          return (
            <div key={section.heading.id} className="outline-section">
              <div className="outline-row">
                <button
                  type="button"
                  data-heading={section.heading.id}
                  aria-current={marked ? "location" : undefined}
                  className={marked ? "outline-jump is-active" : "outline-jump"}
                  onClick={() => onJump(section.heading.id)}
                >
                  {section.heading.text}
                </button>
                <span className="outline-toggle-slot">
                  {section.children.length ? (
                    <button
                      type="button"
                      className={expanded ? "outline-toggle is-open" : "outline-toggle"}
                      aria-expanded={expanded}
                      aria-label={`${expanded ? "Hide" : "Show"} ${section.heading.text} subsections`}
                      onClick={() => toggle(section.heading.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M3 4.5 6 7.5l3-3" />
                      </svg>
                    </button>
                  ) : null}
                </span>
              </div>
              {section.children.length ? (
                // Always rendered, so the rows unfold and fold smoothly; closed rows cannot be focused.
                <div className={expanded ? "outline-children is-open" : "outline-children"} aria-hidden={!expanded} inert={!expanded}>
                  <div className="outline-children-inner">
                    {section.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        data-heading={child.id}
                        aria-current={child.id === activeHeading ? "location" : undefined}
                        className={child.id === activeHeading ? "outline-jump outline-child is-active" : "outline-jump outline-child"}
                        style={{ paddingLeft: 12 + (child.depth - 2) * 12 }}
                        onClick={() => onJump(child.id)}
                      >
                        {child.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
