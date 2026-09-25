# F17 Search

## Summary

Search opens a dialog on the current project and filters its pages by a plain substring of the title, path, and page text. It is the ⌘K page search that shipped. The Ledger palette specified after those requirements is one place for documents, commands, and filters, with full-text over title, body, and frontmatter, ranked by title match then recency, in under 100 ms for a space of 10,000 documents.

## Status and scope

Partly built. This spec covers opening search, the query, the result list, keyboard movement inside the list, and the empty result.

F17-REQ-001 through F17-REQ-012 are the page search that shipped. Their text stays. Command-K on that build opens the dialog labeled "Search pages". A query there is a substring, `type:` is letters, and the list stays in project order.

F17-REQ-013 through F17-REQ-026 are the PRD search palette. They apply where that palette is the search surface. They do not change F17-REQ-001 through F17-REQ-012. Until the palette ships, the page search remains what Command-K opens.

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual. The guide project in that check had 5 pages.

## Users and stories

No sign-in exists (decision D3). Anyone who can open a project may search the pages loaded for that project. There is no other role and no refusal. Search does not look across projects.

- F17-ST-001 As the owner, I want to open search from the keyboard or the file column, so that I can jump to a page without scrolling the list.
- F17-ST-002 As the owner, I want a match on the title, the path, or the body, so that I can find a page by a phrase I remember.
- F17-ST-003 As the owner, I want a plain query, so that words I type are not silently treated as a filter language.
- F17-ST-004 As the owner, I want one palette for documents, commands, and filters, so that I can jump, run a command, or narrow the list from the same place.
- F17-ST-005 As the owner, I want a title match ahead of a body match, and a result within 100 ms, so that a large space still feels immediate.

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
- F17-REQ-013 Where the Ledger search palette is the search surface, when the owner activates Search, or presses Command-K or Control-K, the system shall open one dialog labeled "Search" for documents, commands, and inline filters, and shall close shortcut help if it is open.
- F17-REQ-014 When that dialog opens, the system shall focus a field whose label is "Search query" and whose placeholder is "Search".
- F17-REQ-015 The palette's command set shall be New document, Go to Inbox, Go to Timeline, and Go to Metrics, shown in that order under the heading "Commands". When the query is empty or only whitespace, the system shall show all four. When the query has terms, the system shall keep a command only if every term is a case-insensitive substring of its name. When the query is only filters, the system shall list no commands.
- F17-REQ-016 When the owner activates New document, the system shall start a new document, close the dialog, and close the phone file drawer. When the owner activates Go to Inbox, Go to Timeline, or Go to Metrics, the system shall open that screen, close the dialog, and close the phone file drawer.
- F17-REQ-017 When the query has terms, the system shall keep each document in the open project in which every term is a case-insensitive substring of the title, the body, or a frontmatter scalar. Terms are the query split on whitespace, lowercased, with empty pieces dropped and with filter tokens removed.
- F17-REQ-018 When the query contains `type:`, `status:`, `harness:`, `verdict:`, or `after:`, the system shall treat that token as a filter and not as a term. The prefix match is case-insensitive. `type:` keeps documents whose type equals the value. `status:` keeps documents whose status equals the value. `harness:` keeps documents whose harness link has that slug, and, when the value is `slug@` plus an integer, that version. A `harness:` value with `@` and no integer is a term. `verdict:` keeps documents whose verdict equals the value. `after:` keeps documents whose frontmatter `date` is on or after that `YYYY-MM-DD` value, and drops a document that has no `date`. Value comparison is case-insensitive. Filters and terms combine with AND. A token whose prefix is not one of those five is a term. An `after:` value that is not `YYYY-MM-DD` is a term.
- F17-REQ-019 The system shall order document hits with title matches first, then `updated_at` descending, then slug ascending. A title match means every term is a case-insensitive substring of the title. The ordering score is 1 for a title match and 0 otherwise. Filter tokens are not part of the score. Commands stay in the command group and are not scored.
- F17-REQ-020 The system shall show document hits under the heading "Documents". Each row shall show a type icon for the document's type, the title, and the path. When the query has terms, the row shall also show a snippet of the matched text from 28 characters before the match through 48 characters after it, with whitespace collapsed to single spaces, and with the matched substring highlighted.
- F17-REQ-021 The system shall return palette results in under 100 ms for every query against a space of 10,000 documents. That maximum is p100. The clock starts at the keystroke and stops when the result list is shown. The query may include terms and the five filters. Search shall use Postgres full-text search plus `pg_trgm`, with no embeddings and no search service besides that database.
- F17-REQ-022 If no command and no document matches, then the system shall show "No matches" and no results.
- F17-REQ-023 While the palette query is empty or only whitespace, the system shall list the four commands in F17-REQ-015, then every document in the open project by `updated_at` descending, then slug ascending.
- F17-REQ-024 When the owner presses ArrowDown or ArrowUp in the palette, the system shall move the active row by one and shall not move past either end. When the owner presses Enter on a document, or activates it, the system shall open that document, close the dialog, and close the phone file drawer.
- F17-REQ-025 The system shall size the palette dialog up to 520px wide, inset 32px from the viewport width, and shall limit the result list to 340px tall. The palette is a dialog.
- F17-REQ-026 When the owner presses Escape or the overlay, the system shall close the palette.

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

