# F07: Storage

## Summary

Storage is the record of a space: each document, its immutable revisions, and the author's unsaved draft. A revision is a full snapshot, and the only writers of a revision are a human save and a merge.

## Status and scope

Not started. Server drafts and Postgres are not started. The product today reads Markdown files and stores the unsaved working copy in browser localStorage. ADR-0003 is the decision for that first release. ADR-0002 is the decision for sign-in: there is no auth yet, and the four roles are the later target.

This spec is the target Ledger database. The contract is `specs/contracts/db.sql`. It has every table in the PRD data model. An ORM schema has to match that file. The PRD names Drizzle. Drizzle is not started.

Postgres storage is in use only when the application writes those tables. It does not. While it is not in use, a repository document is the Markdown file in the project folder. The guide project reads `content/` at build time. A page that exists only in the browser is the localStorage working copy. The editor's trash and purge are not `archived_at`. This spec does not change them.

A localStorage snapshot is not a revision. The glossary's stand-in, at most 50 snapshots per page, stays a browser list until `revisions` exists.

This spec covers documents, revisions, drafts, the six invariants, and the merge transaction's writes. It follows Proposed ADR-0017, ADR-0019, ADR-0030, and ADR-0031. File bytes are F01. The validator is F06. The editor, the conflict screen, and the commit-message field are F09. Proposal lifecycle outside the merge write is F12. Sign-in screens are F15. Metric charts are F16. History's screen is F18. Import's screen is F19.

The product name in the UI is markdown-kb. A page is `/{project}/{page-path}`. A project is not a space. `documents.space_id` is the Ledger space.

## Users and stories

- **F07-US-001** As the owner, I want each save kept as a full snapshot, so that history is a list of revisions.
- **F07-US-002** As the owner, I want my unsaved draft back when I return, so that closing the tab keeps the working copy.
- **F07-US-003** As a reviewer, I want a merge to be the only other way a revision is created, so that an agent cannot write history.
- **F07-US-004** As the owner, I want a document archived, so that old links still have a row.

## Requirements

