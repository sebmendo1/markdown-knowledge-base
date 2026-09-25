# F19: Import, export, and backup

## Summary

Import, export, and backup keep a space as a folder of Markdown files. Export writes each stored file's bytes, and importing that zip into a new space stores those same bytes, including line endings and YAML key order.

## Status and scope

Not started. Ledger import, the space zip, and Neon point-in-time restore are not in the product.

The editor slice is built. A local project card can download a zip of that project's pages. Dropping files on the sidebar adds pages and turns CRLF into LF. That zip is not a space archive, and that import does not validate. ADR-0003.

This spec covers the editor zip and sidebar drop, Ledger import, Ledger export, the byte-identical round trip, and backup. Validation is F06. The revision row is F07. Settings chrome is F10. The history screen is F18. Seeding a new empty space is F22.

The product name in the UI is markdown-kb. A page is `/{project}/{page-path}`. Sign-in is not built. ADR-0002.

Import is all-or-nothing per file. The batch does not roll back: every valid file is saved, every invalid file is listed, and if every file fails, nothing is saved. ADR-0032.

## Users and stories

- **F19-US-001** As the owner, I want a zip of the space, so that the folder I download is the folder the space stores.
- **F19-US-002** As the owner, I want a bad file to save nothing of itself, so that a half-written document never lands.
- **F19-US-003** As the owner, I want the other files in that drop to still import, so that one broken note does not throw away the rest.
- **F19-US-004** As the owner, I want a backup I can download, so that the Markdown exists outside the database.

## Requirements

- **F19-REQ-001** While Ledger import is not in use, the system shall show `Export (.zip)` on a project card whose kind is `This browser`, and that action shall download `{project}.zip` and show the toast `Exported 1 page` when the project has one page and `Exported {n} pages` otherwise.
- **F19-REQ-002** That editor zip shall contain one entry per page, at the page path, whose bytes are the stored page content encoded as UTF-8. It shall not add `.ledger/` or `assets/` entries that are not pages.
- **F19-REQ-003** While Ledger import is not in use, a drop on the sidebar shall import only files whose names end in `.md`, `.markdown`, or `.txt`, case-insensitive. If none match, the system shall show `Choose .md files to import` and shall add no page.
- **F19-REQ-004** While Ledger import is not in use, the sidebar import shall replace each CR LF pair in the file with LF before the page is stored, and shall place the page under the drop folder.
- **F19-REQ-005** While Ledger import is not in use, the sidebar import shall add every accepted file and shall not validate a file and shall not remove a sibling file when one file fails to read.
- **F19-REQ-006** When Ledger import is in use, Settings → Import shall offer `Import into this space` and `New space from files`, and a drop on the sidebar shall import into the open space. Each accepts one folder or one `.zip`.
- **F19-REQ-007** The system shall save a file only when that file has zero validation errors. Warnings do not reject it. If it has an error, the system shall write no document and no revision for that file.
- **F19-REQ-008** The system shall not roll back a batch. Every valid file in the batch is saved even when other files in the batch fail. If every file fails, nothing is saved.
- **F19-REQ-009** When the batch finishes, the system shall return one result that lists each saved path and each rejected path with that file's error codes. The system shall not report success file by file before the batch finishes.
- **F19-REQ-010** When one or more files are rejected, the system shall offer `Download report`. The report is a UTF-8 file `import-report.md` with LF line endings and no byte-order mark.
- **F19-REQ-011** When a Markdown file does not start with a UTF-8 byte-order mark and does not start with `---`, the system shall validate and store a constructed file, then the original bytes unchanged. The constructed prefix is `---\ntype: doc\ntitle: "{title}"\n---\n`, with `{title}` double-quoted and `\` and `"` escaped. A file that starts with `---` or with a byte-order mark is not constructed.
- **F19-REQ-012** When a file already has a frontmatter block, the system shall store that file's UTF-8 bytes unchanged, including line endings, YAML key order, and trailing whitespace.
- **F19-REQ-013** Settings → Export shall download a `.zip` of the space. Each document entry is the head revision's content bytes, including `.ledger/` Markdown. Each `assets/` entry is that asset's bytes. Export shall not parse or rewrite frontmatter.
- **F19-REQ-014** `New space from files` on that zip shall create a space whose document and asset bytes equal the zip, and shall not add seed files that the zip does not contain. A second export of the new space shall match the first export's uncompressed Markdown and asset bytes.
- **F19-REQ-015** When `Import into this space` finds a path whose head bytes equal the file, the system shall count the path as saved and shall not append a revision. When the head bytes differ, the system shall reject that file and shall leave the document unchanged.
- **F19-REQ-016** Where `Include history` is on, export shall add `.history/{path without .md}/{index}.md` for each revision, index starting at 1 for the first revision. The default export shall omit `.history/`.
- **F19-REQ-017** A document path and its `.history/` files shall succeed or fail together. An error on the head, or a last history file whose bytes differ from the document file, saves none of them. Other documents in the batch still follow F19-REQ-008.
- **F19-REQ-018** When a valid new file is imported, the system shall append one revision whose message is `Import`. While sign-in is absent, `author_user_id` is null and the author label is `Import`. When sign-in exists, `author_user_id` is the importer.
- **F19-REQ-019** While sign-in is not built, the person at the keyboard may import and export. When sign-in is built, only Owner and Editor may import or export. A Contributor, a Viewer, a public visitor, an agent key, or an OAuth grant shall receive `permission_denied` and the system shall write nothing.
- **F19-REQ-020** The system shall reject a zip that is not a zip archive, and shall reject an entry whose path contains `..`, starts with `/`, or contains a backslash. The system shall ignore `.DS_Store` and any path under `__MACOSX/`. Those ignored entries are not files in the batch.
- **F19-REQ-021** The system shall store a file under `assets/` as that file's bytes and shall not validate it as a document. A file that is not Markdown and not under `assets/` is rejected.
- **F19-REQ-022** If the batch, after ignored entries, has more than 10000 files, or its uncompressed bytes are more than 524288000 bytes (500 MB, 500 × 1024 × 1024), then the system shall save nothing.
- **F19-REQ-023** While Postgres storage is not in use, the backup a person can take is the editor zip in F19-REQ-001. When Postgres storage is in use, Neon point-in-time restore covers the database, and Settings → Export is the Markdown copy. The system shall not run a nightly GitHub mirror.