### F17-AC-013a One palette

Test name: `command k opens the search palette`

Given the Ledger palette is the search surface and shortcut help is open, when the owner presses Command-K, then a dialog labeled "Search" is visible, shortcut help is closed, and the dialog is the place for documents, commands, and filters.

Checked: not run. The shipped dialog is F17-AC-001b, labeled "Search pages".

### F17-AC-014a Palette field

Test name: `palette field is labeled search query`

Given the palette just opened, when the owner types, then the focused field's label is "Search query" and its placeholder is "Search".

Checked: not run.

### F17-AC-015a Commands in the palette

Test name: `palette lists four commands`

Given the palette query is `inbox`, when the command group renders, then it is headed "Commands" and the only command is "Go to Inbox". Given the query is `type:experiment` and nothing else, when the command group renders, then no command is listed.

Checked: not run.

### F17-AC-016a A command runs

Test name: `go to inbox leaves the palette`

Given "Go to Inbox" is active, when the owner presses Enter, then the inbox screen is open, the dialog is closed, and the phone file drawer is closed.

Checked: not run.

### F17-AC-017a Full text covers title, body, and frontmatter

Test name: `a term matches title body or frontmatter`

Given a document whose title and body do not contain `refuted` and whose frontmatter verdict is `refuted`, when the owner searches for `refuted`, then that document is listed.

Checked: not run. On the shipped dialog, F17-REQ-004 matches title, path, and full text as one string.

### F17-AC-018a Inline filters

Test name: `type status harness verdict and after filter together`

Given the query `type:experiment status:concluded harness:memento-journal@7 verdict:refuted after:2026-09-01`, when the palette lists documents, then each row is an experiment, concluded, linked to harness `memento-journal` at version 7, with verdict refuted, and with `date` on or after 2026-09-01. A document missing `date` is absent. The tokens are not required to appear as letters in the body.

Checked: not run. On the shipped dialog, `type:experiment` is letters (F17-AC-004b).

### F17-AC-019a Title match ranks first

Test name: `title matches rank before recency`

Given one document titled "Outline" updated yesterday and one document whose body contains "outline" updated today, when the owner searches for `outline`, then "Outline" is first. Given two title matches, when they are ordered, then the later `updated_at` comes first, and equal times break by slug ascending. The title match scores 1 and the body match scores 0.

Checked: not run. The shipped list stays in project order (F17-AC-005a).

### F17-AC-020a Icon, path, and a highlighted snippet

Test name: `a document row shows a type icon and a highlighted snippet`

Given a matching experiment, when its row renders, then the row shows an experiment icon, the title, the path, and a snippet with the matched substring highlighted. The snippet runs from 28 characters before the match through 48 characters after it.

Checked: not run. The shipped snippet has no highlight mark (F17-AC-006a).

### F17-AC-021a Under 100 ms at 10,000 documents

Test name: `palette answers within 100 milliseconds`

Given a space of 10,000 documents, when the owner types a query that includes terms and `type:`, then every such query shows its list in under 100 ms, measured from the keystroke to the list. The search uses Postgres full-text search and `pg_trgm`, and it does not call an embedding service.

Checked: not run. The shipped check used 5 pages in the browser and recorded no percentile.

### F17-AC-022a Nothing matches

Test name: `palette says no matches`

Given the query `type:experiment status:no-such`, when nothing matches, then the message is "No matches".

Checked: not run. The shipped empty copy is "No matching pages" (F17-AC-009a).

### F17-AC-023a Empty palette query

Test name: `empty palette lists commands then recent documents`

Given the palette query is empty, when the list renders, then the four commands come first, in the order New document, Go to Inbox, Go to Timeline, Go to Metrics, and documents follow by `updated_at` descending, then slug ascending.

Checked: not run. The shipped empty query lists pages in project order (F17-AC-003a).

### F17-AC-024a Arrows and Enter

Test name: `arrows move and enter opens a document`

Given the palette list has more than one row, when the owner presses ArrowDown, then the active row moves down one and does not wrap past the end. When Enter is pressed on a document, then that document opens and the dialog closes.

Checked: not run.

### F17-AC-025a Palette dialog size

Test name: `palette dialog uses the search dialog size`

Given the palette is open at a viewport wider than 520px plus the 32px inset, when the dialog is measured, then it is 520px wide and the result list is at most 340px tall.

Checked: not run. The shipped dialog at 390px is 358px (F17-AC-011a).

### F17-AC-026a Escape closes the palette

Test name: `escape closes the palette`

Given the palette is open, when the owner presses Escape, then it is gone.

Checked: not run.

## Edge cases and errors

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| No page contains the query | none shown | "No matching pages" | none shown |
| Query is empty or whitespace | none shown | the full project list, no error | none |
| Filter token such as `type:experiment` | none shown | matched as plain text, or "No matching pages" when the letters are absent | none shown |
| Project has no pages | none shown | "No matching pages" once a query is typed; an empty query lists nothing | none shown |

