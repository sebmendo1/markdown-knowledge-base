# F05 design: Charts

How the chart fence is drawn. Requirements and acceptance names are in `spec.md` on `origin/cursor/spec-charts-metrics-58b3`. This file does not restate them.

## Modules

Built, and kept:

| Module | Role |
| --- | --- |
| `components/blocks.tsx` | `ChartBlock`, `chartConfig`, `usesRemoteData`, `useNear`. Draws one figure. |
| `components/markdown-parts.tsx` | Sends a fence whose info string is `chart`, `vega`, or `vega-lite` to `ChartBlock`. |
| `components/block-editor/views.tsx` | `FenceView` and `FencePreview`. Empty fence, source while editing, preview under the source. |
| `components/block-editor/commands.ts` | Slash item `Chart`. Inserts the starter body. |
| `components/preview-stage.tsx` | The `.preview-pane` that is the intersection root. |
| `app/globals.css`, `app/shape.css` | Figure padding, radius, margin, host height, error type. |

Not started. New modules, called from `ChartBlock` before `vega-embed`:

| Module | Role |
| --- | --- |
| `lib/charts/parse.ts` | Trim, JSON or YAML, walk every string property named `url`. |
| `lib/charts/csv-data.ts` | Turn an allowed `data.url` into inline `data.values`. |
| `lib/charts/metrics-data.ts` | Turn `data.metrics` into inline rows from current metric points. |
| `lib/charts/export-chart.ts` | File stem, SVG download, PNG at 2 image pixels per CSS pixel. |
| `components/blocks.tsx` | `Export` menu on the figure, once F05-REQ-016 is built. |

`lib/markdown/csv.ts` parses comma-separated text. `csv-data.ts` checks the path, then calls that parser. It does not fetch a URL.

## Data

A fence body is a string. After trim, a body that starts with `{` or `[` is JSON. Anything else is YAML.

The parsed value is a Vega-Lite spec. `ChartBlock` passes it to `vega-embed` with `mode: "vega-lite"`, `renderer: "svg"`, `actions: false`, and the tooltip handler left on. There is no mark-type allowlist.

`chartConfig` is the F05-REQ-004 table. `background` and the view stroke are transparent. The font is `Geist, sans-serif`. The default mark color is `#7aa2f7`. The category range, in order, is `#7aa2f7`, `#7dcea0`, `#e6c07b`, `#f0a8a8`, `#c4b5fd`. Theme is `light` when `document.documentElement.dataset.theme` is `light`, and `dark` otherwise.

Client errors, before Vega-Lite runs:

| Code | When |
| --- | --- |
| `chart_remote` | A string property `url` matches `^https?:` |
| `chart_parse` | JSON, YAML, or Vega-Lite throws |
| `chart_source` | `data.url` is not an `assets/` CSV path and not an `http` or `https` URL |
| `chart_data_missing` | The CSV path is not in the space |
| `chart_eval_unknown` | `data.metrics.eval` matches no eval |
| `chart_metric_unknown` | `data.metrics.metric` is not on that eval |

Built fences show the message only. F05-REQ-014 and F05-REQ-015 also show the hint. Until those two are built, a non-HTTP `data.url` and a `data.metrics` object are passed through to Vega-Lite unchanged.

CSV path, once F05-REQ-014 is built: `^assets/[A-Za-z0-9._/-]+\.csv$`, no `..`, no `//`. The first row is the header. Rows become `data.values`. The browser does not request the path.

`data.metrics` is `{ eval, metric }`. `eval` is `slug` or `slug@version`. Each inline row is:

| Field | Type |
| --- | --- |
| `date` | `YYYY-MM-DD` |
| `value` | number |
| `harness` | slug |
| `harness_version` | integer |
| `eval_version` | integer |
| `environment` | string or null |
| `sample_size` | integer or null |
| `verdict` | `supported`, `refuted`, `inconclusive`, or null |
| `experiment` | experiment slug |

Rows are current points: `metric_points.revision_id` equals the experiment's `documents.head_revision_id`. A missing version in `eval` means every current version of that slug, still as separate rows.

Export stem, once F05-REQ-016 is built: the spec `title` lowercased, each run of characters outside `a`–`z` and `0`–`9` replaced by one `-`, trimmed of leading and trailing `-`, cut at 80 Unicode code points. An empty stem is `chart`. Downloads are `{stem}.svg` and `{stem}.png`.

## State

`ChartBlock` holds `error: string | null` and whether the figure is inside the observer (`useNear`). The observer root is the nearest `.preview-pane`, or the viewport. Root margin is `600px` vertically and `0px` horizontally. `vega-embed` loads only after that intersection.

| State | What the figure shows |
| --- | --- |
| Loading | Empty `.chart-host`, minimum height `220px`, no sentence |
| Error | The message. The previous SVG for that figure is removed |
| Success | The SVG. No status sentence |
| Empty, block editor | `Empty chart. Click to write.` `vega-embed` is not called |
| Editing, non-empty | Fence source, and the chart under it |
| Source mode | Fence text. No `figure.chart-block` |

Copy is the same above `860px` and at `390px`. A wide SVG scrolls inside the figure.

An open chart that uses `data.metrics` replaces `data.values` when a merge adds a current point for that eval and metric. The page does not reload.

## Contracts

F05 does not add a table. It reads two that `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c` already defines:

- `assets (space_id, path)` for the CSV file behind an allowed `data.url`. The chart path rule is the one in F05-REQ-014. The `assets_path_shape` check is lowercase. A path that fails that check is `chart_data_missing` or `chart_source`, and the file is not read.
- `metric_points`, joined to `documents.head_revision_id`, for `data.metrics`. The chart index is `metric_points_chart` on `(space_id, eval_slug, eval_version, metric_key, date)`. Point columns are the F16 point table. `unit` and `better` are not on the row.

The embedder is `vega-embed` `^7.2.0`, Vega-Lite `^6.4.3`, Vega `^6.4.0`. Theme colors in `chartConfig` match the table in the spec. Figure radius `18px` is the shared block rule in `app/shape.css` (ADR-0007).

F06 owns `chart_invalid`. This feature does not emit it. F16 owns the Metrics screen. F05-REQ-015 only embeds the rows that screen uses.
