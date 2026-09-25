# X design

Written against `spec.md` in this folder. Cross-cutting rules cover the deploy, the safety checks, the time budgets, keyboard and contrast, and the 30-day success queries. Feature specs own the screens and the row shapes. This design names the modules that enforce the rules and the data those rules read.

The current release is the editor. `postgresInUse()` in `lib/storage/mode.ts` (F07) is false. Drafts stay in the browser. Sign-in, the Inbox, agent keys, and the success queries are not started. ADR-0034 is Proposed. X-Q-007 blocks treating X-REQ-013, X-REQ-014, and X-REQ-017 as accepted. The modules below still implement those requirements.

X adds no error code. A refusal uses the code owned by the feature named in the spec.

## Modules

### Current release

These modules ship. They stay the path while the current release is the editor.

| Module | Role |
| --- | --- |
| `app/layout.tsx`, `app/page.tsx`, `app/[project]/page.tsx`, `app/[project]/[...slug]/page.tsx` | One Next.js app. No sign-in route and no session. |
| `app/api/files/route.ts` | `GET` and `POST` return 404 unless `KB_LOCAL` is the string `1`. |
| `app/api/mcp/route.ts` | `GET` returns 404 unless `KB_LOCAL` is `1`. When it is `1`, the content directory comes from `KB_DIR`. |
| `lib/store/fs-store.ts` | Resolves the content directory from `KB_DIR` on the server. |
| `lib/markdown/schema.ts` | `sanitizeSchema`. The safe tags are the sanitizer default plus `details`, `summary`, `kbd`, `mark`, `sub`, and `sup`. |
| `components/markdown-parts.tsx` | Runs `rehype-sanitize` with `sanitizeSchema` after raw HTML is parsed. |
| `components/blocks.tsx` | `MermaidBlock` sets `securityLevel: "strict"`. `usesRemoteData` and `ChartBlock` refuse a remote chart URL before `vega-embed`. |
| `components/use-editor-keys.ts` | The editor shortcuts, with no pointer. |
| `components/file-sidebar.tsx` | Search control. The accessible name is the visible word `Search`. |
| `components/document-chrome.tsx` | Share control, accessible name `Share`. Settings control, accessible name `Settings`. Status line words. |
| `components/outline-panel.tsx` | Outline region, accessible name `Outline`. |
| `components/settings-host.tsx` | Settings dialog, accessible name `Settings`. |
| `components/workspace-store.ts` | Working copy and browser-only pages in `localStorage`. |
| `components/history-store.ts` | Browser version history in `localStorage`. |
| `components/draft-store.ts` | Editing mode in `localStorage`. It does not post a draft. |
| `components/disk-sync.ts` | Copies a local project to disk when `KB_LOCAL` is `1`. That copy is not a server draft. |