There is no error code, no hint, and no retry on the shipped page search. A failed search service cannot occur there, because no search service is called.

The palette adds the rows below. The shipped rows above stay the page-search behavior, including `type:experiment` matched as letters.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Palette query matches nothing | none shown | "No matches" | none shown |
| `after:` value is not `YYYY-MM-DD` | none shown | the token is a term, not a filter | none |
| Token prefix is not `type`, `status`, `harness`, `verdict`, or `after` | none shown | the token is a term | none |
| Document has no `date` and the query includes a valid `after:` | none shown | that document is absent | none |
| Palette query fails | `search_failed` | "Search didn't answer. Try again." | "Check the connection, then type the query again." |

## Limits and budgets

| Item | Value | Where |
| --- | --- | --- |
| Dialog width | min(520px, viewport width minus 32px) | measured 358px at 390px |
| List height | 340px maximum | stylesheet; not measured |
| Query field type | 16px | stylesheet |
| Snippet window | 28 characters before the match, 48 characters after | stylesheet of the snippet function; not measured on a result |
| Result cap | no cap; every loaded page may be listed | 5 of 5 shown for the guide project |
| Scope | the open project only | checked on guide |
| Shipped check | 5 pages, local dev server, headless Chrome | results appeared in the same turn as typing; no percentile was recorded |
| Palette budget | under 100 ms, maximum (p100), from keystroke to the list | a space of 10,000 documents; terms and the five filters allowed; Postgres full-text search plus `pg_trgm`; not measured |
| Palette snippet | 28 characters before the match, 48 after, match highlighted | F17-REQ-020; not measured |
| Palette order | title match, then `updated_at` descending, then slug ascending | ADR-0029; score 1 or 0 |

## UI states

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success, empty query | Dialog labeled "Search pages". Placeholder "Search pages". Every page, title and path. | Same copy. Dialog 358px wide at 390px. The guide list showed all 5 pages. |
| Success, matches | Title, path, and a plain snippet for each match. The active row is filled. | Same copy. Not retyped at 390px. |
| Empty, no match | "No matching pages" | Same copy. Not retyped at 390px. |
| Empty, project with no pages | No rows. With a query, "No matching pages". | Same. Not opened. |
| Loading | No loading sentence and no skeleton. The list is the current filter. | Same. |
| Error | No error sentence. A query that matches nothing uses the empty copy. | Same. |
| Palette, empty query | Dialog "Search". Commands, then documents by recency. | Same copy. Dialog width is the viewport minus 32px, so 358px at 390px. Not built. |
| Palette, matches | "Commands" and "Documents". Type icon, title, path, highlighted snippet. | Same copy. Not built. |
| Palette, filters | The five tokens narrow documents. They are typed in the same field. | Same. Not built. |
| Palette, no match | "No matches" | Same copy. Not built. |
| Palette, error | "Search didn't answer. Try again." | Same copy. Not built. |

## Out of scope

- Search across projects, proposals, or history.
- Review commands (Merge, Reject, Request changes). Those belong to review.
- What New document fills in (New documents). The palette only starts it.
- The Inbox, Timeline, and Metrics screens themselves. The palette only opens them.
- The shortcut chord's place in the shortcut list (F20). This spec requires what the dialog does when it opens.
- Embeddings, and any search service besides Postgres full-text search and `pg_trgm`.

## Open questions

- F17-Q-001 Answered. On the shipped dialog, a query stays the substring in F17-REQ-004, and `type:` is letters. On the palette, the five tokens in F17-REQ-018 are filters, and the other text stays terms.
- F17-Q-002 Answered. The shipped list does not rank (F17-REQ-005). The palette ranks a title match first, then `updated_at` descending, then slug ascending (F17-REQ-019, ADR-0029).

ADR-0029 is Proposed. This spec follows it. A different score would replace F17-REQ-019.

## Trace

- PRD Search, import and export, section Search: one palette for documents, commands, and filters (F17-REQ-013, F17-REQ-015); full-text over title, body, and frontmatter (F17-REQ-017); filters `type:`, `status:`, `harness:`, `verdict:`, and `after:` (F17-REQ-018); rank by title match, then recency (F17-REQ-019); type icon, title, path, and a highlighted snippet (F17-REQ-020); under 100 ms for 10,000 documents (F17-REQ-021).
- PRD Keyboard shortcuts: ⌘K is "Search and commands". The shipped dialog searches pages only (F17-REQ-001). The palette adds the commands (F17-REQ-015).
- PRD Stack, row Search: Postgres full-text search plus `pg_trgm` (F17-REQ-021).
- Change request C8 does not define search. The shipped dialog is part of the shell that shipped with the reading work.
- Decision D3: no sign-in, so search is not limited by role.
- Plan section 2.2, row "Modals": search is a dialog. ADR-0009.
- ADRs: ADR-0009, ADR-0029.
