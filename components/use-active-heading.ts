"use client";

import { useEffect, type RefObject } from "react";

export function useActiveHeading(
  previewRef: RefObject<HTMLDivElement | null>,
  value: string,
  mode: string,
  setActiveHeading: (id: string) => void,
) {
  useEffect(() => {
    const root = previewRef.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll("h1, h2, h3, h4")];
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveHeading(visible[0].target.id);
      },
      { root, rootMargin: "0px 0px -65% 0px", threshold: 0.1 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [mode, previewRef, setActiveHeading, value]);
}