- **F07-REQ-001** While Postgres storage is not in use, the system shall read each repository document from its Markdown file and shall insert no row into `documents`, `revisions`, or `drafts`.
- **F07-REQ-002** While Postgres storage is not in use, the system shall store the unsaved working copy in browser localStorage and shall not send a draft to a server on a 2-second interval.
- **F07-REQ-003** The system shall not record a localStorage snapshot as a revision.
- **F07-REQ-004** The system shall store each Ledger document as one `documents` row with `id`, `space_id`, `path`, `slug`, `type`, `title`, `head_revision_id`, `archived_at`, `created_at`, and `updated_at`.
- **F07-REQ-005** The system shall keep `slug` unique among documents in a space, including archived documents, and shall keep `path` unique in that space.
- **F07-REQ-006** When a human archives a document, the system shall set `archived_at` from the database clock and shall keep the row, the slug, the path, and every revision.
- **F07-REQ-007** If a caller deletes a document, then the system shall return `delete_refused` and shall leave the row and its revisions unchanged.
- **F07-REQ-008** The system shall store `revisions.content` as the full Markdown file, frontmatter included, and shall store `revisions.frontmatter` as that file's JSON object.
- **F07-REQ-009** If a caller updates or deletes a revision, then the system shall return `revision_immutable` and shall leave the row unchanged.
- **F07-REQ-010** When a human save has no validation error, the system shall insert one revision and shall set `documents.head_revision_id` to that revision in the same database transaction. Warnings do not block the insert.
- **F07-REQ-011** When a merge has no validation error, the system shall, in one database transaction, insert one revision, set the head to it, replace that document's outgoing `links`, insert `metric_points` for that revision when the document is an experiment with status `concluded`, insert no metric points when it is not, insert one `audit_events` row with action `merge`, and set the proposal status to `merged` with `merged_revision_id` set to the new revision.
- **F07-REQ-012** If validation returns an error, then the system shall insert no revision and shall not change `head_revision_id`.
- **F07-REQ-013** The system shall insert a revision only for a human save or a merge. A human save includes a direct save, a restore, a view-mode task tick, and a valid import.
- **F07-REQ-014** When a revision is inserted, the system shall set `author_user_id` from the signed-in user. A human save shall leave `proposal_id` and `agent_key_id` null. A merge shall set `proposal_id`, shall copy `agent_key_id` from the proposal, and shall set `message` to the proposal summary.
- **F07-REQ-015** When a human save stores a message, the system shall keep it to one line of at most 120 characters, and shall store an empty string when the message is omitted. A character is one Unicode code point.
- **F07-REQ-016** When a human restores a revision, the system shall append one revision whose content bytes equal the chosen revision and whose message is `Restore`, and shall leave the chosen revision unchanged.
- **F07-REQ-017** When a caller who may save directly ticks one task in view mode, the system shall append one revision whose message is `Tick task`.
- **F07-REQ-018** When a valid file is imported, the system shall append one revision whose message is `Import`.
- **F07-REQ-019** The system shall keep each document's revisions as one chain. The first revision has a null parent. Each later parent is the head from before that insert. Each revision has at most one child.
- **F07-REQ-020** The system shall set `content_hash` to the SHA-256 digest of the UTF-8 bytes of `content`, written as 64 lowercase hexadecimal characters. The caller does not choose the digest.
- **F07-REQ-021** The system shall set `version` to the frontmatter integer `version` when that integer is from 1 through 999999999, and shall store null when frontmatter has no such integer.
- **F07-REQ-022** When sign-in is built and Postgres storage is in use, the system shall upsert the author's draft at an interval of 2 seconds while the working copy differs from the stored draft. That upsert shall not insert a revision and shall not run the validator.
- **F07-REQ-023** The system shall store at most one draft per document and user, and shall return that draft only to that user.
- **F07-REQ-024** When the author opens a document that has their draft, the system shall return that draft's content.
- **F07-REQ-025** When a human save or a merge commits, the system shall delete the session user's draft for that document. A merge shall also delete the proposal author's draft for that document.
- **F07-REQ-026** The system shall treat `links` and `metric_points` as derived data. A rebuild from revisions shall reproduce those rows. One script does the rebuild. Current metric points are the rows whose `revision_id` is the head. Older metric rows stay in the table.
- **F07-REQ-027** When a caller looks up version N of a document, the system shall return the revision whose `version` equals N with the smallest `created_at`, and, when two share that `created_at`, the smaller `id`. N is an integer from 1 through 999999999.
- **F07-REQ-028** While sign-in is not built, the system shall skip role checks for a file read and a localStorage draft, and shall not require a `users` row.
- **F07-REQ-029** When sign-in is built, the system shall allow a human save, a restore, a task tick, and an archive only for the Owner and Editor roles. If the caller is a Contributor, a Viewer, an agent key, or an OAuth grant, then the system shall return `permission_denied` and shall insert no revision.
- **F07-REQ-030** Where Postgres storage is in use, the system shall use Postgres on Neon, and point-in-time restore shall cover that database.
- **F07-REQ-031** If the head the caller read is no longer `head_revision_id`, then the system shall insert no revision and shall return `head_moved`.
- **F07-REQ-032** When a document is created, the system shall insert the `documents` row and its first revision in one transaction, and shall not commit a document whose `head_revision_id` is null.
- **F07-REQ-033** When a revision becomes the head, the system shall copy `title` and `type` from that revision's frontmatter onto the document in the same transaction.
- **F07-REQ-034** If `archived_at` is already set, then the system shall leave that timestamp unchanged.
- **F07-REQ-035** If the caller is a Viewer, an agent key, or an OAuth grant, then the system shall not write a server draft. A Contributor may write a server draft.
- **F07-REQ-036** When a document's slug changes, the system shall leave `links.to_slug` on other documents unchanged.
- **F07-REQ-037** If the UTF-8 content is longer than 204800 bytes (200 KB, 200 × 1024), then the system shall write no revision and no draft and shall return `too_large`. A value of 204800 bytes is allowed.

## Acceptance scenarios

### F07-AC-001a

Given the guide project and Postgres storage not in use, when a page whose file is in `content/` is opened, then the text is the file's text and no row is inserted into `documents`, `revisions`, or `drafts`.

### F07-AC-002a

Given Postgres storage not in use and project `guide`, when the working copy changes, then the bytes are in localStorage at `markdown-kb:workspace:guide` or the legacy key `markdown-kb:workspace`, and no request writes a server draft during the next 2 seconds.

### F07-AC-002b

