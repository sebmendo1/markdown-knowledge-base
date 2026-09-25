# F18: History and Timeline

## Summary

History is one document's revisions: a list, a compare of any two, and a restore that appends a new revision. The timeline is those revisions across the space, grouped by day.

## Status and scope

Not started. The Ledger history screen, compare, and restore-as-a-new-revision are not in the product. The timeline is not in the product.

The editor slice is built. Version history is a dialog on the page, backed by browser localStorage. Those snapshots are not revisions. Restoring one replaces the working copy. It does not append a revision. ADR-0003 is that store. ADR-0008 keeps history out of the outline column.

This spec covers the editor dialog, the history screen, compare, restore, and the timeline. The revision write itself is F07. Validation is F06. The outline column is F08. Key bindings as a catalog are F20. Proposals are F12.

The product name in the UI is markdown-kb. A page is `/{project}/{page-path}`. There is no space segment and no `/memento` prefix. Sign-in is not built. ADR-0002.

## Users and stories

- **F18-US-001** As the owner, I want every save listed, so that I can see what the document used to say.
- **F18-US-002** As the owner, I want to compare any two revisions, so that I can read the change without leaving the document's history.
- **F18-US-003** As the owner, I want restore to keep the old revision and add a new one, so that history stays a list I can still open.
- **F18-US-004** As the owner, I want a timeline of the space, so that I can see what changed on a day.

## Requirements

- **F18-REQ-001** While the Ledger history screen is not in use, the system shall open version history as a dialog from the page menu item `Version history`, with the heading `Version history · {title}`, and shall not navigate to `/{project}/{page-path}/history`.
- **F18-REQ-002** While that dialog is open, the system shall list `Current version` with the time `Now`, then the snapshots in `markdown-kb:history:{id}` newest first, at most 50, then `Repository copy` with the time `From the files` when the page has a repository base.
- **F18-REQ-003** The system shall not record a localStorage snapshot as a revision.
- **F18-REQ-004** When the person restores a dialog entry whose content differs from the page, the system shall snapshot the current content with the label `Before restoring`, replace the working copy with the chosen content, show the toast `Version restored`, and shall not append a revision.
- **F18-REQ-005** While the dialog has no snapshots, the system shall show `Versions appear as you edit. Press ⌘S to keep one on purpose.` The `Current version` row stays.
- **F18-REQ-006** When the Ledger history screen is in use, the system shall serve it at `/{project}/{page-path}/history` and shall not use a `/memento` prefix. The page menu item `Version history` shall open that route, and the dialog shall not open.
- **F18-REQ-007** When the history screen is shown, the system shall list every revision of that document, newest first, each with its message, author label, and `created_at`. LocalStorage snapshots shall not appear in the list.
- **F18-REQ-008** When two different revisions are selected, the system shall show a word diff of their full UTF-8 content, frontmatter included, in stored key order. The older `created_at` is the base. When those times are equal, the smaller revision id is the base.
- **F18-REQ-009** When a caller who may restore chooses a revision and validation returns no error, the system shall append one revision whose content bytes equal the chosen revision, whose message is `Restore`, and whose parent is the head from before that insert, and shall leave the chosen revision unchanged.
- **F18-REQ-010** If validation of a restore returns an error, then the system shall append no revision and shall not change the head.
- **F18-REQ-011** If validation of a restore returns only warnings, then the system shall append the revision.
- **F18-REQ-012** When a restore runs, the system shall validate against the type schemas loaded at that time, not the schemas from the chosen revision's date.
- **F18-REQ-013** If the chosen revision's content bytes equal the head, then the system shall return `no_change` and shall append no revision.
- **F18-REQ-014** While sign-in is not built, the system shall let the person at the keyboard open history, compare, and restore, and shall not check a role.
- **F18-REQ-015** When sign-in is built, the system shall allow restore only for the Owner and Editor roles. If the caller is a Contributor, a Viewer, an agent key, or an OAuth grant, then the system shall return `permission_denied` and shall append no revision.
- **F18-REQ-016** When the timeline is in use, the system shall serve it at `/{project}/timeline` and shall group revisions by the calendar date of `created_at` in the viewer's time zone, newest day first, and newest `created_at` first within the day.
- **F18-REQ-017** The timeline shall list every revision in the space, including a human save and a merge. It shall not list an open proposal, a draft, or a localStorage snapshot.
- **F18-REQ-018** While a type filter or an author filter is set, the timeline shall show only revisions that match every set filter. The type filter is one of harness, eval, experiment, finding, decision, or doc. The author filter is one user or one agent key.
- **F18-REQ-019** When a revision has an agent key, the history row and the timeline row shall show that key's label with the agent glyph.
- **F18-REQ-020** When a public read-only link is on, the system shall show history and the timeline and shall refuse restore with `permission_denied`.
- **F18-REQ-021** When the history list or the timeline list has focus, the system shall move the selection to the next row on `J` and to the previous row on `K`.

