# F16: Metrics

## Summary

A concluded experiment writes one metric point per result when it merges, and the Metrics screen plots those points over time. The baseline is the mean of the baseline harness, and two experiments on the same date stay two points.

## Status and scope

Not started. The app has no metric points, no Metrics route, and no harness comparison. Inline Vega-Lite fences are F05 and are already built. This spec is the target for milestone 5.

This spec covers the point rows inserted on merge, the Metrics screen, the baseline value, delta versus that baseline, and repeated experiments on one date. It follows Proposed ADR-0026 and Proposed ADR-0027. The merge transaction that inserts the rows is F07-REQ-011. The table shape is `metric_points` in `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c`. Validation of `results` is F06. The review inbox is out of scope.

The product name in the UI is markdown-kb. The screen is `/{project}/metrics`, with no space segment (ADR-0001).

## Users and stories

- **F16-US-001** As the owner, I want a concluded experiment's results to become metric points when I merge it, so that the numbers are not entered twice.
- **F16-US-002** As the owner, I want the Metrics screen to show one metric over time by harness version, so that I can see whether the work is getting better.
- **F16-US-003** As the owner, I want a dashed baseline and a delta against it, so that a result is compared with the eval's baseline harness.
- **F16-US-004** As the owner, I want two harness versions side by side on every metric, so that I can choose between them.

## Requirements

- **F16-REQ-001** When a merge commits an experiment whose `status` is `concluded`, the system shall insert one `metric_points` row per `results` key whose value is a finite number, in the same transaction as the new revision (F07-REQ-011).
- **F16-REQ-002** If the merged experiment's `status` is `planned`, `running`, or `abandoned`, then the system shall insert no `metric_points` row for the new revision.
- **F16-REQ-003** The system shall store each point with the columns in the point table below, and shall not store `unit` or `better` on the row.
- **F16-REQ-004** When a later merge of that experiment commits, the system shall insert points for the new revision when F16-REQ-001 applies, shall leave rows for earlier revisions in the table, and shall treat as current only the rows whose `revision_id` is the document's `head_revision_id`.
- **F16-REQ-005** The system shall serve the Metrics screen at `/{project}/metrics`. The query string is `eval`, `metric`, and `version`, as in F16-REQ-007.
- **F16-REQ-006** While sign-in is not built, the system shall open the Metrics screen for the person at the keyboard and shall not check a role. When sign-in is built, the system shall open it for the Owner, Editor, Contributor, and Viewer roles.
- **F16-REQ-007** The system shall select the eval, the eval version, and the metric from the screen controls, defaulting as in the selection table below.
- **F16-REQ-008** The system shall draw one Vega-Lite line chart of the current points for the selected eval slug and metric. The x-axis is the experiment `date`. The y-axis is `value`. Each point is colored by `harness_version`.
- **F16-REQ-009** The system shall connect a line only through points that share both `eval_version` and `harness_version`, in `date` ascending order and, for equal dates, experiment slug ascending. Two points may share the same x position. The system shall not average or drop a point because it shares a date, a harness version, or both.
- **F16-REQ-010** When `verdict` is `inconclusive`, the system shall draw that point hollow: no fill, and a stroke in the series color. The system shall still include that point in `n`, the mean, the median, min, max, best, and latest.
- **F16-REQ-011** For metric `M` on eval `E` at version `V`, the system shall read that eval version's `baseline` link as harness `H` at version `B`. The baseline value is the arithmetic mean of `results[M]` over current points of experiments where `status` is `concluded`, the eval link is `[[E@V]]`, the harness link is `[[H@B]]`, and `results[M]` is a finite number. The mean is the sum divided by the count, with exact numeric division and no rounding before a delta uses it.
- **F16-REQ-012** If the baseline count is `0`, or the eval version has no `baseline` link of the form `[[slug@version]]`, then the system shall draw no dashed baseline and shall leave every delta for that eval version blank.
- **F16-REQ-013** The system shall draw the baseline as a dashed horizontal line at the baseline value across the chart's x domain, once per eval version that is on the chart and that has a baseline count of at least `1`.
- **F16-REQ-014** The system shall compute delta as the compared value minus the baseline value. If the metric's `better` is `higher`, a positive delta is an improvement and a negative delta is a regression. If `better` is `lower`, a negative delta is an improvement and a positive delta is a regression. An improvement is `▲` in green. A regression is `▼` in red. A zero delta has no arrow and uses the default text color.
- **F16-REQ-015** The system shall show a harness comparison table. When one eval version is on the chart, there is one row per `harness_version` that has a current point. When `version` is `all`, there is one section per eval version, headed `Eval v{version}`, and the system shall not pool numbers across eval versions. Columns are `Harness`, `n`, `Mean`, `Median`, `Min`, `Max`, `Best`, `Latest`, and `Delta vs baseline`. Cell values are the exact decimals. The y-axis carries the unit.
- **F16-REQ-016** The system shall set `n` to the count of current points in the row. Mean is the exact sum divided by `n`. Median is the middle value after sorting values ascending when `n` is odd, and the exact mean of the two central values when `n` is even. Min is the smallest value. Max is the largest. Best is the max when `better` is `higher`, and the min when `better` is `lower`. Latest is the value of the last point in the F16-REQ-009 order. Delta versus baseline is the row's mean minus the baseline value from F16-REQ-011.
- **F16-REQ-017** When the reader picks harness version A and harness version B, the system shall show every metric on one eval version, with A's mean, B's mean, and the delta of B's mean minus A's mean, using F16-REQ-014 for color and arrows. If the version control is `all`, that eval version is the pinned version on `default_eval`, or the greatest eval version when the link has no pin.
- **F16-REQ-018** When the pointer hovers a point, the system shall show the experiment title, the value, and the sample size. When the reader activates a point, the system shall open that experiment at `/{project}/{page-path}`.
- **F16-REQ-019** When a merge inserts a current point for the eval and metric on an open Metrics screen, the system shall show that point on the chart and in the table without a full page reload.
- **F16-REQ-020** The system shall show `n`, mean, median, min, and max, and shall not compute or show a significance test, a confidence interval, or a p-value.
- **F16-REQ-021** The system shall look up `unit` and `better` from the earliest revision of the eval whose `version` equals the point's `eval_version` (F07-REQ-027). The y-axis title is `{key} ({unit})` when `unit` is a non-empty string, and `{key}` otherwise.