The Vercel project is `markdown-kb-editor`. The deploy named in `specs/PLAN.md` is [markdown-kb-editor.vercel.app](https://markdown-kb-editor.vercel.app). There is no `app/sign-in/page.tsx` in this release.

### Not started

These modules are not in the tree. Each one calls the feature module named beside it. X does not replace that feature.

| Module | Calls | Rule |
| --- | --- | --- |
| `lib/charts/parse.ts`, `lib/charts/csv-data.ts`, `lib/charts/metrics-data.ts` | `ChartBlock`, before `vega-embed` | Chart sources beyond inline values. F05 owns the parsers. |
| `lib/assets/signed-url.ts` | `assets` in the storage contract | Signed URL for an uploaded asset. The page does not receive `blob_url`. |
| `lib/review/inbox.ts`, `components/review/inbox-list.tsx` | F12 | Inbox row within 2 seconds. |
| F17 document index and palette | Postgres full-text search and `pg_trgm` | Search under 100 milliseconds. Not `components/page-search.tsx`. |
| `lib/agent/log-experiment.ts` | `get_template`, `search`, `propose_change` in `lib/agent/tools.ts` | One sentence to one proposal within 10 seconds. |
| `app/globals.css`, `app/theme.css` | Token colors | Contrast ratios in both themes. |
| `components/workspace-view.tsx` and the dialog hosts | Files column, page, outline, then the open dialog | Focus order and the dialog trap. |
| `components/document-chrome.tsx` | Page mode | Accessible state `Editing` or `Preview`. |
| `lib/auth/permissions.ts` | `spaces.public_read` | Documents shown. Proposals, keys, members, and audit events hidden. |
| `lib/agent/keys.ts` | `agent_keys` | Secret shown once. Stored hash and prefix. |
| `lib/audit/record.ts` | The committing transaction | One audit event for reject, role change, key creation, and key revocation. |
| `lib/success/attempts.ts` | `lib/agent/proposals.ts` when `propose_change` returns | One validation-attempt row. No proposal when the result is invalid. |
| `lib/success/queries.ts` | Documents, proposals, attempts, uses | The five window queries. |
| `lib/success/visits.ts` | A space open or a tool call | One `space_uses` row for a person. |
| `lib/storage/connection.ts`, `lib/assets/signed-url.ts` | One Postgres database, one blob store | Later hosting stays one Next.js app. |

`lib/review/merge.ts` does not call `lib/audit/record.ts`. The merge audit row is the one insert inside `append_revision` (F07). A second insert would break the one-event rule.

Keyboard completion for the Inbox, Timeline, and Metrics uses the bindings those features already own (F12, F16, F18, F20). X adds no shortcut.

## Data

### Current release

`localStorage` keys, on the device:

| Key | Holds |
| --- | --- |
| `markdown-kb:workspace:{project}` | Working copy, including a page created in the browser. The legacy key `markdown-kb:workspace` is the same store for the legacy project. |
| `markdown-kb:history:{id}` | Browser snapshots for one page. A snapshot is not a revision. |

No client module reads `process.env.KB_DIR` or `process.env.KB_LOCAL`. The server modules in the table above read them. The client JavaScript of the deploy contains neither name and contains no agent-key secret. No agent-key secret exists in this release.

`usesRemoteData` walks every nested object and array. A string property named `url` that matches `/^https?:/i` is remote. `ChartBlock` then does not call `vega-embed`. The message is `Charts can only use inline data.`

### Chart sources, once they are on

Inline `data.values` stay inline. An allowed CSV path is the path in F05-REQ-014. A metrics query is the object in F05-REQ-015. Any other source, including `data.url` of `../secret.csv`, returns `chart_source` with the message and hint in the spec, and does not call the embedder. The `^https?:` refusal stays in front of this check.

### Signed asset address

`assets.blob_url` is the stored object address. The address written into a page is the signed URL from `lib/assets/signed-url.ts` for that row. The raw `blob_url` is not copied into the HTML.

### Clocks

A day is 24 hours. The three product clocks have no percentile and no machine (X-Q-001, X-Q-002, X-Q-003, X-Q-004). This design does not add one.

| Clock | Starts | Stops | Passes |
| --- | --- | --- | --- |
| Inbox | The commit that stored the proposal | The row is shown in an Inbox that is already open | Elapsed time of 2 seconds |
| Search | The search call against a space of up to 10,000 documents | The result list is returned | Elapsed time under 100 milliseconds. 100 milliseconds misses |
| Agent log | The sentence is accepted | `propose_change` has stored one valid proposal | Elapsed time of 10 seconds |

The agent-log clock covers `get_template`, then `search`, then `propose_change`. It does not split model time out. X-Q-005 is open. The page-search dialog is not the search clock.

A miss has no extra user-facing error.

### Audit row

The row is `audit_events` in the storage contract: `space_id`, `actor_user_id`, `agent_key_id`, `action`, `target`, `data`, `created_at`. X does not add a column.

| Action | Writer | When |
| --- | --- | --- |
| `merge` | `append_revision` | The merge transaction |
| `reject` | `lib/audit/record.ts` from `lib/review/review-actions.ts` | The reject transaction |
| `role_change` | `lib/audit/record.ts` from `lib/auth/audit.ts` | The membership transaction |
| `key_create` | `lib/audit/record.ts` from `lib/agent/keys.ts` | The create transaction |
| `key_revoke` | `lib/audit/record.ts` from `lib/agent/keys.ts` | The revoke transaction |

Each action inserts one row and commits it with the action. A rollback keeps the previous audit rows and adds none.

### Agent key record

`agent_keys.key_hash` is 64 lowercase hex characters, the SHA-256 of the secret. `key_prefix` is the visible prefix from F13-REQ-008. The create result includes the secret. After the owner leaves that result, the secret is not read back and is not in the client bundle.

### Validation attempt

X adds `validation_attempts` to the storage contract. That contract is not in this branch.

| Column | Rule |
| --- | --- |
| `space_id` | The space of the call |
| `credential_kind` | `key` or `grant` |
| `credential_id` | That key or grant |
| `at` | Database time when `propose_change` returns |
| `valid` | True only when the result is valid |
| `had_get_context` | True when that same credential had called `get_context` before this return |

An invalid return inserts one attempt and no `proposals` row. A later `get_context` does not change `had_get_context`.

### Success windows

The caller passes `end`, a `timestamptz`. A 720-hour window starts at `end` minus 720 hours. A 168-hour window starts at `end` minus 168 hours. A timestamp is inside when it is greater than or equal to the start and less than `end`.

`lib/success/queries.ts` returns the measurement. It does not return a pass or a fail. "Under" is strict.

| Query | Returns | Target, compared by the caller |
| --- | --- | --- |
| Experiments recorded | Count of `documents` with `type` `experiment` in the space whose `spaces.slug` is `memento`, `created_at` inside the 720-hour window. Archived documents stay in the count. | 100% of runs the owner knows. The product returns the count (X-Q-006). |
| Agent-proposal share | Of that same set, the percentage whose creating proposal has `agent_key_id` set or `oauth_grant_id` set. | 80% or more |
| Median review | Median of `reviewed_at` minus `created_at`, in minutes. | Under 2 minutes. 2 minutes misses |
| Validation failures | Percentage of attempts in the 720-hour window with `had_get_context` true that have `valid` false. Attempts with `had_get_context` false are excluded. | Under 10%. 10% misses |
| External builders | Count of distinct `user_id` with a `space_uses` row in the 168-hour window, excluding a user whose membership on that use's space has role `owner`. | 5. Optional |

The creating proposal is the proposal id on the document's earliest revision. A null proposal id is a human direct save: it stays in the share's denominator and stays out of the numerator. `oauth_grant_id` is the column F12 adds. This design does not add it.

Share is `numerator / denominator * 100`, exact. The median sorts durations ascending. An odd count takes the middle duration. An even count takes the exact mean of the two central durations. Minutes are seconds divided by 60, exact. A zero denominator returns null, not 0. A window with no decided proposal returns a null median.

A proposal counts toward the median only when `status` is `merged` or `rejected` and `reviewed_at` is inside the window. `open`, `changes_requested`, and `withdrawn` are outside.

### Space use

X adds `space_uses` to the storage contract. That contract is not in this branch.

| Column | Rule |
| --- | --- |
| `space_id` | The space that was opened or whose tool was called |
| `user_id` | The person. A tool call uses the key's owning user or the grant's user |
| `kind` | `open` or `tool` |
| `at` | Database time of the open or the call |

A caller with no user id is not a person and is not stored. The current release writes no rows.

### Accessible state

The visible status line stays `Viewing`, `Editing`, or `Markdown source`. The page column also exposes a state the accessibility tree reads:

| Mode | Accessible state |
| --- | --- |
| `preview` | `Preview` |
| `edit` or `source` | `Editing` |

The state is a visually hidden status inside the page column. Its text is exactly that word. Turning editing off returns `Preview`.

### Focus

Tab order while all three columns are shown and no dialog is open: the files column, then the page, then the outline, top to bottom inside each. A column that is not shown is skipped, including the outline below the 860px shell breakpoint and a closed file drawer. While a dialog is open, Tab stays inside it. When it closes, focus returns to the control that opened it.

### Public read

While `spaces.public_read` is true, a caller with no membership receives the document and receives no proposal, agent key, member, or audit row. The codes and hints stay F11-REQ-030. The deployed share sheet does not set `public_read`.

## State

| State | Where it lives | What it changes |
| --- | --- | --- |
| Current release | No session, `postgresInUse()` false | File routes 404 unless `KB_LOCAL` is `1`. Drafts stay in `localStorage`. |
| `KB_LOCAL` | Server environment | The string `1` enables `/api/files` and `/api/mcp`. Any other value, including unset, is 404. |
| Chart sources beyond inline | The F05 parsers are wired | The allowlist runs. Until then, only the remote-URL refusal runs. |
| Ledger database in use | `postgresInUse()` true | One Next.js app, one Postgres database, one blob store. No queue, no worker, no separate MCP service. MCP stays `app/api/mcp/route.ts`. |
| Dialog open | The dialog host | Focus is trapped, then restored to the opener. |
| Theme | `document.documentElement.dataset.theme` | `light` or `dark`. Both are measured for contrast. |

Contrast, measured on both themes: body text at least 4.5:1, text of at least 24px or at least 18.5px and bold at least 3:1, a component and the focus indicator at least 3:1 against the adjacent color.

## Contracts

None of these files are in this branch.

| Contract | Branch | What X uses |
| --- | --- | --- |
| `specs/contracts/db.sql` | `origin/cursor/spec-storage-db-f59c` | `spaces.public_read`, `documents`, `proposals`, `agent_keys`, `assets`, `audit_events`. X adds `validation_attempts` and `space_uses` there when those tasks are implemented. This branch does not add the file. |
| `specs/contracts/tokens.md` | `origin/cursor/foundations-specs-839b` | The colors both themes paint. Contrast is measured on those colors. |
| `specs/contracts/keymap.md` | `origin/cursor/foundations-specs-839b` | Shortcuts the editor already runs. X adds no binding. |
| `specs/contracts/errors.md` | `origin/cursor/design-tasks-format-types-validation-279e` | X adds no code. `chart_remote`, `chart_source`, `permission_denied`, and `audit_immutable` stay with F05, F11, and F15. |

F04 owns the safe-tag list. F05 owns chart parsers. F12 owns the Inbox row. F13 owns the three tools and the key record. F15 owns sign-in secrets, once sign-in exists. F16 owns metric points, not these success queries. F17 owns the document index. The page-search dialog stays a filter of pages already loaded in the browser.