## Acceptance scenarios

### F18-AC-001a

Given the Ledger history screen is not in use and the page title is `Notes`, when the person chooses `Version history`, then a dialog opens with the heading `Version history · Notes` and the URL stays `/{project}/{page-path}`.

### F18-AC-002a

Given snapshots labeled `Saved version` and `Before editing` in that order in localStorage, and a page whose repository base is `hello`, when the dialog opens, then the rows are `Current version`, `Saved version`, `Before editing`, and `Repository copy`.

### F18-AC-002b

Given 51 distinct snapshots written for one page, when the dialog opens, then the list shows 50 snapshots.

### F18-AC-003a

Given a snapshot in `markdown-kb:history:{id}`, when revisions are queried, then that snapshot is not a row in `revisions`.

### F18-AC-004a

Given the dialog and a snapshot whose content differs from the page, when the person restores it, then the working copy equals the snapshot, a new snapshot is labeled `Before restoring`, the toast is `Version restored`, and no revision is appended.

### F18-AC-004b

Given a dialog entry whose content equals the page, when the dialog is shown, then `Restore this version` is disabled and no snapshot is written.

### F18-AC-005a

Given a page with no snapshots, when the dialog opens, then the copy `Versions appear as you edit. Press ⌘S to keep one on purpose.` is shown and `Current version` is still a row.

### F18-AC-006a

Given the Ledger history screen is in use and the page path is `docs/notes.md` in project `guide`, when the person chooses `Version history`, then the URL is `/guide/docs/notes/history` and the dialog is not shown.

### F18-AC-007a

Given revisions 1, 2, and 3 on one document, newest last, when the history screen opens, then the rows are 3, 2, 1, and no localStorage snapshot is a row.

### F18-AC-007b

Given the screen opens on a document with a parent and a head, when nothing has been clicked, then the head and its parent are the two selected revisions.

### F18-AC-008a

Given revision A with content `title: One` and later revision B with content `title: Two`, when both are selected, then the diff shows `One` removed and `Two` added, and the key `title` appears once in that stored order.

### F18-AC-008b

Given two revisions with the same `created_at` and ids 4 and 9, when both are selected, then revision 4 is the base of the diff.

### F18-AC-009a

Given revision 3 whose content is 12 bytes, and validation with no errors, when an Owner restores it, then a new revision has those 12 bytes and the message `Restore`, its parent is the previous head, and revision 3 is unchanged.

### F18-AC-010a

Given a restore whose content fails `field_missing` against the schemas loaded now, when restore runs, then no revision is appended and the head is unchanged.

### F18-AC-011a

Given a restore whose only issue is `section_missing`, when an Owner restores, then one new revision is appended and the warning is kept on the result.

### F18-AC-012a

Given a revision that was valid under a schema that has since dropped a required field, and the content omits that field, when restore runs, then the code is `field_missing` and no revision is appended.

### F18-AC-013a

Given the person restores the head, when restore runs, then the code is `no_change`, the message is `Content is identical to the current head.`, the hint is `Change the document, or skip this save.`, and no revision is appended.