### Point columns (F16-REQ-003)

| Column | Source |
| --- | --- |
| `space_id` | The experiment's space |
| `experiment_document_id` | The experiment document |
| `revision_id` | The revision this merge inserted |
| `eval_slug`, `eval_version` | The experiment's pinned eval link `[[slug@version]]` |
| `metric_key` | The `results` key |
| `value` | That key's finite number, `numeric`, exact |
| `harness_slug`, `harness_version` | The experiment's pinned harness link `[[slug@version]]` |
| `date` | The experiment's `date`, a calendar date |
| `environment` | The experiment's `environment`, or null when absent |
| `sample_size` | The experiment's `sample_size`, or null when absent |
| `verdict` | `supported`, `refuted`, `inconclusive`, or null when absent |

`unit` and `better` stay on the eval's `metrics` list. A point is unique on (`experiment_document_id`, `revision_id`, `metric_key`).

### Selection defaults (F16-REQ-007)

| Control | Query key | Default |
| --- | --- | --- |
| Eval | `eval` | The slug in `.ledger/space.md` frontmatter `default_eval` when that value is `[[slug]]` or `[[slug@version]]` and the slug is an eval. Otherwise no selection |
| Eval version | `version` | `all` |
| Metric | `metric` | The first item in the `metrics` list on the pinned `default_eval` version, or on the eval head when the link has no `@version` |

`version` is `all` or an integer from `1` to `999999999`. Choosing one integer limits the chart, the baseline, and the table to that `eval_version`. `all` draws every eval version of the slug as separate lines.

