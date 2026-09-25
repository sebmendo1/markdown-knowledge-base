# X tasks

Dependency order. A task starts after every task it lists under Depends on. Size is the parts the task touches: one module, several modules, or a schema change. No calendar estimates.

Shipped tasks lock the current editor. Later tasks call the modules in `design.md`. They do not add a percentile or a test machine for the three time limits.

## X-T-001 — Serve the editor with no sign-in

Depends on: none.

The Vercel project `markdown-kb-editor` serves one Next.js app. Opening the site shows the editor. No sign-in screen and no session are shown.

- Satisfies: X-REQ-001
- Test: `the deployed editor opens with no sign-in` (X-AC-001a)
- Size: several modules

## X-T-002 — Keep the local routes off in a deploy

Depends on: X-T-001.

`app/api/files/route.ts` answers `GET` and `POST` with HTTP 404 and `{"error":"Not found"}` while `KB_LOCAL` is not the string `1`. `app/api/mcp/route.ts` does the same for `GET`.

- Satisfies: X-REQ-002
- Test: `files and mcp routes are 404 unless KB_LOCAL is 1` (X-AC-002a)
- Size: several modules

## X-T-003 — Read secrets from the environment

Depends on: X-T-002.

The server reads `KB_DIR` and `KB_LOCAL` from the environment in `lib/store/fs-store.ts`, `app/api/files/route.ts`, and `app/api/mcp/route.ts`. The client bundle contains neither name and contains no agent-key secret.

- Satisfies: X-REQ-003
- Test: `client bundle has no KB_DIR, KB_LOCAL, or key secret` (X-AC-003a)
- Size: several modules

## X-T-004 — Sanitize rendered HTML

Depends on: none.

`lib/markdown/schema.ts` and `components/markdown-parts.tsx` sanitize rendered Markdown to the safe subset in F04-REQ-014. A `script` element is removed. A `details` element remains. No error is shown.

- Satisfies: X-REQ-004
- Test: `rendered markdown drops a script and keeps details` (X-AC-004a)
- Size: several modules

## X-T-005 — Initialize Mermaid at strict

Depends on: none.

`MermaidBlock` in `components/blocks.tsx` calls `mermaid.initialize` with `securityLevel` `strict` when a `mermaid` fence draws.

- Satisfies: X-REQ-005
- Test: `mermaid initializes at security level strict` (X-AC-005a)
- Size: one module

## X-T-006 — Refuse a remote chart URL

Depends on: none.

`usesRemoteData` in `components/blocks.tsx` matches a string property named `url` against `^https?:`. `ChartBlock` does not call the embedder. The message is `Charts can only use inline data.`

- Satisfies: X-REQ-006
- Test: `an https chart url is not fetched` (X-AC-006a)
- Size: one module

## X-T-007 — Keep drafts on the device

Depends on: X-T-001.

`components/workspace-store.ts` stores the working copy and browser-only pages. `components/history-store.ts` stores browser version history. Leaving and returning in the same browser restores the draft from `localStorage`. The editor sends no server-draft request.

- Satisfies: X-REQ-018
- Test: `a draft is restored from localStorage and is not posted` (X-AC-018a)
- Size: several modules

## X-T-008 — Run the editor from the keyboard

Depends on: X-T-001.

`components/use-editor-keys.ts` runs the F20 shortcuts with no pointer: search, settings, shortcut help, editing, Markdown source, the outline, save, and a new page.

- Satisfies: X-REQ-012
- Test: `editor shortcuts run from the keyboard` (X-AC-012a)
- Size: one module

## X-T-009 — Name the editor controls

Depends on: X-T-008.

Search, share, settings, and the outline expose an accessible name from `components/file-sidebar.tsx`, `components/document-chrome.tsx`, `components/settings-host.tsx`, and `components/outline-panel.tsx`.

- Satisfies: X-REQ-015
- Test: `editor controls expose an accessible name` (X-AC-015a)
- Size: several modules

## X-T-010 — Show the status line as a word

Depends on: X-T-001.

`components/document-chrome.tsx` shows `Viewing`, `Editing`, or `Markdown source` on the status line. Color may accompany the word. The word is still present.

- Satisfies: X-REQ-016
- Test: `the status line uses a word` (X-AC-016a)
- Size: one module

