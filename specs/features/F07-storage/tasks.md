# F07: Storage tasks

Dependency order. A task starts after every task it lists under Depends on. Size is the parts the task touches: one module, several modules, or a schema change. A schema change applies [specs/contracts/db.sql](../../contracts/db.sql) as written and proves the requirement against it. That file is not edited. No calendar estimates.

File-mode tasks lock the shipped path. Postgres tasks call the modules in `design.md`.

## F07-T-001 — Read the file and insert nothing

Depends on: none.

While Postgres storage is not in use, `lib/docs.ts` returns the guide page from `content/`. `lib/storage/mode.ts` stays off, so nothing inserts into `documents`, `revisions`, or `drafts`.

- Satisfies: F07-REQ-001
- Test: `repository_read_inserts_no_rows` (F07-AC-001a)
- Size: one module

## F07-T-002 — Keep the working copy in localStorage

Depends on: F07-T-001.

`components/workspace-store.ts` writes the unsaved working copy to `markdown-kb:workspace:{project}` or the legacy key `markdown-kb:workspace` when the copy changes. The same profile restores it. No request writes a server draft during the next 2 seconds.

- Satisfies: F07-REQ-002
- Tests: `shipped_draft_is_local_storage` (F07-AC-002a), `local_draft_restores` (F07-AC-002b)
- Size: one module

## F07-T-003 — Leave browser snapshots out of revisions

Depends on: F07-T-001.

`components/history-store.ts` keeps at most 50 snapshots at `markdown-kb:history:{id}`. Reading that list inserts no `revisions` row.

- Satisfies: F07-REQ-003
- Test: `browser_snapshots_are_not_revisions` (F07-AC-003a)
- Size: one module

## F07-T-004 — Skip role checks while sign-in is absent

Depends on: F07-T-002.

A file read and a localStorage draft do not check a role and do not require a `users` row. `permission_denied` is not returned for that path.

- Satisfies: F07-REQ-028
- Test: `file_mode_skips_roles` (F07-AC-028a)
- Size: one module

## F07-T-005 — Install the contract and store a document row

Depends on: none.

Apply `specs/contracts/db.sql` to the test database unchanged. `lib/storage/errors.ts` maps `documents_slug_unique` to `slug_taken` and `documents_path_unique` to `path_invalid`. A created document row has `id`, `space_id`, `path`, `slug`, `type`, `title`, `head_revision_id`, `archived_at`, `created_at`, and `updated_at`, and the head points at a revision of that document. Slug uniqueness includes archived documents. Path uniqueness is per space.

- Satisfies: F07-REQ-004 — `document_row_has_ledger_columns` (F07-AC-004a)
- Satisfies: F07-REQ-005 — `slug_taken_includes_archived` (F07-AC-005a), `path_taken_in_space` (F07-AC-005b)
- Size: several modules

## F07-T-006 — Create the document and its first revision together

Depends on: F07-T-005.

`lib/storage/documents.ts` calls `create_document`. The commit has one document and one revision, and `head_revision_id` is that revision. A document insert with no revision is refused (`head_missing`). When the revision becomes the head, `title` and `type` are copied from its frontmatter in that transaction (`revisions_set_head`).

- Satisfies: F07-REQ-032 — `create_document_commits_head` (F07-AC-032a), `document_without_revision_refused` (F07-AC-032b)
- Satisfies: F07-REQ-033 — `head_copies_title_and_type` (F07-AC-033a)
- Size: schema change

## F07-T-007 — Store the full file and its frontmatter object

Depends on: F07-T-006.

`lib/storage/save.ts` passes the Markdown file as `content` and the parsed frontmatter as the JSON object. The stored content is the file, not a diff against the parent.

- Satisfies: F07-REQ-008
- Tests: `revisions_store_full_markdown` (F07-AC-008a), `frontmatter_matches_content` (F07-AC-008b)
- Size: one module