The screen URL is `/{project}/metrics?eval={slug}&metric={key}&version={version}`. A missing `version` means `all`.

## Acceptance scenarios

### F16-AC-001a

Given an experiment with `status: concluded`, `eval: "[[summary-faithfulness@2]]"`, `harness: "[[memento-journal@7]]"`, `date: 2026-09-22`, `sample_size: 40`, `verdict: supported`, and `results` `faithfulness: 0.82` and `latency_ms: 420`, when a reviewer merges it, then two `metric_points` rows reference the new revision, with those slugs, versions, date, sample size, verdict, and values.

### F16-AC-001b

Given the same merge and an eval metric `cost` with no `results` key, when the merge commits, then no point has `metric_key` `cost`. F06 may warn `metric_missing`. The merge still writes the keys that are present.

### F16-AC-002a

Given an experiment with `status: abandoned` and a numeric `results.faithfulness`, when it merges, then no `metric_points` row references the new revision.

### F16-AC-002b

Given an experiment with `status: concluded` and `verdict: inconclusive`, when it merges, then the point's `verdict` is `inconclusive`.

### F16-AC-003a

Given the merge in F16-AC-001a, when the `faithfulness` row is read, then `unit` and `better` are not columns on that row, and `value` is numeric `0.82`.

### F16-AC-004a

Given the merged experiment in F16-AC-001a, when a later merge sets `faithfulness` to `0.91` and `status` stays `concluded`, then the head revision has a point of `0.91`, the earlier point of `0.82` remains, and the chart uses `0.91`.

### F16-AC-004b

Given that experiment, when a later merge sets `status` to `abandoned`, then the new revision has no point, the `0.82` row remains, and the chart omits the experiment.

### F16-AC-005a

Given project `guide`, when the reader opens `/guide/metrics`, then the Metrics screen renders and the path has no `/memento` segment.

### F16-AC-006a

Given sign-in is not built, when the person at the keyboard opens the Metrics screen, then the screen renders and no role is checked.

### F16-AC-006b

Given sign-in is built and the caller is a Viewer, when they open the Metrics screen, then the screen renders.

### F16-AC-006c

Given sign-in is built and the caller is an agent key, when they request the Metrics screen, then the code is `permission_denied`, the message is `Agent credentials cannot open the Metrics screen.`, and the hint is `Sign in with a browser session.`

### F16-AC-007a

Given `.ledger/space.md` has `default_eval: "[[summary-faithfulness@2]]"` and that eval's first metric key is `faithfulness`, when the reader opens `/{project}/metrics` with no query, then the eval is `summary-faithfulness`, the metric is `faithfulness`, and `version` is `all`.

### F16-AC-007b

Given the space has no eval document, when the reader opens the screen, then the copy is `No evals yet. Add an eval, then merge a concluded experiment.`

### F16-AC-007c

Given the space has an eval and `.ledger/space.md` has no `default_eval`, when the reader opens the screen, then no eval is selected and the copy is `Pick an eval.`

### F16-AC-008a

Given two current points for one metric, harness versions `5` and `7`, when the chart draws, then the points use two series colors and the y value of each point is its `value`.

### F16-AC-009a

Given two concluded experiments on `2026-09-22` with harness `[[memento-journal@7]]`, slugs `alpha` and `beta`, and values `0.80` and `0.90`, when the chart draws, then both points are drawn at that date, and the line visits `alpha` before `beta`.

### F16-AC-009b

Given a point at eval version `2` and a point at eval version `3` with the same harness version, when `version` is `all`, then the two points are not on one line.

### F16-AC-010a

Given a current point with `verdict: inconclusive` and value `0.50`, and one other current point with value `0.70` on the same harness version, when the chart and table draw, then the inconclusive mark has no fill, `n` is `2`, and the mean is `0.60`.

### F16-AC-011a

