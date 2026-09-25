# F03 Links

## Summary

Readers move between pages with `[[wiki links]]`, jump to a heading with `#Heading`, and include another page or section with `![[embed]]`. The same links are what the page lists under "Linked from", and a rename or move rewrites them so they keep resolving.

## Status and scope

Partly built. This spec records the links that render today: `[[slug]]`, `[[slug#Heading]]`, `[[slug|label]]`, whole-paragraph `![[embed]]`, the "Linked from" list, and the rewrite that follows a rename or move.

Not started, and not specified here except as the current fallback: `[[slug@7]]` version pins (Versioned references), and backlinks computed when a proposal merges (Links). A pin is stored as part of the target text, so `[[shortcuts@7]]` renders as an unresolved link. Frontmatter strings are not scanned for wiki links, and a broken link does not fail validation.

Rendering of the embedded Markdown (callouts, math, and the rest) belongs to F04. The block editor's `[[` picker is built and is left to a later pass of F09. File names and slugs belong to F01. Nothing here is a proposal, a validation rule, or a role check.

## Users and stories

There is no sign-in. "Reader" means the person with the page open.

- **F03-US-001** As a reader, I want a `[[name]]` in the text to open that page, so that notes connect without a full URL.
- **F03-US-002** As a reader, I want a heading fragment and an embed, so that I can land on a section or read it in place.
- **F03-US-003** As a reader, I want the foot of the page to list who links here, so that I can see the citation without a merge step.

## Requirements

**F03-REQ-001** The system shall resolve a wiki target by trimming it, removing one trailing `.md` without regard to case, and removing leading slashes, then matching that text to a page path without `.md`. If no path matches, the system shall match the target to a page file name when exactly one page in the project has that file name.

**F03-REQ-002** When the body contains `[[target]]`, `[[target#Heading]]`, or `[[target|label]]`, and the target resolves, the system shall render a link to `/{project}/{path}` with a `#` fragment when a heading is present. The visible text shall be the label if one was written, otherwise the heading text, otherwise the page title.

**F03-REQ-003** If a wiki target does not resolve, including when more than one page has that file name, or when the target contains `@`, then the system shall show the label, heading, or target text in red and shall not make it a link.

**F03-REQ-004** When a paragraph's only text is `![[target]]` or `![[target#Heading]]` and the target resolves, the system shall render an embed: a source link reading `{title}` or `{title} / {Heading}`, then the page body or the headed section, with the embedded page's property row omitted.

**F03-REQ-005** If that embed target does not resolve, then the system shall replace the paragraph with the text `Missing page: {target}` in red.

**F03-REQ-006** When an embed names a heading, the system shall include that heading and the lines after it until the next heading of the same or higher level. If no heading text matches, ignoring case, the system shall embed the page body instead, and the source link shall still use the fragment for that text.

**F03-REQ-007** The system shall show at most 3 nested embeds. If the next embed would be a 4th level, or the page path is already on the embed trail, the system shall show `Embed stops here: {path} is already shown above.` and shall not render that embed.

**F03-REQ-008** While the page is in preview or editing, when another page in the project contains a wiki link or embed that resolves to this page, the system shall list those pages under the heading "Linked from", each row a title that links to the page and the path beneath it. The open page shall not be listed. When the list is empty, the system shall show no "Linked from" heading.

**F03-REQ-009** When a page or folder is renamed or moved, the system shall rewrite each wiki target that resolved to the old path so that it resolves to the new path, and shall keep any `#heading` and `|label` on that link.

**F03-REQ-010** The system shall set each rendered heading's id with github-slugger, in document order, skipping headings inside fenced code. A second heading with the same text shall receive a `-1` suffix, then `-2`, and so on. A wiki `#Heading` fragment shall be slugified on its own, so it matches the first heading with that text.

**F03-REQ-011** When the reader opens a project URL that has no page, the system shall show a missing-page screen whose heading is `“{Title}” has no page yet`, whose body is `Links can point to pages you haven’t written. Create it now and start writing, or open another page.`, and whose button is `Create this page`. `{Title}` is the last path segment with hyphens read as spaces and the first letter capitalized.

## Acceptance scenarios

### F03-AC-001a Unique file name

Given pages `docs/shortcuts.md` and `docs/writing.md`, when the target is `shortcuts`, then it resolves to `docs/shortcuts.md`.

Test name: `wiki refs resolve by file name when the path is unique`. Automated, passed (`npm test`).

### F03-AC-001b Exact path beats the file name

Given `docs/_probe/alpha/note.md` titled "First note", when the writing is `[[docs/_probe/alpha/note]]`, then the link reads "First note" and its address is `/guide/docs/_probe/alpha/note`.

Test name: `exact wiki path renders the page title`. Manual, passed. Chrome, local dev server, desktop 1280×900, `/guide/docs/_probe/links` in preview. The probe pages were removed after the check.

