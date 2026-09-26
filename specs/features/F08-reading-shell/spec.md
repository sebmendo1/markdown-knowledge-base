# F08 Reading shell

## Summary

The reading shell is the screen a person uses to read a page: a file column, the page, and an outline. It keeps the page readable on a wide display and on a phone, and it is the frame for settings, share, and search.

## Status and scope

Built. This spec covers routes, the three columns, the file column's show and hide behavior, the outline, the title row and status line, the reading measure, and the shell's missing, empty, and unknown screens.

It leaves editing mechanics to F09, the settings window to F10, the share sheet to F11, page search to F17, shortcut behavior to F20, and surface, radius, type, and breakpoint values to F21. Version history, trash contents, and file-tree edits (rename, move, delete, import) are out of scope.

Two shipped values disagree with PLAN section 2.2. This spec requires what the app does.

- PLAN section 2.2 says pages live at `/docs/…` with no space segment. The app addresses a page as `/{project}/{page-path}`. A project slug is the first segment. `/docs` and `/ledger` redirect into the guide project.
- PLAN section 2.2 and change request C4 call for a measure of about 66 characters. The stylesheet sets a `66ch` width and also a `760px` maximum. In the browser check at 17px, the maximum won: the text was 696px wide, and 66ch of the same font was 744px.

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual.

## Users and stories

No sign-in exists (decision D3). Anyone who can open the app is the owner for this spec. There is no other role and no refusal.

- F08-ST-001 As the owner, I want the open page between the file list and the outline, so that I can move through a project while I read.
- F08-ST-002 As the owner, I want the line length and type to stay comfortable, so that a page is readable on a desk and on a phone.
- F08-ST-003 As the owner, I want to hide the file list, so that the page can use the width.

## Requirements