## Acceptance scenarios

### F19-AC-001a

Given Ledger import is not in use and a local project `guide` with one page, when the person chooses `Export (.zip)`, then the download is `guide.zip` and the toast is `Exported 1 page`.

### F19-AC-001b

Given that project has two pages, when the person exports, then the toast is `Exported 2 pages`.

### F19-AC-001c

Given a project whose kind is `Repository`, when the project card menu is opened, then `Export (.zip)` is absent.

### F19-AC-002a

Given a local project page at `docs/notes.md` whose content is `hello\n`, when the editor zip is unzipped, then `docs/notes.md` is those bytes and there is no `.ledger/` entry.

### F19-AC-003a

Given Ledger import is not in use, when the person drops `a.md` and `b.png` on the sidebar, then `a.md` becomes a page and the toast is `Imported 1 page`.

### F19-AC-003b

Given a drop of only `b.png`, when the drop is handled, then the toast is `Choose .md files to import` and no page is added.

### F19-AC-004a

Given a dropped file whose bytes contain `a\r\nb`, when the editor import stores the page, then the stored content contains `a\nb` and does not contain `a\r\nb`.

### F19-AC-005a

Given two `.md` files dropped together and no validator, when the editor import finishes, then both pages exist.

### F19-AC-006a

Given Ledger import is in use, when Settings → Import is opened, then the actions are `Import into this space` and `New space from files`.

### F19-AC-007a

Given a file whose validation result is `field_missing`, when the batch runs, then that path has no document and no revision.

### F19-AC-007b

Given a file whose only issue is `section_missing`, when the batch runs, then the file is saved and the warning is listed on the result.

### F19-AC-008a

Given a batch of one valid file and one file with `field_missing`, when the batch finishes, then the valid file has one revision and the invalid file has none.