Given that working copy, when the same browser profile opens the page again, then the working copy is restored from localStorage.

### F07-AC-003a

Given a browser history list at `markdown-kb:history:{id}` with at most 50 snapshots, when the list is read, then none of those snapshots is a row in `revisions`.

### F07-AC-004a

Given a created document, when its `documents` row is read, then `id`, `space_id`, `path`, `slug`, `type`, `title`, `head_revision_id`, `archived_at`, `created_at`, and `updated_at` are present, and `head_revision_id` points at a revision of that document.

### F07-AC-005a

Given a document with slug `hello`, including one with `archived_at` set, when a second document in the space uses slug `hello`, then the code is `slug_taken` and the second row is not committed.

### F07-AC-005b

Given a document at `docs/notes.md`, when a second document in the space uses that path, then the code is `path_invalid` and the second row is not committed.

### F07-AC-006a

Given a document with two revisions, when an Owner archives it, then `archived_at` is a timestamp from the database clock, the slug and path are unchanged, both revisions remain, and no revision is inserted.

### F07-AC-007a

Given a stored document, when a caller deletes the `documents` row, then the code is `delete_refused`, the message is `Documents are archived, not deleted.`, the hint is `Archive the document. The row and its revisions stay.`, and the row and its revisions remain.

### F07-AC-008a

Given a save whose file is 40 bytes of Markdown including the frontmatter block, when the revision is read, then `content` is those 40 bytes and it is not a diff against the parent.

### F07-AC-008b

Given frontmatter `title: Notes` and `type: doc`, when the revision is read, then `frontmatter` is the JSON object for that map.

### F07-AC-009a

Given a stored revision, when a caller updates `content` or deletes the row, then the code is `revision_immutable`, the message is `Revisions cannot be changed.`, the hint is `Save or merge to append a new revision.`, and the row is unchanged.

### F07-AC-010a

Given a document whose head the Owner read, and validation with no errors and one warning, when the Owner saves, then one new revision exists, `head_revision_id` is that revision, and the previous revision is unchanged.

### F07-AC-011a

Given an open proposal whose merge validates with no errors, when a reviewer merges it, then the transaction contains the new revision, the new head, the outgoing link rows, one audit row with action `merge`, and the proposal status `merged` with `merged_revision_id` equal to the new revision.

### F07-AC-011b

Given that merge is an experiment with status `concluded` and one metric, when it commits, then one new `metric_points` row references the new revision, and older metric rows for earlier revisions remain.

### F07-AC-011c

Given that merge is an experiment with status `abandoned`, when it commits, then no `metric_points` row references the new revision.

### F07-AC-012a

Given validation that returns `field_missing`, when a save or a merge runs, then no revision is inserted and `head_revision_id` is unchanged.

### F07-AC-013a

Given a dirty draft and an agent `propose_change` that validates, when the draft upserts and the proposal is stored, then `revisions` has no new row until a human save or a merge.

### F07-AC-014a

Given a human save by user 4, when the revision is read, then `author_user_id` is 4, `proposal_id` is null, and `agent_key_id` is null.

### F07-AC-014b

Given a proposal whose summary is `Log the 8k run`, whose author is user 2, and whose agent key is 9, when user 4 merges it, then the revision's `author_user_id` is 4, `proposal_id` is that proposal, `agent_key_id` is 9, and `message` is `Log the 8k run`.

### F07-AC-015a

Given a human save with no message, when the revision is read, then `message` is the empty string.

### F07-AC-015b

Given a message of 121 characters, when the save runs, then the code is `message_invalid` and no revision is inserted.

### F07-AC-015c

Given a message that contains a line feed, when the save runs, then the code is `message_invalid` and no revision is inserted.

### F07-AC-016a

Given revision 3 whose content is 12 bytes, when an Owner restores it and validation has no errors, then a new revision has those 12 bytes and message `Restore`, and revision 3 is unchanged.

### F07-AC-017a

Given view mode and a caller who may save directly, when they toggle one task and validation has no errors, then one new revision has message `Tick task`.

### F07-AC-018a

Given a valid Markdown file in an import, when the import stores it, then the document has one revision and the message is `Import`.

### F07-AC-018b

Given an import file that fails validation, when the import runs, then that file adds no document and no revision.

### F07-AC-019a

Given a document with no revisions, when the first save commits and a second save commits, then the first parent is null, the second parent is the first revision, and a third insert that names the first revision as parent is refused.