### F18-AC-014a

Given sign-in is not built, when the person at the keyboard restores a valid older revision, then a revision with message `Restore` is appended and no role is checked.

### F18-AC-015a

Given sign-in is built and the caller is a Viewer, when they restore, then the code is `permission_denied`, the message is `You do not have permission to change this document.`, the hint is `Ask an owner for a role that can edit.`, and no revision is appended.

### F18-AC-015b

Given sign-in is built and the caller is a Contributor, when they restore, then the code is `permission_denied`, the message is `Contributors propose changes. They do not save directly.`, the hint is `Submit a proposal instead of saving.`, and no revision is appended.

### F18-AC-015c

Given sign-in is built and the caller is an agent key, when they restore, then the code is `permission_denied`, the message is `Agents propose changes. They do not save directly.`, the hint is `Call propose_change. Agents cannot merge, delete, or administer.`, and no revision is appended.

### F18-AC-015d

Given sign-in is built and the caller is an Owner, when they restore a valid older revision, then a revision is appended.

### F18-AC-016a

Given the viewer time zone is America/New_York, one revision at 2026-09-22T23:30:00-04:00, and another at 2026-09-23T00:30:00-04:00, when the timeline is shown, then the revisions are under different local dates, and 2026-09-23 is above 2026-09-22.

### F18-AC-016b

Given two revisions on 2026-09-22 in the viewer's time zone, the later one created second, when the timeline is shown, then they share one group and the later revision is first.

### F18-AC-017a

Given one human save and one merged proposal, and one open proposal, when the timeline is shown, then both revisions appear and the open proposal does not.

### F18-AC-018a

Given a harness revision and an experiment revision, when the type filter is experiment, then only the experiment revision is shown.

### F18-AC-018b

Given revisions by user 4 and agent key 9, when the author filter is key 9, then only key 9's revisions are shown.

### F18-AC-019a

Given a revision whose agent key label is `Cursor · MacBook`, when the timeline row is read, then the accessible name includes `Cursor · MacBook` and the agent glyph is present.

### F18-AC-020a

Given a public read-only link, when that visitor opens history, then the revision list is shown.

### F18-AC-020b

Given a public read-only link, when that visitor restores, then the code is `permission_denied` and no revision is appended.

### F18-AC-021a

Given the timeline list has focus on the first row, when `J` is pressed, then the second row is selected.

### F18-AC-021b

Given the history list has focus on the second row, when `K` is pressed, then the first row is selected.

## Edge cases and errors

Restore runs the F06 validator. An error uses that code, message, and hint. Storage writes no revision. `no_change` and `head_moved` use the sentences below. `permission_denied` matches F07.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| History URL for a missing document | `document_missing` | `This document is not in the space.` | `Open a document from the sidebar.` |
| Restore bytes equal the head | `no_change` | `Content is identical to the current head.` | `Change the document, or skip this save.` |
| Head moved before restore commits | `head_moved` | `This document changed. Review changes.` | `Review the new head, then save again.` |
| Viewer, public visitor, or no session restores | `permission_denied` | `You do not have permission to change this document.` | `Ask an owner for a role that can edit.` A missing session, when sign-in exists, uses the hint `Sign in as an owner or an editor.` |
| Contributor restores | `permission_denied` | `Contributors propose changes. They do not save directly.` | `Submit a proposal instead of saving.` |
| Agent key or OAuth grant restores | `permission_denied` | `Agents propose changes. They do not save directly.` | `Call propose_change. Agents cannot merge, delete, or administer.` |

An archived document still has its history. Restore appends a revision and leaves `archived_at` unchanged.

The editor dialog disables `Restore this version` when the chosen content equals the page. That path has no code.

A snapshot write that localStorage refuses is the F07 quota toast. This screen does not add a second message.

## Limits and budgets