### F19-AC-008b

Given a batch where every file has an error, when the batch finishes, then no document and no revision were written.

### F19-AC-009a

Given that mixed batch, when the result is read before the batch finishes, then the result is not available. When it finishes, the saved path and the rejected path with `field_missing` are both listed.

### F19-AC-010a

Given one rejected file `notes.md` with `path_invalid`, when the person downloads the report, then the file is `import-report.md`, it starts with `# Import report`, and it contains the path, the code `path_invalid`, the message, and the hint.

### F19-AC-011a

Given `docs/notes.md` whose bytes are `# Hello\n` and which does not start with `---`, when Ledger import stores it, then the revision bytes are `---\ntype: doc\ntitle: "notes"\n---\n# Hello\n`.

### F19-AC-011b

Given a file that starts with `---\n` and whose YAML is a list, when import runs, then the code is `yaml_invalid` and the original bytes are not wrapped with a new frontmatter block.

### F19-AC-012a

Given a file whose frontmatter keys are `title` then `type`, with CRLF line endings and a trailing space on the title line, when import stores it and export writes it, then those bytes match, including the CRLF and the trailing space and the key order.

### F19-AC-013a

Given a space with `.ledger/space.md` and `assets/plot.png`, when Settings → Export runs, then the zip contains those paths and each entry's uncompressed bytes equal the stored bytes.

### F19-AC-014a

Given that zip, when `New space from files` imports it, then every Markdown file and every asset in the new space has the same bytes, and a second export matches the first export's uncompressed bytes.

### F19-AC-014b

Given a zip that does not contain `.ledger/space.md`, when it is imported as a new space, then `.ledger/space.md` is not created beside the zip.

### F19-AC-015a

Given a document whose head bytes equal the imported file, when `Import into this space` runs, then the path is saved and the revision count is unchanged.

### F19-AC-015b

Given a document whose head bytes differ, when that file is in the batch, then the code is `path_invalid`, the head is unchanged, and a different valid file in the batch is still saved.

### F19-AC-016a

Given `Include history` is off, when export runs, then the zip has no `.history/` entry.

### F19-AC-016b

Given a document `docs/notes.md` with two revisions and `Include history` on, when export runs, then the zip contains `.history/docs/notes/1.md` and `.history/docs/notes/2.md` and each file's bytes equal that revision.

### F19-AC-017a

Given history files whose last file differs from `docs/notes.md`, when import runs, then `docs/notes.md` is not saved and neither history file is saved.

### F19-AC-017b

Given that mismatch and another valid `docs/other.md` in the same batch, when import finishes, then `docs/other.md` is saved.

### F19-AC-018a

Given a valid new file and sign-in absent, when import stores it, then the revision message is `Import`, `author_user_id` is null, and the author label is `Import`.

### F19-AC-018b

Given sign-in is built and user 4 imports a valid new file, when the revision is read, then `author_user_id` is 4 and the message is `Import`.

### F19-AC-019a

Given sign-in is not built, when the person at the keyboard exports, then the zip downloads and no role is checked.

### F19-AC-019b

Given sign-in is built and the caller is a Viewer, when they import, then the code is `permission_denied` and nothing is written.

### F19-AC-020a

Given a zip entry named `../secrets.md`, when import runs, then the code is `zip_path` and nothing is saved.

### F19-AC-020b

Given a zip whose only extra entry is `__MACOSX/foo` plus one valid `docs/notes.md`, when import runs, then the Mac entry is ignored and `docs/notes.md` is saved.

### F19-AC-021a

Given `assets/plot.png` of 4 bytes, when import runs, then those 4 bytes are stored and `field_missing` is not reported for that file.

### F19-AC-021b

Given `images/plot.png` outside `assets/`, when import runs, then the code is `not_markdown` and that file is not stored.

### F19-AC-022a

Given a batch of 10001 Markdown files, when import runs, then the code is `batch_too_large` and nothing is saved.

### F19-AC-022b

Given a batch whose uncompressed size is 524288001 bytes, when import runs, then nothing is saved.

### F19-AC-022c

