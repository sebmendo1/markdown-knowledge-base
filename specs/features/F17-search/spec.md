# F17 Search

## Summary

Search opens a dialog on the current project and filters its pages by a plain substring of the title, path, and page text. It is the ⌘K palette that shipped, not the PRD command palette.

## Status and scope

Partly built. This spec covers opening search, the query, the result list, keyboard movement inside the list, and the empty result.

Not started, and not required here: a command list, filter tokens (`type:`, `status:`, `harness:`, `verdict:`, `after:`), ranking by title match then recency, type icons, match highlighting, and the PRD latency budget for 10,000 documents.

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual. The guide project in that check had 5 pages.

## Users and stories

No sign-in exists (decision D3). Anyone who can open a project may search the pages loaded for that project. There is no other role and no refusal. Search does not look across projects.

- F17-ST-001 As the owner, I want to open search from the keyboard or the file column, so that I can jump to a page without scrolling the list.
- F17-ST-002 As the owner, I want a match on the title, the path, or the body, so that I can find a page by a phrase I remember.
- F17-ST-003 As the owner, I want a plain query, so that words I type are not silently treated as a filter language.

## Requirements

- F17-REQ-001 When the owner activates Search, or presses Command-K or Control-K, the system shall open a dialog labeled "Search pages" and close shortcut help if it is open.
- F17-REQ-002 When the dialog opens, the system shall focus a field whose label is "Search query" and whose placeholder is "Search pages".
- F17-REQ-003 While the query is empty or only whitespace, the system shall list every page in the current project in project order: folder rank, then title.
- F17-REQ-004 When the query has text, the system shall keep each page whose title, path, or full text contains that query, compared in lower case, and shall treat filter-shaped text as letters to match.
- F17-REQ-005 The system shall keep project order in the results and shall not reorder by a title match or by recency.
- F17-REQ-006 The system shall show each result's title and path, and, when the query is non-empty, a snippet of the page text from 28 characters before the match through 48 characters after it, with whitespace collapsed to single spaces and with no highlight mark.
- F17-REQ-007 When the owner presses ArrowDown or ArrowUp, the system shall move the active result one row and shall not move past either end of the list.
- F17-REQ-008 When the owner presses Enter on a result, or activates a result, the system shall open that page, close the dialog, and close the phone file drawer.
- F17-REQ-009 If no page matches, then the system shall show "No matching pages" and no results.
- F17-REQ-010 When the owner presses Escape or the overlay, the system shall close the dialog.
- F17-REQ-011 The system shall size the dialog up to 520px wide, inset 32px from the viewport width, and shall limit the result list to 340px tall.
- F17-REQ-012 The system shall run the filter on the pages already loaded in the browser, with no separate loading step and no request to a search service.

## Acceptance scenarios

### F17-AC-001a Open from Search

Test name: `search button opens the page dialog`

Given a project page is open, when the owner activates Search, then a dialog labeled "Search pages" is visible.

Checked: ran, Chrome, 1280×800.

### F17-AC-001b Open from Control-K

Test name: `control k opens search`

Given the dialog is closed, when the owner presses Control-K, then the dialog opens.

Checked: ran, Chrome, 1280×800. Command-K was also pressed at 390px and opened the dialog. Closing shortcut help at the same time was not set up.

### F17-AC-002a Query field

Test name: `search field is labeled and focused`

Given the dialog just opened, when the owner types, then the field accepts the text. Its placeholder is "Search pages".

Checked: ran, Chrome, 1280×800, by typing `outline`. Focus was not asserted with a separate focus query.

### F17-AC-003a Empty query lists the project

Test name: `empty search lists every page in project order`

Given the guide project, when Search is open and the query is empty, then 5 pages are listed and the first is "About this space".

Checked: ran, Chrome, 1280×800. At 390px the list order was About this space, Layout, Organizing pages, Shortcuts, Writing in markdown-kb.

### F17-AC-004a Substring match

Test name: `search matches title path and body text`

Given the guide project, when the owner searches for `outline`, then Layout, Shortcuts, and Writing in markdown-kb are listed.

Checked: ran, Chrome, 1280×800.

### F17-AC-004b Filter text is literal

Test name: `type colon experiment is not a filter`

Given the guide project has no page containing the letters `type:experiment`, when the owner searches for `type:experiment`, then the dialog shows "No matching pages".

Checked: ran, Chrome, 1280×800.

### F17-AC-005a Order stays the project order

Test name: `results stay in project order`

Given an empty query, when the list renders, then it follows folder rank and then title, with the ledger page before the docs pages.

Checked: ran, Chrome, 390×844, full list order as in F17-AC-003a. No recency reorder was observed.

### F17-AC-006a Snippet

Test name: `a query shows a plain snippet`

Given the query `outline`, when Layout is listed, then a snippet under the path includes surrounding page text and is not a highlighted mark.

