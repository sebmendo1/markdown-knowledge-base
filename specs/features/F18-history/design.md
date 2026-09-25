# F18 design: History and Timeline

Two histories. The editor dialog stores snapshots in the browser. The Ledger screen lists `revisions` rows. Requirements are in `spec.md` on `origin/cursor/spec-history-import-home-08e8`.

The Ledger screen is in use when the open project reads documents from Postgres. Until then the dialog is the history UI, and `/{project}/{page-path}/history` is not served.

## Modules

Built, and kept while the Ledger screen is not in use:

| Module | Role |
| --- | --- |
| `components/history-dialog.tsx` | Dialog heading, rows, restore button, empty copy. |
| `components/history-store.ts` | `markdown-kb:history:{id}`, cap 50, restore into the working copy. |
| `components/document-chrome.tsx`, `components/tree-items.ts` | Page menu item `Version history`. |

Not started:

| Module | Role |
| --- | --- |
| `lib/history/list.ts` | Revisions of one document, newest first. No localStorage rows. |
| `lib/history/diff.ts` | Word diff of two full UTF-8 contents, frontmatter included. |
| `lib/history/restore.ts` | Validate, then `append_revision` with message `Restore`. |
| `lib/history/timeline.ts` | Space revisions grouped by the viewer's local calendar date. |
| `components/history/history-screen.tsx` | List beside compare, or list above compare under `860px`. |
| `components/history/timeline-screen.tsx` | Day groups, type filter, author filter. |
| `app/[project]/timeline/page.tsx` | `/{project}/timeline`. |
| `app/[project]/[...slug]/history/page.tsx` | `/{project}/{page-path}/history`. The catch-all page must not treat `history` as a document segment. |

`J` and `K` live on the two list components. The keymap catalog is F20.

## Data

A dialog snapshot is `{ at: number, content: string, label: string }` in `localStorage` under `markdown-kb:history:{id}`. At most 50. These rows are never inserted into `revisions`.

Dialog order: `Current version` at `Now`, then snapshots newest first, then `Repository copy` at `From the files` when the page has a repository base.

A Ledger revision is one `revisions` row: `id`, `document_id`, `parent_revision_id`, `content`, `created_at`, `message`, `author_user_id`, `agent_key_id`. The history list shows message, author label, and `created_at`, newest first.

Compare selects two different revisions. The older `created_at` is the base. When those times are equal, the smaller `id` is the base. The diff is a word diff of the full file in stored key order.

On open, with nothing clicked, the two selected revisions are the head and its parent. One revision on the document shows `One revision. Save again to compare.`

Restore, when the caller may restore and validation returns no error:

- Content bytes equal the chosen revision.
- Message is `Restore`.
- Parent is the head from before the insert.
- The chosen revision is not updated (`revisions_immutable`).

Validation uses the type schemas loaded now, not the schemas from the chosen revision's date. Errors append nothing and leave the head. Warnings, including `section_missing`, still append. Bytes equal to the head return `no_change` and append nothing. A head that moved returns `head_moved` from `append_revision`.

An archived document keeps `archived_at`. Restore still appends.

Timeline rows are every revision in the space: a human save and a merge. An open proposal, a draft, and a localStorage snapshot are not rows. Group key is the calendar date of `created_at` in the viewer's time zone. Newest day first. Inside a day, newest `created_at` first.

Filters, while set, all apply:

| Filter | Values |
| --- | --- |
| Type | One of harness, eval, experiment, finding, decision, doc |
| Author | One user or one agent key |

A revision with `agent_key_id` shows that key's label and the agent glyph.

## State

| Surface | State | What is shown |
| --- | --- | --- |
| Dialog | Empty snapshots | `Versions appear as you edit. Press ⌘S to keep one on purpose.` `Current version` stays |
| Dialog | Chosen content equals the page | `Restore this version` disabled. No snapshot is written |
| Dialog | Restored | Working copy replaced. New snapshot labeled `Before restoring`. Toast `Version restored`. No revision |
| History | Loading | Accessible name `Loading history`. Skeleton of the list and the compare |
| History | One revision | `One revision. Save again to compare.` |
| History | Two selected | The word diff. No extra banner |
| History | Error | The message, then the hint |
| History | Restored | `Restored.` The new revision is selected |
| Timeline | Empty | `No revisions yet. Save a document to start the timeline.` Action `New document` |
| Timeline | Loading | Accessible name `Loading timeline` |
| Timeline | Error | The message, then the hint |
| Timeline | Success | Day groups. No success banner |

The dialog has no loading state. It reads `localStorage` before it opens.

Copy is the same at `860px` or wider and at `420px`. At `860px` or wider the revision list sits beside the compare. Under `860px` the list is above the compare, full width. Restore and each list row are at least `44px` by `44px` on a coarse pointer.

While the Ledger screen is not in use, `Version history` opens the dialog and the URL stays `/{project}/{page-path}`. When the Ledger screen is in use, that item opens `/{project}/{page-path}/history` and the dialog does not open. `docs/notes.md` in project `guide` is `/guide/docs/notes/history`.

While sign-in is not built, the person at the keyboard may open history, compare, and restore, and no role is checked. When sign-in is built, only Owner and Editor may restore. A Contributor, a Viewer, an agent key, or an OAuth grant gets `permission_denied` and no revision is appended. A public read-only link shows history and the timeline and refuses restore with `permission_denied`.

Codes: `document_missing`, `no_change`, `head_moved`, `permission_denied`, plus F06 codes on a failed restore. Messages and hints are the table in the spec.

## Contracts

From `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c`:

- `revisions` and `revisions_document_order` on `(document_id, created_at, id)`.
- `revisions_immutable` blocks update and delete. Restore inserts. It does not rewrite the chosen row.
- `append_revision` sets `parent_revision_id` to the locked head and returns `head_moved` when `p_expected_head` is not that head. Message `Restore` fits `revisions_message_shape` (one line, at most 120 characters).
- `revisions_before_insert` sets `author_user_id` from `ledger_session_user()` and rejects content over `204800` bytes. `204800` is allowed.
- `documents.head_revision_id` and `documents.archived_at`. `documents_guard` keeps an archived document archived.
- `agent_keys` for the label on a revision that has `agent_key_id`.
- `proposals` and `drafts` are not history rows. A merge appears because it inserted a `revisions` row.

`revisions.author_user_id` is `NOT NULL`. While sign-in is absent, `ledger.user_id` is unset, so a restore insert cannot land until that column accepts null. That schema change is F19 step 2, which F18 restore depends on. This feature does not add a second author column.

F06 owns the rule catalog. F07 owns the insert, the parent chain, and `content_hash`. F12 owns the review diff. This compare is a word diff of the file.
