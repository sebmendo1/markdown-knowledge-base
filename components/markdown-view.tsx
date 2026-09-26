"use client";

import Link from "next/link";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { splitFrontmatter } from "@/lib/markdown/frontmatter";
import { hrefFor } from "@/lib/markdown/links";
import { extractSection } from "@/lib/markdown/outline";
import { rehypeMarkChanged } from "@/lib/markdown/plugins";
import { CodeBlock } from "./blocks";
import { markdownComponents, markdownPlugins, Properties, type EmbedProps, type MarkdownDoc } from "./markdown-parts";
import { useProject } from "./project-context";

type MarkdownViewProps = {
  source: string;
  docs: MarkdownDoc[];
  path?: string;
  depth?: number;
  trail?: string[];
  // Body line numbers (after frontmatter) to mark as just changed.
  changed?: ReadonlySet<number>;
};

export function MarkdownView({ source, docs, path, depth = 0, trail = [], changed }: MarkdownViewProps) {
  const parsed = useMemo(() => splitFrontmatter(source), [source]);
  const project = useProject();
  const plugins = useMemo(() => {
    const base = markdownPlugins(docs, project);
    if (!changed?.size) return base;
    return { ...base, rehypePlugins: [...(base.rehypePlugins ?? []), [rehypeMarkChanged, changed]] as typeof base.rehypePlugins };
  }, [docs, project, changed]);
  const chain = useMemo(() => (path ? [...trail, path] : trail), [path, trail]);
  const components = useMemo(() => markdownComponents({ docs, project, depth, trail: chain, Code: CodeBlock, Embed }), [docs, project, depth, chain]);

  return (
    <div className={depth > 0 ? "md md-embed" : "md"}>
      {parsed.error ? <p className="block-error">{parsed.error}</p> : null}
      {depth === 0 ? <Properties data={parsed.data} /> : null}
      <ReactMarkdown {...plugins} components={components}>
        {parsed.body}
      </ReactMarkdown>
    </div>
  );
}

function Embed({ path, heading, docs, project, depth, trail }: EmbedProps) {
  const doc = docs.find((entry) => entry.path === path);
  if (!doc) return <p className="wiki-broken">Missing page: {path}</p>;
  const source = heading ? extractSection(doc.content, heading) : doc.content;
  return (
    <aside className="embed">
      <Link className="embed-source" href={hrefFor(project, doc.path, heading || undefined)}>
        {doc.title}
        {heading ? ` / ${heading}` : ""}
      </Link>
      <MarkdownView source={source} docs={docs} path={doc.path} depth={depth} trail={trail} />
    </aside>
  );
}
