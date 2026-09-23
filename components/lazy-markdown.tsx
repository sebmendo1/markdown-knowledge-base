"use client";

import dynamic from "next/dynamic";

const load = () => import("./markdown-view");

export const LazyMarkdownView = dynamic(() => load().then((module) => module.MarkdownView), {
  ssr: false,
  loading: () => <div className="md md-loading" aria-busy="true" />,
});

export function preloadMarkdown() {
  void load();
}