Given a batch of 10000 files whose uncompressed size is 524288000 bytes, and each file valid and within the per-file cap, when import runs, then the batch is accepted.

### F19-AC-023a

Given Postgres storage is not in use, when the person looks for a backup, then the copy they can download is the editor zip and no nightly GitHub job runs.

### F19-AC-023b

Given Postgres storage is in use, when the database is identified, then it is Postgres on Neon and point-in-time restore covers it.

## Edge cases and errors

Per-file validation errors use the F06 codes, messages, and hints. Import writes nothing for that file. The batch still saves the other valid files.

A file and its `.history/` entries are one unit (F19-REQ-017). A batch-level error saves nothing at all.

`{title}` in F19-REQ-011 is the last path segment with a final `.md` or `.markdown` removed, case-insensitive. The original file bytes follow that prefix with no added newline of their own. The constructed bytes are what export later writes. A second round trip of that result is byte-identical.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| The upload is not a zip and not a folder of files | `zip_invalid` | `This file is not a zip archive.` | `Choose a .zip of Markdown files, or drop the folder.` |
| A zip entry escapes the archive | `zip_path` | `The zip entry "{path}" escapes the archive.` | `Remove entries whose path contains "..", starts with "/", or contains a backslash.` |
| More than 10000 files, or more than 524288000 uncompressed bytes | `batch_too_large` | `The batch has {count} files and {bytes} bytes. The limits are 10000 files and 524288000 bytes.` | `Split the folder and import again. Nothing was saved.` |
| No Markdown files and no assets after ignored entries | `import_empty` | `The batch has no Markdown files or assets.` | `Add .md files, or a zip that contains them.` |
| Not Markdown and not under `assets/` | `not_markdown` | `"{path}" is not a Markdown document or an asset.` | `Put images under assets/. An agent converts HTML and artifacts outside markdown-kb.` |
| Asset longer than 10485760 bytes | `asset_too_large` | `Asset is {bytes} bytes. The limit is 10485760 bytes (10 MB).` | `Use a file of 10485760 bytes or less.` |
| History does not end with the document bytes | `history_mismatch` | `The history files do not end with the document file.` | `Export the space again. The last history file has to match the document.` |
| Path already stored with different bytes | `path_invalid` | `Path "{path}" is already used.` | `Keep the current path, or pick a date and slug that are free.` |
| Document longer than 204800 bytes | `too_large` | `Document is {bytes} bytes. The limit is 204800 bytes (200 KB).` | `Shorten the file to 204800 bytes or less, UTF-8.` |
| Viewer, Contributor, public visitor, or no session | `permission_denied` | `You do not have permission to change this document.` | `Sign in as an owner or an editor.` |
| Agent key or OAuth grant | `permission_denied` | `Agents propose changes. They do not save directly.` | `Call propose_change. Agents cannot merge, delete, or administer.` |

`{count}`, `{bytes}`, and `{path}` are filled with the integer or the entry path.

The report sections, in order, are `# Import report`, `## Saved`, then one `- \`{path}\`` per saved path, or the line `Nothing was saved.`, then `## Rejected`, then `### \`{path}\`` and one `- \`{code}\` — {message}` plus the hint indented two spaces. A batch-level error does not offer `Download report`. The screen shows that one error.

Claude artifacts and HTML are not converted. They fail `not_markdown`. An agent converts them outside the product and submits proposals.

The editor toasts `Choose .md files to import`, `Imported 1 page`, `Imported {n} pages`, `Exported 1 page`, and `Exported {n} pages` have no code and no hint.

The delete confirmation on a local project says `Its {n} pages and their versions leave this browser for good. Export the project first to keep a copy.` For one page, `page` is singular. That dialog is the editor backup warning. It is not Ledger import.

## Limits and budgets

