# ADR-0033: Export and re-import identity

**Status:** Proposed

## Context

A product principle says export produces the exact same folder of files. An acceptance criterion says exporting and re-importing a space yields identical files. The export downloads a zip of the space as its folder of Markdown files, including `.ledger/` and `assets/`.

"Identical" can mean the same bytes, or the same documents after YAML is parsed and written back. A re-serialized file can change key order and line endings and still parse as the same document.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Identical means the same parsed frontmatter and the same rendered body. Key order and line endings may change.
2. Identical means the same UTF-8 bytes, including line endings and YAML key order. Export does not re-serialize.
3. Identical means the same bytes for the body, and canonical YAML for the frontmatter.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Identical means the same UTF-8 bytes.

Export writes each Markdown file as the bytes stored for that document. It does not parse and rewrite frontmatter, so key order, line endings, and trailing whitespace stay as stored. `.ledger/` Markdown files are included the same way. Each file in `assets/` is copied as the same bytes.

Re-import stores those bytes as the initial revision content. It does not normalize them.

A test that exports a space and re-imports it must find the same bytes for every Markdown file and every asset file.

## Replaces

The unspecified meaning of "exporting and re-importing a space yields identical files" in section 2.3, including line endings and key order.

## Consequences

- F19: export and re-import are byte-preserving. A round trip does not reformat Markdown or assets.
