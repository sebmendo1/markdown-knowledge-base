"use client";

import Link from "next/link";
import { useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { Doc } from "@/lib/docs";
import { splitFrontmatter } from "@/lib/markdown/frontmatter";
import { extractSection } from "@/lib/markdown/outline";
import { hrefFor } from "@/lib/markdown/links";
import { remarkAlerts, remarkHighlight, remarkWiki } from "@/lib/markdown/plugins";
import { sanitizeSchema } from "@/lib/markdown/schema";
import { ChartBlock, CodeBlock, CsvTable, MermaidBlock } from "./blocks";

type MarkdownViewProps = {
  source: string;
  docs: Doc[];
  embedded?: boolean;
};

export function MarkdownView({ source, docs, embedded = false }: MarkdownViewProps) {
  const parsed = useMemo(() => splitFrontmatter(source), [source]);
  const remarkPlugins = useMemo(
    () => [remarkGfm, remarkMath, remarkAlerts, remarkWiki(docs), remarkHighlight],
    [docs],
  );
  const rehypePlugins = useMemo(
    () => [rehypeKatex, rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeSlug] as const,
    [],
  );
  const components = useMemo<Components>(
    () => ({
      a: ({ href, children, className }) => {
        if (href?.startsWith("/")) {
          return (
            <Link href={href} className={className}>
              {children}
            </Link>
          );
        }
        const external = href?.startsWith("http");
        return (
          <a href={href} className={className} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
            {children}
          </a>
        );
      },
      pre: ({ children }) => <>{children}</>,
      code: ({ className, children }) => {
        const raw = String(children);
        const lang = /language-([\w-]+)/.exec(className ?? "")?.[1] ?? "";
        const isBlock = Boolean(lang) || raw.endsWith("\n");
        const text = raw.replace(/\n$/, "");
        if (!isBlock) return <code>{children}</code>;
        if (lang === "mermaid") return <MermaidBlock chart={text} />;
        if (lang === "chart" || lang === "vega" || lang === "vega-lite") return <ChartBlock source={text} />;
        if (lang === "csv" || lang === "tsv") {
          return <CsvTable source={text} delimiter={lang === "tsv" ? "\t" : ","} />;
        }
        return <CodeBlock code={text} lang={lang} />;
      },
      table: ({ children }) => (
        <div className="table-scroll">
          <table>{children}</table>
        </div>
      ),
      div: ({ className, children, node }) => {
        const properties = node?.properties ?? {};
        const embedPath = stringProp(properties.dataEmbed);
        if (embedPath) {
          return (
            <Embed
              path={embedPath}
              heading={stringProp(properties.dataHeading) ?? ""}
              docs={docs}
            />
          );
        }
        return <div className={className}>{children}</div>;
      },
    }),
    [docs],
  );

  const properties = propertyEntries(parsed.data);

  return (
    <div className={embedded ? "md md-embed" : "md"}>
      {parsed.error ? <p className="block-error">{parsed.error}</p> : null}
      {!embedded && properties.length > 0 ? (
        <dl className="properties">
          {properties.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins as never} components={components}>
        {parsed.body}
      </ReactMarkdown>
    </div>
  );
}

function Embed({ path, heading, docs }: { path: string; heading: string; docs: Doc[] }) {
  const doc = docs.find((entry) => entry.path === path);
  if (!doc) return <p className="wiki-broken">Missing page: {path}</p>;
  const source = heading ? extractSection(doc.content, heading) : doc.content;
  return (
    <aside className="embed">
      <Link className="embed-source" href={hrefFor(doc.path, heading || undefined)}>
        {doc.title}
        {heading ? ` / ${heading}` : ""}
      </Link>
      <MarkdownView source={source} docs={docs} embedded />
    </aside>
  );
}

function propertyEntries(data: Record<string, unknown> | null): [string, string][] {
  if (!data) return [];
  return Object.entries(data)
    .filter(([key]) => key !== "title" && key !== "type")
    .map(([key, value]) => [key, formatProperty(value)]);
}

function formatProperty(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value == null) return "";
  return JSON.stringify(value);
}

function stringProp(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
