"use client";

import Link from "next/link";
import { hrefOf, humanize, nameOf } from "@/lib/workspace/paths";
import type { PageDoc } from "@/lib/workspace/tree";
import { setMode } from "./draft-store";
import { newPageAt } from "./page-actions";

export function MissingPage({ path, first, go }: { path: string; first?: PageDoc; go: (href: string) => void }) {
  const title = humanize(nameOf(path));
  function create() {
    const made = newPageAt(path);
    setMode("split");
    if (made && made !== path) go(hrefOf(made));
  }
  return (
    <div className="stage preview">
      <div className="missing-page">
        <p className="missing-kicker">{path}</p>
        <h1>“{title}” has no page yet</h1>
        <p>Links can point to pages you haven’t written. Create it now and start writing, or open another page.</p>
        <div className="missing-actions">
          <button type="button" className="share-button" onClick={create}>
            Create this page
          </button>
          {first ? (
            <Link href={hrefOf(first.path)} className="text-button" onClick={() => go("")}>
              Open {first.title}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
