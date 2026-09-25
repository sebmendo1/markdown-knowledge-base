# F17 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Shipped steps are the page search in the tree. Not-started steps are the Ledger palette. They are not in the tree. Until they ship, Command-K still opens the dialog labeled "Search pages", and a shipped search test is not proof of the palette.

## Shipped

### F17-T-001 Open page search and close it

- Requirements: F17-REQ-001, F17-REQ-002, F17-REQ-010
- Test: `search button opens the page dialog` (F17-AC-001a). `control k opens search` (F17-AC-001b). `search field is labeled and focused` (F17-AC-002a). `escape closes search` (F17-AC-010a).
- Size: several modules
- Depends on: none
- Modules: `components/page-search.tsx` and the Command-K handler in `components/use-editor-keys.ts`. The dialog is labeled "Search pages". Opening it closes shortcut help. The field is labeled "Search query", placeholder "Search pages", and it is focused. Escape or the overlay closes the dialog.

### F17-T-002 Filter the loaded pages in project order

- Requirements: F17-REQ-003, F17-REQ-004, F17-REQ-005, F17-REQ-012
- Test: `empty search lists every page in project order` (F17-AC-003a). `search matches title path and body text` (F17-AC-004a). `type colon experiment is not a filter` (F17-AC-004b). `results stay in project order` (F17-AC-005a). `search filters pages already on the page` (F17-AC-012a).
- Size: one module
- Depends on: F17-T-001
- Module: the filter in `components/page-search.tsx`. An empty or whitespace query lists every page, folder rank then title. Text keeps a page whose title, path, or full text contains the query in lower case. `type:` is letters. The list is not reordered. There is no loading step and no search request.

### F17-T-003 Show a plain snippet

- Requirements: F17-REQ-006
- Test: `a query shows a plain snippet` (F17-AC-006a).
- Size: one module
- Depends on: F17-T-002
- Module: `snippet` in `components/draft-store.ts`. The slice is 28 characters before the match through 48 after it, whitespace collapsed to single spaces, with no highlight mark. An empty query shows no snippet.

### F17-T-004 Move and open a result

- Requirements: F17-REQ-007, F17-REQ-008, F17-REQ-009
- Test: `arrow down moves the active result` (F17-AC-007a). `enter opens the active page` (F17-AC-008a). `unknown query says no matching pages` (F17-AC-009a).
- Size: one module
- Depends on: F17-T-002
- Module: `components/page-search.tsx`. ArrowDown and ArrowUp stop at the ends. Enter or a click opens the page, closes the dialog, and closes the phone file drawer. No match shows "No matching pages" and no results.

### F17-T-005 Size the dialog

- Requirements: F17-REQ-011
- Test: `search dialog fits the viewport` (F17-AC-011a).
- Size: one module
- Depends on: F17-T-001
- Module: the palette rules in `app/globals.css`. Width is at most 520px, inset 32px from the viewport. The result list is at most 340px tall. Those sizes are the search row in [`specs/contracts/tokens.md`](../../contracts/tokens.md).

## Not started

The palette is a new surface. Shipping it is what makes Command-K open "Search" instead of "Search pages". Do not describe the shipped dialog as already doing these steps.

### F17-T-006 Index documents for full-text search

- Requirements: F17-REQ-021
- Test: `palette answers within 100 milliseconds` (F17-AC-021a).
- Size: a schema change
- Depends on: documents stored for the space (F07)
- Schema: Postgres full-text search plus `pg_trgm` on the space's documents. No embeddings and no search service besides that database. The budget is under 100 ms, p100, from the keystroke until the result list is shown, for every query against 10,000 documents, including terms and the five filters. The shipped filter in F17-T-002 does not use this index.

### F17-T-007 Parse terms and the five filters

- Requirements: F17-REQ-017, F17-REQ-018
- Test: `a term matches title body or frontmatter` (F17-AC-017a). `type status harness verdict and after filter together` (F17-AC-018a).
- Size: one module
- Depends on: F17-T-006
- Module: a query parser. Terms are the query split on whitespace, lowercased, empty pieces dropped, filter tokens removed. A document stays when every term is a case-insensitive substring of the title, the body, or a frontmatter scalar. `type:`, `status:`, `harness:`, `verdict:`, and `after:` are filters. The prefix match is case-insensitive. `harness:` with `slug@` plus an integer keeps that version. A `harness:` value with `@` and no integer is a term. `after:` keeps a `date` on or after `YYYY-MM-DD` and drops a document with no `date`. An `after:` value that is not that shape is a term. Any other prefix is a term. Filters and terms combine with AND. On the shipped dialog, `type:experiment` stays letters (F17-T-002).

### F17-T-008 Rank title matches, then recency

- Requirements: F17-REQ-019, F17-REQ-023
- Test: `title matches rank before recency` (F17-AC-019a). `empty palette lists commands then recent documents` (F17-AC-023a).
- Size: one module
- Depends on: F17-T-007
- Module: the rank function. Score is 1 when every term is a case-insensitive substring of the title, and 0 otherwise. Filter tokens are not part of the score. Order is title match first, then `updated_at` descending, then slug ascending. An empty or whitespace query lists documents by `updated_at` descending, then slug ascending, after the four commands. The shipped list stays in project order (F17-T-002).

### F17-T-009 Open one palette for commands and documents

- Requirements: F17-REQ-013, F17-REQ-014, F17-REQ-015, F17-REQ-016, F17-REQ-020, F17-REQ-022, F17-REQ-024, F17-REQ-025, F17-REQ-026
- Test: `command k opens the search palette` (F17-AC-013a). `palette field is labeled search query` (F17-AC-014a). `palette lists four commands` (F17-AC-015a). `go to inbox leaves the palette` (F17-AC-016a). `a document row shows a type icon and a highlighted snippet` (F17-AC-020a). `palette says no matches` (F17-AC-022a). `arrows move and enter opens a document` (F17-AC-024a). `palette dialog uses the search dialog size` (F17-AC-025a). `escape closes the palette` (F17-AC-026a).
- Size: several modules
- Depends on: F17-T-008
- Modules: the palette dialog. It is labeled "Search". The field is labeled "Search query", placeholder "Search". Opening it closes shortcut help. Commands, in order under "Commands", are New document, Go to Inbox, Go to Timeline, and Go to Metrics. An empty query shows all four. Terms keep a command only when every term is a case-insensitive substring of its name. A filters-only query lists no commands. New document starts a document. The other three open that screen. Each closes the dialog and the phone drawer. Document rows sit under "Documents" and show a type icon, the title, the path, and, when the query has terms, a highlighted snippet of 28 characters before the match through 48 after it. No command and no document shows "No matches". Arrows stop at the ends. Enter opens the document and closes the dialog and the phone drawer. The dialog is at most 520px wide, inset 32px, with a list at most 340px tall. Escape or the overlay closes it. The shipped dialog labeled "Search pages" remains until this surface is the one Command-K opens.