| Limit | Value |
| --- | --- |
| Files in one Ledger batch | 10000. 10000 is allowed. 10001 is `batch_too_large` and nothing is saved |
| Uncompressed batch size | 524288000 bytes (500 MB, 500 × 1024 × 1024). 524288000 is allowed |
| Document file | 204800 bytes (200 KB, 200 × 1024), UTF-8, from F06 |
| Asset file | 10485760 bytes (10 MB, 10 × 1024 × 1024). 10485760 is allowed. 10485761 is `asset_too_large` |
| Title constructed for a file with no frontmatter | 1 to 120 characters. A character is one Unicode code point. The F06 check enforces it |
| `Include history` index | Integers starting at 1, one file per revision, in parent order |
| Default export | No `.history/` entries |
| Identical round trip | Uncompressed UTF-8 bytes of every Markdown file and every asset. The zip container bytes may differ |
| Point-in-time restore retention | No window is specified |
| Editor zip | One entry per page. CRLF may already have been rewritten by F19-REQ-004 |

No response-time budget is set for import or export. The numbers above are counts and sizes.

## UI states

Copy is the same at 860px wide or wider and at 420px wide. On a coarse pointer, `Import into this space`, `New space from files`, `Download report`, and Settings → Export are at least 44px by 44px. There is no illustration.

| Surface | State | Copy |
| --- | --- | --- |
| Settings → Import | Empty | `Drop a folder or a .zip of Markdown files.` The action is `Choose files` |
| Settings → Import | Loading | `Importing…` The accessible name is `Importing` |
| Settings → Import | Error, batch | The message, then the hint. No report button |
| Settings → Import | Partial | `{saved} saved. {rejected} need fixes.` The action is `Download report` |
| Settings → Import | Success | `Imported {n} files.` when none are rejected |
| Settings → Export | Success | The zip downloads. The toast is `Exported {n} files.` |
| Settings → Export | Error | The message, then the hint |
| Editor sidebar | Empty drop | `Choose .md files to import` |
| Editor card | Success | `Exported 1 page` or `Exported {n} pages` |

`{saved}`, `{rejected}`, and `{n}` are integers. The editor toasts stay the page wording in F19-REQ-001 and F19-REQ-003. The Ledger success line uses `files`.

While Ledger import is not in use, Settings has no Import section. The editor controls above are the ones that exist.

## Out of scope

- The validator's rule catalog (F06). Import calls it.
- The `Import` revision row and `content_hash` (F07).
- Turning the zip into proposals (F12). Import that validates writes documents. It does not open the Inbox.
- Converting Claude artifacts or HTML. The product does not interpret them.
- The nightly GitHub mirror. The PRD schedules that for v1.1. F19-REQ-023 keeps it out of this release.
- Seeding `.ledger/` on an empty new space (F22). Import does not add files the batch did not contain.
- The history screen (F18). `Include history` is an export option here.

## Open questions

None. ADR-0032 and ADR-0033 are Proposed. This spec follows them. The batch outcome is F19-REQ-008. Byte identity is F19-REQ-012 and F19-REQ-014.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:product-principles -->` (line 8) — export produces the same folder of files.
- `<!-- prd:import-existing-work -->` (line 286) — a folder of Markdown becomes revisions. The product does not convert artifacts.
- `<!-- prd:search-import-and-export -->` (line 755) — import and export use the file format.
- `<!-- prd:import -->` (line 764) — drop on Settings → Import or the sidebar. One initial revision. Author label `Import`. Nothing partial per file. A file with no frontmatter becomes `type: doc`.
- `<!-- prd:export -->` (line 770) — a zip of the space, including `.ledger/` and `assets/`. Optional `.history/`.
- `<!-- prd:backup -->` (line 774) — Neon point-in-time restore. The nightly GitHub job is v1.1.
- `<!-- prd:acceptance-milestones-6-7 -->` (line 852) — exporting and re-importing yields identical files.
- `<!-- prd:roles -->` (line 648) — Owner and Editor save directly.

Decisions in `specs/source/decisions-and-changes.md`: D3, D5, D6, D7, C4.

ADRs: ADR-0001, ADR-0002, ADR-0003, ADR-0011, ADR-0032, ADR-0033.

Shipped code this spec records and does not treat as Ledger import: `components/page-actions.ts`, `lib/workspace/zip.ts`, `lib/workspace/tree.ts`, `components/launcher.tsx`.
