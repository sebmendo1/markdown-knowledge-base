# ADR-0013: Filename patterns

**Status:** Proposed

## Context

A type schema sets a filename pattern. The only example is `"{date}-{slug}"`. The PRD does not say which other placeholders are allowed, or what happens to the path when someone edits `date`.

`path_invalid` requires the path to match the type's folder and filename pattern, so a date change that leaves the old path in place would fail validation. This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Allow any `{token}`, and leave the path unchanged when `date` changes.
2. Allow only `{date}` and `{slug}`. Changing `date` rewrites the path in the same save and does not change the slug.
3. Allow `{date}`, `{slug}`, and `{title}`, and keep the original path forever.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

The only placeholders are `{date}` and `{slug}`, written exactly that way. Any other `{…}` in the pattern makes the schema fail to load (`schema_invalid`, ADR-0015).

`{slug}` is the document slug from ADR-0012. `{date}` is the document's `date` field in `YYYY-MM-DD` form. If the pattern contains `{date}` and the date is missing or not in that form, the document fails `path_invalid` and is not saved.

The path is `{folder}/{pattern}` with those tokens replaced. Creating a document sets that path.

Editing `date` on an existing document recomputes the path in the same save. The slug does not change. Links use the slug, so they still resolve. The old path is not kept as a redirect. If another document already uses the new path, the save is rejected with `path_invalid`, the path stays as it was, and no revision is written.

## Replaces

The unspecified placeholder list and the unspecified effect of editing `date`, in section 2.3 (filename patterns).

## Consequences

- F01: paths come from the type folder and this pattern.
- F06: `path_invalid` covers a bad date, an unknown placeholder's refusal at schema load, and a path collision.
- F09: a date edit saves a new path in that same save.