Checked: ran, Chrome, 1280×800. The Layout snippet began mid-word, "r sixty-six characters. ## Outline…", which is the raw slice. The 28-character and 48-character bounds were not measured on that string.

### F17-AC-007a Arrow keys

Test name: `arrow down moves the active result`

Given the empty guide list, when the owner presses ArrowDown twice, then "Organizing pages" is the active result.

Checked: ran, Chrome, 1280×800. ArrowUp and the end stops were not pressed.

### F17-AC-008a Enter opens the page

Test name: `enter opens the active page`

Given "Organizing pages" is active, when the owner presses Enter, then the dialog closes and the address is `/guide/docs/organizing`.

Checked: ran, Chrome, 1280×800. Closing the phone drawer on open was not combined with this navigation.

### F17-AC-009a No matches

Test name: `unknown query says no matching pages`

Given the query `type:experiment`, when nothing matches, then the message is "No matching pages".

Checked: ran, Chrome, 1280×800.

### F17-AC-010a Escape closes search

Test name: `escape closes search`

Given the dialog is open, when the owner presses Escape, then it is gone.

Checked: ran, Chrome, 1280×800. The overlay was not pressed.

### F17-AC-011a Dialog width

Test name: `search dialog fits the viewport`

Given Search is open at 390px, when the dialog is measured, then it is 358px wide.

Checked: ran, Chrome, 390×844. The 520px cap and the 340px list cap were not measured at 1280px.

### F17-AC-012a Local filter

Test name: `search filters pages already on the page`

Given the dialog is open, when the owner types, then results change without a loading message.

Checked: ran, Chrome, 1280×800. No network search request was asserted.

## Edge cases and errors

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| No page contains the query | none shown | "No matching pages" | none shown |
| Query is empty or whitespace | none shown | the full project list, no error | none |
| Filter token such as `type:experiment` | none shown | matched as plain text, or "No matching pages" when the letters are absent | none shown |
| Project has no pages | none shown | "No matching pages" once a query is typed; an empty query lists nothing | none shown |

There is no error code, no hint, and no retry. A failed search service cannot occur, because no search service is called.

## Limits and budgets

| Item | Value | Where |
| --- | --- | --- |
| Dialog width | min(520px, viewport width minus 32px) | measured 358px at 390px |
| List height | 340px maximum | stylesheet; not measured |
| Query field type | 16px | stylesheet |
| Snippet window | 28 characters before the match, 48 characters after | stylesheet of the snippet function; not measured on a result |
| Result cap | no cap; every loaded page may be listed | 5 of 5 shown for the guide project |
| Scope | the open project only | checked on guide |
| PRD budget | under 100 ms for a space of 10,000 documents | not started and not measured |
| Checked set | 5 pages, local dev server, headless Chrome | results appeared in the same turn as typing; no percentile was recorded |

## UI states

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success, empty query | Dialog labeled "Search pages". Placeholder "Search pages". Every page, title and path. | Same copy. Dialog 358px wide at 390px. The guide list showed all 5 pages. |
| Success, matches | Title, path, and a plain snippet for each match. The active row is filled. | Same copy. Not retyped at 390px. |
| Empty, no match | "No matching pages" | Same copy. Not retyped at 390px. |
| Empty, project with no pages | No rows. With a query, "No matching pages". | Same. Not opened. |
| Loading | No loading sentence and no skeleton. The list is the current filter. | Same. |
| Error | No error sentence. A query that matches nothing uses the empty copy. | Same. |

## Out of scope

- Commands in the palette, including "new document" and "go to" (PRD "Search").
- Filter grammar: `type:`, `status:`, `harness:`, `verdict:`, `after:`.
- Ranking by title match, then recency.
- Type icons and highlighted match marks inside the snippet.
- Full-text search on the server, `pg_trgm`, and the 10,000-document budget.
- Search across projects, proposals, or history.
- The shortcut chord's place in the shortcut list (F20). This spec requires what the dialog does when it opens.

## Open questions

- F17-Q-001 Owner. When the filter grammar is built, do the tokens replace this substring filter or sit on top of it? Recommended answer: a query with no token stays the substring filter in this spec; tokens are an added mode. Blocks the rest of F17.
- F17-Q-002 Owner. What is the rank when a title match and a body match both exist? The PRD "Search" section says title match, then recency. Recommended answer: keep that order when ranking is built. The built list does not rank.

## Trace

- PRD "Search" under "Search, import and export": one palette for documents, commands, and filters; full-text over title, body, and frontmatter; rank by title match, then recency; the filter examples; type icon, title, path, and a highlighted snippet; under 100 ms for 10,000 documents.
- PRD "Keyboard shortcuts": ⌘K is "Search and commands". The built dialog searches pages only.
- Change request C8 does not define search. The palette is part of the shell that shipped with the reading work.
- Decision D3: no sign-in, so search is not limited by role.
- No ADR is written yet.
