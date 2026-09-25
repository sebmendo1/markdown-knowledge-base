# F05: Charts

## Summary

A chart fence draws a Vega-Lite spec in the document. Inline values draw today. A CSV in `assets/`, a live metrics query, and PNG or SVG export are specified here and are not started.

## Status and scope

Partly built. Inline Vega-Lite is built and was checked against the code on `main`: `components/blocks.tsx` (`ChartBlock`), `components/markdown-parts.tsx`, `components/block-editor/views.tsx`, `components/block-editor/commands.ts`, `components/preview-stage.tsx`, `app/globals.css`, and `app/shape.css`.

Built, and required now: F05-REQ-001 through F05-REQ-013. Not started: F05-REQ-014 (CSV in `assets/`), F05-REQ-015 (metrics-backed data), and F05-REQ-016 (PNG and SVG export). Those three describe the target. The running app does not resolve them.

This spec covers chart fences in a document. The Metrics screen, metric points, and harness comparison are F16. The `chart_invalid` warning is F06. The slash menu chrome is F09; this spec owns the chart bytes that menu inserts today. The review inbox is out of scope.

The product name in the UI is markdown-kb. A page is `/{project}/{page-path}` (ADR-0001).

## Users and stories

- **F05-US-001** As a reader, I want a Vega-Lite fence to draw in the page, so that a chart is part of the document.
- **F05-US-002** As the owner, I want the slash menu to insert a chart, so that I start from a valid inline spec.
- **F05-US-003** As a reader, I want a chart to read a CSV in `assets/` or the space's metric points, so that the figure can follow the evidence.
- **F05-US-004** As a reader, I want to export the drawn chart as PNG or SVG, so that I can take the figure out of the page.

## Requirements

- **F05-REQ-001** When a fenced block has info string `chart`, `vega`, or `vega-lite`, the system shall draw it with Vega-Lite in the document preview, in the block editor, and in any other Markdown view that uses the shared fence renderer. When the document is in source mode, the system shall show the fence as editor text and shall not call the chart embedder.
- **F05-REQ-002** When a chart fence is drawn, the system shall trim the fence body and parse it as JSON when the trimmed text starts with `{` or `[`, and as YAML otherwise.
- **F05-REQ-003** When a chart fence is drawn, the system shall call `vega-embed` with `mode` `vega-lite`, `renderer` `svg`, and `actions` `false`.
- **F05-REQ-004** When a chart fence is drawn, the system shall apply the theme config in the table below. The theme is `light` when `document.documentElement.dataset.theme` is `light`, and `dark` otherwise.
- **F05-REQ-005** The system shall load `vega-embed` only after the chart figure intersects the observer, and shall not load it before that. The observer root is the nearest ancestor with class `preview-pane`, or the viewport when there is no such ancestor. The root margin is `600px` vertically and `0px` horizontally.
- **F05-REQ-006** If any string property named `url` in the parsed spec matches `^https?:` (ASCII case-insensitive), then the system shall not call `vega-embed` and shall show the message `Charts can only use inline data.`
- **F05-REQ-007** If parsing or embedding throws, then the system shall show that error's message, or `Chart could not be drawn.` when the throw is not an `Error`, and shall remove the previous SVG for that figure.
- **F05-REQ-008** While a `chart`, `vega`, or `vega-lite` fence in the block editor has an empty or whitespace-only body, the system shall show `Empty chart. Click to write.` and shall not call `vega-embed`.
- **F05-REQ-009** While the reader is editing a non-empty chart fence in the block editor, the system shall show the fence source and shall draw the chart under that source.
- **F05-REQ-010** When the reader chooses the slash item `Chart`, the system shall insert a fence with info string `chart` and the starter body in F05-AC-010a.
- **F05-REQ-011** The system shall draw the chart in a `figure` of class `chart-block` with padding `12px`, border radius `18px`, bottom margin `1.15em`, and horizontal overflow scrolling, containing a host of class `chart-host` with minimum height `220px`. An error paragraph uses `13px` type and the danger color, with `8px` of space under it.
- **F05-REQ-012** The system shall draw every mark type the installed Vega-Lite accepts, including line, bar, area, scatter, stacked, grouped, histogram, heatmap, box plot, layered, and faceted specs, and shall not keep an allowlist of mark types.
- **F05-REQ-013** When a chart fence is drawn, the system shall leave the `vega-embed` tooltip handler on.
- **F05-REQ-014** When chart CSV data is built and `data.url` is a path that matches `^assets/[A-Za-z0-9._/-]+\.csv$`, contains no `..`, and contains no `//`, the system shall read that file from the space's `assets/`, parse it as comma-separated text whose first row is the header, and embed the rows as inline `data.values`. If `data.url` is not an `http` or `https` URL and does not match that path, the system shall not embed and shall show `Chart uses a data source that is not allowed.` An `http` or `https` URL stays on F05-REQ-006. This requirement is not started.
- **F05-REQ-015** When metrics-backed charts are built and the spec has `data.metrics` with `eval` and `metric`, the system shall replace that object with inline `data.values` from the current metric points for that eval and metric, and shall refresh an open chart after a merge adds a matching point, without a full page reload. This requirement is not started.
- **F05-REQ-016** When PNG and SVG export are built, the system shall put an `Export` menu on the chart figure with actions `PNG` and `SVG`. This requirement is not started.

