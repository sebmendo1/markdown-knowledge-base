# F12 design: Proposals and review

Design for `specs/features/F12-proposals/spec.md` (branch `cursor/spec-proposals-review-a40a`). This file names modules, data shapes, state, and contracts. It does not copy that spec.

The review loop is off unless `LEDGER_REVIEW=1`. With the variable unset, the app matches the current tree: no Inbox, no proposal screen, no merge control, and no proposal row. `mcp/server.ts` and `lib/mcp/tools.ts` stay the editor stdio server.

## Modules

| Module | Path | Responsibility |
| --- | --- | --- |
| Review flag | `lib/review/flag.ts` | `reviewLoopEnabled()` is true only when `LEDGER_REVIEW=1`. Callers hide Inbox and refuse `createProposal` when it is false. |
| Proposal types | `lib/review/types.ts` | The proposal row, inbox row, marks, and error object. |
| Apply edits | `lib/review/apply-edits.ts` | Find-once replacement on a working copy. Case-sensitive, non-overlapping, left to right. |
| Submit | `lib/review/submit.ts` | Create-or-update checks, then one `open` insert when F06 returns no error. |
| Author | `lib/review/author.ts` | Records the agent key and owning user, the human user, or the OAuth grant label. |
| Read | `lib/review/read.ts` | Author read: status, review note, merged revision id. |
| Update | `lib/review/update.ts` | Author `update_proposal` after `changes_requested`. |
| Withdraw | `lib/review/withdraw.ts` | Human author, or the key's owning user, withdraws an `open` proposal. |
| Line merge | `lib/review/line-merge.ts` | Three-way line merge of full Markdown. No YAML parse, no key sort, no list-as-set. |
| Conflict | `lib/review/conflict.ts` | Conflicted mark, resolver input, and `merge_conflict` until `Resolved` is non-empty. |
| Marks | `lib/review/marks.ts` | `stale` and `conflicted` derived at read. Neither is a status. |
| Merge | `lib/review/merge.ts` | Calls the F07 merge transaction when the base is the head, or after a clean rebase. |
| Review actions | `lib/review/review-actions.ts` | Reject and request changes. Reject writes one `reject` audit event. |
| Edit before merge | `lib/review/edit-before-merge.ts` | Reviewer bytes merge in the same step. `⌘S` writes no revision. |
| Closed | `lib/review/closed.ts` | `merge_closed` and `review_closed` on `merged`, `rejected`, and `withdrawn`. |
| Permissions | `lib/review/permissions.ts` | Agent and grant refusal. When `LEDGER_AUTH=1`, Owner and Editor review; Contributor proposes; Viewer does neither. |
| Inbox query | `lib/review/inbox.ts` | Filter, open count, author-clock order, row fields, age words. |
| Block diff | `lib/review/block-diff.ts` | Block alignment and in-pair word diff. |
| Frontmatter diff | `lib/review/frontmatter-diff.ts` | Field, before, after, and numeric delta. |
| Section fold | `lib/review/section-fold.ts` | Collapse unchanged sections. |
| Review keys | `lib/review/keys.ts` | Scope order and the review bindings. |
| Inbox route | `app/[project]/inbox/page.tsx` | `/{project}/inbox`. First segment is the project. |
| Proposal route | `app/[project]/inbox/[id]/page.tsx` | `/{project}/inbox/{id}`. |
| Inbox list | `components/review/inbox-list.tsx` | Rows, filters, empty and loading copy, sidebar count. |
| Proposal screen | `components/review/proposal-screen.tsx` | Header, rationale, warnings, inline actions, no review dialog. |
| Rendered diff | `components/review/rendered-diff.tsx` | Green underline and red strike, source toggle, charts and diagrams. |
| Conflict panes | `components/review/conflict-panes.tsx` | Base, Current, Proposal, and Resolved on the proposal screen. |
| Optimistic review | `components/review/optimistic.ts` | Shows success copy, then restores the row if the write fails. |
| Sidebar | `components/file-sidebar.tsx` | Inbox item and open count, omitted on a public read view. |

`lib/review/submit.ts` is the function `propose_change` and the human Propose control both call. Direct save for Owner and Editor stays on the F07 revision writer and does not call submit.

## Data shapes

Status values are `open`, `changes_requested`, `merged`, `rejected`, and `withdrawn`. Action values are `create` and `update`.

The row is the F07 `proposals` table in `specs/contracts/db.sql`, plus two columns this feature adds:

| Column | Type | Rule |
| --- | --- | --- |
| `author_clock` | `timestamptz NOT NULL` | Set at insert to `created_at`. A stored `update_proposal` sets it to the database time. Reject, request changes, and withdraw write `reviewed_at` and leave `author_clock` unchanged. |
| `oauth_grant_id` | `bigint NULL` | Set when an F14 grant is the author. Null for a human or an agent key. At most one of `agent_key_id` and `oauth_grant_id` is set. The foreign key arrives with F14. |

