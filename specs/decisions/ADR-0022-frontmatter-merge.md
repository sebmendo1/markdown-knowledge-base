# ADR-0022: Three-way merge of frontmatter

**Status:** Proposed

## Context

If the base revision is no longer the head, merge runs a three-way merge of base, head, and the proposal. The stack names node-diff3 for that merge. Human saves do the same when the document changed during editing: a clean merge saves, a conflict opens a side-by-side resolver.

The PRD does not say whether frontmatter is merged as YAML fields or as text lines, what happens to key order, or how lists are aligned.

A field merge and a line merge produce different files from the same three texts. This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Parse frontmatter into fields, merge keys, and sort the keys.
2. Merge the whole file as lines with diff3. Do not parse frontmatter. Key order and lists follow the lines that survive.
3. Merge the body as lines and the frontmatter as a field map.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

The merge input is the full Markdown of base, current head, and the incoming text (the proposal, or the draft). Split each text into lines on `\n`. Do not parse YAML. Do not sort keys. Do not treat list items as a set.

Run a three-way line merge (diff3). A line changed on both sides in different ways, or two changed hunks that overlap, is a conflict.

A clean merge produces one file. The save proceeds and the notice is `Rebased onto latest`. YAML key order is whatever order the surviving lines have.

A conflict does not save. The proposal is marked conflicted, or the human save stops, and the reviewer gets the side-by-side resolver with their text, the other text, and the base. No merged file is written until the conflict is resolved.

## Replaces

The unspecified three-way merge of frontmatter (YAML key order, lists, and line merge versus field merge) in section 2.3.

## Consequences

- F09: an edit conflict uses this line merge. A clean merge saves. A conflict does not.
- F12: a proposal whose base is behind the head uses the same line merge.