- F08-REQ-001 The system shall address a page as `/{project}/{page-path}`, where `{project}` is the project slug and `{page-path}` is the page path with the `.md` suffix removed.
- F08-REQ-002 When the request path is `/docs` or `/ledger`, the system shall respond with a temporary redirect to `/guide`.
- F08-REQ-003 When the request path is `/docs/{path}` or `/ledger/{path}`, the system shall respond with a permanent redirect to `/guide/docs/{path}` or `/guide/ledger/{path}`.
- F08-REQ-004 When the owner opens a project URL with no page, and that project has a home page, the system shall redirect to the home page.
- F08-REQ-005 While the viewport is wider than 860px, the file column is expanded, the outline choice is open, and the mode is not Markdown source, the system shall show three full-height columns: the file column at 248px, the page in the remaining width, and the outline at 220px.
- F08-REQ-006 The system shall paint the file column and the outline with the sidebar surface, and the title row, page, and status line with the page surface, with a border width of 0px between those columns. Superseded by F08-REQ-036 (ADR-0037).
- F08-REQ-007 While the stored sidebar choice is shown, or no choice is stored, and the viewport is wider than 860px, the system shall show the file column.
- F08-REQ-008 When the owner hides the file column, the system shall remove it, show a panel control labeled "Show sidebar" at the top left of the page, and store the choice as hidden.
- F08-REQ-009 When the owner activates "Show sidebar", the system shall show the file column and store the choice as shown.
- F08-REQ-010 While the viewport is 860px wide or narrower, the system shall keep the outline off screen and keep the file column off screen until the owner opens it.
- F08-REQ-011 When the owner opens the file column at a viewport 860px wide or narrower, the system shall show it as a drawer of `min(280px, 88vw)` with a scrim over the page.
- F08-REQ-012 The system shall list the project's pages in the file column, mark the open page, and expand every folder on the path to that page.
- F08-REQ-013 The system shall show a Search control at the top of the file column and Trash and Settings at the foot. Superseded by F08-REQ-037 (ADR-0037).
- F08-REQ-014 When a page is open, the system shall show its path in the title row, with folder segments separated by ` / ` and the file name, including `.md`, emphasized.
- F08-REQ-015 When a page is open, the system shall show Edit, Share, and page actions in the title row. Superseded by F08-REQ-038 (ADR-0037).
- F08-REQ-016 The system shall show a status line naming the page state, and, when a page is open, the word count and the mode.
- F08-REQ-017 The system shall open a page in viewing unless a stored mode or a share parameter says otherwise, and shall remember the mode on this machine.
- F08-REQ-018 While the mode is viewing, the system shall show the page as rendered Markdown.
- F08-REQ-019 The system shall set the reading text to 17px with a line height of 1.7.
- F08-REQ-020 The system shall limit the reading column to the smallest of the page column width, 760px, and 66ch plus 64px, and shall pad it by 32px on each side above a 640px page column, 20px on each side from 420px through 640px, and 16px on each side at 420px and below.
- F08-REQ-021 While the viewport is 390px wide, the system shall show the page without horizontal scrolling and shall keep Edit available.
- F08-REQ-022 The system shall fill the outline from the page's headings, skipping headings inside an embed, a backlink list, or footnotes.
- F08-REQ-023 If the open page has no headings, then the system shall show "No headings" in the outline.
- F08-REQ-024 While a heading is the highest one visible in the page, the system shall mark that outline row.
- F08-REQ-025 When the owner chooses an outline row, the system shall scroll that heading to the top of the page, smoothly unless the owner prefers reduced motion.
- F08-REQ-026 The system shall hide the outline while the outline choice is closed, while the mode is Markdown source, while the route has no page, or while the viewport is 860px wide or narrower.
- F08-REQ-027 The system shall indent an outline row by 8px plus 12px for each heading level below the first.
- F08-REQ-028 If the route names a page the project does not have, and the project has at least one page, then the system shall show the missing-page screen for that path.
- F08-REQ-029 If the project has no pages, then the system shall show the empty-project screen.
- F08-REQ-030 If the project is not in this browser, then the system shall show the unknown-project screen.
- F08-REQ-031 While the page list has not finished loading and the route names no page, the system shall show a blank page stage and no message.
- F08-REQ-032 When one or more pages link to the open page, the system shall list them under "Linked from" at the end of the reading column.
- F08-REQ-033 If the open page has changed on disk since it was loaded, then the system shall show "This page changed on disk." and a "Load disk version" control.
- F08-REQ-034 When a page is open, the system shall set the document title to `{page title} · {project name}`.
- F08-REQ-035 When the owner activates the phone file-column scrim, the system shall close the drawer.
- F08-REQ-036 The system shall paint the file column with the sidebar surface, and the title row, page, status line, and outline column with the page surface, with a border width of 0px between those columns. The outline shall sit in a card 208px wide with a 16px radius, filled with `#2c2c2c` at 20% opacity in Dark and with the sunken surface in Light, inset 16px from the column sides and 24px from its top.
- F08-REQ-037 The system shall show a Search control at the top of the file column and one account row at the foot, with a gear icon and the label "Settings", that opens Settings. When sign-in exists, the label shall be the person's name. The system shall offer Trash from the Pages menu.
- F08-REQ-038 When a page is open, the system shall show, in the title row, the file name in Geist Mono with the page actions control directly after it on the left, and Edit and Share on the right.
- F08-REQ-039 The system shall head the outline card with "Outline", then the page title, then one row for each H2, each with a 24px chevron slot at the right, whether or not that row has children.
- F08-REQ-040 When the owner chooses an H2 row's chevron, the system shall show or hide that section's H3 rows beneath it, indented by 12px, and shall show the section of the heading that is highest in view.
- F08-REQ-041 The system shall show the project name at the top of the file column with an up-down chevron that opens the project switcher, and no letter tile.

The page state words are "Repository copy", "Edited in this browser", "Created in this browser", and "No page here yet". The mode words are "Viewing", "Editing", and "Markdown source". The word count is the number of whitespace-separated words in the page text, followed by the word "words". Edit reads "Edit" in viewing and "Editing" in editing and in Markdown source.

## Acceptance scenarios

### F08-AC-001a Project page URL

Test name: `page url is project then page path`

Given the guide project and the page `docs/layout.md`, when the owner opens it, then the path is `/guide/docs/layout`.

Checked: ran, Chrome, 1280×800.

### F08-AC-002a Bare docs and ledger redirect

Test name: `bare docs and ledger redirect to guide`

Given the dev server, when a client requests `/docs` or `/ledger`, then the response is `307` and the location is `/guide`.

Checked: ran, HTTP against the local dev server.

### F08-AC-003a Nested docs and ledger redirect

