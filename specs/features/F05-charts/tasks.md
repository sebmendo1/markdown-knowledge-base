# F05 tasks: Charts

Dependency order. Each step names the requirements it satisfies, the test that proves them, and a size. Size is one module, several modules, or a schema change. No step lacks a requirement.

## 1. Draw an inline fence

Satisfies: F05-REQ-001, F05-REQ-002, F05-REQ-003, F05-REQ-012, F05-REQ-013.

Size: several modules (`components/blocks.tsx`, `components/markdown-parts.tsx`, `components/block-editor/views.tsx`).

Tests:

- F05-AC-001a, F05-AC-001b, F05-AC-001c in `lib/charts/fence.test.ts`
- F05-AC-002a, F05-AC-002b in `lib/charts/parse.test.ts`
- F05-AC-003a in `lib/charts/embed-options.test.ts`
- F05-AC-012a in `lib/charts/fence.test.ts`
- F05-AC-013a in `lib/charts/fence.test.ts`

`ChartBlock` trims the body, parses JSON or YAML, and calls `vega-embed` with `mode` `vega-lite`, `renderer` `svg`, and `actions` `false`. The tooltip handler stays on. Source mode does not call the embedder. A `mark: rect` heatmap is not rejected.

## 2. Apply the theme

Satisfies: F05-REQ-004.

Size: one module (`components/blocks.tsx`, `chartConfig`).

Tests: F05-AC-004a, F05-AC-004b in `lib/charts/theme.test.ts`.

Depends on step 1. `light` follows `dataset.theme`. Any other value, including absent, is the dark column.

## 3. Load the embedder on intersection

Satisfies: F05-REQ-005.

Size: one module (`components/blocks.tsx`, `useNear`).

Tests: F05-AC-005a, F05-AC-005b in `lib/charts/lazy.test.ts`.

Depends on step 1. Root is the nearest `.preview-pane` from `components/preview-stage.tsx`, or the viewport. Margin is `600px` top and bottom, `0px` left and right.

## 4. Refuse a remote URL and surface a thrown error

Satisfies: F05-REQ-006, F05-REQ-007.

Size: one module (`components/blocks.tsx`).

Tests: F05-AC-006a, F05-AC-006b, F05-AC-007a, F05-AC-007b in `lib/charts/errors.test.ts`.

Depends on step 1. `usesRemoteData` walks every string property named `url`. A match on `^https?:` does not call `vega-embed`. A throw removes the previous SVG. The built message has no code and no hint.

## 5. Empty and editing fences in the block editor

Satisfies: F05-REQ-008, F05-REQ-009.

Size: one module (`components/block-editor/views.tsx`).

Tests: F05-AC-008a, F05-AC-009a in `lib/charts/editor-fence.test.ts`.

Depends on step 1. An empty or whitespace body shows `Empty chart. Click to write.` and does not call `vega-embed`. A non-empty fence that is being edited shows the source and draws under it.

## 6. Insert the Chart starter

Satisfies: F05-REQ-010.

Size: one module (`components/block-editor/commands.ts`).

Test: F05-AC-010a in `lib/charts/starter.test.ts`.

The slash item `Chart` inserts info string `chart` and the YAML body in F05-AC-010a. `STARTERS.chart` is that body.

## 7. Figure chrome

Satisfies: F05-REQ-011.

Size: several modules (`components/blocks.tsx`, `app/globals.css`, `app/shape.css`).

Test: F05-AC-011a in `lib/charts/chrome.test.ts`.

Depends on step 1. The figure is `figure.chart-block`: padding `12px`, radius `18px`, bottom margin `1.15em`, horizontal overflow. The host is `.chart-host` with minimum height `220px`. An error paragraph is `13px`, danger color, `8px` under it. The same test asserts that error paragraph against the message from F05-AC-007a.

## 8. Read a CSV in assets

Satisfies: F05-REQ-014.

Size: several modules (`lib/charts/csv-data.ts`, `lib/charts/parse.ts`, `components/blocks.tsx`).

Tests: F05-AC-014a, F05-AC-014b, F05-AC-014c in `lib/charts/csv-data.test.ts`.

Depends on steps 1 and 4. An allowed `data.url` is read from the space `assets/` and embedded as `data.values`. A missing file is `chart_data_missing`. A path that is not an allowed CSV and not `http` or `https` is `chart_source` and is not read. An `http` or `https` URL stays on step 4.

## 9. Embed current metric points

Satisfies: F05-REQ-015.

Size: several modules (`lib/charts/metrics-data.ts`, `components/blocks.tsx`).

Tests: F05-AC-015a, F05-AC-015b, F05-AC-015c in `lib/charts/metrics-data.test.ts`.

Depends on steps 1 and 8, and on F16 step 2 (current points). `data.metrics` is replaced with inline rows. An open chart refreshes after a merge adds a matching current point, without a full page reload. An unknown eval is `chart_eval_unknown`. An unknown metric key is `chart_metric_unknown`.

## 10. Export PNG and SVG

Satisfies: F05-REQ-016.

Size: several modules (`lib/charts/export-chart.ts`, `components/blocks.tsx`).

Tests: F05-AC-016a, F05-AC-016b in `lib/charts/export-chart.test.ts`.

Depends on step 1. The figure has an `Export` menu with `PNG` and `SVG`. SVG is the chart markup. PNG is rasterized at 2 image pixels per CSS pixel. The stem rule is in the design.