## F07-T-008 — Refuse revision updates and deletes

Depends on: F07-T-006.

Trigger `revisions_immutable` returns `revision_immutable` and leaves the row unchanged.

- Satisfies: F07-REQ-009
- Test: `revision_update_or_delete_refused` (F07-AC-009a)
- Size: schema change

## F07-T-009 — Chain revisions, hash the bytes, and copy version

Depends on: F07-T-006.

The first parent is null. Each later parent is the previous head. A third insert that names the first revision as parent is refused (`revisions_one_child` and the head check). The insert trigger sets `content_hash` to the SHA-256 hex of the UTF-8 content and ignores a caller-supplied hash. `version` is the frontmatter integer from 1 through 999999999, or null when that integer is absent.

- Satisfies: F07-REQ-019 — `revision_chain_one_child` (F07-AC-019a)
- Satisfies: F07-REQ-020 — `content_hash_is_sha256` (F07-AC-020a)
- Satisfies: F07-REQ-021 — `version_from_frontmatter` (F07-AC-021a), `version_null_without_integer` (F07-AC-021b)
- Size: schema change

## F07-T-010 — Move the head in the save transaction

Depends on: F07-T-006.

`append_revision` inserts one revision and sets `documents.head_revision_id` to it in the same transaction. A warning does not block the insert. The previous revision is unchanged.

- Satisfies: F07-REQ-010
- Test: `save_with_warning_appends_head` (F07-AC-010a)
- Size: schema change

## F07-T-011 — Stop before insert when validation has an error

Depends on: F07-T-010.

`lib/storage/save.ts` reads the F06 result. An error, including `field_missing`, does not call `append_revision` or `create_document`, and `head_revision_id` stays.

- Satisfies: F07-REQ-012
- Test: `revision_requires_valid_document` (F07-AC-012a)
- Size: one module

## F07-T-012 — Stamp the author, and the proposal on a merge

Depends on: F07-T-010.

The insert trigger sets `author_user_id` from `ledger.user_id`. A human save leaves `proposal_id` and `agent_key_id` null. A merge sets `proposal_id`, copies `agent_key_id` from the proposal, and sets `message` to the proposal summary.

- Satisfies: F07-REQ-014
- Tests: `human_save_author_nulls_proposal` (F07-AC-014a), `merge_copies_proposal_fields` (F07-AC-014b)
- Size: schema change

## F07-T-013 — Keep the save message to one line

Depends on: F07-T-010.

An omitted message is stored as the empty string. More than 120 code points, or a CR or LF, returns `message_invalid` and inserts no revision. The check is `revisions_message_shape` and `revisions_before_insert`.

- Satisfies: F07-REQ-015
- Tests: `omitted_message_is_empty` (F07-AC-015a), `message_over_120_refused` (F07-AC-015b), `message_with_line_feed_refused` (F07-AC-015c)
- Size: schema change

## F07-T-014 — Refuse a save when the head moved

Depends on: F07-T-010.

If the expected head is not `head_revision_id`, `append_revision` inserts nothing and returns `head_moved`.

- Satisfies: F07-REQ-031
- Test: `stale_head_returns_head_moved` (F07-AC-031a)
- Size: schema change

## F07-T-015 — Archive without deleting history

Depends on: F07-T-006.

`archive_document` sets `archived_at` from `clock_timestamp()` and keeps the slug, the path, and every revision. It inserts no revision. A second archive leaves the timestamp. Clearing `archived_at` returns `archive_kept`.

- Satisfies: F07-REQ-006 — `archive_sets_database_clock` (F07-AC-006a)
- Satisfies: F07-REQ-034 — `second_archive_keeps_timestamp` (F07-AC-034a), `clear_archived_at_refused` (F07-AC-034b)
- Size: schema change

## F07-T-016 — Refuse document deletes

Depends on: F07-T-005.

