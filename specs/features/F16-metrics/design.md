# F16 design: Metrics

How a concluded experiment becomes metric points, and how the Metrics screen plots them. Requirements are in `spec.md` on `origin/cursor/spec-charts-metrics-58b3`.

## Modules

| Module | Role |
| --- | --- |
| `lib/metrics/points.ts` | Builds the `p_metric_points` array for one experiment revision. Drops keys whose value is not a finite number. |
| `lib/metrics/current.ts` | Reads current points: `metric_points.revision_id` is `documents.head_revision_id`. |
| `lib/metrics/baseline.ts` | Baseline mean, delta, arrow, and color. |
| `lib/metrics/stats.ts` | `n`, mean, median, min, max, best, latest. Exact numeric division. |
| `lib/metrics/series.ts` | Groups a line by `eval_version` and `harness_version`. Orders by `date`, then experiment slug. |
| `lib/metrics/format.ts` | Display decimals, `+` and `-`, blank delta. |
| `components/metrics/metrics-screen.tsx` | Controls, chart, harness table, compare. |
| `app/[project]/metrics/page.tsx` | Route `/{project}/metrics`. |

The chart frame reuses `ChartBlock` in `components/blocks.tsx` (F05): same `vega-embed` options and `chartConfig`. Series color is the F05 category list, assigned by `harness_version` ascending, repeating every 5 versions.

The merge path does not insert rows itself. It fills `p_metric_points` and calls `append_revision` in `specs/contracts/db.sql`. That function inserts the rows in the same transaction as the revision when `type` is `experiment` and `status` is `concluded`.

## Data

One point is one `metric_points` row. Columns, and only these columns:

| Column | Source on the experiment |
| --- | --- |
| `space_id` | The experiment's space |
| `experiment_document_id` | The experiment document |
| `revision_id` | The revision this merge inserted |
| `eval_slug`, `eval_version` | Pinned link `[[slug@version]]` |
| `metric_key` | A `results` key |
| `value` | That key, `numeric`, exact |
| `harness_slug`, `harness_version` | Pinned link `[[slug@version]]` |
| `date` | Frontmatter `date`, a calendar date |
| `environment` | Frontmatter, or null |
| `sample_size` | Frontmatter, or null |
| `verdict` | `supported`, `refuted`, `inconclusive`, or null |

`unit` and `better` stay on the eval. A point is unique on (`experiment_document_id`, `revision_id`, `metric_key`).

`p_metric_points` is a JSON array of those fields except `space_id`, `experiment_document_id`, and `revision_id`. `append_revision` fills those three. The record shape is the `jsonb_to_recordset` list in that function.

Current points are the rows whose `revision_id` equals the experiment's `head_revision_id`. Older rows stay in the table. A later merge that is not `concluded` writes no new rows, so the chart omits that experiment.

The screen query is `eval`, `metric`, and `version` on `/{project}/metrics`. `version` is `all` or an integer from `1` to `999999999`. A missing `version` is `all`.

Defaults when the query is absent:

| Control | Default |
| --- | --- |
| Eval | Slug inside `.ledger/space.md` frontmatter `default_eval` when that value is `[[slug]]` or `[[slug@version]]` and the slug is an eval. Otherwise no selection |
| Eval version | `all` |
| Metric | First key in `metrics` on the pinned `default_eval` version, or on the eval head when the link has no `@version` |

`unit` and `better` come from `revision_for_version` on the eval: the earliest revision whose `version` equals the point's `eval_version`. The y-axis title is `{key} ({unit})` when `unit` is a non-empty string, and `{key}` otherwise.

Baseline for metric `M` on eval `E` at version `V`: read that eval version's `baseline` link as harness `H` at version `B`. The value is the arithmetic mean of `results[M]` over current points of experiments where `status` is `concluded`, the eval link is `[[E@V]]`, the harness link is `[[H@B]]`, and `results[M]` is a finite number. Sum divided by count, no rounding before a delta uses it. Count `0`, or no `[[slug@version]]` baseline, means no dashed line and a blank delta. A blank cell is empty. It is not `0`, not an em dash, and not an arrow.

Delta is compared value minus baseline. `better: higher` paints a positive delta as `▲` in green and a negative delta as `▼` in red. `better: lower` swaps that. A zero delta has no arrow and uses the default text color. Displayed numbers drop trailing zeros after the decimal point. A whole number has no decimal point. A positive delta has a leading `+`.