### F07-AC-020a

Given a revision's content, when it is stored, then `content_hash` is the 64-character lowercase hexadecimal SHA-256 of those UTF-8 bytes, and a caller-supplied hash is not kept.

### F07-AC-021a

Given frontmatter `version: 7`, when the revision is stored, then `version` is 7.

### F07-AC-021b

Given a `doc` with no `version` key, when the revision is stored, then `version` is null.

### F07-AC-022a

Given sign-in built, Postgres storage in use, and a working copy that differs from the stored draft, when 2 seconds have elapsed since the last successful draft write, then one draft upsert is written and no revision is inserted.

### F07-AC-022b

Given that dirty copy, when only 1 second has elapsed, then no further draft upsert is written.

### F07-AC-022c

Given a draft whose frontmatter would fail `field_missing`, when the 2-second upsert runs and the file is at most 204800 bytes, then the draft row is stored and no revision is inserted.

### F07-AC-023a

Given user 1's draft on a document, when user 2 queries drafts for that document, then no row is returned and user 1's content is not in the result.

### F07-AC-023b

Given a request that names user 1's draft while the session is user 2, when it is served, then the code is `draft_forbidden`, the message is `Drafts are private to their author.`, and the hint is `Open your own draft, or read the saved revision.`

### F07-AC-024a

Given user 1's draft content `hello`, when user 1 opens the document, then the returned draft content is `hello`.

### F07-AC-025a

Given user 1's draft and user 1's successful save, when the transaction commits, then user 1 has no draft row for that document.

### F07-AC-025b

Given a proposal author user 2 with a draft, when user 4 merges the proposal, then both user 2 and user 4 have no draft row for that document.

### F07-AC-026a

Given revisions, links, and metric points after a merge, when `rebuild_links_and_metric_points` runs, then the `links` rows and the `metric_points` rows match the rows the merge wrote.

### F07-AC-027a

Given revision 1 at version 7 with `created_at` T, and revision 2 at version 7 with a later `created_at`, when version 7 is looked up, then the result is revision 1.

### F07-AC-027b

Given two revisions at version 7 with the same `created_at`, when version 7 is looked up, then the result is the smaller `id`.

### F07-AC-027c

Given no revision at version 4, when version 4 is looked up, then the result is empty and no row is inserted. F06 reports `version_missing`.

### F07-AC-028a

Given sign-in is not built, when the person at the keyboard edits a localStorage draft, then the draft is stored and no role is checked.

### F07-AC-029a

Given sign-in is built and the caller is a Viewer, when they save, then the code is `permission_denied`, the message is `You do not have permission to change this document.`, the hint is `Ask an owner for a role that can edit.`, and no revision is inserted.

### F07-AC-029b

Given sign-in is built and the caller is a Contributor, when they save, then the code is `permission_denied`, the message is `Contributors propose changes. They do not save directly.`, the hint is `Submit a proposal instead of saving.`, and no revision is inserted.

### F07-AC-029c

Given sign-in is built and the caller is an Owner, when they save a valid document, then a revision is inserted.

### F07-AC-029d

Given sign-in is built and the caller is an agent key, when they save, then the code is `permission_denied`, the message is `Agents propose changes. They do not save directly.`, the hint is `Call propose_change. Agents cannot merge, delete, or administer.`, and no revision is inserted.

### F07-AC-030a

Given Postgres storage is in use, when the database is identified, then it is Postgres on Neon and point-in-time restore covers it.

### F07-AC-031a

Given the caller read head 5 and the head is now 6, when they save with expected head 5, then the code is `head_moved`, the message is `This document changed. Review changes.`, the hint is `Review the new head, then save again.`, and no revision is inserted.

### F07-AC-032a

Given a new path and a valid file, when the document is created, then the commit contains one `documents` row and one revision, and `head_revision_id` is that revision.

### F07-AC-032b

Given a transaction that inserts a `documents` row and no revision, when it commits, then the commit is refused.

### F07-AC-033a

Given a new revision whose frontmatter title is `Notes` and type is `doc`, when it becomes the head, then the document's `title` is `Notes` and `type` is `doc`.

### F07-AC-034a

Given `archived_at` already set to time T, when archive runs again, then `archived_at` remains T.

### F07-AC-034b