Test name: `nested docs and ledger redirect into guide`

Given the dev server, when a client requests `/docs/layout` or `/ledger/space`, then the response is `308` and the location is `/guide/docs/layout` or `/guide/ledger/space`.

Checked: ran, HTTP against the local dev server. The browser then showed `/guide/docs/layout`.

### F08-AC-004a Project home redirects

Test name: `project home opens the home page`

Given the guide project's home page `docs/writing.md`, when the owner opens `/guide`, then the response is `307` and the location is `/guide/docs/writing`.

Checked: ran, HTTP against the local dev server.

### F08-AC-005a Three columns

Test name: `desktop shell is three full-height columns`

Given `/guide/docs/layout` in viewing with the file column and outline open, when the viewport is 1280×800 CSS pixels, then the shell is 1280×800, the file column is 248px wide, the outline is 220px wide, and the page column is 812px wide.

Checked: ran, Chrome, 1280×800.

### F08-AC-006a Column surfaces

Test name: `columns use solid fills and no hairline`

Given the same desktop page, when the shell is measured, then the page, title row, and status line are `rgb(17, 17, 17)`, the file column and outline are `rgb(27, 27, 27)`, and the file column's right border and the outline's left border are 0px.

Checked: ran, Chrome, 1280×800, dark theme.

### F08-AC-007a Sidebar starts open

Test name: `file column starts open on a wide screen`

Given a fresh browser profile and a viewport wider than 860px, when the owner opens a page, then the file column is visible.

Checked: ran, Chrome, 1280×800, first load of the profile.

### F08-AC-008a Hide the file column

Test name: `hide sidebar removes the file column`

Given the file column is visible at 1280px, when the owner activates "Hide sidebar", then the file column is not displayed, "Show sidebar" is visible, the stored choice is hidden, and the remaining columns are the page and the 220px outline.

Checked: ran, Chrome, 1280×800. The page column measured 1060px beside the 220px outline.

### F08-AC-009a Show the file column

Test name: `show sidebar restores the file column`

Given the file column is hidden, when the owner activates "Show sidebar", then the file column is visible and the stored choice is shown.

Checked: ran, Chrome, 1280×800.

### F08-AC-010a Narrow shell

Test name: `phone width hides the outline and the file column`

Given `/guide/docs/layout` with the outline choice open, when the viewport is 390×844 CSS pixels, then the outline is not shown and the file column sits off screen.

Checked: ran, Chrome, 390×844. The outline computed display was `none`. The file column was translated off screen.

### F08-AC-011a Phone drawer

Test name: `phone file column opens as a drawer`

Given a 390px viewport, when the owner activates "Show sidebar", then the drawer is 280px wide at the left edge and a scrim is present.

Checked: ran, Chrome, 390×844, for the open drawer, its 280px width, and the scrim.

### F08-AC-035a Scrim closes the drawer

Test name: `phone scrim closes the file drawer`

Given the drawer is open at 390px, when the owner activates the scrim, then the drawer closes and the page is visible.

Checked: manual. A click aimed at the scrim during the browser check landed on the drawer instead, so the close was not observed. The scrim button is the control that closes it.

### F08-AC-012a Current page in the file list

Test name: `file list marks the open page and opens its folders`

Given `docs/layout.md` is open, when the file column is visible, then that page is the current page and its parent folder is expanded.

Checked: manual. The file list was on screen at 1280px, and the code expands every ancestor of the open path. The current-page attribute was not read back in the browser check.

### F08-AC-013a File column controls

Test name: `file column shows search trash and settings`

Given the file column is visible, when the owner looks at its top and foot, then Search, Trash, and Settings are there.

Checked: ran, Chrome, 1280×800. Search and Settings were used. The desktop screenshot also showed Trash at the foot.

### F08-AC-014a Path in the title row

Test name: `title row shows the page path`

Given `docs/layout.md` is open, when the title row renders, then it reads `docs / layout.md`.

Checked: ran, Chrome, 1280×800 and 390×844.

### F08-AC-015a Title row actions

Test name: `title row shows edit share and page actions`

Given a page is open, when the title row renders, then Edit and Share are visible.

Checked: ran, Chrome, 1280×800 and 390×844. The page-actions control was not activated.

