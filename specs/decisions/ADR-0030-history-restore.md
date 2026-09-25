# ADR-0030: History restore

**Status:** Proposed

## Context

History lists revisions, compares any two, and can restore. Revisions are immutable. Only a human save or a merged proposal creates a revision. Editing a type schema does not revalidate old documents; they are checked on their next change.

The PRD does not say whether restore writes a new revision or rewinds the head in place, or whether the check uses today's schema or the schema from the revision's date.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Point the head at the old revision and skip validation.
2. Write a new revision whose bytes equal the chosen revision, validated against the schemas loaded now.
3. Write a new revision, validated against the schemas as they were on that revision's date.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Restore writes one new revision. It does not change or delete the chosen revision or any older revision.

The new revision's content is the same bytes as the chosen revision's content.

Validation uses the type schemas loaded at restore time, not the schemas from the old revision's date. Errors block the restore and no revision is written. Warnings do not block.

The revision message is `Restore`.

Who may restore follows ADR-0002. While the first release has no sign-in, the local user may restore. When roles exist, only Owner and Editor may restore. Anyone else gets a refusal and no revision is written.

## Replaces

The unspecified restore behavior in section 2.3: a new revision versus a rewind, and today's schema versus the schema at the time.

## Consequences

- F06: restore runs the current validator. Errors block it.
- F07: restore is a human save that appends a revision. History stays immutable.
- F15: when roles exist, only Owner and Editor may restore.
- F18: the history action "restore" follows this rule, including the message `Restore`.