### F03-AC-002a Title, heading, and label

Given `/guide/docs/writing` in preview, when the page is read, then `[[shortcuts]]` is a link "Shortcuts" to `/guide/docs/shortcuts`, and `[[layout]]` is a link "Layout" to `/guide/docs/layout`.

Given the probe page, when the body contains `[[shortcuts#Keyboard]]` and `[[layout|The layout]]`, then the links read "Keyboard" and "The layout", and the Keyboard address ends in `#keyboard`.

Test name: `wiki link text is title, heading, or label`. Manual, passed. Same browser session, desktop, preview.

### F03-AC-003a Unresolved and ambiguous targets

Given two pages whose file name is `note.md`, and no page named `no-such-page` or `shortcuts@7`, when the probe page is shown in preview, then the text "note", "no-such-page", and "shortcuts@7" are red, and none of them is a link.

Test name: `unresolved wiki text is red and not a link`. Manual, passed. Same session, desktop, preview.

### F03-AC-004a Embed a heading

Given `/guide/docs/writing` in preview, when the page reaches `![[shortcuts#Keyboard]]`, then the source link reads "Shortcuts / Keyboard", its address is `/guide/docs/shortcuts#keyboard`, and the included table contains "Search pages" and does not contain the later heading "While editing".

Test name: `embed shows the headed section and a source link`. Manual, passed. Desktop and a 390px-wide viewport, preview, on `/guide/docs/writing`. The same source link was also present while editing.

### F03-AC-005a Missing embed

Given a paragraph whose only text is `![[missing-embed]]`, when the page is shown in preview, then the paragraph is replaced by `Missing page: missing-embed` in red.

Test name: `missing embed names the target`. Manual, passed. Desktop, preview, probe page.

### F03-AC-006a Heading section bounds

Given a body `# A`, then `alpha`, then `## Nested`, then `inside`, then `# B`, when the section "A" is taken, then the text includes `alpha` and `inside` and excludes `beta`.

Test name: `section extract stops at the next heading of the same rank`. Automated, passed (`npm test`).

### F03-AC-006b Unknown heading embeds the body

Given `![[shortcuts#Not a real heading]]`, when the probe page is shown in preview, then the source link still points at `#not-a-real-heading` and the embed includes the shortcuts section "While editing".

Test name: `unknown embed heading falls back to the page body`. Manual, passed. Desktop, preview, probe page.

### F03-AC-007a Fourth embed stops

Given `links` embeds `depth-a`, which embeds `depth-b`, then `depth-c`, then `depth-d`, then `depth-e`, when the probe page is shown, then "Depth A", "Depth B", and "Depth C" are visible, "Depth D" and "Fifth level stays on the page" are not, and the text `Embed stops here: docs/_probe/depth-d.md is already shown above.` is shown.

Test name: `embed depth stops at three levels`. Manual, passed. Desktop, preview and editing, probe page.

### F03-AC-008a Linked from

Given `/guide/docs/shortcuts` in preview, when the page foot is read, then a heading "Linked from" lists "Writing in markdown-kb" with `docs/writing.md` and "Link probe" with `docs/_probe/links.md`.

Given `/guide/docs/writing` in preview, when no other seeded page links to it, then there is no "Linked from" heading. In source mode the preview pane, and that list with it, is not shown.

Test name: `linked-from lists resolving pages and hides when empty`. Manual, passed. Desktop, preview. Editing was not opened on Shortcuts itself; source mode on Writing showed no preview pane.

### F03-AC-009a Rename and move rewrite targets

Given a link to `docs/layout.md`, when that page is renamed to "Screen layout", then the link target becomes `screen-layout`. Given a link `[[docs/shortcuts#Keys|keys]]`, when that page moves under `guides`, then the link becomes `[[guides/shortcuts#Keys|keys]]`.

Test name: `renaming a page moves the file and rewrites links to it` and `moving pages and folders keeps every link resolving`. Automated, passed (`npm test`). Not repeated in the browser.

### F03-AC-010a Heading ids

Given a fenced `# Hidden` and then two headings whose text is "Shown", when ids are extracted, then they are `shown` and `shown-1`, and the fenced line is not an id.

Test name: `headings skip fenced code and slug duplicates`. Automated, passed (`npm test`).

On `/guide/docs/writing` in preview, the heading "Links and notes" has id `links-and-notes`, and the embedded "Keyboard" heading has id `keyboard`.

Test name: `rendered heading ids match the slugger`. Manual, passed. Desktop and 390px, preview.

### F03-AC-011a Missing URL

Given the address `/guide/docs/no-such-page`, when it is opened, then the heading is `“No such page” has no page yet`, the body is `Links can point to pages you haven’t written. Create it now and start writing, or open another page.`, and the button is `Create this page`.

