# F07: Storage design

Storage has two modes. While Postgres is not in use, a repository document is the Markdown file on disk and the unsaved working copy is browser localStorage. When Postgres is in use, the only record is the database in [specs/contracts/db.sql](../../contracts/db.sql). That file is the contract. An ORM schema, when one is added, has to match it. The PRD names Drizzle. Drizzle is not started, and this design does not add it.

The application does not reimplement the six invariants. It calls the functions in the contract and refuses a write before that call when the rule is not expressible in SQL. File mode never opens a connection and never inserts into `documents`, `revisions`, or `drafts`.

## Modules

### File mode

These modules already ship. They stay the path while Postgres storage is not in use. None of them writes a Ledger revision.

| Module | Role |
| --- | --- |
| `lib/docs.ts` | Reads the guide project from `content/` at build time. The text of a page is the file's text. |
| `lib/store/fs-store.ts` | Reads and writes Markdown files for a local project. A file write is not a `revisions` insert. |
| `lib/workspace/model.ts` | In-memory `Workspace` of `Page` rows. Trash and purge are not `archived_at`. |
| `components/workspace-store.ts` | Persists the working copy in localStorage. Keys are `markdown-kb:workspace:{project}` and the legacy key `markdown-kb:workspace`. |
| `components/history-store.ts` | Browser snapshot list at `markdown-kb:history:{id}`, at most 50 snapshots, with a 10-minute quiet gap before another "Before editing" snapshot. A snapshot is not a revision. |
| `components/disk-sync.ts` | Copies the working copy to the project folder. It does not call the database. |

`lib/storage/mode.ts` is the switch. `postgresInUse()` is false until the application is configured to write the contract tables. While it is false, the file-mode modules run and the Postgres modules below are not called.

### Postgres mode

These modules are not started. Each one is a caller of the contract. The SQL functions are the writers of `documents`, `revisions`, `drafts`, and `audit_events`. The role `ledger_app` can execute those functions and must not own the tables.

| Module | Calls | Does not |
| --- | --- | --- |
| `lib/storage/mode.ts` | Reads whether Postgres storage is in use | Open a pool while it is not |
| `lib/storage/connection.ts` | Connects to Postgres on Neon when storage is in use. Point-in-time restore covers that database | Choose a second database |
| `lib/storage/session.ts` | Sets `ledger.user_id` and, when the caller is an agent key, `ledger.agent_key_id`, for one transaction | Require a `users` row for a file read or a localStorage draft |
| `lib/storage/errors.ts` | Maps `P0001` `DETAIL` and the constraint name to the storage code. Maps `unique_violation` on `documents_slug_unique` to `slug_taken` and on `documents_path_unique` to `path_invalid` | Invent codes |
| `lib/storage/documents.ts` | `create_document`, `archive_document` | `DELETE` a document, or clear `archived_at` |
| `lib/storage/save.ts` | Human save, restore, view-mode task tick, and valid import. Calls the F06 validator, then `append_revision` or `create_document` with `proposal_id` null | Insert a revision when validation has an error, or when the caller is not an Owner or Editor |
| `lib/storage/merge.ts` | `append_revision` with the proposal id, the outgoing link rows, and the metric rows | Proposal create, review notes, stale marks, or the conflict screen (F12, F09) |
| `lib/storage/drafts.ts` | `save_draft` and `read_draft`. The 2-second interval lives here | Run the validator, or insert a revision |
| `lib/storage/revision-lookup.ts` | `revision_for_version` | Insert a row when version N is missing |
| `lib/storage/rebuild.ts` | Script `rebuild_links_and_metric_points` | Update a `links` or `metric_points` row in place |

F06 owns the validator. Storage only reads its result: an error blocks `append_revision` and `create_document`; a warning does not. A draft upsert does not call it. F09 renders save, draft, and archive copy. F15 owns sign-in screens. Role checks on these writes are in this design for when sign-in exists.

## Data shapes

### File mode

From `lib/workspace/model.ts` and `components/history-store.ts`:

```text
Page        id, path, content, origin?, base?, createdAt, updatedAt
Workspace   version: 1, pages, folders, trash, removed
Snapshot    at, content, label
```

`Snapshot` is the localStorage history list. It has no `content_hash`, no parent, and no row in `revisions`.

### Rows

Column names and checks are the tables in [specs/contracts/db.sql](../../contracts/db.sql). The shapes the modules pass and read:

```text
Document
  id, space_id, path, slug, type, title,
  head_revision_id, archived_at, created_at, updated_at

Revision
  id, document_id, parent_revision_id,
  content,            -- full Markdown file, frontmatter included, not a diff
  frontmatter,        -- JSON object of that file's frontmatter
  content_hash,       -- set by the insert trigger, 64 lowercase hex
  version,            -- frontmatter integer 1..999999999, or null
  message,            -- one line, 0..120 Unicode code points
  author_user_id, agent_key_id, proposal_id, created_at

Draft
  document_id, user_id, content, updated_at
  -- primary key (document_id, user_id)

Link
  from_document_id, to_slug, to_version, in_frontmatter, field

MetricPoint
  space_id, experiment_document_id, revision_id,
  eval_slug, eval_version, metric_key, value,
  harness_slug, harness_version, date,
  environment, sample_size, verdict

AuditEvent
  space_id, actor_user_id, agent_key_id,
  action, target, data, created_at
```