### Theme config (F05-REQ-004)

Sizes are CSS pixels. `background` is transparent. The view stroke is transparent. The font is `Geist, sans-serif`. The default mark color is `#7aa2f7`. The category range, in order, is `#7aa2f7`, `#7dcea0`, `#e6c07b`, `#f0a8a8`, `#c4b5fd`.

| Property | Light | Dark |
| --- | --- | --- |
| Axis label, axis title, legend label | `#5c5c5c` | `#a1a1a1` |
| Axis domain, axis tick | `#d5d5d0` | `#2a2a2a` |
| Axis grid | `#e6e6e1` | `#222222` |
| Legend title, chart title | `#1c1c1c` | legend `#cfcfcf`, title `#ececec` |
| Axis label size | `11px` | `11px` |
| Axis title size | `12px` | `12px` |
| Chart title size | `13px`, weight normal, anchor start | `13px`, weight normal, anchor start |

## Acceptance scenarios

### F05-AC-001a

Given a fence whose info string is `chart` and whose body is the starter in F05-AC-010a, when the document is in preview, then the page contains a `figure.chart-block` with an SVG drawn by Vega-Lite.

### F05-AC-001b

Given the same fence with info string `vega` or `vega-lite`, when the document is in preview, then each draws a `figure.chart-block`.

### F05-AC-001c

Given the same fence, when the document is in source mode, then the editor shows the fence text and the page has no `figure.chart-block` for that fence.

### F05-AC-002a

Given a fence body that starts with `{` and is valid JSON for a bar chart with inline `data.values`, when the chart draws, then the bars match those values.

### F05-AC-002b

Given a fence body that starts with `title:` and is valid YAML for the same bar chart, when the chart draws, then the bars match those values.

### F05-AC-003a

Given a drawn chart, when the embed options are inspected, then `mode` is `vega-lite`, `renderer` is `svg`, and `actions` is `false`.

### F05-AC-004a

Given `dataset.theme` is `light`, when a chart draws, then the axis label color is `#5c5c5c` and the axis label size is `11px`.

### F05-AC-004b

Given `dataset.theme` is absent, when a chart draws, then the axis label color is `#a1a1a1` and the chart title color is `#ececec`.

### F05-AC-005a

Given a chart figure more than `600px` below the preview pane's visible area, when the page finishes loading, then `vega-embed` has not been requested.

### F05-AC-005b

Given that figure, when it comes within `600px` of the preview pane's visible area, then `vega-embed` loads and the chart draws.

### F05-AC-006a

Given a spec whose `data.url` is `https://example.com/data.json`, when the fence renders, then the message is `Charts can only use inline data.` and `vega-embed` is not called.

### F05-AC-006b

Given a spec whose nested layer has `url: "HTTP://example.com/a.csv"`, when the fence renders, then the message is `Charts can only use inline data.`

### F05-AC-007a

Given a fence body `{`, when the fence renders, then the error paragraph shows the JSON parser message and the host has no SVG.

### F05-AC-007b

Given a chart that has drawn an SVG, when the body is changed to `{`, then the previous SVG is removed and the error paragraph is shown.

### F05-AC-008a

Given edit mode and a `chart` fence whose body is empty, when the block is shown, then the text is `Empty chart. Click to write.` and `vega-embed` is not called.

### F05-AC-009a

Given edit mode and a `chart` fence whose body is the starter, when the reader is editing that block, then the source text is visible and a chart is drawn under it.

### F05-AC-010a

Given the slash menu, when the reader chooses `Chart`, then the inserted fence info string is `chart` and the body is exactly:

```yaml
title: Example
data:
  values:
    - { label: A, value: 3 }
    - { label: B, value: 5 }
mark: bar
encoding:
  x: { field: label, type: nominal }
  y: { field: value, type: quantitative }
```

### F05-AC-011a

Given a drawn chart, when its figure is measured, then the padding is `12px`, the border radius is `18px`, the host's minimum height is `220px`, and the figure's bottom margin is `1.15em`.

