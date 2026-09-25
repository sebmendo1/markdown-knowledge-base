# ADR-0027: Repeated experiments on a chart

**Status:** Proposed

## Context

The metrics chart plots every concluded experiment over time. The x-axis is the experiment date. Points are colored by harness version and connected per version.

The PRD does not say what to do when two concluded experiments share a date and a harness. Combining them would hide a run. Plotting both matches "every concluded experiment" only if that sentence is taken literally.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Combine experiments that share a date and a harness version into one point (the mean).
2. Plot each concluded experiment as its own point, even when the date and harness version match.
3. Keep the latest experiment for that date and harness, and drop the others.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Each concluded experiment is one point. Points are not averaged or dropped because they share a date, a harness, or both.

A harness version's line connects that version's points in this order: `date` ascending, then experiment slug ascending. Two points may share the same x position.

`verdict: inconclusive` is still its own point, drawn hollow, as the PRD already says. `abandoned` experiments add no point.

## Replaces

The unspecified chart treatment of repeated experiments on the same date and harness in section 2.3.

## Consequences

- F16: the time chart draws one point per concluded experiment and orders the connecting line by date, then slug.
