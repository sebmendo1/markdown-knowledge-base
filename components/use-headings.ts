"use client";

import { useCallback, useRef, useSyncExternalStore, type RefObject } from "react";
import type { Heading } from "@/lib/markdown/outline";

const SELECTOR = "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]";

function textOf(node: Element): string {
  if (!node.querySelector(".katex-mathml")) return (node.textContent ?? "").replace(/\s+/g, " ").trim();
  const clone = node.cloneNode(true) as Element;
  clone.querySelectorAll(".katex-mathml").forEach((math) => math.remove());
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
}

function read(root: HTMLElement): Heading[] {
  return [...root.querySelectorAll(SELECTOR)]
    .filter((node) => node.id && !node.closest(".embed, .backlinks, .md-embed, .block-atom, [data-footnotes]"))
    .map((node) => ({ depth: Number(node.tagName[1]), text: textOf(node), id: node.id }))
    .filter((heading) => heading.text);
}

export function useHeadings(ref: RefObject<HTMLElement | null>, initial: Heading[], page: string): Heading[] {
  const last = useRef<{ key: string | null; headings: Heading[] }>({ key: null, headings: initial });
  const subscribe = useCallback(
    (onChange: () => void) => {
      const root = ref.current;
      if (!root || typeof MutationObserver === "undefined") return () => {};
      let frame = 0;
      const observer = new MutationObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(onChange);
      });
      observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["id"] });
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref, page],
  );
  const snapshot = useCallback(() => {
    const root = ref.current;
    if (!root) return last.current.headings;
    const headings = read(root);
    const key = headings.map((heading) => `${heading.depth}\u0000${heading.id}\u0000${heading.text}`).join("\u0001");
    if (key !== last.current.key) last.current = { key, headings };
    return last.current.headings;
  }, [ref]);
  return useSyncExternalStore(subscribe, snapshot, () => initial);
}
