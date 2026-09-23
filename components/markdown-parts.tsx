import Link from "next/link";
import type { ComponentType } from "react";
import type { Components, Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { Frontmatter } from "@/lib/markdown/frontmatter";
import type { DocRef } from "@/lib/markdown/links";
import { rehypeSinglePrefix, remarkAlerts, remarkHighlight, remarkWiki } from "@/lib/markdown/plugins";
import { sanitizeSchema } from "@/lib/markdown/schema";
import { ChartBlock, CsvTable, MermaidBlock } from "./blocks";

export const MAX_EMBED_DEPTH = 3;

export type MarkdownDoc = DocRef & { content: string };
export type CodeProps = { code: string; lang: string };
export type EmbedProps = { path: string; heading: string; docs: MarkdownDoc[]; project: string; depth: number; trail: string[] };

export function markdownPlugins(docs: DocRef[], project: string): Pick<Options, "remarkPlugins" | "rehypePlugins"> {
  return {
    remarkPlugins: [remarkGfm, remarkMath, remarkAlerts, remarkWiki(docs, project), remarkHighlight],
    rehypePlugins: [rehypeKatex, rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeSinglePrefix, rehypeSlug],
  };
}

export function markdownComponents({
  docs,
  project,
  depth,
  trail,
  Code,
  Embed,
}: {
  docs: MarkdownDoc[];
  project: string;
  depth: number;
  trail: string[];
  Code: ComponentType<CodeProps>;
  Embed: ComponentType<EmbedProps>;
}): Components {
  return {
    a: ({ node: _node, href, children, ...rest }) => {
      void _node;
      if (href?.startsWith("/")) {
        return (
          <Link href={href} {...rest}>
            {children}
          </Link>
        );
      }
      const external = href?.startsWith("http");
      return (
        <a href={href} {...rest} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
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
      if (lang === "csv" || lang === "tsv") return <CsvTable source={text} delimiter={lang === "tsv" ? "\t" : ","} />;
      return <Code code={text} lang={lang} />;
    },
    table: ({ children }) => (
      <div className="table-scroll">
        <table>{children}</table>
      </div>
    ),
    div: ({ className, children, node }) => {
      const embedPath = stringProp(node?.properties?.dataEmbed);
      if (!embedPath) return <div className={className}>{children}</div>;
      if (depth >= MAX_EMBED_DEPTH || trail.includes(embedPath)) {
        return <p className="wiki-broken">Embed stops here: {embedPath} is already shown above.</p>;
      }
      return <Embed path={embedPath} heading={stringProp(node?.properties?.dataHeading) ?? ""} docs={docs} project={project} depth={depth + 1} trail={trail} />;
    },
  };
}

export function Properties({ data }: { data: Frontmatter | null }) {
  const entries = data
    ? Object.entries(data)
        .filter(([key]) => key !== "title" && key !== "type")
        .map(([key, value]) => [key, formatProperty(value)] as const)
    : [];
  if (entries.length === 0) return null;
  return (
    <dl className="properties">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatProperty(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "";
  return JSON.stringify(value);
}

function stringProp(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