`links` and `metric_points` are derived. A rebuild from `revisions` reproduces them. Current metric points are the rows whose `revision_id` is the head. Older metric rows stay.

### Function inputs

The modules pass these arguments and no others. Names match the contract.

```text
create_document(space_id, path, slug, content, frontmatter, message,
                proposal_id, links, metric_points) -> document id

append_revision(document_id, content, frontmatter, message, proposal_id,
                expected_head, path, slug, links, metric_points) -> revision id

archive_document(document_id) -> archived_at

save_draft(document_id, content) -> updated_at

read_draft(document_id) -> content or null

revision_for_version(document_id, version) -> revision id or null
```

The caller does not supply `content_hash`, `author_user_id`, `version`, or `created_at`. The insert trigger sets the hash from the SHA-256 of the UTF-8 `content`, sets `version` from frontmatter, sets `author_user_id` from `ledger.user_id`, and sets `created_at` from `clock_timestamp()`. A human save leaves `proposal_id` and `agent_key_id` null. A merge sets `proposal_id`, copies `agent_key_id` from the proposal, and sets `message` to the proposal summary, ignoring the message argument.

`links` is a JSON array of `{to_slug, to_version, in_frontmatter, field}`. `metric_points` is a JSON array of the metric columns except the ids the function fills. The function writes metric rows only when frontmatter `type` is `experiment` and `status` is `concluded`.

### Limits the shapes carry

