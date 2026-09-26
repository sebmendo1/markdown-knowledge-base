# F08 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Every step here is shipped. The tests named below already prove it.

## Shipped

### F08-T-001 Address a page and redirect the old paths

- Requirements: F08-REQ-001, F08-REQ-002, F08-REQ-003, F08-REQ-004
- Test: `page url is project then page path` (F08-AC-001a). `bare docs and ledger redirect to guide` (F08-AC-002a). `nested docs and ledger redirect into guide` (F08-AC-003a). `project home opens the home page` (F08-AC-004a).
- Size: several modules
- Depends on: none
- Modules: `lib/workspace/paths.ts` (`hrefOf`), `app/[project]/page.tsx`, `app/[project]/[...slug]/page.tsx`, `next.config.ts`. `/docs` and `/ledger` are temporary redirects to `/guide`. Nested paths are permanent redirects into `/guide`.

### F08-T-002 Lay out the three columns

- Requirements: F08-REQ-005, F08-REQ-006
- Test: `desktop shell is three full-height columns` (F08-AC-005a). `columns use solid fills and no hairline` (F08-AC-006a). Files are 248px, the outline is 220px, and the border between columns is 0px.
- Size: several modules
- Depends on: F08-T-001
- Modules: `components/workspace-view.tsx`, `app/columns.css`. Surfaces are the sidebar and page tokens in [`specs/contracts/tokens.md`](../../contracts/tokens.md).

### F08-T-003 Show and hide the file column

- Requirements: F08-REQ-007, F08-REQ-008, F08-REQ-009
- Test: `file column starts open on a wide screen` (F08-AC-007a). `hide sidebar removes the file column` (F08-AC-008a). `show sidebar restores the file column` (F08-AC-009a).
- Size: one module
- Depends on: F08-T-002
- Module: `setSidebarExpanded` in `components/draft-store.ts`, key `markdown-kb:sidebar`. A missing value is shown. The reveal control is labeled "Show sidebar".

### F08-T-004 Open the file column as a phone drawer

- Requirements: F08-REQ-010, F08-REQ-011, F08-REQ-035
- Test: `phone width hides the outline and the file column` (F08-AC-010a). `phone file column opens as a drawer` (F08-AC-011a). `phone scrim closes the file drawer` (F08-AC-035a). The drawer is `min(280px, 88vw)`.
- Size: several modules
- Depends on: F08-T-003
- Modules: `components/workspace.tsx` (`sidebarOpen`), `app/columns.css` at `max-width: 860px`

### F08-T-005 List pages in the file column

- Requirements: F08-REQ-012, F08-REQ-013
- Test: `file list marks the open page and opens its folders` (F08-AC-012a). `file column shows search trash and settings` (F08-AC-013a).
- Size: one module
- Depends on: F08-T-003
- Module: `components/file-sidebar.tsx` and `components/page-tree.tsx`

### F08-T-006 Show the title row, the status line, and the document title

- Requirements: F08-REQ-014, F08-REQ-015, F08-REQ-016, F08-REQ-034
- Test: `title row shows the page path` (F08-AC-014a). `title row shows edit share and page actions` (F08-AC-015a). `status line names state words and mode` (F08-AC-016a). `document title joins page and project` (F08-AC-034a).
- Size: one module
- Depends on: F08-T-001
- Module: `components/document-chrome.tsx`. The document title is set in `components/workspace.tsx`. Word count and mode labels are filled by F09.

### F08-T-007 Open in viewing and show rendered Markdown

- Requirements: F08-REQ-017, F08-REQ-018
- Test: `unset mode opens in viewing` (F08-AC-017a). `viewing shows rendered markdown` (F08-AC-018a).
- Size: several modules
- Depends on: F08-T-006
- Modules: `useMode` in `components/draft-store.ts`, the preview stage in `components/preview-stage.tsx`. The mode is one value for the browser. A share parameter is F11 and F09.

### F08-T-008 Set the reading measure and the phone page

- Requirements: F08-REQ-019, F08-REQ-020, F08-REQ-021
- Test: `reading text is 17px at 1.7 line height` (F08-AC-019a). `reading column is capped at 760px` (F08-AC-020a). `390px page uses 16px side padding` (F08-AC-020b). `390px page scrolls vertically and can edit` (F08-AC-021a).
- Size: one module
- Depends on: F08-T-002
- Module: `app/reading.css`. Padding is 32px above a 640px page column, 20px from 420px through 640px, and 16px at 420px and below.

