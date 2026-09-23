"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, type ReactNode, type RefObject } from "react";
import { hrefOf } from "@/lib/workspace/paths";
import type { PageDoc } from "@/lib/workspace/tree";
import type { Mode } from "./draft-store";
import { LazyMarkdownView, preloadMarkdown } from "./lazy-markdown";
import { useProject } from "./project-context";

const Editor = dynamic(() => import("./editor").then((module) => module.Editor), {
  ssr: false,
});

const loadBlockEditor = () => import("./block-editor/block-editor");

export function preloadBlockEditor() {
  void loadBlockEditor();
}

const BlockEditor = dynamic(() => loadBlockEditor().then((module) => module.BlockEditor), {
  ssr: false,
  loading: () => <div className="block-editor-loading" aria-busy="true" />,
});

export function PreviewStage({
  mode,
  value,
  rendered,
  path,
  docs,
  linkedFrom,
  previewRef,
  onChange,
  go,
}: {
  mode: Mode;
  value: string;
  rendered: ReactNode;
  path: string;
  docs: PageDoc[];
  linkedFrom: PageDoc[];
  previewRef: RefObject<HTMLDivElement | null>;
  onChange: (next: string) => void;
  go: (href: string) => void;
}) {
  const project = useProject();
  useEffect(() => {
    if (mode !== "preview") preloadMarkdown();
  }, [mode]);
  if (mode === "source") {
    return (
      <div className="stage source">
        <div className="source-pane">
          <Editor value={value} onChange={onChange} />
        </div>
      </div>
    );
  }
  return (
    <div className={`stage ${mode}`}>
      <div className="preview-pane" ref={previewRef}>
        <article className="md-column">
          {mode === "edit" ? (
            <BlockEditor value={value} docs={docs} onChange={onChange} go={go} />
          ) : (
            (rendered ?? <LazyMarkdownView source={value} docs={docs} path={path} />)
          )}
          {linkedFrom.length > 0 ? (
            <aside className="backlinks" aria-label="Linked from">
              <h2>Linked from</h2>
              <ul>
                {linkedFrom.map((doc) => (
                  <li key={doc.id}>
                    <Link href={hrefOf(project, doc.path)} onClick={() => go("")}>
                      {doc.title}
                    </Link>
                    <small>{doc.path}</small>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </article>
      </div>
    </div>
  );
}
