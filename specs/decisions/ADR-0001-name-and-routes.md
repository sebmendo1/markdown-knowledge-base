# ADR-0001: Product name and routes

**Status:** Accepted

## Context

The PRD names the product Ledger and puts the first space, Memento, at `/memento`. Document routes hang off that space segment, for example `/memento/experiments/…`.

Scoping answer D6, given later and already live, says to call it markdown-kb for now. The live pages are `/docs/…` and the URL has no space segment.

The final product name is still an open question. This decision records the name and routes that are live now.

## Options

1. Keep Ledger and `/memento/…`.
2. Use markdown-kb, and serve pages at `/docs/…` with no space segment.
3. Use markdown-kb as the name but keep the `/memento` space segment.

## Decision

The product name shown in the UI is markdown-kb. Document pages are at `/docs/…`. URLs do not include a space slug.

This is the newer instruction (D6) and it is already live. The full Ledger loop stays in scope; the editor is the first release. A later release may add a final name without putting a space segment back into these URLs unless a newer decision says so.

## Replaces

PRD product name "Ledger" and space URL `/memento`, including document routes under that space segment. Superseded by D6 and the live `/docs/…` routes.

## Consequences

- F08: the reading shell and document routes use `/docs/…` and the name markdown-kb.
- F11: a shared link points at a `/docs/…` page, not at `/memento/…`.
- F22: space home is not served at `/memento`.