Given an archived document, when a caller clears `archived_at`, then the code is `archive_kept`, the message is `Archived documents stay archived.`, the hint is `There is no un-archive. The row and its revisions stay.`, and `archived_at` remains set.

### F07-AC-035a

Given a Viewer session and Postgres storage in use, when 2 seconds pass with a dirty copy, then no draft row is written.

### F07-AC-035b

Given a Contributor session, when the 2-second draft upsert runs, then one draft row exists for that user and no revision is inserted.

### F07-AC-036a

Given a link row whose `to_slug` is `hello` and whose `from_document_id` is a different document, when `hello` is renamed to `hello-notes`, then that link row still has `to_slug` `hello`.

### F07-AC-037a

Given content of 204801 bytes, when a save or a draft upsert runs, then the code is `too_large`, no revision is inserted, and no draft row is written.

### F07-AC-037b

Given content of 204800 bytes that validates, when the Owner saves, then the revision is stored.

## Edge cases and errors

Validation failures use the F06 codes, messages, and hints in `specs/contracts/errors.md`. Storage writes no revision when the result has an error. A violation of unique index `documents_slug_unique` is `slug_taken`. A violation of unique index `documents_path_unique` is `path_invalid`. Those two are PostgreSQL `unique_violation` errors. The application maps the index name to the code. The message and hint are the F06 templates.

`permission_denied` is an access refusal. It is the same refusal F01 uses. While sign-in is absent, it is not returned for a file read or a localStorage draft.

The database returns the code in `DETAIL` and in the constraint name. The message and the hint are the sentences below.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Delete a document | `delete_refused` | `Documents are archived, not deleted.` | `Archive the document. The row and its revisions stay.` |
| Update or delete a revision | `revision_immutable` | `Revisions cannot be changed.` | `Save or merge to append a new revision.` |
| Update a link or a metric point in place | `document_locked` | `Derived rows are replaced, not edited.` | `Delete and insert them in the save transaction, or run the rebuild script.` |
| Update or delete an audit event | `audit_immutable` | `Audit events cannot be changed.` | `Record a new audit event.` |
| Clear `archived_at` | `archive_kept` | `Archived documents stay archived.` | `There is no un-archive. The row and its revisions stay.` |
| Change title, type, path, slug, or head outside an append | `document_locked` | `Title, type, path, and slug change only when a revision is appended.` | `Save or merge to change the document.` |
| Commit a document with no revision | `head_missing` | `A document has no revision.` | `Insert the first revision in the same transaction.` |
| Expected head is stale | `head_moved` | `This document changed. Review changes.` | `Review the new head, then save again.` |
| Message longer than 120 characters, or a message with a line break | `message_invalid` | `The save message must be one line of at most 120 characters.` | `Shorten the message, or leave it empty.` |
| File longer than 204800 bytes | `too_large` | `Document is {bytes} bytes. The limit is 204800 bytes (200 KB).` | `Shorten the file to 204800 bytes or less, UTF-8.` |
| Read another user's draft | `draft_forbidden` | `Drafts are private to their author.` | `Open your own draft, or read the saved revision.` |
| Server draft write fails | `draft_not_stored` | `Draft was not saved.` | `Your text is still in the editor. Try the save again.` |
| Merge a proposal that is not `open` or `changes_requested` | `merge_closed` | `This proposal is not open for merge.` | `Merge an open proposal, or one with changes requested.` |
| Proposal names a different document | `proposal_target` | `The proposal targets a different document.` | `Merge it into the document it names.` |
| Merge transaction has no audit row | `merge_audit` | `A merge must record an audit event.` | `Insert the audit event in the same transaction as the revision.` |
| Merge transaction does not mark the proposal merged | `merge_unclosed` | `A merge must mark the proposal merged.` | `Set the proposal status to merged and store the new revision id in the same transaction.` |
| No session on a Postgres write | `permission_denied` | `You do not have permission to change this document.` | `Sign in as an owner or an editor.` |
| Contributor save, restore, tick, or archive | `permission_denied` | `Contributors propose changes. They do not save directly.` | `Submit a proposal instead of saving.` |
| Viewer save, restore, tick, or archive | `permission_denied` | `You do not have permission to change this document.` | `Ask an owner for a role that can edit.` |
| Agent key or OAuth grant save | `permission_denied` | `Agents propose changes. They do not save directly.` | `Call propose_change. Agents cannot merge, delete, or administer.` |