### F05-AC-012a

Given a spec with `mark: rect` and a heatmap encoding that Vega-Lite 6 accepts, when the fence renders, then the chart draws and the spec is not rejected for its mark type.

### F05-AC-013a

Given a drawn bar chart, when the pointer hovers a bar, then a tooltip shows the encoded fields.

### F05-AC-014a

Given CSV data is built and `assets/scores.csv` is `label,value` then `A,3` then `B,5`, and the spec is `data:` / `url: assets/scores.csv` with `mark: bar` and encodings `label` and `value`, when the fence renders, then the bars are `3` and `5` and the browser does not request an external URL.

### F05-AC-014b

Given CSV data is built and the spec's `data.url` is `assets/missing.csv`, when the fence renders, then the code is `chart_data_missing`, the message is `No CSV at assets/missing.csv.`, and the hint is `Add the file under assets/, or use inline values.`

### F05-AC-014c

Given CSV data is built and the spec's `data.url` is `../secret.csv`, when the fence renders, then the code is `chart_source`, the message is `Chart uses a data source that is not allowed.`, the hint is `Use inline data, a CSV in assets/, or a metrics query.`, and the file is not read.

### F05-AC-015a

Given metrics-backed charts are built, the current points for `summary-faithfulness` version `2` metric `faithfulness` are one row with `value` `0.82`, and the spec is the metrics example under F05-REQ-015, when the fence renders, then the drawn point's `value` is `0.82`.

### F05-AC-015b

Given that chart is open, when a merge adds a current point with `value` `0.91` for the same eval version and metric, then the chart shows `0.91` without a full page reload.

### F05-AC-015c

Given metrics-backed charts are built and `data.metrics.metric` is `bleu` on an eval that defines only `faithfulness`, when the fence renders, then the code is `chart_metric_unknown`, the message is `bleu is not a metric on summary-faithfulness.`, and the hint is `Use a key from that eval's metrics list.`

### F05-AC-016a

Given PNG and SVG export are built and a chart has drawn, when the reader chooses `Export` then `SVG`, then the download is an `.svg` file of the chart's SVG markup.

### F05-AC-016b

Given the same chart, when the reader chooses `PNG`, then the download is a `.png` file rasterized at `2` image pixels per CSS pixel.

## Edge cases and errors

The built chart shows the message and does not show a code or a hint. The code and the hint are the catalog for tests and for the not-started cases, which show both. Server validation remains `chart_invalid` on F06. This client list does not replace that warning.

| Code | Severity | When | Message | Hint |
| --- | --- | --- | --- | --- |
| `chart_remote` | Error | A string property `url` matches `^https?:` | `Charts can only use inline data.` | `Put the values in data.values.` |
| `chart_parse` | Error | JSON, YAML, or Vega-Lite throws | The thrown message, or `Chart could not be drawn.` | `Fix the Vega-Lite spec.` |
| `chart_source` | Error | F05-REQ-014 and `data.url` is not an `assets/` CSV path and not an `http` or `https` URL | `Chart uses a data source that is not allowed.` | `Use inline data, a CSV in assets/, or a metrics query.` |
| `chart_data_missing` | Error | F05-REQ-014 and the CSV path is not in the space | `No CSV at {path}.` | `Add the file under assets/, or use inline values.` |
| `chart_eval_unknown` | Error | F05-REQ-015 and the eval slug matches no eval | `No eval "{slug}".` | `Use an eval in this space.` |
| `chart_metric_unknown` | Error | F05-REQ-015 and the key is not on that eval | `{key} is not a metric on {eval}.` | `Use a key from that eval's metrics list.` |

Until F05-REQ-014 and F05-REQ-015 are started, a `data.url` that is not an `http` or `https` URL, and a `data.metrics` object, are handed to Vega-Lite unchanged. The built app does not read `assets/` for a chart and does not query metric points.

A `data.metrics` object has this shape. `eval` is `slug` or `slug@version`. `metric` is the metric key.

```yaml
title: Faithfulness by harness version
data:
  metrics: { eval: summary-faithfulness@2, metric: faithfulness }
mark: { type: line, point: true }
encoding:
  x: { field: date, type: temporal }
  y: { field: value, type: quantitative }
  color: { field: harness_version, type: nominal }
```

When F05-REQ-015 is started, each inline row has `date` (`YYYY-MM-DD`), `value` (a number), `harness` (slug), `harness_version` (an integer), `eval_version` (an integer), `environment` (a string or null), `sample_size` (an integer or null), `verdict` (`supported`, `refuted`, `inconclusive`, or null), and `experiment` (the experiment slug). The rows are the current points from F16: `revision_id` is the experiment's head. A missing eval version in `eval` means every current version of that slug, still as separate rows.