### F08-AC-016a Status line

Test name: `status line names state words and mode`

Given an unchanged repository page in viewing, when the status line renders, then it reads "Repository copy", the word count, and "Viewing".

Checked: ran, Chrome, 1280×800. `docs/layout.md` showed "Repository copy", "282 words", and "Viewing".

### F08-AC-017a Viewing is the default

Test name: `unset mode opens in viewing`

Given no stored mode, when the owner opens a page, then the status line says "Viewing".

Checked: ran, Chrome, first load of the profile at 1280×800.

### F08-AC-018a Rendered page

Test name: `viewing shows rendered markdown`

Given `docs/layout.md` in viewing, when the page renders, then the heading "Layout" is visible as a heading.

Checked: ran, Chrome, 1280×800.

### F08-AC-019a Reading type

Test name: `reading text is 17px at 1.7 line height`

Given a page in viewing, when the reading text is measured, then its font size is 17px and its computed line height is 28.9px.

Checked: ran, Chrome, 1280×800 and 390×844.

### F08-AC-020a Reading measure

Test name: `reading column is capped at 760px`

Given a 1280px viewport in viewing, when the reading column is measured, then its width is 760px, its side padding is 32px, and the text width is 696px. A 66ch measure of the same 17px font is 744px, so the 760px cap is the limit that binds.

Checked: ran, Chrome, 1280×800. This is the disagreement with the 66-character figure in PLAN section 2.2.

### F08-AC-020b Narrow reading padding

Test name: `390px page uses 16px side padding`

Given a 390px viewport, when the reading column is measured, then it is 390px wide with 16px padding on each side.

Checked: ran, Chrome, 390×844.

### F08-AC-021a Phone reading and edit

Test name: `390px page scrolls vertically and can edit`

Given `/guide/docs/layout` at 390×844, when the owner turns editing on, then the document scrolls no wider than 390px, the heading is "Layout", and the status line says "Editing" and "282 words".

Checked: ran, Chrome, 390×844, opened with `?edit=1`.

### F08-AC-022a Outline headings

Test name: `outline lists the page headings`

Given `docs/layout.md` in viewing, when the outline renders, then its rows are "Layout", "Files", "Page", and "Outline".

Checked: ran, Chrome, 1280×800.

### F08-AC-023a Outline with no headings

Test name: `outline says no headings`

Given a page whose body has no headings, when the outline is open, then it shows "No headings".

Checked: manual. The pages opened in the browser all have headings. The empty copy is the outline component's only empty message.

### F08-AC-024a Active heading

Test name: `outline marks the top heading`

Given `docs/layout.md` scrolled to the top, when the outline renders, then "Layout" is the active row.

Checked: ran, Chrome, 1280×800.

### F08-AC-025a Outline jump

Test name: `outline row scrolls to the heading`

Given the outline is open, when the owner chooses "Outline", then the heading element `outline` is in the page.

Checked: ran, Chrome, 1280×800. The heading's top was 726px in an 800px viewport, below the title row, so the jump landed inside the page. Smooth versus reduced motion was not switched.

### F08-AC-026a Outline hidden in source and on a phone

Test name: `source mode and phone width hide the outline`

Given the outline choice is open, when the mode is Markdown source at 1280px, then the outline is absent. When the viewport is 390px and the mode is viewing, the outline element is not shown.

Checked: ran, both cases, Chrome.

### F08-AC-027a Outline indent

Test name: `outline indents nested headings`

Given `docs/layout.md`, when the outline rows are measured, then "Layout" is padded 8px and "Files", "Page", and "Outline" are padded 20px.

Checked: ran, Chrome, 1280×800.

### F08-AC-028a Missing page

Test name: `missing page offers to create it`

Given the guide project, when the owner opens `/guide/docs/does-not-exist`, then the screen shows `docs/does-not-exist.md`, "“Does not exist” has no page yet", "Links can point to pages you haven’t written. Create it now and start writing, or open another page.", "Create this page", and "Open About this space".

Checked: ran, Chrome.

### F08-AC-029a Empty project

Test name: `empty project offers the first page`

Given a project with no pages, when the owner opens it, then the screen shows "{name} has no pages yet", "Write the first page, or drop Markdown files on the sidebar to bring them in.", "Write the first page", and "All projects".