| Limit | Value |
| --- | --- |
| Editor snapshots | At most 50 per page, in localStorage. These are not revisions |
| Quiet gap before another `Before editing` snapshot | 10 minutes |
| Revisions on the history screen | Every revision of that document. No maximum is set |
| Timeline | Every revision in the space. No maximum is set |
| Compare | Two revisions. The diff is the full file, frontmatter included |
| Restore message | The six characters `Restore` |
| Document size on restore | 204800 bytes (200 KB, 200 × 1024), UTF-8, from F06. 204800 bytes is allowed |
| Day grouping | The viewer's time zone. The group key is the local calendar date |
| Viewport, desktop | 860px wide or wider: the revision list sits beside the compare |
| Viewport, phone | Under 860px, including 420px wide: the list is above the compare, full width |
| Coarse pointer | Restore and each list row are at least 44px by 44px |

No response-time budget is set for history or the timeline. The numbers above are counts, sizes, and layout widths.

## UI states

Copy is the same at 860px wide or wider and at 420px wide. Layout follows the table in Limits. There is no illustration.

The editor dialog has no loading state. The list is read from localStorage before the dialog is shown.

| Surface | State | Copy |
| --- | --- | --- |
| Editor dialog | Empty snapshots | `Versions appear as you edit. Press ⌘S to keep one on purpose.` |
| Editor dialog | Success | Toast `Version restored` |
| Editor dialog | Chosen row matches the page | `Restore this version` is disabled |
| History screen | One revision | `One revision. Save again to compare.` |
| History screen | Two selected | The word diff. No extra banner |
| History screen | Loading | Accessible name `Loading history`. The skeleton matches the list and the compare |
| History screen | Error | The message, then the hint |
| History screen | Success, restore | `Restored.` The new revision is selected |
| Timeline | Empty | `No revisions yet. Save a document to start the timeline.` The action is `New document` |
| Timeline | Loading | Accessible name `Loading timeline` |
| Timeline | Error | The message, then the hint |
| Timeline | Success | The day groups. No success banner |

`New document` is the new-document action in F09.

## Out of scope

- The revision insert, the parent chain, and `content_hash` (F07). This spec names the message `Restore` and the bytes.
- The rule catalog (F06). Restore uses it.
- The outline column. ADR-0008: it does not show history.
- The last five revisions in the PRD right panel. That panel is not the shipped column, and it is not this screen.
- The review screen's rendered diff (F12). Compare here is a word diff of the file.
- The keymap catalog (F20). `J` and `K` on these lists are F18-REQ-021.
- Metric history (F16).
- Import (F19).

## Open questions

None. ADR-0030 is Proposed. This spec follows it. The timeline lists every revision, including a human save. That is the rule in F18-REQ-017, not an open question.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:product-principles -->` (line 8) — history is the product. Every change is an immutable revision.
- `<!-- prd:core-concepts -->` (line 60) — a revision is an immutable snapshot with author, message, and parent.
- `<!-- prd:screens -->` (line 311) — History and Timeline routes and contents. This spec serves them without a `/memento` prefix.
- `<!-- prd:document-view -->` (line 331) — last five revisions in the right panel. Out of scope here. ADR-0008.
- `<!-- prd:invariants -->` (line 732) — revisions are immutable. Only a human save or a merge creates one. Restore is a human save.
- `<!-- prd:roles -->` (line 648) — Owner and Editor save directly.
- `<!-- prd:interaction-rules -->` (line 796) — lists are keyboard reachable. Agent authorship is visible.
- `<!-- prd:keyboard-shortcuts -->` (line 803) — `G` then `T` goes to the timeline. The binding catalog is F20.

Decisions in `specs/source/decisions-and-changes.md`: D3 (no auth yet), D6 (name markdown-kb), D7 (Owner and Editor save directly, later), C4 (phones), C7 (outline column only).

ADRs: ADR-0001, ADR-0002, ADR-0003, ADR-0008, ADR-0011, ADR-0030.

Shipped code this spec records and does not treat as Ledger history: `components/history-dialog.tsx`, `components/history-store.ts`, `components/document-chrome.tsx`.
