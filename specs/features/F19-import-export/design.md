# F19 design: Import, export, and backup

The editor zip is a download of local pages. Ledger import and export move a space as Markdown bytes. Requirements are in `spec.md` on `origin/cursor/spec-history-import-home-08e8`.

Ledger import is in use when the open project stores documents in Postgres. Until then, Settings has no Import section, and backup is the editor zip.

## Modules

Built, and kept while Ledger import is not in use:

| Module | Role |
| --- | --- |
| `components/launcher.tsx` | `Export (.zip)` on a project card whose kind is `This browser`. Absent on `Repository`. |
| `components/page-actions.ts` | `exportWorkspace`, `importInto`. Toasts for page counts. |
| `lib/workspace/zip.ts` | Zip of `{ path, content }` strings, one entry per page. |
| `lib/workspace/tree.ts` | `importFiles`. Sidebar drop. CRLF becomes LF. |

Not started:

| Module | Role |
| --- | --- |
| `lib/import/intake.ts` | One folder or one zip. Rejects a bad archive, a path that escapes, and a batch over the caps. Ignores `.DS_Store` and `__MACOSX/`. |
| `lib/import/bytes.ts` | Keeps frontmatter bytes. Builds the `type: doc` prefix when the file has neither a BOM nor `---`. |
| `lib/import/batch.ts` | Validates each file, writes the valid ones, holds the result until the batch finishes. |
| `lib/import/history-unit.ts` | Pairs a document with `.history/{path without .md}/{index}.md`. |
| `lib/import/report.ts` | `import-report.md`. |
| `lib/export/space-zip.ts` | Head bytes, `assets/` bytes, optional `.history/`. |
| `components/settings-host.tsx` | Settings → Import and Settings → Export. |

`lib/workspace/zip.ts` stays the editor writer. `space-zip.ts` writes stored bytes and does not re-encode pages through the editor zip.

## Data

An editor zip entry is the page path and the stored page content as UTF-8. It does not add `.ledger/` or `assets/` entries that are not pages. The download name is `{project}.zip`. One page toasts `Exported 1 page`. Any other count toasts `Exported {n} pages`.

A sidebar drop, while Ledger import is not in use, keeps names ending in `.md`, `.markdown`, or `.txt`, case-insensitive. Each CR LF pair becomes LF. The page lands under the drop folder. Files are not validated. One unreadable file does not remove a sibling. No match toasts `Choose .md files to import` and adds no page.

A Ledger batch is a list of files after ignored entries. Ignored entries are not files in the batch. The batch is not one database transaction. Each valid file commits on its own. Invalid files in the same batch do not roll those commits back. If every file fails, nothing is written.

A file is saved only when it has zero validation errors. Warnings do not reject it. The warning stays on that file's result.

Result, returned once, after the batch finishes:

```text
saved: { path, warnings[] }
rejected: { path, errors[] }
```

Each error and warning has a code, a message, and a hint. Per-file validation uses F06. Import-specific codes:

| Code | When |
| --- | --- |
| `zip_invalid` | Not a zip and not a folder |
| `zip_path` | Entry contains `..`, starts with `/`, or contains a backslash |
| `batch_too_large` | More than 10000 files, or more than 524288000 uncompressed bytes |
| `import_empty` | No Markdown files and no assets after ignored entries |
| `not_markdown` | Not Markdown and not under `assets/` |
| `asset_too_large` | Asset longer than 10485760 bytes |
| `history_mismatch` | Last history file differs from the document file |
| `path_invalid` | Path already stored with different bytes |
| `too_large` | Document longer than 204800 bytes |
| `permission_denied` | Caller may not import or export |

`10000` files and `524288000` bytes are allowed. `10485760` asset bytes and `204800` document bytes are allowed.

A Markdown file that does not start with a UTF-8 BOM and does not start with `---` is stored as the constructed prefix plus the original bytes, with no extra newline between them:

```text
---
type: doc
title: "{title}"
---
```

`{title}` is the last path segment with a final `.md` or `.markdown` removed, case-insensitive, double-quoted, with `\` and `"` escaped. A file that starts with `---` or a BOM is not wrapped, even when the YAML is invalid.