Test name: `missing path offers to create the page`. Manual, passed. Desktop, local dev server.

## Edge cases and errors

The product has no error code and no hint for any link failure. The visible text is the whole report.

| Situation | Code | Message | Hint |
| --- | --- | --- | --- |
| Unresolved `[[target]]`, ambiguous file name, or a target containing `@` | None | The label, heading, or raw target, in red. No separate sentence. | None |
| Unresolved `![[target]]` | None | `Missing page: {target}` | None |
| 4th embed, or a page already on the trail | None | `Embed stops here: {path} is already shown above.` The same sentence is used for both causes. | None |
| Embed heading not found | None | No error. The page body is embedded. | None |
| `![[target\|label]]`, or `![[target]]` inside a sentence | None | Not an embed. It follows F03-REQ-002 and F03-REQ-003. | None |
| Wiki syntax inside frontmatter | None | Not scanned. The value is ordinary property text if a property row is shown. | None |

A heading-shaped line inside a fence is skipped when heading ids are built, and is not skipped by the line scan that cuts an embed section. That second scan was not loaded in the browser.

## Limits and budgets

- Embed depth: 3 nested embeds. The 4th is the stop message. Counted in the rendered page, not as a percentile.
- "Linked from" is computed when the page is shown, from the pages held in the browser. There is no published latency budget.
- Heading ids and fragments use github-slugger. No separate length cap is applied at render time.

## UI states

| State | Desktop (1280px wide) | 390px wide |
| --- | --- | --- |
| Success | Wiki links use the page link color. An embed sits in a filled block with a 12px source link `{title}` or `{title} / {Heading}`. "Linked from" is a heading and a list at the foot of the column. | The same text. The column uses the full width (F04). The outline is hidden, so the list stays on the page. |
| Empty | No "Linked from" heading when nothing resolves to the page. An empty embed target is not a state of preview; the editor's empty embed says `Choose a page to embed.` and is outside this spec. | Same. |
| Loading | Links and embeds are part of the page HTML. No link-specific loading copy. | Same. |
| Error | Red text, as in the table above. The rest of the page still renders. | Same red text. Checked on Writing at 390px for a successful embed; the red cases were checked at desktop only. |
| Partial | A chain shows the first 3 embeds and then the stop sentence. | Not separately loaded. The stop sentence is the same string. |

Checked in Chrome on the local dev server. Production `https://markdown-kb-editor.vercel.app/guide/docs/writing` returned the same wiki link and embed markers in the HTML. Production was not clicked.

## Out of scope

- `[[slug@7]]` as a version pin, and the rule that a pin points at the first revision saved with that version (Versioned references). Not started.
- Backlinks computed on merge, grouped by type, in the right panel (Links, Document view). The built list is "Linked from" at the foot of the page. The right column is the outline (section 2.2, C7), specified with F08.
- Validation codes for broken frontmatter links. Not started.
- Charts, callouts, and other body syntax inside an embed (F04), except that the embed stops and the missing-page sentence are this feature.
- The `[[` page picker while editing (built, later F09).
- Proposals, the validation engine, and sign-in.

## Open questions

| Question | Owner | Blocks |
| --- | --- | --- |
| Should an embed whose heading does not match show an error instead of the whole page body? Today it shows the body. | Product owner | A change to F03-REQ-006. The built behavior is specified. |
| When several pages share a file name, should the link offer a choice instead of rendering as unresolved? | Product owner | A change to F03-REQ-003. |
| Which revision does `[[slug@7]]` show when version 7 is saved more than once? | Product owner | The unbuilt version pin. Section 2.3. |

## Trace

- PRD sections: Links; Versioned references; Markdown capabilities (rows Wiki links, Embeds, and the performance note that embeds stop at three levels and never loop); Document view (backlinks, which the built page puts at the foot).
- Plan section 2.2, row "Right panel": the outline replaced the backlink panel. C7.
- Plan section 2.3, "Links and versions": the pin ambiguity and the unstated embed-limit copy. This spec records the copy that shipped.
- Decisions: D5 (the editor and reading come before the Ledger loop), D6 (pages are `/guide/…`, not `/memento`).
- Change requests: C4 (the link text stays in the reading column at 390px), C8 (a shared link opens the page; it does not change how a target resolves).
- D7 and D8 do not change link resolution. D7 is who may save, which is not built. D8 keeps attachments out of scope.
- ADRs: none recorded yet.
- Code: `lib/markdown/links.ts`, `lib/markdown/plugins.ts`, `lib/markdown/outline.ts` (`extractSection`), `lib/workspace/relink.ts`, `lib/workspace/tree.ts` (`backlinks`), `components/markdown-parts.tsx` (`MAX_EMBED_DEPTH`), `components/markdown-view.tsx`, `components/missing-page.tsx`.
