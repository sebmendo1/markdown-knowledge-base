import Link from "next/link";
import Markdown from "react-markdown";
import { splitFrontmatter } from "@/lib/markdown/frontmatter";
import { highlight } from "@/lib/markdown/highlight";
import { hrefFor } from "@/lib/markdown/links";
import { extractSection } from "@/lib/markdown/outline";
import { CodeBlock } from "./blocks";
import { markdownComponents, markdownPlugins, Properties, type CodeProps, type EmbedProps, type MarkdownDoc } from "./markdown-parts";

export function StaticMarkdown({
  source,
  docs,
  project,
  path,
  depth = 0,
  trail = [],
}: {
  source: string;
  docs: MarkdownDoc[];
  project: string;
  path?: string;
  depth?: number;
  trail?: string[];
}) {
  const parsed = splitFrontmatter(source);
  const chain = path ? [...trail, path] : trail;
  return (
    <div className={depth > 0 ? "md md-embed" : "md"}>
      {parsed.error ? <p className="block-error">{parsed.error}</p> : null}
      {depth === 0 ? <Properties data={parsed.data} /> : null}
      <Markdown
        {...markdownPlugins(docs, project)}
        components={markdownComponents({ docs, project, depth, trail: chain, Code: HighlightedCode, Embed: StaticEmbed })}
      >
        {parsed.body}
      </Markdown>
    </div>
  );
}

async function HighlightedCode({ code, lang }: CodeProps) {
  return <CodeBlock code={code} lang={lang} html={await highlight(code, lang)} />;
}

function StaticEmbed({ path, heading, docs, depth, trail, project }: EmbedProps) {
  const doc = docs.find((entry) => entry.path === path);
  if (!doc) return <p className="wiki-broken">Missing page: {path}</p>;
  const source = heading ? extractSection(doc.content, heading) : doc.content;
  return (
    <aside className="embed">
      <Link className="embed-source" href={hrefFor(project, doc.path, heading || undefined)}>
        {doc.title}
        {heading ? ` / ${heading}` : ""}
      </Link>
      <StaticMarkdown source={source} docs={docs} project={project} path={doc.path} depth={depth} trail={trail} />
    </aside>
  );
}
