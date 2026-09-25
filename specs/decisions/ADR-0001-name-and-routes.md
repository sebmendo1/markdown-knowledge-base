# ADR-0001: Product name and routes

**Status:** Accepted

## Context

The PRD names the product Ledger and puts the first space, Memento, at `/memento`. Document routes hang off that space segment, for example `/memento/experiments/…`.

Scoping answer D6 says to call it markdown-kb for now. Plan section 2.2 said the live pages are `/docs/…` with no space segment. The as-built reading-shell spec checked the app and found that path wrong.

The product name is still markdown-kb. A page URL is `/{project}/{page-path}`. `/docs` and `/ledger` redirect into the guide project. The URL still has no space segment.

The final product name is still an open question. This decision records the name and routes that are live now.

## Options

1. Keep Ledger and `/memento/…`.
2. Use markdown-kb, and serve each page at `/{project}/{page-path}`, with `/docs` and `/ledger` redirecting into the guide project, and no space segment.
3. Use markdown-kb and serve every page at `/docs/…`.

## Decision

The product name shown in the UI is markdown-kb.

A page is `/{project}/{page-path}`. For example, `/guide/docs/layout` is the `docs/layout` page in the guide project.

`/docs` and `/ledger` redirect into the guide project. They are not the page prefix.

URLs do not include a space slug. The first segment is the project, not a Ledger space.

This keeps D6. The route shape is what the app serves, not the `/docs/…` path in plan section 2.2. The full Ledger loop stays in scope; the editor is the first release. A later release may add a final name without putting a space segment into these URLs unless a newer decision says so.

## Replaces

PRD product name "Ledger" and space URL `/memento`, including document routes under that space segment. Superseded by D6 for the name, and by the as-built routes for the path. Plan section 2.2's `/docs/…` page prefix is not what shipped.

## Consequences

- F08: the reading shell serves pages at `/{project}/{page-path}` and shows the name markdown-kb. `/docs` and `/ledger` redirect into the guide project.
- F11: a shared link uses `/{project}/{page-path}`, not `/memento/…` and not a bare `/docs/…` prefix.
- F22: space home is not served at `/memento`.
