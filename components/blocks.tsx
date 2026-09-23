"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { parse } from "yaml";
import { parseDelimited } from "@/lib/markdown/csv";
import { useResolvedTheme } from "./theme-store";

const LANG_ALIAS: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  yml: "yaml",
  sh: "bash",
  shell: "bash",
  md: "markdown",
  txt: "text",
  plaintext: "text",
};

let highlighterPromise: Promise<import("shiki").Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= import("shiki").then(({ createHighlighter, createJavaScriptRegexEngine }) =>
    createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "json",
        "yaml",
        "bash",
        "markdown",
        "python",
        "css",
        "html",
        "sql",
        "diff",
        "text",
      ],
      engine: createJavaScriptRegexEngine(),
    }),
  );
  return highlighterPromise;
}

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const theme = useResolvedTheme();
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const mapped = LANG_ALIAS[lang] ?? (lang || "text");
    getHighlighter()
      .then((highlighter) => {
        const loaded = highlighter.getLoadedLanguages();
        const useLang = loaded.includes(mapped) ? mapped : "text";
        const next = highlighter.codeToHtml(code, { lang: useLang, theme: theme === "light" ? "github-light" : "github-dark" });
        if (!cancelled) setHtml(next);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, theme]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <button type="button" className="copy-button" onClick={copy} aria-label="Copy code">
        {copied ? "Copied" : "Copy"}
      </button>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export function MermaidBlock({ chart }: { chart: string }) {
  const reactId = useId().replace(/:/g, "");
  const theme = useResolvedTheme();
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${reactId}-${theme}`;
    const light = theme === "light";
    document.getElementById(id)?.remove();
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: light ? "default" : "dark",
          fontFamily: "Geist, sans-serif",
          themeVariables: light
            ? {
                darkMode: false,
                background: "transparent",
                primaryColor: "#e7eefc",
                primaryTextColor: "#1c1c1c",
                primaryBorderColor: "#b7c7ea",
                lineColor: "#5c7199",
                secondaryColor: "#f3f3f0",
                tertiaryColor: "#ffffff",
                fontSize: "14px",
              }
            : {
                darkMode: true,
                background: "transparent",
                primaryColor: "#1c2433",
                primaryTextColor: "#ececec",
                primaryBorderColor: "#314158",
                lineColor: "#8aa0c8",
                secondaryColor: "#161616",
                tertiaryColor: "#141414",
                fontSize: "14px",
              },
        });
        const rendered = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(rendered.svg);
          setError(null);
        }
      } catch (caught) {
        document.getElementById(id)?.remove();
        if (!cancelled) {
          setSvg(null);
          setError(caught instanceof Error ? caught.message : "Diagram could not be drawn.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId, theme]);

  return (
    <figure className="mermaid-block">
      {error ? <p className="block-error">{error}</p> : null}
      {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : null}
    </figure>
  );
}

function chartConfig(light: boolean) {
  return {
    background: "transparent",
    font: "Geist, sans-serif",
    view: { stroke: "transparent" },
    axis: {
      labelColor: light ? "#5c5c5c" : "#a1a1a1",
      titleColor: light ? "#5c5c5c" : "#a1a1a1",
      domainColor: light ? "#d5d5d0" : "#2a2a2a",
      tickColor: light ? "#d5d5d0" : "#2a2a2a",
      gridColor: light ? "#e6e6e1" : "#222222",
      labelFontSize: 11,
      titleFontSize: 12,
    },
    legend: { labelColor: light ? "#5c5c5c" : "#a1a1a1", titleColor: light ? "#1c1c1c" : "#cfcfcf" },
    title: { color: light ? "#1c1c1c" : "#ececec", fontSize: 13, fontWeight: "normal" as const, anchor: "start" as const },
    range: { category: ["#7aa2f7", "#7dcea0", "#e6c07b", "#f0a8a8", "#c4b5fd"] },
    mark: { color: "#7aa2f7" },
  };
}

function usesRemoteData(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(usesRemoteData);
  const record = value as Record<string, unknown>;
  if (typeof record.url === "string" && /^https?:/i.test(record.url)) return true;
  return Object.values(record).some(usesRemoteData);
}

export function ChartBlock({ source }: { source: string }) {
  const reactId = useId().replace(/:/g, "");
  const theme = useResolvedTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = document.getElementById(reactId);
    if (!host) return;
    let cancelled = false;
    let finalize: (() => void) | undefined;

    (async () => {
      try {
        const trimmed = source.trim();
        const spec = trimmed.startsWith("{") || trimmed.startsWith("[") ? JSON.parse(trimmed) : parse(trimmed);
        if (usesRemoteData(spec)) {
          throw new Error("Charts can only use inline data.");
        }
        const embed = (await import("vega-embed")).default;
        if (cancelled || !host) return;
        const result = await embed(host, spec as never, {
          actions: false,
          renderer: "svg",
          config: chartConfig(theme === "light"),
          mode: "vega-lite",
        });
        finalize = () => result.finalize();
        if (!cancelled) setError(null);
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Chart could not be drawn.");
        }
      }
    })();

    return () => {
      cancelled = true;
      finalize?.();
    };
  }, [reactId, source, theme]);

  return (
    <figure className="chart-block">
      {error ? <p className="block-error">{error}</p> : null}
      <div id={reactId} className="chart-host" />
    </figure>
  );
}

export function CsvTable({ source, delimiter }: { source: string; delimiter: string }) {
  const rows = useMemo(() => parseDelimited(source, delimiter), [source, delimiter]);
  const [sort, setSort] = useState<{ index: number; direction: 1 | -1 } | null>(null);
  if (rows.length === 0) return null;

  const header = rows[0];
  const body = rows.slice(1);
  const sorted = sort
    ? [...body].sort((a, b) => compareCells(a[sort.index] ?? "", b[sort.index] ?? "", sort.direction))
    : body;

  return (
    <div className="csv-block table-scroll">
      <table>
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th key={`${cell}-${index}`} scope="col">
                <button
                  type="button"
                  onClick={() =>
                    setSort((current) =>
                      current?.index === index
                        ? { index, direction: current.direction === 1 ? -1 : 1 }
                        : { index, direction: 1 },
                    )
                  }
                >
                  {cell}
                  {sort?.index === index ? (sort.direction === 1 ? " ↑" : " ↓") : ""}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {header.map((_, cellIndex) => (
                <td key={cellIndex}>{row[cellIndex] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function compareCells(a: string, b: string, direction: number) {
  const left = Number(a);
  const right = Number(b);
  if (a.trim() !== "" && b.trim() !== "" && !Number.isNaN(left) && !Number.isNaN(right)) {
    return (left - right) * direction;
  }
  return a.localeCompare(b) * direction;
}