Given eval `summary-faithfulness` version `2` has `baseline: "[[memento-journal@5]]"`, and two current concluded experiments on `[[summary-faithfulness@2]]` and `[[memento-journal@5]]` have `faithfulness` `0.40` and `0.60`, when the chart for `faithfulness` draws, then the baseline value is `0.50`.

### F16-AC-011b

Given those two experiments and a third on harness `[[memento-journal@7]]` with `faithfulness` `0.90`, when the baseline is computed, then `0.90` is not in the mean.

### F16-AC-011c

Given a concluded experiment on the baseline harness with `verdict: inconclusive` and value `0.20`, plus one with value `0.40`, when the baseline is computed, then the mean includes `0.20`.

### F16-AC-012a

Given the baseline harness has no concluded experiment for the metric, when the chart draws, then there is no dashed line and the delta cells are empty.

### F16-AC-012b

Given the eval version has no `baseline` key, when the chart draws, then there is no dashed line and a delta cell is not `0`.

### F16-AC-013a

Given the baseline value is `0.50`, when the chart draws, then a dashed horizontal line sits at y = `0.50`.

### F16-AC-014a

Given `better: higher`, baseline `0.50`, and a row mean `0.54`, when the delta cell renders, then the text is `+0.04 ▲` in green.

### F16-AC-014b

Given `better: lower`, baseline `400`, and a row mean `420`, when the delta cell renders, then the text is `+20 ▼` in red. The metric unit is `ms` and the y-axis title includes `ms`.

### F16-AC-014c

Given `better: higher`, baseline `0.50`, and a row mean `0.50`, when the delta cell renders, then the text is `0` with no arrow.

### F16-AC-014d

Given one experiment value `0.82`, `better: higher`, and baseline `0.50`, when F08 asks for the property-header delta, then the delta is `+0.32` and the arrow is `▲`. F08 draws the header. This spec defines the number.

### F16-AC-015a

Given harness versions `5` and `7` on one eval version, when the table renders, then there are two rows and the headers are `Harness`, `n`, `Mean`, `Median`, `Min`, `Max`, `Best`, `Latest`, and `Delta vs baseline`.

### F16-AC-015b

Given points on eval versions `2` and `3` and `version=all`, when the table renders, then the sections are headed `Eval v2` and `Eval v3` and their means are computed apart.

### F16-AC-016a

Given values `1`, `2`, and `9` on one harness version, when the row renders, then `n` is `3`, the mean is `4`, the median is `2`, min is `1`, max is `9`, and best is `9` when `better` is `higher`.

### F16-AC-016b

Given values `1` and `2`, when the row renders, then the median is `1.5`.

### F16-AC-016c

Given two points on the same harness version, dates `2026-09-01` value `0.10` and `2026-09-22` value `0.80`, when the row renders, then Latest is `0.80`.

### F16-AC-016d

Given two points on `2026-09-22` with slugs `alpha` value `0.10` and `beta` value `0.80`, when the row renders, then Latest is `0.80`.

### F16-AC-017a

Given harness `5` mean `0.40` and harness `7` mean `0.55` for `faithfulness` with `better: higher`, when the reader compares A = `5` and B = `7`, then the delta is `+0.15 ▲` in green.

### F16-AC-017b

Given harness `7` has no point for `latency_ms`, when the comparison renders, then the B cell and the delta for `latency_ms` are blank.

### F16-AC-018a

Given a point titled `Context window 8k vs 4k`, value `0.82`, unit `score`, and `sample_size` `40`, when the pointer hovers it, then the hover shows `Context window 8k vs 4k`, `0.82 score`, and `sample size 40`.

### F16-AC-018b

Given that point's document path is `experiments/2026-09-22-context-window-8k`, when the reader activates the point, then the open page is `/{project}/experiments/2026-09-22-context-window-8k`.

### F16-AC-018c

Given a point with no `sample_size`, when the pointer hovers it, then the hover includes `sample size —`.

### F16-AC-019a