`documents_no_delete` returns `delete_refused`. The row and its revisions stay.

- Satisfies: F07-REQ-007
- Test: `delete_document_refused` (F07-AC-007a)
- Size: schema change

## F07-T-017 — Write the merge in one transaction

Depends on: F07-T-010, F07-T-012.

`lib/storage/merge.ts` calls `append_revision` with the proposal id, the outgoing links, and the metric rows. One transaction inserts the revision, moves the head, replaces that document's outgoing `links`, inserts one `audit_events` row with action `merge`, and sets the proposal to `merged` with `merged_revision_id`. A concluded experiment gets one new `metric_points` row for the new revision, and older metric rows stay. An abandoned experiment gets none.

- Satisfies: F07-REQ-011
- Tests: `merge_writes_revision_head_links_audit` (F07-AC-011a), `merge_concluded_inserts_metric_point` (F07-AC-011b), `merge_abandoned_inserts_no_metric_point` (F07-AC-011c)
- Size: schema change

## F07-T-018 — Append restore, tick, and import with their messages

Depends on: F07-T-011.

`lib/storage/save.ts` treats these as human saves. Restore appends a revision whose content bytes equal the chosen revision and whose message is `Restore`, and leaves the chosen row unchanged. A view-mode task tick by a caller who may save directly uses message `Tick task`. A valid import uses message `Import`. An import file that fails validation adds no document and no revision.

- Satisfies: F07-REQ-016 — `restore_appends_copy` (F07-AC-016a)
- Satisfies: F07-REQ-017 — `tick_task_appends_revision` (F07-AC-017a)
- Satisfies: F07-REQ-018 — `import_appends_revision` (F07-AC-018a), `invalid_import_writes_nothing` (F07-AC-018b)
- Size: one module

## F07-T-019 — Store one private draft per document and user

Depends on: F07-T-006.

`save_draft` and `read_draft` use the primary key `(document_id, user_id)` and the `drafts_private` policy. `ledger_app` does not own `drafts`. User 2's query does not return user 1's draft. A request that names user 1's draft on user 2's session returns `draft_forbidden`. Opening the document as user 1 returns that draft's content.

- Satisfies: F07-REQ-023 — `second_user_cannot_read_draft` (F07-AC-023a), `named_draft_is_forbidden` (F07-AC-023b)
- Satisfies: F07-REQ-024 — `open_returns_author_draft` (F07-AC-024a)
- Size: schema change

## F07-T-020 — Upsert the server draft on a 2-second interval

Depends on: F07-T-019.

`lib/storage/drafts.ts` upserts when sign-in is built, Postgres is in use, and the working copy differs from the stored draft. The gap between successful upserts is 2 seconds. One second after a success writes nothing. The upsert does not insert a revision and does not run the validator, so a draft that would fail `field_missing` is still stored when it is at most 204800 bytes.

- Satisfies: F07-REQ-022
- Tests: `server_draft_interval_is_2_seconds` (F07-AC-022a, F07-AC-022b), `draft_upsert_stores_invalid_frontmatter` (F07-AC-022c)
- Size: one module

## F07-T-021 — Limit who can write a server draft

Depends on: F07-T-019.

`save_draft` refuses a Viewer. A Contributor's upsert stores one draft and inserts no revision. An agent key is refused inside `save_draft`. `lib/storage/session.ts` refuses an OAuth grant before the call. No draft row is written for those callers.

- Satisfies: F07-REQ-035
- Tests: `viewer_writes_no_draft` (F07-AC-035a), `contributor_upserts_draft` (F07-AC-035b), `agent_key_writes_no_draft`, `oauth_grant_writes_no_draft`
- Size: several modules

## F07-T-022 — Delete drafts when the revision commits

Depends on: F07-T-010, F07-T-017, F07-T-019.

`append_revision` deletes the session user's draft on a human save. On a merge it also deletes the proposal author's draft.