Checked: manual. The guide project has pages, so this screen was not opened. The copy is the empty-project component.

### F08-AC-030a Unknown project

Test name: `unknown project sends the owner to the project list`

Given a project slug this browser does not know, when the owner opens `/not-a-project`, then the screen shows "This project isn’t in this browser", "Projects you create or open from a folder live in the browser that made them. Pick a project from the list, or open the folder again.", and "All projects".

Checked: ran, Chrome.

### F08-AC-031a Blank while the page list loads

Test name: `missing route is blank before hydration`

Given a route with no page, while the page list has not hydrated, the page stage is empty and has no message.

Checked: manual. Hydration finished before a snapshot was taken.

### F08-AC-032a Linked from

Test name: `backlinks sit under the page`

Given another page links to the open page, when the owner views it, then "Linked from" lists that page at the end of the reading column.

Checked: manual. No page with a backlink was opened in the browser. The reading stage renders that list when the link index is non-empty.

### F08-AC-033a Disk change banner

Test name: `disk change shows a load control`

Given a synced page whose disk copy changed, when the owner is on that page, then the banner reads "This page changed on disk." and offers "Load disk version".

Checked: manual. The guide project is not disk-synced, so the banner did not appear.

### F08-AC-034a Document title

Test name: `document title joins page and project`

Given `docs/layout.md` in the guide project, when it is open, then the document title is "Layout · markdown-kb guide".

Checked: ran, Chrome, 1280×800.

### F08-AC-036a Outline card

Test name: `F08-AC-036a outline is a card in a page-colored column`

Given a page with headings at 1280px, when the shell renders, then the outline column's background is the page color and the outline card is 208px wide with a 16px radius.

### F08-AC-037a Account row

Test name: `F08-AC-037a file column foot is one settings row`

Given the file column is shown, when its foot renders, then it holds one row labeled "Settings" with a gear icon, choosing it opens Settings, and Trash is an item in the Pages menu.

### F08-AC-038a Title row order

Test name: `F08-AC-038a page actions sit beside the file name`

Given a page is open, when the title row renders, then the page actions control is the next control after the file name, and Edit and Share are at the right end in that order.

### F08-AC-039a Outline rows

Test name: `F08-AC-039a outline lists the title and each h2 with a chevron slot`

Given a page titled "Plan" with H2s "Sources" and "Phases", when the outline renders, then it shows "Outline", "Plan", "Sources", and "Phases", and each H2 row has a 24px chevron slot.

### F08-AC-040a Collapsible sections

Test name: `F08-AC-040a an h2 chevron shows and hides its h3 rows`

Given an H2 with two H3s, when the owner chooses its chevron, then the two H3 rows appear indented by 12px, and choosing it again hides them.

### F08-AC-041a Project name

Test name: `F08-AC-041a project name has a chevron and no tile`

Given a project is open, when the file column renders, then the project name is shown with an up-down chevron, choosing it opens the project switcher, and no letter tile is drawn.

## Edge cases and errors

These screens do not use a validation error code. The message is the screen copy, and there is no separate hint.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Page path is not in the project | none shown | "“{Title}” has no page yet" plus "Links can point to pages you haven’t written. Create it now and start writing, or open another page." | none shown |
| Project has no pages | none shown | "{name} has no pages yet" plus "Write the first page, or drop Markdown files on the sidebar to bring them in." | none shown |
| Project is unknown in this browser | none shown | "This project isn’t in this browser" plus "Projects you create or open from a folder live in the browser that made them. Pick a project from the list, or open the folder again." | none shown |
| Page list still loading on a missing route | none shown | no message | none shown |
| Disk copy changed | none shown | "This page changed on disk." | the control "Load disk version" |
| `edit` is neither `1` nor `0` | none shown | the parameter is ignored and then left in the address | none |

`/docs` and `/ledger` are redirects, not error pages. A route the app router does not know shows "This page is not in the knowledge base." and "Back to all projects". That screen was not opened in the browser check.

## Limits and budgets

Measured in headless Chrome on the local dev server, 25 Sep 2026, unless noted as a stylesheet value.