Given the Metrics screen is open on `faithfulness`, when a reviewer merges a concluded experiment that adds a current point of `0.91`, then the chart shows `0.91` without a full page reload.

### F16-AC-020a

Given a table with `n` of `2`, when the screen renders, then the row shows `n`, mean, median, min, and max, and the screen text has no p-value and no confidence interval.

### F16-AC-021a

Given the earliest revision of eval version `2` defines `faithfulness` with `unit: score` and `better: higher`, and a later save keeps `version: 2` and changes the unit, when the chart for version `2` draws, then the y-axis title is `faithfulness (score)` from the earliest revision.

## Edge cases and errors

A blank delta is an empty cell. It is not the digit `0`, not an em dash, and not an arrow. The empty baseline is the partial state in the UI table, not one of these codes.

Displayed numbers are the exact numeric decimal. Trailing zeros after the decimal point are removed. A whole number has no decimal point. A positive delta has a leading `+`. A negative delta has a leading `-`.

`better` and `unit` come from the pinned eval version's first revision. ADR-0017's "earliest revision" rule applies to that lookup. ADR-0026 says the baseline link already names harness version `B`, so the baseline set does not search for a different harness version.

An experiment enters the baseline set only when its harness link is `[[H@B]]` and its eval link is `[[E@V]]`. A later harness version does not join that mean. `planned`, `running`, and `abandoned` do not join it. `concluded` with `verdict: inconclusive` does.

F08's property header uses F16-REQ-011 and F16-REQ-014 on that experiment's own `value`, not on a harness mean. This spec does not draw the header.

A human direct save is not a merge. F16-REQ-001 does not fire. See F16-Q-001.

| Code | Severity | When | Message | Hint |
| --- | --- | --- | --- | --- |
| `metrics_eval_unknown` | Error | `eval` matches no eval document | `No eval "{slug}".` | `Pick an eval from this space.` |
| `metrics_metric_unknown` | Error | `metric` is not on the selected eval version, or on any included version when `version` is `all` | `{key} is not a metric on {eval}.` | `Pick a key from that eval's metrics list.` |
| `metrics_unavailable` | Error | The point query fails | `Metrics could not be loaded.` | `Reload the page.` |
| `permission_denied` | Error | The caller is an agent key or an OAuth grant | `Agent credentials cannot open the Metrics screen.` | `Sign in with a browser session.` |

Updating a stored point in place stays `document_locked` on F07. A new revision gets new rows.

## Limits and budgets

| Limit | Value |
| --- | --- |
| `value` | Postgres `numeric`. Deltas use the exact quotient, with no rounding step |
| `eval_version`, `harness_version` | Integers from `1` through `999999999` |
| `sample_size` on the row | Null, or an integer greater than or equal to `0`. F06 still requires at least `1` on a valid experiment when the field is present |
| `date` | A calendar date, not a time of day |
| `metric_key` | At least `1` character |
| Series color | The F05 category list, assigned by `harness_version` ascending, repeating every `5` versions |
| Significance | None. No test, no confidence interval, no p-value |
| Screen route | `/{project}/metrics` |

The PRD sets no latency number for this screen. See F16-Q-002. Milestone 5 asks the new point to appear without a full page reload (F16-REQ-019). That sentence has no millisecond budget.

## UI states

Copy is the same at a desktop viewport wider than `860px` and at a phone viewport of `860px` or narrower, including `390px`. At `860px` or narrower the eval, version, and metric controls stack in one column, the chart scrolls horizontally inside its frame, and the tables scroll horizontally.

The accessible name of the screen is `Metrics`. Control labels are `Eval`, `Eval version`, `Metric`, `Version A`, and `Version B`. The version control's all-versions option is `All versions`. Compare sits under the harness table.

Keyboard: the controls, the chart points, and the table rows are reachable in order. `J` and `K` move one row in the harness table. Enter on a point opens that experiment. Enter on a row opens the experiment that supplied Latest.

