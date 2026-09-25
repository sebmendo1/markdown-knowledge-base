# ADR-0002: Sign-in and roles

**Status:** Accepted

## Context

The PRD signs humans in with Better Auth (GitHub, Google, and email magic link), database sessions, and four roles per space: Owner, Editor, Contributor, and Viewer. Agents use API keys or OAuth grants. Scoping answer D7 keeps the PRD rule for who may save: Owner and Editor save directly, Contributors propose, and agents never merge.

Scoping answer D3, given later, says there is no auth yet. The four roles are the target for when sign-in is built, not for the editor that is live now.

Section 7 Q1 keeps the full Ledger loop in scope and marks the editor as the first release. This decision does not drop sign-in or roles from that later loop.

## Options

1. Build Better Auth and the four roles in the first release.
2. Ship no auth now, and keep the four roles plus the D7 save rule as the target for later.
3. Drop roles and let every caller merge.

## Decision

The first release has no human sign-in and no sessions. The person at the keyboard can edit.

When sign-in is built, the PRD roles apply. Owner and Editor may save directly. Contributors may propose and may not save directly. Viewers may read. Agents never merge, delete, or administer. That later work is part of the full Ledger loop, not the first release.

## Replaces

PRD "Human sign-in" (Better Auth, GitHub, Google, magic link, and database sessions) for the first release. Superseded by D3. The role table and D7 are not superseded; they are deferred with the loop.

## Consequences

- F09: the first release does not check a role before edit or save.
- F12: proposals and the merge gate are not in the first release.
- F13: agent keys are not in the first release.
- F14: OAuth grants are not in the first release.
- F15: sign-in, sessions, and role checks are specified for the later loop, not built with the editor.