`{bytes}` is the integer UTF-8 length.

Shipped localStorage failure, today: when `localStorage` refuses the write, the toast is `This browser is out of room for pages. Export a project, then empty its Trash.` That toast has no code and no hint. It is not `draft_not_stored`. The working copy in memory is kept when the write returns false.

A conflicted merge writes no revision. The three-way merge screen is F09 and F12. Storage's part of that case is `head_moved` when the caller's head is stale.

An archived document still has its slug. A link to that slug is not `link_broken`. ADR-0019. `link_broken` stays an F06 code for a slug that matches no document.

## Limits and budgets

| Limit | Value |
| --- | --- |
| Server draft interval, target, not started | 2 seconds between successful upserts while the working copy differs from the stored draft. The first upsert is due within 2 seconds of the first difference. This is an interval, not a response-time budget, so it has no percentile |
| Server draft environment, target | The author's browser session and the app server writing Postgres. Not started |
| Document and draft size | 204800 bytes (200 KB, 200 × 1024), UTF-8. 204800 bytes is allowed. 204801 bytes is `too_large` |
| Title | 1 to 120 characters. A character is one Unicode code point |
| Slug | 1 to 80 characters, pattern `^[a-z0-9]+(-[a-z0-9]+)*$` |
| Save message | 0 to 120 characters, one line, no CR and no LF |
| Version | Integer 1 through 999999999, or null |
| Content hash | 64 lowercase hexadecimal characters, SHA-256 of the UTF-8 content |
| Draft rows | 1 row per document and user |
| Revision count | No maximum number of revisions is set |
| Shipped browser history list | At most 50 snapshots per page, in localStorage. These are not revisions |
| Shipped quiet gap before another "Before editing" snapshot | 10 minutes |
| Database encoding, target | UTF-8 |
| Postgres major version, target | 15 or newer |
| Point-in-time restore retention | No window is specified |

The 2-second server draft and the Neon database are not started. The live draft path is localStorage, written when the working copy changes, with no 2-second server write.

## UI states

This feature has no screen. Save, draft, and archive messages appear on the editing surface (F09) and the review surface (F12). The copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower. There is no illustration. Save, draft, and archive are not dialogs.

The loading copy does not replace the page text.

| State | Copy |
| --- | --- |
| Empty | No storage message. The page shows the file while Postgres is not in use, and the head revision when it is |
| Loading, save or server draft | `Saving…` |
| Loading, archive | `Archiving…` |
| Error | The message, then the hint |
| Partial, Postgres not in use | `Draft saved in this browser.` |
| Partial, server draft upsert succeeded | `Draft saved.` |
| Success, revision committed | `Saved.` |
| Success, archive committed | `Archived.` |

The shipped quota toast in Edge cases is the error copy for a full browser store. `Draft saved.` and `Archiving…` and `Archived.` are target copy. They are not started.

## Out of scope

- Folder layout, frontmatter grammar, and slug derivation (F01).
- The rule catalog and its messages, except the storage backstop for `too_large` and the unique slug and path violations (F06).
- Which bytes a pin renders, and link color (F03). The lookup in F07-REQ-027 is the row the pin uses.
- Editor chrome, the commit-message field, live preview, and the conflict resolver (F09).
- Proposal create, review notes, and stale marks (F12). Storage writes the merge's revision, head, links, metric rows, audit row, and merged status.
- Sign-in screens, sessions, and invites (F15). Role checks on the database writes are in this spec for when sign-in exists.
- Metric charts and comparability (F16).
- The history screen (F18). Restore's write is F07-REQ-016.
- Import UI (F19). The `Import` message is F07-REQ-018.
- Search indexes (F17).
- OAuth grant tables (F14).
- Better Auth session tables (F15).
- The nightly GitHub mirror. The PRD schedules that for v1.1.
- The editor trash, purge, and `.trash/` files in the current app.
- A legal hard-delete. That is the open question below. There is no ADR.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F07-Q-001 | How is a legal deletion request carried out when documents are never hard-deleted? | Do not add a hard-delete path. Archive stays the only removal. A legal-deletion path is new scope and needs a decision of its own. There is no ADR. | Product owner | Any erasure that removes a document row or a revision. It does not block F07-REQ-007 |

