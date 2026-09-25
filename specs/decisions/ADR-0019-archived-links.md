# ADR-0019: Links to archived documents

**Status:** Proposed

## Context

Documents are archived, never hard-deleted. `link_broken` means the linked slug does not exist. An archived document still has a slug and a row. The PRD does not say whether a link to it is broken or still valid.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Treat an archived target as `link_broken`.
2. Resolve the link. The document exists. Show it as archived. Do not report `link_broken`.
3. Resolve the link in the body and reject it in frontmatter.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Archiving sets `archived_at`. It does not remove the document or the slug.

A link to an archived document resolves to that document. It is not `link_broken`. The reader sees the document and that it is archived. Archive does not rewrite links in other documents.

`link_broken` is only for a slug that matches no document, archived or not.

## Replaces

The unspecified status of links to an archived document in section 2.3.

## Consequences

- F03: links to archived documents still open the document.
- F06: `link_broken` does not treat `archived_at` as a missing slug.
