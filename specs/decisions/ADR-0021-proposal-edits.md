# ADR-0021: Proposal edit matches

**Status:** Proposed

## Context

A proposal may send full Markdown as `content`, or a list of `{find, replace}` pairs in `edits`, applied to the base revision. The PRD does not say what happens when `find` matches nothing or matches more than once.

Applying the first match, or applying every match, would change different documents. Creating a proposal from a partial apply would put an unintended edit in the inbox.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Apply the first match, and ignore a find that misses.
2. Require each `find` to match exactly once, in order, or reject the whole submission and create no proposal.
3. Apply every match of each `find`.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

`edits` is applied to a working copy that starts as the base revision's full Markdown, one pair at a time, in list order.

For each pair, `find` is a non-empty string and must occur exactly once in the working copy as a case-sensitive substring. Whitespace counts. `replace` may be empty, and that occurrence is then deleted.

If any pair has an empty `find`, zero matches, or more than one match, the whole submission is rejected. No pair is kept. No proposal is created.

The error code is `edit_not_unique`. The message says the match count (0, or more than 1) or that `find` is empty, and includes `find` truncated to 80 characters. The hint is: each find must match exactly once.

## Replaces

The unspecified result of `edits: [{find, replace}]` with zero matches or several matches, in section 2.3.

## Consequences

- F06: `edit_not_unique` is the error for a find that is empty, missing, or repeated.
- F12: a proposal is created from `edits` only when every find matched once. The inbox never receives a partial apply.
