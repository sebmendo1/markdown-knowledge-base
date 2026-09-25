# ADR-0003: Storage

**Status:** Accepted

## Context

The PRD stores documents as Postgres revisions and autosaves a server draft every 2 seconds, private to the author.

What is live, after D2 (hosted on Vercel) and D5 (run the Markdown editor first), is different. Documents are files in `content/`, read at build time. Drafts are in the browser's `localStorage`.

Section 7 Q1 keeps the full Ledger loop in scope, with the editor as the first release. Postgres revisions belong to that later loop. They are not how the editor stores a page today.

## Options

1. Postgres revisions and server drafts every 2 seconds, as in the PRD.
2. Files in `content/`, read at build time, and drafts in `localStorage`.
3. Files in `content/` plus server drafts.

## Decision

The first release reads Markdown from files in `content/` at build time. An unsaved draft is stored in the browser's `localStorage`, not on the server, and not on a 2-second server write.

The full Ledger loop remains in scope for a later release. That release is where immutable revisions and server drafts are specified. Until then, the live storage rule is `content/` plus `localStorage`.

## Replaces

PRD storage of Postgres revisions and server drafts every 2 seconds, for the first release. Superseded by the live behavior recorded against D2 and D5.

## Consequences

- F07: first-release storage is files and `localStorage`. Revision invariants apply when the loop's storage is built.
- F09: draft restore reads `localStorage`.
- X: the deployed app serves the files built from `content/`.