Export file names, once F05-REQ-016 is started: if the spec `title` is a non-empty string, the stem is that title lowercased, with each run of characters outside `a`–`z`, `0`–`9` replaced by one `-`, trimmed of leading and trailing `-`, and cut at `80` characters. If the stem is empty, it is `chart`. The downloads are `{stem}.svg` and `{stem}.png`.

An empty chart fence in the reading view, outside the block editor, is F05-REQ-007. It does not use the `Empty chart. Click to write.` sentence.

## Limits and budgets

| Limit | Value |
| --- | --- |
| Vega-Lite | Major version 6, the `vega-lite` the app already depends on (`^6.4.3` on `main`) |
| Vega | The `vega` the app already depends on (`^6.4.0`) |
| Embedder | `vega-embed` (`^7.2.0`), loaded only after the intersection in F05-REQ-005 |
| Lazy root margin | `600px` top and bottom, `0px` left and right |
| Chart host | Minimum height `220px` |
| Figure padding | `12px` |
| Figure radius | `18px` |
| Figure margin | `1.15em` on the bottom, from the shared block rule |
| Error type | `13px` |
| PNG scale | `2` image pixels per CSS pixel, when F05-REQ-016 is started |
| Export stem | At most `80` characters. A character is one Unicode code point |
| Mark-type allowlist | None. Vega-Lite 6 decides |

The PRD sets no latency number for drawing a chart. See F05-Q-001. The built chart does not cache the SVG by content hash.

## UI states

Copy is the same at a desktop viewport wider than `860px` and at a phone viewport of `860px` or narrower, including `390px`. The figure scrolls horizontally inside itself when the SVG is wider than the column.

| State | Where | Copy |
| --- | --- | --- |
| Empty | Block editor, blank chart fence | `Empty chart. Click to write.` |
| Loading | Figure is not yet inside the `600px` margin | The host is empty. No sentence. Minimum height `220px` |
| Error | Parse, embed, remote URL, or a not-started data failure | The message from the error table. Not-started failures also show the hint |
| Success | Spec embedded | The SVG. No status sentence |
| Partial | Not used | A chart either draws or shows the error. The previous SVG does not stay |

Source mode has no chart state. It shows the fence text.

## Out of scope

- The Metrics screen, metric-point rows, the baseline mean, and harness comparison (F16). F05-REQ-015 only embeds the rows F16 defines.
- The `chart_invalid` warning, including the Vega-Lite schema check on the server (F06).
- Turning a selected Markdown table into a chart, and slash items that start a metrics chart or a CSV chart (F09). The built `Chart` item is F05-REQ-010.
- Keeping the last successful SVG above a later error (F09). The built behavior is F05-REQ-007.
- A side-by-side chart in the review inbox (F12). `<!-- prd:charts-in-review -->` (lines 416–419).
- A static SVG snapshot stored under a chart when the space is exported (F19).
- Caching the rendered SVG by content hash. It is not built. F05-Q-002 holds it.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F05-Q-001 | What latency should one chart draw meet? | Under `500 ms` at the 95th percentile from intersection to SVG, for the starter spec, on desktop Chrome over localhost, with `vega-embed` already cached. | Product owner | A performance test. Not a requirement until confirmed |
| F05-Q-002 | Should the drawn SVG be cached by a hash of the source plus the theme? | Yes, in memory for the page, keyed by the SHA-256 of the UTF-8 fence body plus `light` or `dark`. No byte cap until the owner sets one. | Product owner | A cache requirement. Not started, and not a requirement until confirmed |

## Trace

- PRD anchors (`origin/cursor/rebuild-prd-tables-f4c0`, `specs/source/ledger-prd.md`): `<!-- prd:charts -->` (lines 394–409), the Charts row of `<!-- prd:supported-syntax -->` (line 383), `<!-- prd:performance-and-safety -->` (lines 420–423), the Charts row of `<!-- prd:stack -->` (line 697). The slash starter and "chart from table" lines in `<!-- prd:editor-support -->` (lines 410–415) are F09 except the built `Chart` item in F05-REQ-010. `<!-- prd:charts-in-review -->` (lines 416–419) is F12.
- Decisions: none of D1–D8 change the chart engine.
- Change requests: none.
- ADRs: ADR-0001 (routes and the product name). ADR-0007 is the `18px` block radius already in `app/shape.css`. Metric-point fields used by F05-REQ-015 are ADR-0026 and ADR-0027 as applied in F16.
- Depends on F04 for Markdown fences. Depends on F16 for the rows in F05-REQ-015. The server warning is F06-REQ-024.