A file that already has a frontmatter block is stored as its UTF-8 bytes, including line endings, YAML key order, and trailing whitespace. Export writes those bytes back. A second export matches the first export's uncompressed Markdown and asset bytes. Zip container bytes may differ.

`assets/` files are stored as bytes and are not validated as documents. Export writes those bytes.

`Include history` off, the default, omits `.history/`. On, each revision is `.history/{path without .md}/{index}.md`, index starting at 1 for the first revision, in parent order. A document and its history files succeed or fail together. An error on the head, or a last history file whose bytes differ from the document file, saves none of them. Other documents in the batch still follow the no-rollback rule.

A new valid file appends one revision with message `Import`. While sign-in is absent, `author_user_id` is null and the author label is `Import`. When sign-in exists, `author_user_id` is the importer.

`Import into this space`: head bytes equal to the file count as saved and append no revision. Different head bytes are `path_invalid` and leave the document unchanged. `New space from files` creates a space whose document and asset bytes equal the zip and does not add seed files the zip does not contain.

The report is UTF-8, LF, no BOM, name `import-report.md`. Sections, in order: `# Import report`, `## Saved`, one `- \`{path}\`` per saved path or the line `Nothing was saved.`, `## Rejected`, then `### \`{path}\`` and one `- \`{code}\` — {message}` plus the hint indented two spaces. A batch-level error does not offer `Download report`.

Settings → Import actions are `Import into this space` and `New space from files`. A sidebar drop, once Ledger import is in use, imports into the open space. Each accepts one folder or one `.zip`.

While sign-in is not built, the person at the keyboard may import and export. When sign-in is built, only Owner and Editor may. A Contributor, a Viewer, a public visitor, an agent key, or an OAuth grant receives `permission_denied` and nothing is written.

Backup: while Postgres is not in use, the download is the editor zip, and no nightly GitHub mirror runs. When Postgres is in use, Neon point-in-time restore covers the database, and Settings → Export is the Markdown copy. This feature does not add that mirror.

## State

| Surface | State | Copy |
| --- | --- | --- |
| Settings → Import | Empty | `Drop a folder or a .zip of Markdown files.` Action `Choose files` |
| Settings → Import | Loading | `Importing…` Accessible name `Importing` |
| Settings → Import | Batch error | The message, then the hint. No report button |
| Settings → Import | Partial | `{saved} saved. {rejected} need fixes.` Action `Download report` |
| Settings → Import | Success | `Imported {n} files.` |
| Settings → Export | Success | Zip downloads. Toast `Exported {n} files.` |
| Settings → Export | Error | The message, then the hint |
| Editor sidebar | No Markdown in the drop | `Choose .md files to import` |
| Editor card | Success | `Exported 1 page` or `Exported {n} pages` |

Copy is the same at `860px` or wider and at `420px`. On a coarse pointer, `Import into this space`, `New space from files`, `Download report`, and Settings → Export are at least `44px` by `44px`.

Editor toasts have no code and no hint. The local-project delete confirmation that mentions export is the editor backup warning. It is not this batch.

## Contracts

From `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c`:

- `create_document` and `append_revision` write the `Import` revision. Content is the stored bytes. The trigger sets `content_hash`. Parent of an update is the previous head.
- `revisions_content_size` and the insert trigger enforce `204800` bytes.
- `documents_path_unique` on `(space_id, path)`. A different payload for an existing path is `path_invalid`, not an overwrite.
- `assets (space_id, path, blob_url, mime, bytes)` stores an asset. Export reads the blob so the zip entry matches the imported bytes. `assets_path_shape` is the path check for that table.
- `revisions_immutable` means history import inserts a chain. It does not edit an old row.

Schema change this feature needs: `revisions.author_user_id` is `NOT NULL`, and `revisions_before_insert` assigns `ledger_session_user()`. F19-REQ-018 requires null while sign-in is absent. Step 2 of the tasks makes the column nullable and skips that assignment when `ledger.user_id` is unset. The author label `Import` is the label when `author_user_id` is null and the message is `Import`.

F22 seeding does not run inside `New space from files`. F06 is the validator. F18 is the history screen. `Include history` is only an export and import option here.