The harness table, for one eval version, has one row per `harness_version` with a current point. Columns: `Harness`, `n`, `Mean`, `Median`, `Min`, `Max`, `Best`, `Latest`, `Delta vs baseline`. When `version` is `all`, one section per eval version, headed `Eval v{version}`. Numbers are not pooled across versions.

`n` is the count of current points in the row. Mean is the exact sum divided by `n`. Median is the middle value after sorting ascending when `n` is odd, and the exact mean of the two central values when `n` is even. Best is max when `better` is `higher`, and min when `better` is `lower`. Latest is the last point in the line order: `date` ascending, then experiment slug ascending. An `inconclusive` point is included in every one of those.

Compare takes harness versions A and B and lists every metric on one eval version: A's mean, B's mean, and B's mean minus A's mean, with the same arrow rule. When the version control is `all`, that eval version is the pin on `default_eval`, or the greatest eval version when the link has no pin. A metric with no point for B leaves the B cell and the delta blank.

Errors:

| Code | When |
| --- | --- |
| `metrics_eval_unknown` | `eval` matches no eval |
| `metrics_metric_unknown` | `metric` is not on the selected eval version, or on any included version when `version` is `all` |
| `metrics_unavailable` | The point query fails |
| `permission_denied` | The caller is an agent key or an OAuth grant |

## State

The screen is client state over the query string. Changing a control writes `eval`, `metric`, and `version`.

| State | Copy |
| --- | --- |
| Empty, no eval | `No evals yet. Add an eval, then merge a concluded experiment.` |
| Empty, none selected | `Pick an eval.` |
| Empty, no metric keys | `This eval has no metrics.` |
| Empty, no current points | `No concluded experiments for this metric.` |
| Loading | `Loading metrics…` on a skeleton of the controls, the chart, and the table |
| Error | The message, then the hint |
| Partial | Chart and table, blank deltas, no dashed line, no extra banner |
| Success | Chart, harness table, compare. No status sentence |

One current point is success: the point is drawn and `n` is `1`.

Copy is the same above `860px` and at `390px`. At `860px` or narrower the controls stack, and the chart and tables scroll horizontally inside their frames.

The accessible name is `Metrics`. Labels are `Eval`, `Eval version`, `Metric`, `Version A`, and `Version B`. The all-versions option is `All versions`. Compare sits under the harness table.

Keyboard: controls, chart points, and table rows are in order. `J` and `K` move one row in the harness table. Enter on a point opens that experiment. Enter on a row opens the experiment that supplied Latest.

Hover on a point shows the experiment title, the value with its unit, and `sample size 40` or `sample size —`. Activating a point opens `/{project}/{page-path}`.

While the screen is open, a merge that inserts a current point for the selected eval and metric runs `current.ts` again and replaces the chart and table. The document does not reload.

While sign-in is not built, the person at the keyboard opens the screen and no role is checked. When sign-in is built, Owner, Editor, Contributor, and Viewer may open it. An agent key or an OAuth grant receives `permission_denied` and does not see the screen.

## Contracts

From `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c`:

- `metric_points` and `metric_points_identity`. No `unit` or `better` column. `metric_points_no_update` refuses an in-place change. A new revision gets new rows.
- `append_revision(..., p_metric_points jsonb)` inserts those rows only when frontmatter `type` is `experiment` and `status` is `concluded`. `planned`, `running`, and `abandoned` insert nothing, which is F16-REQ-002. The insert is in the same transaction as the revision (F07-REQ-011).
- `documents.head_revision_id` is the current revision. The chart and the table read only that join.
- `revision_for_version(document_id, version)` is the earliest revision at that version (ADR-0017), used for `unit` and `better`.
- `metric_points_chart` on `(space_id, eval_slug, eval_version, metric_key, date)` is the screen's read index.
- `links` holds the eval, harness, and baseline pins. The baseline set does not search for a harness version other than `B`.

`create_document` takes the same `p_metric_points` array. A human direct save is not F16-REQ-001. F16-Q-001 records the recommended follow-up. This design does not add that call.

The route has no space segment and no `/memento` prefix (ADR-0001).