| State | Copy |
| --- | --- |
| Empty, no eval document | `No evals yet. Add an eval, then merge a concluded experiment.` |
| Empty, evals exist and none is selected | `Pick an eval.` |
| Empty, eval has no metric keys | `This eval has no metrics.` |
| Empty, metric has no current points | `No concluded experiments for this metric.` |
| Loading | `Loading metrics…` on a skeleton of the controls, the chart, and the table |
| Error | The message and the hint from the error table |
| Partial | The chart and the table, with blank delta cells and no dashed line, when the baseline count is `0`. No extra banner |
| Success | The chart, the harness table, and the compare controls. No status sentence |

One current point is the success state: the point is drawn, and `n` is `1`.

## Out of scope

- The review inbox, proposal diffs, and the frontmatter sentence "metric changes show the delta" (F12).
- Drawing the property header. F08 uses F16-REQ-011 and F16-REQ-014 and draws `▲` or `▼` there.
- The small chart and experiment table on an eval document (F08). They may read these points. This spec does not lay them out.
- `get_metrics` and `GET /metrics` (F13). The screen reads the same current points.
- The `G` then `M` shortcut (F20). The route itself is F16-REQ-005.
- Sign-in screens (F15). F16-REQ-006 only names who may open the screen.
- `metric_unknown`, `metric_missing`, and `metric_range` (F06).
- The merge transaction other than the point rows: revision, head, links, audit event, and proposal status (F07).
- Inline chart fences, CSV charts, and PNG or SVG export (F05). The Metrics chart uses the F05 embedder and theme once this screen is built.
- Seeding evals and experiments (F22). The screen does not require three experiments before it draws.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F16-Q-001 | Should a human direct save of a concluded experiment insert the same point rows as a merge? | Yes. `append_revision` already inserts `p_metric_points` when `type` is `experiment` and `status` is `concluded`. A direct save should pass the same rows, so the chart follows the new head. | Product owner | Chart correctness after a direct save. Not a requirement until confirmed. F16-REQ-001 stays merge-only |
| F16-Q-002 | What latency should the Metrics screen meet? | The chart and table are visible within `1 s` at the 95th percentile for `1000` current points, on desktop Chrome against the app database. | Product owner | A performance test. Not a requirement until confirmed |

ADR-0026 and ADR-0027 are Proposed. They are applied above. They are not open questions. The frontmatter key `default_eval` is the rule in F16-REQ-007, taken from the PRD sentence that `space.md` holds the current default eval. ADR-0014 does not name the key.

## Trace

- PRD anchors (`origin/cursor/rebuild-prd-tables-f4c0`, `specs/source/ledger-prd.md`): `<!-- prd:measurement-layer -->` (lines 609–611), `<!-- prd:metric-point -->` (lines 612–625), `<!-- prd:metrics-screen -->` (lines 626–631), `<!-- prd:comparability-rules -->` (lines 632–636), `<!-- prd:metrics-over-time -->` (lines 280–282), the Metrics row of `<!-- prd:screens -->` (line 322), `<!-- prd:on-merge -->` (lines 478–480), `metric_points` in `<!-- prd:data-model -->` (lines 725–728), invariant 4 in `<!-- prd:invariants -->` (line 737), `<!-- prd:acceptance-milestone-5 -->` (lines 848–851), the property-header bullet in `<!-- prd:document-view -->` (line 333) for the delta F08 consumes.
- Decisions: D3 and D7 for who merges. ADR-0002 for no sign-in yet.
- Change requests: none.
- ADRs: ADR-0001 (the `/{project}/metrics` route), ADR-0014 (`space.md` is `type: doc`; this spec adds the `default_eval` key), ADR-0017 (the earliest revision at a version, used for `unit` and `better`), ADR-0026 (baseline mean, delta, arrows, blank when the count is `0`), ADR-0027 (one point per concluded experiment, ordered by date then slug).
- Depends on F07 for the merge insert and for current rows (`revision_id` is the head). Depends on F06 before a merge can commit. The chart frame and theme are F05. The property header is F08.
