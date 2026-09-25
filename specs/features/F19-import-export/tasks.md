# F19 tasks: Import, export, and backup

Dependency order. Each step names the requirements it satisfies, the test that proves them, and a size. Size is one module, several modules, or a schema change. No step lacks a requirement.

## 1. Keep the editor zip and the sidebar drop

Satisfies: F19-REQ-001, F19-REQ-002, F19-REQ-003, F19-REQ-004, F19-REQ-005.

Size: several modules (`components/launcher.tsx`, `components/page-actions.ts`, `lib/workspace/zip.ts`, `lib/workspace/tree.ts`).

Tests:

- F19-AC-001a, F19-AC-001b, F19-AC-001c in `lib/import/editor-zip.test.ts`
- F19-AC-002a in `lib/import/editor-zip.test.ts`
- F19-AC-003a, F19-AC-003b in `lib/import/editor-drop.test.ts`
- F19-AC-004a in `lib/import/editor-drop.test.ts`
- F19-AC-005a in `lib/import/editor-drop.test.ts`

While Ledger import is not in use, `Export (.zip)` exists only on `This browser`, downloads `{project}.zip`, and toasts the page count. The zip is one entry per page and has no extra `.ledger/` entry. The sidebar drop keeps `.md`, `.markdown`, and `.txt`, rewrites CR LF to LF, skips validation, and still adds the other files when one cannot be read.

## 2. Allow a null author while sign-in is absent

Satisfies: F19-REQ-018.

Size: schema change (`revisions.author_user_id`, `revisions_before_insert` in `specs/contracts/db.sql`).

Tests: F19-AC-018a, F19-AC-018b in `lib/import/author.test.ts`.

`author_user_id` accepts null. When `ledger.user_id` is unset, the insert trigger does not overwrite a null author. A valid new file then has message `Import`, null `author_user_id`, and author label `Import`. When sign-in exists, `author_user_id` is the importer. F18 restore uses this same column.

## 3. Accept a folder or a zip inside the caps

Satisfies: F19-REQ-020, F19-REQ-022.

Size: one module (`lib/import/intake.ts`).

Tests: F19-AC-020a, F19-AC-020b, F19-AC-022a, F19-AC-022b, F19-AC-022c in `lib/import/intake.test.ts`.

Depends on step 2 for the write path used when a file is accepted. A non-zip is `zip_invalid`. An entry with `..`, a leading `/`, or a backslash is `zip_path`, and nothing is saved. `.DS_Store` and `__MACOSX/` are ignored and are not batch files. More than 10000 files, or more than 524288000 uncompressed bytes, is `batch_too_large` and saves nothing. 10000 files and 524288000 bytes are accepted when each file is otherwise valid.

## 4. Save each valid file and refuse each invalid file

Satisfies: F19-REQ-007, F19-REQ-008, F19-REQ-011, F19-REQ-012, F19-REQ-021.

Size: several modules (`lib/import/bytes.ts`, `lib/import/batch.ts`).

Tests:

- F19-AC-007a, F19-AC-007b in `lib/import/batch.test.ts`
- F19-AC-008a, F19-AC-008b in `lib/import/batch.test.ts`
- F19-AC-011a, F19-AC-011b in `lib/import/bytes.test.ts`
- F19-AC-012a in `lib/import/bytes.test.ts`
- F19-AC-021a, F19-AC-021b in `lib/import/batch.test.ts`

Depends on steps 2 and 3. Zero errors saves the file. A warning such as `section_missing` still saves it. `field_missing` writes no document and no revision for that path. A mixed batch keeps the valid file. A batch of only errors writes nothing. A file with no frontmatter gets the constructed prefix and then the original bytes. A file that already has frontmatter is stored unchanged, including CRLF, key order, and trailing space. `assets/` is stored as bytes and is not validated. Anything else that is not Markdown is `not_markdown`.

## 5. Return one result and a report

Satisfies: F19-REQ-009, F19-REQ-010.

Size: several modules (`lib/import/batch.ts`, `lib/import/report.ts`).

Tests: F19-AC-009a, F19-AC-010a in `lib/import/report.test.ts`.

Depends on step 4. The result is unavailable until the batch finishes, then lists every saved path and every rejected path with its codes. One or more rejections offer `Download report`. The file is `import-report.md`, starts with `# Import report`, and includes the path, the code, the message, and the hint. A batch-level error does not offer the report.

## 6. Offer the two import actions

Satisfies: F19-REQ-006.

Size: one module (`components/settings-host.tsx`).

Test: F19-AC-006a in `lib/import/settings.test.ts`.

Depends on step 4. Settings → Import shows `Import into this space` and `New space from files`. A sidebar drop imports into the open space. Each accepts one folder or one zip.

## 7. Export the space and round-trip it

Satisfies: F19-REQ-013, F19-REQ-014, F19-REQ-016.

Size: one module (`lib/export/space-zip.ts`).

Tests: F19-AC-013a, F19-AC-014a, F19-AC-014b, F19-AC-016a, F19-AC-016b in `lib/export/space-zip.test.ts`.

Depends on step 4. Settings → Export writes head bytes, including `.ledger/` Markdown, and `assets/` bytes, without parsing frontmatter. `New space from files` stores those bytes and does not add a seed file the zip lacks. A second export matches the uncompressed bytes. `Include history` off omits `.history/`. On, `.history/docs/notes/1.md` and `2.md` match the revisions in parent order.

## 8. Import into a space that already has the path

Satisfies: F19-REQ-015, F19-REQ-017.

Size: several modules (`lib/import/batch.ts`, `lib/import/history-unit.ts`).

Tests: F19-AC-015a, F19-AC-015b, F19-AC-017a, F19-AC-017b in `lib/import/history-unit.test.ts`.

Depends on steps 4 and 7. Equal head bytes count as saved and append no revision. Different head bytes are `path_invalid` and leave the document. A history unit whose last file differs from the document saves neither the document nor the history files. Another valid document in that batch is still saved.

## 9. Allow import and export by role

Satisfies: F19-REQ-019.

Size: one module (`lib/import/batch.ts`).

Tests: F19-AC-019a, F19-AC-019b in `lib/import/access.test.ts`.

Depends on steps 6 and 7. While sign-in is absent, export downloads and no role is checked. When sign-in exists, a Viewer, and the other denied callers in the spec, receive `permission_denied` and nothing is written. Owner and Editor may import and export.

## 10. Name the backup

Satisfies: F19-REQ-023.

Size: one module (`lib/export/space-zip.ts`).

Tests: F19-AC-023a, F19-AC-023b in `lib/export/backup.test.ts`.

Depends on steps 1 and 7. While Postgres is not in use, the downloadable backup is the editor zip and no nightly GitHub job is defined. When Postgres is in use, the database is Postgres on Neon, point-in-time restore covers it, and Settings → Export is the Markdown copy.