- Satisfies: F07-REQ-025
- Tests: `save_deletes_author_draft` (F07-AC-025a), `merge_deletes_both_drafts` (F07-AC-025b)
- Size: schema change

## F07-T-023 — Insert a revision only for a human save or a merge

Depends on: F07-T-010, F07-T-020.

A dirty draft upsert and a stored `propose_change` add no `revisions` row. `revisions_human_or_merge` keeps a non-merge revision free of `proposal_id` and `agent_key_id`. The next revision appears only when a human save or a merge runs.

- Satisfies: F07-REQ-013
- Test: `only_human_save_or_merge_inserts_revision` (F07-AC-013a)
- Size: several modules

## F07-T-024 — Rebuild links and metric points from revisions

Depends on: F07-T-017.

`lib/storage/rebuild.ts` runs `rebuild_links_and_metric_points`. After a merge, the script's `links` and `metric_points` rows match the rows that merge wrote. It replaces derived rows by delete and insert. It does not edit them in place.

- Satisfies: F07-REQ-026
- Test: `rebuild_links_and_metric_points` (F07-AC-026a)
- Size: one module

## F07-T-025 — Look up the first revision of version N

Depends on: F07-T-009.

`lib/storage/revision-lookup.ts` calls `revision_for_version`. The result is the revision whose `version` equals N with the smallest `created_at`, then the smaller `id`. No row at that version returns empty and inserts nothing.

- Satisfies: F07-REQ-027
- Tests: `version_lookup_earliest` (F07-AC-027a), `version_lookup_smaller_id` (F07-AC-027b), `version_lookup_missing_is_empty` (F07-AC-027c)
- Size: schema change

## F07-T-026 — Allow a direct save only for Owner and Editor

Depends on: F07-T-010.

When sign-in is built, `assert_writer` allows a human save, restore, tick, and archive for Owner and Editor. A Viewer, a Contributor, or an agent key gets `permission_denied` and no revision. `lib/storage/session.ts` returns the same refusal for an OAuth grant before the call. An Owner's valid save inserts one.

- Satisfies: F07-REQ-029
- Tests: `viewer_save_denied` (F07-AC-029a), `contributor_save_denied` (F07-AC-029b), `owner_save_inserts_revision` (F07-AC-029c), `agent_key_save_denied` (F07-AC-029d), `oauth_grant_save_denied`
- Size: several modules

## F07-T-027 — Use Neon when Postgres storage is in use

Depends on: F07-T-005.

`lib/storage/connection.ts` points the in-use store at Postgres on Neon. Point-in-time restore covers that database. The check runs only where Postgres storage is in use.

- Satisfies: F07-REQ-030
- Test: `postgres_on_neon_with_pitr` (F07-AC-030a)
- Size: one module

## F07-T-028 — Leave other documents' link slugs in place

Depends on: F07-T-017.

`append_revision` replaces `links` only where `from_document_id` is the document being saved. Renaming `hello` to `hello-notes` leaves another document's `to_slug` of `hello` unchanged.

- Satisfies: F07-REQ-036
- Test: `rename_leaves_other_to_slug` (F07-AC-036a)
- Size: schema change

## F07-T-029 — Refuse content past 204800 bytes

Depends on: F07-T-010, F07-T-020.

`lib/storage/save.ts` and `lib/storage/drafts.ts` share the UTF-8 limit with `revisions_before_insert` and `save_draft`. 204801 bytes returns `too_large` and writes no revision and no draft. 204800 bytes that validates is stored.

