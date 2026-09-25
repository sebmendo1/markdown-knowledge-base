# F18 tasks: History and Timeline

Dependency order. Each step names the requirements it satisfies, the test that proves them, and a size. Size is one module, several modules, or a schema change. No step lacks a requirement.

## 1. Keep the editor dialog

Satisfies: F18-REQ-001, F18-REQ-002, F18-REQ-003, F18-REQ-004, F18-REQ-005.

Size: several modules (`components/history-dialog.tsx`, `components/history-store.ts`, `components/document-chrome.tsx`).

Tests:

- F18-AC-001a in `lib/history/dialog.test.ts`
- F18-AC-002a, F18-AC-002b in `lib/history/dialog.test.ts`
- F18-AC-003a in `lib/history/dialog.test.ts`
- F18-AC-004a, F18-AC-004b in `lib/history/dialog.test.ts`
- F18-AC-005a in `lib/history/dialog.test.ts`

While the Ledger screen is not in use, `Version history` opens the dialog and does not navigate. Rows are current, at most 50 snapshots, then the repository copy. Restore replaces the working copy, writes `Before restoring`, toasts `Version restored`, and does not insert a `revisions` row. A matching row disables `Restore this version`.

## 2. Open the history screen on the document

Satisfies: F18-REQ-006, F18-REQ-007.

Size: several modules (`lib/history/list.ts`, `components/history/history-screen.tsx`, `app/[project]/[...slug]/history/page.tsx`).

Tests: F18-AC-006a, F18-AC-007a, F18-AC-007b in `lib/history/list.test.ts`.

Depends on step 1 for the menu item, which switches target when the Ledger screen is in use. The path for `docs/notes.md` in `guide` is `/guide/docs/notes/history`. The list is every revision, newest first, with no localStorage row. The first selection is the head and its parent.

## 3. Diff two revisions

Satisfies: F18-REQ-008.

Size: one module (`lib/history/diff.ts`).

Tests: F18-AC-008a, F18-AC-008b in `lib/history/diff.test.ts`.

Depends on step 2. The older `created_at` is the base. Equal times use the smaller revision id. The diff covers the full UTF-8 file, frontmatter in stored key order.

## 4. Restore by appending a revision

Satisfies: F18-REQ-009, F18-REQ-010, F18-REQ-011, F18-REQ-012, F18-REQ-013.

Size: one module (`lib/history/restore.ts`).

Tests:

- F18-AC-009a in `lib/history/restore.test.ts`
- F18-AC-010a, F18-AC-012a in `lib/history/restore.test.ts`
- F18-AC-011a in `lib/history/restore.test.ts`
- F18-AC-013a in `lib/history/restore.test.ts`

Depends on step 2 and on F19 step 2 (nullable `author_user_id` while sign-in is absent). Validate against the schemas loaded now. No error appends one revision with message `Restore`, parent equal to the previous head, and the chosen row unchanged. An error, including `field_missing` against a schema that changed later, appends nothing. Warnings still append. Identical bytes return `no_change`.

## 5. Allow restore by role

Satisfies: F18-REQ-014, F18-REQ-015, F18-REQ-020.

Size: one module (`lib/history/restore.ts`).

Tests: F18-AC-014a, F18-AC-015a, F18-AC-015b, F18-AC-015c, F18-AC-015d, F18-AC-020a, F18-AC-020b in `lib/history/access.test.ts`.

Depends on step 4. While sign-in is absent, the person at the keyboard restores and no role is checked. When sign-in exists, Owner and Editor restore. Contributor, Viewer, agent key, and OAuth grant receive `permission_denied` and append nothing. A public read-only visitor sees the list and cannot restore.

## 6. Group the space on a timeline

Satisfies: F18-REQ-016, F18-REQ-017, F18-REQ-018, F18-REQ-019.

Size: several modules (`lib/history/timeline.ts`, `components/history/timeline-screen.tsx`, `app/[project]/timeline/page.tsx`).

Tests:

- F18-AC-016a, F18-AC-016b in `lib/history/timeline.test.ts`
- F18-AC-017a in `lib/history/timeline.test.ts`
- F18-AC-018a, F18-AC-018b in `lib/history/timeline.test.ts`
- F18-AC-019a in `lib/history/timeline.test.ts`

Depends on step 2. The route is `/{project}/timeline`. Days use the viewer's time zone. The list includes a human save and a merge, and excludes an open proposal, a draft, and a localStorage snapshot. Type and author filters both apply when set. An agent key shows its label and the agent glyph.

## 7. Move the list with J and K

Satisfies: F18-REQ-021.

Size: several modules (`components/history/history-screen.tsx`, `components/history/timeline-screen.tsx`).

Tests: F18-AC-021a, F18-AC-021b in `lib/history/keys.test.ts`.

Depends on steps 2 and 6. `J` selects the next row. `K` selects the previous row. The binding applies on the history list and on the timeline list.