ADR-0017, ADR-0019, ADR-0030, and ADR-0031 are Proposed. This spec follows them. They are not open questions here.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:core-concepts -->` — five nouns, archive, revision rules.
- `<!-- prd:markdown-format -->` — a space is a folder of Markdown files. The database stores revisions of those files.
- `<!-- prd:versioned-references -->` — `[[slug@7]]` is the first save of that version.
- `<!-- prd:saving -->` — server draft every 2 seconds, private to the author. A save creates a revision.
- `<!-- prd:on-merge -->` — one transaction for the revision, the head, links, metric points, and the audit event.
- `<!-- prd:roles -->` — Owner and Editor save directly. Contributor and Viewer do not. Agents do not save directly.
- `<!-- prd:human-sign-in -->` — sessions are the later target. Not started.
- `<!-- prd:architecture-and-data-model -->`, `<!-- prd:stack -->`, `<!-- prd:data-model -->`, `<!-- prd:invariants -->`.
- `<!-- prd:backup -->` — point-in-time restore.
- `<!-- prd:import -->` — a valid file's first revision is authored `Import`.
- `<!-- prd:links -->` — backlinks are computed on merge.

Decisions in `specs/source/decisions-and-changes.md`: D2, D3, D5, D7. D2 and D5 are the live storage conflict, decided by ADR-0003. D3 is no auth yet, decided by ADR-0002. D7 keeps Owner and Editor as the roles that save directly, later.

Change requests C1 through C9 do not replace the data model. C1 hosts the app on Vercel. The editor that shipped is the file and localStorage store.

ADRs: ADR-0002, ADR-0003, ADR-0017, ADR-0018, ADR-0019, ADR-0030, ADR-0031.

Inventory rows this spec takes: REQ-014, REQ-044, REQ-045, REQ-046, REQ-065, REQ-186, REQ-264, REQ-386, REQ-398, REQ-399, REQ-401, REQ-407, REQ-408, REQ-409, REQ-410, REQ-411, REQ-429.

Contract: `specs/contracts/db.sql`. Functions named there: `create_document`, `append_revision`, `archive_document`, `save_draft`, `read_draft`, `revision_for_version`.

Shipped code this spec records and does not treat as Ledger revisions: `content/`, `components/workspace-store.ts`, `components/history-store.ts`, `lib/workspace/model.ts`.

### Invariant map

| PRD invariant | In the database | Test |
| --- | --- | --- |
| Revisions are immutable and store full content | Trigger `revisions_immutable`. `content` is the file. The insert trigger sets `content_hash`. Full-file-not-a-diff and YAML-versus-JSON are not expressible in SQL | `revisions_store_full_markdown` (F07-AC-008a), `frontmatter_matches_content` (F07-AC-008b) |
| Only a human save or a merge creates a revision, and both run the validator | Check `revisions_human_or_merge` constrains columns. The validator and the call sites are not expressible in SQL | `revision_requires_valid_document` (F07-AC-012a), `only_human_save_or_merge_inserts_revision` (F07-AC-013a) |
| `head_revision_id` moves in the transaction that creates the revision | Trigger `revisions_set_head`, guard `documents_guard`, deferred check `documents_head_present`, composite foreign key | F07-AC-010a, F07-AC-032b |
| `links` and `metric_points` are derived and can be rebuilt | Not expressible in SQL. The merge function writes the rows it is given. A Markdown rebuild cannot be a check | `rebuild_links_and_metric_points` (F07-AC-026a) |
| Documents are archived, never deleted | Trigger `documents_no_delete` | F07-AC-007a |
| Version lookup finds the first revision whose `version` equals N | Function `revision_for_version` and index `revisions_version_lookup`. Duplicate versions stay legal | F07-AC-027a, F07-AC-027b |

Also not expressible in SQL: the localStorage draft and the absence of a 2-second server write (`shipped_draft_is_local_storage`, F07-AC-002a), and the 2-second timer (`server_draft_interval_is_2_seconds`, F07-AC-022a, F07-AC-022b). Messages `Restore`, `Tick task`, and `Import` are the caller's message. SQL checks the length and stores the string. F07-AC-016a, F07-AC-017a, and F07-AC-018a cover those strings.

The table owner and a superuser bypass row security on `drafts`. The application role must not own the table. F07-AC-023a is the proof for a second user.