## X-T-011 — Announce Editing or Preview

Depends on: X-T-010.

The page column exposes the accessible state `Editing` while mode is `edit` or `source`, and `Preview` while mode is `preview`. The visible status line keeps the words from X-T-010.

- Satisfies: X-REQ-017
- Test: `turning editing on sets the accessible state to Editing` (X-AC-017a)
- Size: one module

## X-T-012 — Allow only listed chart sources

Depends on: X-T-006.

When chart sources beyond inline values are on, `ChartBlock` accepts inline values, a CSV under `assets/` on the F05-REQ-014 path, or a metrics query in F05-REQ-015. `../secret.csv` returns `chart_source`, the message `Chart uses a data source that is not allowed.`, and the hint `Use inline data, a CSV in assets/, or a metrics query.` The embedder is not called. The remote-URL refusal from X-T-006 still runs first.

- Satisfies: X-REQ-007
- Test: `a chart data source outside inline assets and metrics is refused` (X-AC-007a)
- Size: several modules

## X-T-013 — Meet the contrast ratios

Depends on: X-T-001.

`app/globals.css` and `app/theme.css` meet the WCAG 2.2 Level AA ratios in both themes. Body text is at least 4.5:1. Text of at least 24px, or at least 18.5px and bold, is at least 3:1. A component and the focus indicator are at least 3:1 against the adjacent color.

- Satisfies: X-REQ-013
- Test: `both themes meet the WCAG 2.2 AA contrast ratios` (X-AC-013a)
- Size: several modules

## X-T-014 — Order focus and trap a dialog

Depends on: X-T-009, X-T-011.

With the three columns shown and no dialog open, Tab moves through the files column, then the page, then the outline, top to bottom in each. A hidden column is skipped. While a dialog is open, focus stays inside it. On close, focus returns to the control that opened it.

- Satisfies: X-REQ-014
- Test: `focus walks files then page then outline and a dialog traps it` (X-AC-014a)
- Size: several modules

## X-T-015 — Serve an uploaded asset from a signed URL

Depends on: X-T-001.

`lib/assets/signed-url.ts` turns an `assets` row into a signed URL. A page that renders the asset uses that URL. `blob_url` is not copied into the HTML.

- Satisfies: X-REQ-008
- Test: `an uploaded asset is served from a signed url` (X-AC-008a)
- Size: one module

## X-T-016 — Hide review data on a public read

Depends on: X-T-001.

While `spaces.public_read` is true, `lib/auth/permissions.ts` shows a document to a caller with no membership and returns no proposals, agent keys, members, or audit events. The codes stay F11-REQ-030.

- Satisfies: X-REQ-019
- Test: `public read shows documents and hides proposals keys members and audit` (X-AC-019a)
- Size: several modules

## X-T-017 — Show a key secret once

Depends on: X-T-003.

`lib/agent/keys.ts` returns the secret on create and stores only the SHA-256 hash and the visible prefix. Leaving the result does not show the secret again. The secret is not written into the client bundle.

- Satisfies: X-REQ-020
- Test: `an agent key secret is shown once and stored as a hash` (X-AC-020a)
- Size: one module

## X-T-018 — Write one audit event in the action's transaction

Depends on: X-T-017.

A merge inserts one `audit_events` row inside `append_revision` and does not insert another. Reject, role change, key creation, and key revocation each call `lib/audit/record.ts` once inside the same transaction as the action.

- Satisfies: X-REQ-021
- Test: `merge reject role change and key changes write one audit event` (X-AC-021a)
- Size: several modules

## X-T-019 — Record a validation attempt

Depends on: X-T-017.

Add `validation_attempts` to `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c`. That file is not in this branch. `lib/success/attempts.ts` inserts one row when `propose_change` returns, with the credential, the time, `valid`, and `had_get_context`. An invalid return inserts no proposal.

- Satisfies: X-REQ-022
- Test: `an invalid propose_change stores a validation attempt and no proposal` (X-AC-022a)
- Size: a schema change

## X-T-020 — Finish the agent-log flow within 10 seconds

Depends on: X-T-019.

`lib/agent/log-experiment.ts` takes the sentence `Log this run to Ledger` and a valid experiment body, calls `get_template`, `search`, and `propose_change`, and leaves one valid proposal. The sequence finishes within 10 seconds. A finish at 10 seconds passes. No percentile is added.

