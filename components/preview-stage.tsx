"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { RefObject } from "react";
import { hrefOf } from "@/lib/workspace/paths";
import type { PageDoc } from "@/lib/workspace/tree";
import { MarkdownView } from "./markdown-view";

const Editor = dynamic(() => import("./editor").then((module) => module.Editor), {
  ssr: false,
});

export function PreviewStage({
  mode,
  value,
  docs,
  linkedFrom,
  previewRef,
  onChange,
  go,
}: {
  mode: "preview" | "split";
  value: string;
  docs: PageDoc[];
  linkedFrom: PageDoc[];
  previewRef: RefObject<HTMLDivElement | null>;
  onChange: (next: string) => void;
  go: (href: string) => void;
}) {
  return (
    <div className={`stage ${mode}`}>
      {mode === "split" ? (
        <div className="source-pane">
          <Editor value={value} onChange={onChange} />
        </div>
      ) : null}
      <div className="preview-pane" ref={previewRef}>
        <article className="md-column">
          <MarkdownView source={value} docs={docs} />
          {linkedFrom.length > 0 ? (
            <aside className="backlinks" aria-label="Linked from">
              <h2>Linked from</h2>
              <ul>
                {linkedFrom.map((doc) => (
                  <li key={doc.id}>
                    <Link href={hrefOf(doc.path)} onClick={() => go("")}>
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
