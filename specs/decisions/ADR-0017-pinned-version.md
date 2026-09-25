# ADR-0017: Pinned version target

**Status:** Proposed

## Context

`[[slug@7]]` links to a harness or eval at a version. The data-model invariant says a version lookup finds the first revision of that document whose `version` column equals 7.

`version_not_bumped` is a warning, not an error. A later save can change the text and keep `version: 7`. The pin then points at the first revision, while the current v7 text is the head. The reader can be shown either, and the PRD does not say which bytes the pin returns once they differ.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Resolve the pin to the head whenever the head's `version` is 7.
2. Resolve the pin to the earliest revision with that version, and leave `version_not_bumped` as a warning. Later saves do not move the pin.
3. Make `version_not_bumped` an error so a version can have only one revision.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

`[[slug@7]]` and `![[slug@7]]` resolve to the earliest revision of that document whose frontmatter `version` equals 7.

Earliest means the smallest `created_at`. If two revisions share that timestamp, the smaller revision id wins.

A later revision that still has `version: 7` is not the target, including when it is the head. The text returned for the pin is the full Markdown of that earliest revision.

`version_not_bumped` stays a warning. A save that changes a harness or an eval without increasing `version` is allowed. It does not move the pin.

If no revision has that version, the link fails `version_missing`.

## Replaces

The ambiguous pin target in section 2.3, where a later save at version 7 can differ from the first revision saved with `version: 7`. The PRD invariant (first revision) is kept and made the readable text. The warning severity is not changed.

## Consequences

- F03: a pinned link renders the earliest matching revision, not the head.
- F06: `version_not_bumped` remains a warning. `version_missing` remains the error when that version was never saved.
- F07: version lookup is the earliest revision with that `version`, ordered by `created_at` then revision id.
