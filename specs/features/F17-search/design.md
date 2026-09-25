# F17 design

Written against `spec.md` in this folder, from `origin/cursor/spec-rest-of-search-b39a`. That branch is not merged.

F17-REQ-001 through F17-REQ-012 are the page search in the tree. Command-K opens a dialog labeled "Search pages". A query is a substring, `type:` is letters, and the list stays in project order.

F17-REQ-013 through F17-REQ-026 are the Ledger palette. They are not in the tree. They do not change the page search. Until the palette is the search surface, Command-K still opens "Search pages".

## Shipped modules

| Module | Role |
| --- | --- |
| `components/page-search.tsx` | The dialog, the filter, and the keyboard inside the list |
| `components/draft-store.ts` | `snippet` |
| `components/use-editor-keys.ts` | Command-K opens search and closes shortcut help |
| `components/workspace.tsx` | Closes the dialog and the phone drawer when a page opens |
| `lib/workspace/tree.ts` | Project order of the page list the dialog filters |
| Palette styles in `app/globals.css` | Width and list height |

## Shipped data and state

```ts
type PageHit = { title: string; path: string; content: string };
```

The dialog is labeled "Search pages". The field is labeled "Search query" and its placeholder is "Search pages". It is focused when the dialog opens.

An empty query, or a query that is only whitespace, lists every page in the current project in project order: folder rank, then title. A query with text keeps each page whose title, path, or full text contains that query, compared in lower case. Filter-shaped text, including `type:`, is letters to match. Results stay in project order. They are not reordered by a title match or by recency.

When the query is non-empty, a row also shows a snippet of the page text from 28 characters before the match through 48 characters after it. Whitespace collapses to single spaces. There is no highlight mark. `snippet` in `draft-store.ts` is that slice.

ArrowDown and ArrowUp move the active result by one row and do not move past either end. Enter, or activating a result, opens that page, closes the dialog, and closes the phone file drawer. No match shows "No matching pages" and no results. Escape or the overlay closes the dialog.

The dialog is at most 520px wide, inset 32px from the viewport width. The result list is at most 340px tall. The filter runs on the pages already loaded in the browser. There is no loading step and no request to a search service.

## Not started

These modules are not in the tree. The palette becomes what Command-K opens only when it is the search surface. Until then, `PageSearch` stays.

| Module | Role |
| --- | --- |
| Query parser | Splits terms and the five filters |
| Rank | Title match, then `updated_at`, then slug |
| Palette dialog | One dialog labeled "Search", for documents, commands, and filters |
| Document index | Postgres full-text search plus `pg_trgm` |

```ts
type Command = "new-document" | "inbox" | "timeline" | "metrics";

type Filter =
  | { kind: "type" | "status" | "verdict"; value: string }
  | { kind: "harness"; slug: string; version?: number }
  | { kind: "after"; date: string };

type ParsedQuery = { terms: string[]; filters: Filter[] };

type DocumentHit = {
  slug: string;
  title: string;
  path: string;
  type: string;
  updated_at: string;
  snippet: string;
  titleMatch: boolean;
};
```

Commands, in order, under the heading "Commands": New document, Go to Inbox, Go to Timeline, Go to Metrics. An empty query or a whitespace query shows all four, then every document in the open project by `updated_at` descending, then slug ascending. A query with terms keeps a command only if every term is a case-insensitive substring of its name. A query that is only filters lists no commands. New document starts a new document. The other three open that screen. Each command closes the dialog and the phone file drawer.

Terms are the query split on whitespace, lowercased, with empty pieces dropped and with filter tokens removed. A document stays when every term is a case-insensitive substring of the title, the body, or a frontmatter scalar.

`type:`, `status:`, `harness:`, `verdict:`, and `after:` are filters, not terms. The prefix match is case-insensitive. `type:` keeps documents whose type equals the value. `status:` keeps documents whose status equals the value. `harness:` keeps documents whose harness link has that slug, and, when the value is `slug@` plus an integer, that version. A `harness:` value with `@` and no integer is a term. `verdict:` keeps documents whose verdict equals the value. `after:` keeps documents whose frontmatter `date` is on or after that `YYYY-MM-DD` value, and drops a document that has no `date`. An `after:` value that is not `YYYY-MM-DD` is a term. Value comparison is case-insensitive. Filters and terms combine with AND. A token whose prefix is not one of those five is a term.

Document hits are ordered with title matches first, then `updated_at` descending, then slug ascending. A title match means every term is a case-insensitive substring of the title. The score is 1 for a title match and 0 otherwise. Filter tokens are not part of the score. Commands stay in the command group and are not scored.

Document hits are under the heading "Documents". Each row shows a type icon, the title, and the path. When the query has terms, the row also shows a snippet from 28 characters before the match through 48 characters after it, whitespace collapsed, with the matched substring highlighted.

If no command and no document matches, the palette shows "No matches" and no results. Arrow keys and Enter behave as in the page search, on the palette rows. The palette dialog uses the same size: at most 520px wide, inset 32px, list at most 340px tall. It is a dialog. Escape or the overlay closes it.

The budget is under 100 ms for every query against a space of 10,000 documents. That maximum is p100. The clock starts at the keystroke and stops when the result list is shown. The query may include terms and the five filters. The index is Postgres full-text search plus `pg_trgm`, with no embeddings and no search service besides that database. The shipped page search does not use that index.

## Contracts

`⌘K` is in [`specs/contracts/keymap.md`](../../contracts/keymap.md), global scope: open search and close shortcut help, including while typing. Dialog arrows, Enter, and Escape are in the dialog scope of that contract. The 520px palette width is in [`specs/contracts/tokens.md`](../../contracts/tokens.md). The document index is a schema change on the storage contract from F07. It is not in the tree.