### F08-T-009 Fill and scroll the outline

- Requirements: F08-REQ-022, F08-REQ-023, F08-REQ-024, F08-REQ-025, F08-REQ-026, F08-REQ-027
- Test: `outline lists the page headings` (F08-AC-022a). `outline says no headings` (F08-AC-023a). `outline marks the top heading` (F08-AC-024a). `outline row scrolls to the heading` (F08-AC-025a). `source mode and phone width hide the outline` (F08-AC-026a). `outline indents nested headings` (F08-AC-027a).
- Size: several modules
- Depends on: F08-T-002, F08-T-007
- Modules: `lib/markdown/outline.ts`, `components/use-headings.ts`, `components/use-active-heading.ts`, `components/outline-panel.tsx`. Indent is `8 + (depth - 1) * 12` pixels. Scroll is smooth unless reduced motion is preferred. Headings inside an embed, a backlink list, or footnotes are skipped.

### F08-T-010 Show the empty, missing, unknown, and loading screens

- Requirements: F08-REQ-028, F08-REQ-029, F08-REQ-030, F08-REQ-031
- Test: `missing page offers to create it` (F08-AC-028a). `empty project offers the first page` (F08-AC-029a). `unknown project sends the owner to the project list` (F08-AC-030a). `missing route is blank before hydration` (F08-AC-031a).
- Size: several modules
- Depends on: F08-T-001
- Modules: `components/missing-page.tsx` (`MissingPage`, `EmptyProject`, and the unknown-project screen), and the blank stage in `components/workspace-view.tsx` while `hydrated` is false and the route names no page. The missing-page copy is the same screen as F03-REQ-011.

### F08-T-011 Show who links here

- Requirements: F08-REQ-032
- Test: `backlinks sit under the page` (F08-AC-032a). The heading is "Linked from", at the end of the reading column, and only when at least one page links here.
- Size: one module
- Depends on: F08-T-007
- Module: `backlinks` from `lib/workspace/tree.ts`, placed by `components/workspace.tsx`. Resolution rules are F03-REQ-008.

### F08-T-012 Show a disk change

- Requirements: F08-REQ-033
- Test: `disk change shows a load control` (F08-AC-033a). The copy is "This page changed on disk." and the control is "Load disk version".
- Size: one module
- Depends on: F08-T-006
- Module: `components/disk-sync.ts` (`useDiskConflicts`, `loadDiskVersion`), banner in the document chrome

## ADR-0037

### F08-T-013 Outline card and collapsible sections

- Requirements: F08-REQ-006, F08-REQ-036, F08-REQ-039, F08-REQ-040
- Test: `F08-AC-036a outline is a card in a page-colored column`. `F08-AC-039a outline lists the title and each h2 with a chevron slot`. `F08-AC-040a an h2 chevron shows and hides its h3 rows`.
- Size: several modules
- Depends on: F08-T-007
- Modules: `components/outline-panel.tsx` groups headings by H2 and keeps an expanded set; `.outline` in `app/globals.css` and `app/columns.css`. F08-REQ-006 is superseded (ADR-0037).

### F08-T-014 One account row, Trash in the Pages menu

- Requirements: F08-REQ-013, F08-REQ-037
- Test: `F08-AC-037a file column foot is one settings row`.
- Size: several modules
- Depends on: none
- Modules: the foot of `components/file-sidebar.tsx`; the Pages menu items in `components/tree-items.ts`. F08-REQ-013 is superseded (ADR-0037).

### F08-T-015 Title row order

- Requirements: F08-REQ-015, F08-REQ-038
- Test: `F08-AC-038a page actions sit beside the file name`.
- Size: one module
- Depends on: none
- Module: `components/document-chrome.tsx`. F08-REQ-015 is superseded (ADR-0037).

### F08-T-016 Project name without a tile

- Requirements: F08-REQ-041
- Test: `F08-AC-041a project name has a chevron and no tile`.
- Size: one module
- Depends on: F21-T-011 for the display face
- Module: `components/project-switcher.tsx`.
