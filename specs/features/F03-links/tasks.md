# F03 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Every step here is shipped. The tests named below already prove it. There is no not-started requirement in this spec.

## Shipped

### F03-T-001 Resolve a wiki target

- Requirements: F03-REQ-001
- Test: `wiki refs resolve by file name when the path is unique` (F03-AC-001a), in `lib/markdown/markdown.test.ts`. `exact wiki path renders the page title` (F03-AC-001b) checks that an exact path wins over a file name.
- Size: one module
- Depends on: none
- Module: `lib/markdown/links.ts` (`resolveDoc`)

### F03-T-002 Slug heading ids

- Requirements: F03-REQ-010
- Test: `headings skip fenced code and slug duplicates` (F03-AC-010a), in `lib/markdown/markdown.test.ts`. `rendered heading ids match the slugger` checks the ids on the rendered page.
- Size: one module
- Depends on: none
- Module: `lib/markdown/outline.ts` (`extractHeadings`), with `rehype-slug` on the rendered page

### F03-T-003 Render a wiki link

- Requirements: F03-REQ-002, F03-REQ-003
- Test: `wiki link text is title, heading, or label` (F03-AC-002a). `unresolved wiki text is red and not a link` (F03-AC-003a), including an ambiguous file name and a target that contains `@`.
- Size: several modules
- Depends on: F03-T-001, F03-T-002
- Modules: `lib/markdown/plugins.ts` (`remarkWiki`), `components/markdown-parts.tsx`

### F03-T-004 Render an embed

- Requirements: F03-REQ-004, F03-REQ-005, F03-REQ-006, F03-REQ-007
- Test: `embed shows the headed section and a source link` (F03-AC-004a). `missing embed names the target` (F03-AC-005a). `section extract stops at the next heading of the same rank` (F03-AC-006a), in `lib/markdown/markdown.test.ts`. `unknown embed heading falls back to the page body` (F03-AC-006b). `embed depth stops at three levels` (F03-AC-007a).
- Size: several modules
- Depends on: F03-T-001, F03-T-003
- Modules: `remarkWiki` for the embed placeholder, `extractSection` for the section bounds, `components/markdown-parts.tsx` for depth and the stop message

### F03-T-005 List who links here

- Requirements: F03-REQ-008
- Test: `linked-from lists resolving pages and hides when empty` (F03-AC-008a). The open page is absent. An empty list has no "Linked from" heading. Source mode shows no preview pane, so the list is not there.
- Size: one module
- Depends on: F03-T-001
- Module: `lib/workspace/tree.ts` (`backlinks`), rendered from `components/workspace.tsx`

### F03-T-006 Rewrite targets on rename and move

- Requirements: F03-REQ-009
- Test: `renaming a page moves the file and rewrites links to it` and `moving pages and folders keeps every link resolving` (F03-AC-009a), in `lib/workspace/workspace.test.ts`. A `#heading` and a `|label` stay on the rewritten target.
- Size: several modules
- Depends on: F03-T-001
- Modules: `lib/workspace/relink.ts`, `lib/workspace/moves.ts`

### F03-T-007 Offer to create a missing page

- Requirements: F03-REQ-011
- Test: `missing path offers to create the page` (F03-AC-011a). The heading is `“{Title}” has no page yet`, the body is the sentence in the requirement, and the button is `Create this page`. `{Title}` is the last path segment, hyphens read as spaces, first letter capitalized.
- Size: one module
- Depends on: none
- Module: `components/missing-page.tsx`, using `humanize` from `lib/workspace/paths.ts`