- Satisfies: F07-REQ-037
- Tests: `content_over_limit_is_too_large` (F07-AC-037a), `content_at_limit_is_stored` (F07-AC-037b)
- Size: several modules

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F07-REQ-001 | F07-T-001 | `repository_read_inserts_no_rows` |
| F07-REQ-002 | F07-T-002 | `shipped_draft_is_local_storage`, `local_draft_restores` |
| F07-REQ-003 | F07-T-003 | `browser_snapshots_are_not_revisions` |
| F07-REQ-004 | F07-T-005 | `document_row_has_ledger_columns` |
| F07-REQ-005 | F07-T-005 | `slug_taken_includes_archived`, `path_taken_in_space` |
| F07-REQ-006 | F07-T-015 | `archive_sets_database_clock` |
| F07-REQ-007 | F07-T-016 | `delete_document_refused` |
| F07-REQ-008 | F07-T-007 | `revisions_store_full_markdown`, `frontmatter_matches_content` |
| F07-REQ-009 | F07-T-008 | `revision_update_or_delete_refused` |
| F07-REQ-010 | F07-T-010 | `save_with_warning_appends_head` |
| F07-REQ-011 | F07-T-017 | `merge_writes_revision_head_links_audit`, `merge_concluded_inserts_metric_point`, `merge_abandoned_inserts_no_metric_point` |
| F07-REQ-012 | F07-T-011 | `revision_requires_valid_document` |
| F07-REQ-013 | F07-T-023 | `only_human_save_or_merge_inserts_revision` |
| F07-REQ-014 | F07-T-012 | `human_save_author_nulls_proposal`, `merge_copies_proposal_fields` |
| F07-REQ-015 | F07-T-013 | `omitted_message_is_empty`, `message_over_120_refused`, `message_with_line_feed_refused` |
| F07-REQ-016 | F07-T-018 | `restore_appends_copy` |
| F07-REQ-017 | F07-T-018 | `tick_task_appends_revision` |
| F07-REQ-018 | F07-T-018 | `import_appends_revision`, `invalid_import_writes_nothing` |
| F07-REQ-019 | F07-T-009 | `revision_chain_one_child` |
| F07-REQ-020 | F07-T-009 | `content_hash_is_sha256` |
| F07-REQ-021 | F07-T-009 | `version_from_frontmatter`, `version_null_without_integer` |
| F07-REQ-022 | F07-T-020 | `server_draft_interval_is_2_seconds`, `draft_upsert_stores_invalid_frontmatter` |
| F07-REQ-023 | F07-T-019 | `second_user_cannot_read_draft`, `named_draft_is_forbidden` |
| F07-REQ-024 | F07-T-019 | `open_returns_author_draft` |
| F07-REQ-025 | F07-T-022 | `save_deletes_author_draft`, `merge_deletes_both_drafts` |
| F07-REQ-026 | F07-T-024 | `rebuild_links_and_metric_points` |
| F07-REQ-027 | F07-T-025 | `version_lookup_earliest`, `version_lookup_smaller_id`, `version_lookup_missing_is_empty` |
| F07-REQ-028 | F07-T-004 | `file_mode_skips_roles` |
| F07-REQ-029 | F07-T-026 | `viewer_save_denied`, `contributor_save_denied`, `owner_save_inserts_revision`, `agent_key_save_denied`, `oauth_grant_save_denied` |
| F07-REQ-030 | F07-T-027 | `postgres_on_neon_with_pitr` |
| F07-REQ-031 | F07-T-014 | `stale_head_returns_head_moved` |
| F07-REQ-032 | F07-T-006 | `create_document_commits_head`, `document_without_revision_refused` |
| F07-REQ-033 | F07-T-006 | `head_copies_title_and_type` |
| F07-REQ-034 | F07-T-015 | `second_archive_keeps_timestamp`, `clear_archived_at_refused` |
| F07-REQ-035 | F07-T-021 | `viewer_writes_no_draft`, `contributor_upserts_draft`, `agent_key_writes_no_draft`, `oauth_grant_writes_no_draft` |
| F07-REQ-036 | F07-T-028 | `rename_leaves_other_to_slug` |
| F07-REQ-037 | F07-T-029 | `content_over_limit_is_too_large`, `content_at_limit_is_stored` |