| Item | Value | Where |
| --- | --- | --- |
| Shell height | 100dvh, measured 800px at an 800px viewport | desktop check |
| File column | 248px | viewport wider than 860px |
| Outline | 220px | viewport wider than 860px, outline open |
| Title row | 44px plus the top safe-area inset | stylesheet; measured 44px with a 0px inset |
| Status line | 28px plus the bottom safe-area inset | stylesheet; measured 28px with a 0px inset |
| Reading font | 17px | desktop and 390px checks |
| Reading line height | 1.7, computed 28.9px | desktop and 390px checks |
| Reading column cap | 760px, and also 66ch + 64px | 760px bound at 1280px; 66ch measured 744px |
| Text width at 1280px | 696px | 760px column minus 32px padding on each side |
| Phone drawer | min(280px, 88vw), measured 280px at 390px | 390px check |
| Off-screen drawer shift | 105% of the drawer width | stylesheet |
| Narrow shell | viewport 860px and below | stylesheet; behavior checked at 390px, not at 860px versus 861px |
| Side padding | 32px, 20px, or 16px | 32px at 1280px; 16px at 390px; 20px not separately measured |
| No latency budget | the shell has no timed budget for first paint | not measured |

## UI states

Copy is the same at desktop and at 390px. Layout differs as F08-REQ-010, F08-REQ-011, and F08-REQ-021.

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success, page open | Three columns when the outline is open. Title row `docs / layout.md`. Status "Repository copy", "{n} words", "Viewing". Outline lists headings. | File column and outline hidden. Same title, page, and status. Edit and Share stay in the title row. No horizontal scroll. |
| Empty, project with no pages | "{name} has no pages yet". "Write the first page, or drop Markdown files on the sidebar to bring them in." Actions "Write the first page" and "All projects". | Same copy. The file column is a drawer. |
| Empty, page with no headings | Outline shows "No headings". The page body still renders. | Outline is hidden, so this copy is not on screen. |
| Loading | A missing route shows a blank page stage until the page list hydrates. A known page renders its Markdown with the document. | Same. |
| Error, missing page | Path as the kicker. "“{Title}” has no page yet". "Links can point to pages you haven’t written. Create it now and start writing, or open another page." "Create this page" and, when another page exists, "Open {title}". | Same copy. Checked at the default viewport after the 390px checks, not re-shot at 390px. |
| Error, unknown project | "This project isn’t in this browser". "Projects you create or open from a folder live in the browser that made them. Pick a project from the list, or open the folder again." "All projects". | Same copy. Not re-shot at 390px. |
| Partial, disk change | Banner "This page changed on disk." and "Load disk version" above the page. | Same banner in the page column. |

## Out of scope

- Editing, the block editor, and saving a version, except that Edit stays available and Markdown source hides the outline (F09, F20).
- Settings contents and theme (F10).
- The share sheet and the `edit` parameter's meaning (F11). The shell only applies `edit=1` and `edit=0`.
- Search results (F17).
- Shortcut chords (F20).
- Token values beyond the column sizes and reading measure named here (F21).
- Trash, rename, move, import, and version history.
- Space home, Inbox, Timeline, Metrics, and proposals (PRD "Screens").

## Open questions

- F08-Q-001 Owner. Should page URLs drop the project segment and become `/docs/…`, as PLAN section 2.2 says? This spec blocks that change: the requirement is `/{project}/{page-path}`. Recommended answer: keep the project segment, and record an ADR that supersedes the `/docs/…` row.
- F08-Q-002 Owner. Should the 760px cap be removed so the line can reach 66ch? This spec blocks that change until an ADR says so. Recommended answer: remove the 760px cap if the 66-character measure is the one that should win.

## Trace

- PRD "UI and screens", "Document view", "Empty states". The right panel in "Document view" is properties, backlinks, and history. Change request C7 replaces that with the outline column. "Linked from" stays at the end of the page.
- PRD "Non-goals" says the web app is read-mostly on phones. Change request C4 replaces that for this shell: the page is readable and editing works.
- Change requests C3 (file column hides and returns from the top-left icon), C4 (readability, 17px, 1.7, phones), C7 (three full-height columns, title row and status line share the page surface).
- Decision D3 (no sign-in) and D6 (the product name markdown-kb). D6 does not state the `/docs/…` route; that route is PLAN section 2.2's reading of D6, and the app disagrees.
- No ADR is written yet.
