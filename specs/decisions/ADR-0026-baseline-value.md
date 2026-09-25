# ADR-0026: Baseline value

**Status:** Proposed

## Context

An eval's `baseline` field is a pinned harness link, for example `[[memento-journal@5]]`. The metrics chart draws that baseline as a dashed line at a numeric value. The harness comparison table shows delta versus baseline. The experiment property header shows ▲ or ▼ against the eval's baseline.

The PRD does not say where the number comes from. Section 2.3 offers two sources: the mean of the baseline harness's concluded experiments, or the latest one. The same gap notes that delta and the arrows depend on that value. They are not a second choice.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. The latest concluded experiment on that harness.
2. The arithmetic mean of concluded experiments on that harness, for the same eval version and metric.
3. Draw no baseline until the owner types a number on the eval.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

For metric `M` on eval `E` at version `V`, read the eval's `baseline` link as harness `H` at version `B` (ADR-0017's pin does not apply here: the link already names the version).

The baseline value is the arithmetic mean of `results[M]` over experiments where all of the following hold:

- `status` is `concluded` (this includes `verdict: inconclusive`)
- `status` is not `abandoned`, `planned`, or `running`
- the eval link is `[[E@V]]`
- the harness link is `[[H@B]]`
- `results[M]` is a number

The mean is the sum divided by the count, with no rounding in the value that deltas use.

If the count is 0, there is no baseline. The chart draws no dashed line. Deltas are blank, not 0.

Delta is the point's value minus the baseline value.

- If the metric's `better` is `higher`, a positive delta is an improvement and a negative delta is a regression.
- If `better` is `lower`, a negative delta is an improvement and a positive delta is a regression.
- An improvement is ▲ in green. A regression is ▼ in red. A zero delta has no arrow.

The dashed baseline line, the "delta vs baseline" column, and the property-header arrows all use this same mean. They do not use the latest experiment.

## Replaces

The undefined numeric source of an eval baseline in section 2.3, and the dependent gap that delta and the property-header arrows use that same value.

## Consequences

- F08: the property header arrows use this mean and this direction rule.
- F16: the dashed line and the comparison-table delta use this mean. An empty set draws no line.
