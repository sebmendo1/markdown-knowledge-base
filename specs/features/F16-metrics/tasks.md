# F16 tasks: Metrics

Dependency order. Each step names the requirements it satisfies, the test that proves them, and a size. Size is one module, several modules, or a schema change. No step lacks a requirement. The table and `append_revision` already exist in `specs/contracts/db.sql`. These steps do not add a table.

## 1. Build point rows for a concluded merge

Satisfies: F16-REQ-001, F16-REQ-002, F16-REQ-003.

Size: one module (`lib/metrics/points.ts`). The insert stays inside `append_revision`.

Tests:

- F16-AC-001a, F16-AC-001b in `lib/metrics/points.test.ts`
- F16-AC-002a, F16-AC-002b in `lib/metrics/points.test.ts`
- F16-AC-003a in `lib/metrics/points.test.ts`

Depends on F07 `append_revision`. One finite `results` key becomes one record. A missing key writes no point. `planned`, `running`, and `abandoned` pass an empty array, and the function's `write_metrics` gate inserts nothing when status is not `concluded`. The row has no `unit` and no `better`. `value` stays numeric.

## 2. Treat the head as current

Satisfies: F16-REQ-004.

Size: one module (`lib/metrics/current.ts`).

Tests: F16-AC-004a, F16-AC-004b in `lib/metrics/current.test.ts`.

Depends on step 1. A later concluded merge inserts points for the new revision and leaves earlier rows. The chart query keeps rows whose `revision_id` is `documents.head_revision_id`. A later abandoned merge inserts nothing, so the experiment drops off the chart while the old row remains in the table.

## 3. Serve the Metrics route

Satisfies: F16-REQ-005, F16-REQ-006.

Size: several modules (`app/[project]/metrics/page.tsx`, `components/metrics/metrics-screen.tsx`).

Tests: F16-AC-005a, F16-AC-006a, F16-AC-006b, F16-AC-006c in `lib/metrics/route.test.ts`.

The path is `/{project}/metrics` with no `/memento` segment. While sign-in is absent, no role is checked. When sign-in exists, Owner, Editor, Contributor, and Viewer may open it. An agent key or an OAuth grant gets `permission_denied`.

## 4. Select eval, version, and metric

Satisfies: F16-REQ-007.

Size: one module (`lib/metrics/current.ts`).

Tests: F16-AC-007a, F16-AC-007b, F16-AC-007c in `lib/metrics/selection.test.ts`.

Depends on step 3. Defaults come from `default_eval` on `.ledger/space.md`. No eval document uses the empty copy. Evals with no `default_eval` use `Pick an eval.`

## 5. Draw the line chart

Satisfies: F16-REQ-008, F16-REQ-009, F16-REQ-010, F16-REQ-013.

Size: several modules (`lib/metrics/series.ts`, `components/metrics/metrics-screen.tsx`).

Tests:

- F16-AC-008a, F16-AC-009a, F16-AC-009b in `lib/metrics/series.test.ts`
- F16-AC-010a in `lib/metrics/series.test.ts`
- F16-AC-013a in `lib/metrics/series.test.ts`

Depends on steps 2 and 4, and on F05 step 1 for the embedder. One line per (`eval_version`, `harness_version`), ordered by `date` then experiment slug. Two points may share an x position. An `inconclusive` mark has no fill and a stroke in the series color, and it still counts in `n` and the mean. A baseline with count at least 1 is a dashed horizontal line at that y.

## 6. Baseline, delta, and the eval's unit

Satisfies: F16-REQ-011, F16-REQ-012, F16-REQ-014, F16-REQ-021.

Size: several modules (`lib/metrics/baseline.ts`, `lib/metrics/format.ts`).

Tests:

- F16-AC-011a, F16-AC-011b, F16-AC-011c in `lib/metrics/baseline.test.ts`
- F16-AC-012a, F16-AC-012b in `lib/metrics/baseline.test.ts`
- F16-AC-014a, F16-AC-014b, F16-AC-014c, F16-AC-014d in `lib/metrics/baseline.test.ts`
- F16-AC-021a in `lib/metrics/baseline.test.ts`

Depends on step 2. The mean uses exact division. A later harness version is not in the baseline set. `inconclusive` on the baseline harness is in the mean. Count `0` or a missing baseline link leaves deltas blank and draws no dashed line. `unit` and `better` come from `revision_for_version`, not from a later save of that version. F16-AC-014d is the number F08's property header consumes. This feature does not draw that header.

## 7. Harness comparison table

Satisfies: F16-REQ-015, F16-REQ-016, F16-REQ-020.

Size: several modules (`lib/metrics/stats.ts`, `components/metrics/metrics-screen.tsx`).

Tests:

- F16-AC-015a, F16-AC-015b in `lib/metrics/stats.test.ts`
- F16-AC-016a, F16-AC-016b, F16-AC-016c, F16-AC-016d in `lib/metrics/stats.test.ts`
- F16-AC-020a in `lib/metrics/stats.test.ts`

Depends on steps 5 and 6. `version=all` splits sections by eval version. The screen text has no p-value and no confidence interval.

## 8. Compare two harness versions

Satisfies: F16-REQ-017.

Size: one module (`components/metrics/metrics-screen.tsx`).

Tests: F16-AC-017a, F16-AC-017b in `lib/metrics/compare.test.ts`.

Depends on step 7. Delta is B's mean minus A's mean, colored by F16-REQ-014. A metric with no point for B leaves that cell and the delta blank.

## 9. Hover and open an experiment

Satisfies: F16-REQ-018.

Size: one module (`components/metrics/metrics-screen.tsx`).

Tests: F16-AC-018a, F16-AC-018b, F16-AC-018c in `lib/metrics/hover.test.ts`.

Depends on step 5. Hover shows the title, the value with unit, and the sample size or `sample size —`. Activate opens `/{project}/{page-path}`.

## 10. Refresh an open screen after merge

Satisfies: F16-REQ-019.

Size: one module (`components/metrics/metrics-screen.tsx`).

Test: F16-AC-019a in `lib/metrics/refresh.test.ts`.

Depends on steps 2 and 5. A merge that inserts a current point for the open eval and metric replaces the chart and the table without a full page reload.