| Field | Rule |
| --- | --- |
| `content` | UTF-8, 1 through 204800 bytes. 204800 is allowed. 204801 is `too_large` |
| `title` | 1 to 120 Unicode code points |
| `slug`, `to_slug` | 1 to 80 characters, `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `message` | 0 to 120 code points, no CR and no LF. Omitted human message is stored as `''` |
| `version` | Integer 1 through 999999999, or null |
| Draft rows | One per document and user |

A character in a length check is one Unicode code point. Byte length is the UTF-8 octet length.

### Errors

Storage returns `{code, message, hint}`. The sentences are the table in `spec.md`. Validation errors keep the F06 code. `lib/storage/errors.ts` reads `DETAIL` from `storage_fail`. The file-mode quota toast stays a toast with no code. It is not `draft_not_stored`.

## State

### Mode

One flag, `postgresInUse`.

- False: read files, write localStorage, skip role checks, require no `users` row, send no draft request on a 2-second interval.
- True: the session and the functions below. File bytes are no longer the Ledger record.

Switching the flag on does not import `content/` by itself. Import's write, when it runs, is `create_document` or `append_revision` with message `Import`.

### File-mode state

The working copy lives in the `Workspace` in memory and in localStorage under the project key. Reopening the same browser profile restores it. A change writes localStorage immediately. There is no timer and no server draft. The history list is a separate localStorage key, capped at 50, and is never copied into `revisions`.

### Postgres session

Each write runs as `ledger_app` inside one transaction:

```text
set_config('ledger.user_id', <session user>, true)
set_config('ledger.agent_key_id', <agent key or ''>, true)
```

`ledger_session_user()` reads that setting. While sign-in is not built, file mode does not set it. Postgres writes still require it, because `assert_writer` refuses a null user. Tests set the setting directly. F15 supplies it when sign-in exists.

Caller class, decided in `lib/storage/session.ts` before the SQL call:

| Caller | Human save, restore, tick, archive | Server draft |
| --- | --- | --- |
| Owner, Editor | Allowed | Allowed |
| Contributor | `permission_denied` | Allowed |
| Viewer | `permission_denied` | No write |
| Agent key | `permission_denied` | No write |
| OAuth grant | `permission_denied` | No write |
| No session | `permission_denied` | No write |

The SQL backstop is `assert_writer` for a save or archive, and the role check inside `save_draft` for a draft. An OAuth grant is refused in `lib/storage/session.ts` before the call, because membership roles do not include a grant.

### Document and head

A document is created only by `create_document`: one `documents` row and its first revision in one transaction. Commit of a document whose `head_revision_id` is null is refused (`head_missing`). After that commit the head points at a revision of that same document.

A later revision is `append_revision`. The expected head is the head the caller read. If it is not `head_revision_id`, the function returns `head_moved` and inserts nothing. On success the same transaction sets `head_revision_id`, copies `title` and `type` from the new revision's frontmatter, and sets `updated_at`.

`slug` stays unique in the space among archived and live documents. `path` stays unique in the space. A slug change updates that document only. Other documents' `links.to_slug` values are left as stored.

### Revision chain

Revisions for one document are one chain. The first parent is null. Each later parent is the head from before that insert. `revisions_one_child` allows at most one child per parent. An insert that names an older revision as parent is refused. Rows are insert-only: update or delete returns `revision_immutable`.

A human save includes a direct save, a restore (message `Restore`, content bytes equal to the chosen revision, chosen row unchanged), a view-mode task tick (message `Tick task`), and a valid import (message `Import`). An invalid import adds no document and no revision. A draft upsert and `propose_change` add no revision. A merge is the only other insert.

### Draft timer

While sign-in is built and Postgres is in use, `lib/storage/drafts.ts` upserts when the working copy differs from the stored draft. The first upsert is due within 2 seconds of the first difference. The next waits 2 seconds after the last successful upsert. The interval is not a response-time budget. One second after a success, no further upsert is written. The upsert does not run the validator and does not insert a revision, including when frontmatter would fail `field_missing`, as long as the file is at most 204800 bytes.

`read_draft` returns the session user's content. Another user's draft is not in the result. A request that names another user's draft returns `draft_forbidden`. Row security on `drafts` uses `ledger_session_user()`. The table owner and a superuser bypass it, so `ledger_app` must not own `drafts`.

A successful human save deletes the session user's draft for that document. A merge also deletes the proposal author's draft. Both deletes are inside `append_revision`.

### Derived rows

On each append the function deletes `links` for that document and inserts the outgoing set it was given. It does not update link rows, and it does not change `to_slug` on other documents. Metric points are inserted for the new revision only when the document is a concluded experiment. An abandoned experiment adds none. Older metric rows stay.

`rebuild_links_and_metric_points` reads revisions and writes those same rows again: outgoing links from each document's head, and metric rows for every concluded experiment revision. It deletes and inserts. It does not `UPDATE` `links` or `metric_points` (that returns `document_locked`). It does not change revision bytes.

### Transaction flag

`revisions_before_insert` sets `ledger.appending` to `on` for the transaction. `documents_guard` allows `title`, `type`, `path`, `slug`, and `head_revision_id` to change only while that flag is on. Outside an append, those changes return `document_locked`. Archive is the other allowed document update: `archive_document` sets `archived_at` from `clock_timestamp()` and does not insert a revision. A second archive leaves the timestamp. Clearing it returns `archive_kept`.

## How a write runs

Human save or create, Postgres in use:

1. `lib/storage/session.ts` allows the caller only for Owner or Editor.
2. UTF-8 length above 204800 returns `too_large` and writes no revision and no draft. 204800 continues.
3. The message, when present, is one line of at most 120 code points, or the call returns `message_invalid`. Omitted becomes `''`.
4. F06 runs. Any error returns that code and leaves `head_revision_id` unchanged. Warnings continue.
5. Create calls `create_document`. A later save calls `append_revision` with the head the caller read and `proposal_id` null.
6. The function inserts the revision, moves the head, copies title and type, replaces outgoing links, inserts metric points only for a concluded experiment, and deletes the session user's draft.

Merge uses the same function with the proposal id. The proposal must be `open` or `changes_requested` and must name this document. The transaction also sets the proposal to `merged` with `merged_revision_id`, inserts one `audit_events` row with action `merge`, and deletes both the reviewer's and the proposal author's drafts. A missing audit row or a proposal that is not marked merged fails the transaction (`merge_audit`, `merge_unclosed`).

Restore, tick, and import are human saves. The messages are `Restore`, `Tick task`, and `Import`. Restore copies the chosen revision's content bytes and does not update that row.

Server draft, Postgres in use and sign-in built:

1. Viewer, agent key, and OAuth grant write nothing.
2. Length above 204800 returns `too_large`.
3. After the 2-second gap, `save_draft` upserts the one row for this document and user. No validator. No revision.
4. A failed write returns `draft_not_stored`. The editor text stays in memory.

Archive calls `archive_document`. It does not append a revision.

Version N is `revision_for_version`: the row whose `version` equals N with the smallest `created_at`, then the smaller `id`. N is an integer from 1 through 999999999. No such row returns empty and inserts nothing. F06 reports `version_missing`.

## Contract

[specs/contracts/db.sql](../../contracts/db.sql) is the schema, the triggers, and the functions. PostgreSQL 15 or newer, encoding UTF-8. This design does not change that file.

| Invariant | In the contract | Proved by |
| --- | --- | --- |
| Revisions are immutable full snapshots | `revisions_immutable`, insert trigger sets `content_hash` | `revisions_store_full_markdown`, `frontmatter_matches_content` |
| Only a human save or a merge creates a revision | `revisions_human_or_merge` on columns. The validator and the call sites are application | `revision_requires_valid_document`, `only_human_save_or_merge_inserts_revision` |
| The head moves in the insert transaction | `revisions_set_head`, `documents_guard`, deferred `documents_head_present` | F07-AC-010a, F07-AC-032b |
| Links and metric points are derived | The merge function writes the rows it is given. The rebuild script reproduces them | `rebuild_links_and_metric_points` |
| Documents are archived, never deleted | `documents_no_delete` | F07-AC-007a |
| Version N is the first revision with that version | `revision_for_version`, index `revisions_version_lookup` | F07-AC-027a, F07-AC-027b |

Also application-only: `shipped_draft_is_local_storage` and `server_draft_interval_is_2_seconds`.