`author_user_id` is always the human: the key owner, the grant's approving user, or the signed-in author. A human proposal leaves `agent_key_id` and `oauth_grant_id` null.

Stored body after a successful edit apply: `content` holds the working copy and `edits` is null, which matches `proposals_body`. Validation warnings live in `validation` jsonb. `review_note` holds the request-changes note or the optional reject reason.

```ts
type ProposalError = { code: string; message: string; hint: string };

type InboxFilter = "open" | "changes_requested" | "closed";

type InboxRow = {
  id: number;
  authorLabel: string;
  authorKind: "agent" | "human";
  action: "Create" | "Update";
  path: string;
  summary: string;
  validation: "Valid" | "Warnings";
  age: string;
  status: "Open" | "Changes requested" | "Merged" | "Rejected" | "Withdrawn";
  stale: boolean;
  conflicted: boolean;
};
```

`authorKind: "agent"` covers an agent key and an OAuth grant. Both use the agent glyph plus the label (`Cursor · MacBook`, `Muse · Sebastian`).

Age uses `created_at`: `just now` under 60 seconds, `{n}m` up to 3600 seconds, `{n}h` up to 48 hours, then `{n}d`.

Stale is true when status is `open` or `changes_requested` and the database clock is at least 720 hours after `author_clock`. Conflicted is true when `line-merge` of base, head, and stored content conflicts. A create has no base, so it is not conflicted.

Open count is the number of rows whose status is `open` or `changes_requested`, including stale and conflicted rows. Inbox order is `author_clock` ascending, then `id` ascending. The Closed filter lists `merged`, `rejected`, and `withdrawn`. The Open filter lists status `open` only.

Block alignment follows F12-REQ-028: words are `[A-Za-z0-9]+` lowercased as a multiset; similarity is intersection over union; empty equal types score 1; a pair needs equal types and similarity of at least 0.5. Word diff runs only inside a paired block.

The line merge walks lines. A line changed on only one side takes that side. The same line changed on both sides to different text is a conflict. Output keeps base order.

## State

Server state is the proposal row. Marks are computed when a row is read.

Client state on the proposal screen:

| Field | Values | Notes |
| --- | --- | --- |
| `diffMode` | `rendered` or `source` | `rendered` is the default. `D` toggles. |
| `folded` | set of section keys | Unchanged sections start collapsed. |
| `note` | string | Request-changes note. Starts empty. `C` focuses it and does not send. |
| `reason` | string | Reject reason. `R` outside a text field rejects at once with a null reason. |
| `editing` | boolean | Edit-before-merge. Document editing stays off. |
| `resolved` | string | Conflict `Resolved` field. Starts empty. |
| `pending` | `merge`, `reject`, `changes`, or null | Optimistic label before the server returns. |

Inbox client state is the filter, default `open`. A dialog (settings, search, share, shortcut help) sits above the review scope, so review keys do not fire while one is open. A single-character shortcut does not fire while focus is in a text field. Scope order is dialog, editor, review, document, global. `G` then `I` within 1000 ms in the global scope opens the Inbox.

Copy for empty, loading, error, and success is the Inbox and Proposal tables in the spec, at 860px and at 420px. At 900px and wider, a changed chart or diagram is side by side and the conflict panes are side by side. Below 900px they stack. Merge, Request changes, Reject, and Edit before merge stay on the proposal screen.

## Contracts

- `specs/contracts/db.sql` — `proposals`, `revisions`, `audit_events`, and the F07 merge transaction. This feature adds `author_clock` and `oauth_grant_id`.
- `specs/contracts/errors.md` — F06 codes, including `no_change`, `base_missing` when F06 owns that sentence, `too_large`, `path_invalid`, and `slug_taken`. Proposal codes in the F12 edge-case table live in `lib/review/types.ts`.
- `specs/contracts/keymap.md` — review bindings this feature owns: `G I`, `C`, `E`, `M`, `R`, `D`, `J`, `K`. The rest of the keymap is F20.
- F13 `specs/contracts/mcp-tools.json` — `propose_change`, `update_proposal`, and `get_proposal` call `submit`, `update`, and `read`. This feature does not define those JSON schemas.
- F15 — when `LEDGER_AUTH=1`, `lib/review/permissions.ts` reads the membership role. It does not issue sessions.

## Boundaries

F06 validates. F07 inserts the revision, the links, the metric points, and the merge audit row inside one transaction. F12 decides when that transaction runs. F13 transports the three proposal tools. F14 stores the grant label F12 shows. F16 draws charts. Public read hiding of the Inbox is this feature; the public link itself is F11.
