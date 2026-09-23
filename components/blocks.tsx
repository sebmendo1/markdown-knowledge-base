"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { parseDelimited } from "@/lib/markdown/csv";
import { useResolvedTheme } from "./theme-store";

function useNear<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { root: node.closest(".preview-pane"), rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);
  return [ref, near] as const;
}

export function CodeBlock({ code, lang, html: ready }: { code: string; lang: string; html?: string | null }) {
  const [html, setHtml] = useState<string | null>(ready ?? null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ready !== undefined) return;
    let cancelled = false;
    import("@/lib/markdown/highlight")
      .then(({ highlight }) => highlight(code, lang))
      .then((next) => {
        if (!cancelled) setHtml(next);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, ready]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  const shown = ready ?? html;
  return (
    <div className="code-block">
      <button type="button" className="copy-button" onClick={copy} aria-label="Copy code">
        {copied ? "Copied" : "Copy"}
      </button>
      {shown ? (
        <div dangerouslySetInnerHTML={{ __html: shown }} />
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

const diagrams = new Map<string, string>();

export function MermaidBlock({ chart }: { chart: string }) {
  const reactId = useId().replace(/:/g, "");
  const theme = useResolvedTheme();
  const [ref, near] = useNear<HTMLElement>();
  const [drawn, setDrawn] = useState<{ key: string; svg: string | null; error: string | null } | null>(null);
  const key = `${theme}\n${chart}`;
  const cached = diagrams.get(key);
  const svg = cached ?? drawn?.svg ?? null;
  const error = cached ? null : drawn?.key === key ? drawn.error : null;

  useEffect(() => {
    if (!near || diagrams.has(key)) return;
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
        if (diagrams.size > 60) diagrams.delete(diagrams.keys().next().value!);
        diagrams.set(key, rendered.svg);
        if (!cancelled) setDrawn({ key, svg: rendered.svg, error: null });
      } catch (caught) {
        document.getElementById(id)?.remove();
        if (!cancelled) setDrawn({ key, svg: null, error: caught instanceof Error ? caught.message : "Diagram could not be drawn." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, key, near, reactId, theme]);

  return (
    <figure ref={ref} className="mermaid-block" aria-busy={!svg && !error}>
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
  const [ref, near] = useNear<HTMLElement>();

  useEffect(() => {
    const host = document.getElementById(reactId);
    if (!host || !near) return;
    let cancelled = false;
    let finalize: (() => void) | undefined;

    (async () => {
      try {
        const trimmed = source.trim();
        const spec = trimmed.startsWith("{") || trimmed.startsWith("[") ? JSON.parse(trimmed) : (await import("yaml")).parse(trimmed);
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
  }, [near, reactId, source, theme]);

  return (
    <figure ref={ref} className="chart-block">
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
