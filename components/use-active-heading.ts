"use client";

import { useEffect, type RefObject } from "react";
import { pickActiveHeading } from "@/lib/markdown/active-heading";

// The same headings the outline lists (see use-headings.ts): ids set, and not inside embeds or footnotes.
const SELECTOR = "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]";
const SKIP = ".embed, .backlinks, .md-embed, .block-atom, [data-footnotes]";

// Marks the heading at the top of the page from the scroll position, once per frame (F08-REQ-044).
// Positions are read on every scroll, so fast scrolling and the end of the page are never missed.
export function useActiveHeading(
  previewRef: RefObject<HTMLDivElement | null>,
  value: string,
  mode: string,
  setActiveHeading: (id: string) => void,
) {
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const base = root.getBoundingClientRect().top;
      const tops = [...root.querySelectorAll<HTMLElement>(SELECTOR)]
        .filter((node) => !node.closest(SKIP))
        .map((node) => ({ id: node.id, top: node.getBoundingClientRect().top - base }));
      const atEnd = root.scrollHeight > root.clientHeight + 1 && root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
      const id = pickActiveHeading(tops, atEnd);
      if (id) setActiveHeading(id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    root.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Rendering is lazy (charts, diagrams, the block editor), so heading positions move after load.
    const observer = new MutationObserver(schedule);
    observer.observe(root, { subtree: true, childList: true });
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [mode, previewRef, setActiveHeading, value]);
}