- Satisfies: X-REQ-011
- Test: `one sentence produces one proposal within 10 seconds` (X-AC-011a)
- Size: several modules

## X-T-021 — Show a stored proposal within 2 seconds

Depends on: X-T-001.

`lib/review/inbox.ts` and `components/review/inbox-list.tsx` show the new row in an open Inbox within 2 seconds of the storing commit. A finish at 2 seconds passes. No percentile is added, and a miss adds no error message.

- Satisfies: X-REQ-009
- Test: `a stored proposal is in the inbox within 2 seconds` (X-AC-009a)
- Size: several modules

## X-T-022 — Return search under 100 milliseconds

Depends on: X-T-001.

The F17 document index answers a search of a space of 10,000 documents in under 100 milliseconds. 100 milliseconds misses. `components/page-search.tsx` is not this search. No percentile and no machine are added.

- Satisfies: X-REQ-010
- Test: `search of 10000 documents returns in under 100 milliseconds` (X-AC-010a)
- Size: several modules

## X-T-023 — Complete Inbox, Timeline, and Metrics from the keyboard

Depends on: X-T-008, X-T-021.

The Inbox, Timeline, and Metrics screens complete each screen's primary action with the keyboard alone, using the bindings F12, F16, F18, and F20 already own. A pointer is not required. X adds no shortcut.

- Satisfies: X-REQ-012
- Test: `inbox timeline and metrics work from the keyboard alone` (X-AC-012b)
- Size: several modules

## X-T-024 — Count experiments in the 720-hour window

Depends on: X-T-001.

`lib/success/queries.ts` counts `experiment` documents created in the Memento space (`spaces.slug` `memento`) inside the caller's 720-hour window. A document created before the window is excluded.

- Satisfies: X-REQ-023
- Test: `experiment documents in the 720 hour window are counted` (X-AC-023a)
- Size: one module

## X-T-025 — Compute the agent-proposal share

Depends on: X-T-024.

The same module returns the share of that set whose creating proposal carries an agent key or a grant. A human direct save stays in the denominator and stays out of the numerator. Eight of ten is 80%.

- Satisfies: X-REQ-024
- Test: `the agent-proposal share of experiments is computed` (X-AC-024a)
- Size: one module

## X-T-026 — Compute the median review duration

Depends on: X-T-024.

The same module returns the median of `reviewed_at` minus `created_at`, in minutes, for proposals that became `merged` or `rejected` in the window. A proposal that is `open` or `changes_requested` is outside the median. The sample of 60 seconds and 180 seconds returns 2 minutes, which misses the under-2-minute target.

- Satisfies: X-REQ-025
- Test: `median review duration is reviewed_at minus created_at` (X-AC-025a)
- Size: one module

## X-T-027 — Compute validation failures after the guide

Depends on: X-T-019, X-T-024.

The same module returns the share of invalid attempts among attempts in the window whose `had_get_context` is true. Attempts whose credential had not called `get_context` are excluded. One invalid attempt among ten is 10%, which misses the under-10% target.

- Satisfies: X-REQ-026
- Test: `invalid propose_change calls after get_context are under 10 percent at the target` (X-AC-026a)
- Size: one module

## X-T-028 — Count weekly external builders

Depends on: X-T-024.

Add `space_uses` to `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c`. That file is not in this branch. `lib/success/visits.ts` writes one row when a person opens a space or calls a tool. The query counts distinct people in a 168-hour window who are not an Owner of the space they used. The Owner's own open is excluded.

- Satisfies: X-REQ-027
- Test: `distinct non-owners who used a space in 168 hours are counted` (X-AC-027a)
- Size: a schema change

## X-T-029 — Keep the later deploy to one app

Depends on: X-T-015.

Where the Ledger database is in use, the deployment is one Next.js app on Vercel, one Postgres database through `lib/storage/connection.ts`, and one blob store through `lib/assets/signed-url.ts`. It adds no queue, no worker, and no MCP service outside `app/api/mcp/route.ts`.

- Satisfies: X-REQ-028
- Test: `the ledger store runs on vercel with postgres and a blob store` (X-AC-028a)
- Size: several modules
