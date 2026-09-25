# F08 design

Written against `spec.md` in this folder, from `origin/cursor/reading-shell-specs-6322`. That branch is not merged. The shell in this spec is built. Editing mechanics are F09. Settings are F10. The share sheet is F11. Page search is F17. Shortcuts are F20. Paint, radius, and type tokens are F21.

## Modules

| Module | Role |
| --- | --- |
| `app/[project]/page.tsx`, `app/[project]/[...slug]/page.tsx` | Project home and page routes |
| `next.config.ts` | Redirects for `/docs` and `/ledger` |
| `lib/workspace/paths.ts` | `hrefOf` builds `/{project}/{page-path}` |
| `components/workspace.tsx` | Shell state: mode, columns, outline, title |
| `components/workspace-view.tsx` | Three-column frame |
| `components/file-sidebar.tsx`, `components/page-tree.tsx` | Page list |
| `components/outline-panel.tsx`, `components/use-headings.ts`, `components/use-active-heading.ts` | Outline |
| `components/document-chrome.tsx` | Title row and status line |
| `components/missing-page.tsx` | Missing page, empty project, unknown project |
| `components/draft-store.ts` | Sidebar shown or hidden, and the shared mode |
| `components/disk-sync.ts` | Disk-change banner |
| `lib/markdown/outline.ts` | Heading list for the outline |
| `lib/workspace/tree.ts` | `backlinks`, rendered at the end of the column |
| `app/columns.css`, `app/reading.css`, `app/sidebar.css` | Column widths, measure, and surfaces |

## Data shapes

```ts
type PageState = "repo" | "edited" | "created" | "missing";

type Heading = { id: string; depth: number; text: string };

type ShellChrome = {
  project: string;
  path: string;          // with .md, or "" when no page is open
  mode: "preview" | "edit" | "source";
  sidebar: "shown" | "hidden";
  outlineOpen: boolean;  // session state, default true
  phoneDrawer: boolean;
};
```

A page address is `/{project}/{page-path}`, with `.md` removed from the path. `/docs` and `/ledger` redirect temporarily to `/guide`. `/docs/{path}` and `/ledger/{path}` redirect permanently to `/guide/docs/{path}` and `/guide/ledger/{path}`. A project URL with no page redirects to that project's home page when it has one.

`PageState` is derived, not stored. No page is `missing`. A page with no `origin` is `created`. A page whose content differs from `base` is `edited`. Otherwise it is `repo`. The status line shows "No page here yet", "Created in this browser", "Edited in this browser", or "Repository copy", then the word count, then the mode label. Word count and the mode label are F09. This shell places them.

The title row shows the path with folder segments separated by ` / ` and the file name, including `.md`, emphasized. When a page is open it also shows Edit, Share, and page actions. The document title is `{page title} · {project name}`.

## State

| Key | Where | Values |
| --- | --- | --- |
| `markdown-kb:sidebar` | `localStorage`, via `draft-store.ts` | absent or anything other than `hidden` means shown. `hidden` hides the file column on a wide viewport |
| `markdown-kb:mode` | `localStorage`, shared with F09 | `preview` unless the stored value is `edit`, `source`, or `split` (`split` reads as editing) |
| `outlineOpen` | React state in `workspace.tsx` | starts `true`. Not written to storage. Command-\\ toggles it (F20) |
| `sidebarOpen` | React state | the phone drawer. Starts closed |

While the viewport is wider than 860px, the sidebar choice is shown, the outline choice is open, and the mode is not source, the shell is three full-height columns: files at 248px, the page in the remaining width, the outline at 220px. The file column and the outline use the sidebar surface. The title row, page, and status line use the page surface. The border between those columns is 0px.

Hiding the file column removes it, shows a control labeled "Show sidebar" at the top left, and stores `hidden`. "Show sidebar" shows the column and stores the choice as shown.

At 860px or narrower the outline stays off screen and the file column stays off screen until it is opened. The open column is a drawer of `min(280px, 88vw)` with a scrim. Activating the scrim closes the drawer.

The file column lists the project's pages, marks the open page, and expands every folder on the path to that page. Search is at the top. Trash and Settings are at the foot.

The outline is filled from the page's headings, skipping headings inside an embed, a backlink list, or footnotes. No headings shows "No headings". The highest heading visible in the page is marked. Choosing a row scrolls that heading to the top, smoothly unless the owner prefers reduced motion. Indent is 8px plus 12px for each level below the first. The outline is hidden when the choice is closed, when the mode is source, when the route has no page, or when the viewport is 860px or narrower.

Reading text is 17px with line height 1.7. The column is the smallest of the page column width, 760px, and 66ch plus 64px. Padding is 32px on each side above a 640px page column, 20px from 420px through 640px, and 16px at 420px and below. At 390px the page does not scroll sideways and Edit stays available.

A route that names a page the project does not have, when the project has at least one page, shows the missing-page screen (the same screen as F03-REQ-011). No pages shows the empty-project screen. A project that is not in this browser shows the unknown-project screen. While the page list has not finished loading and the route names no page, the stage is blank and has no message.

When one or more pages link to the open page, they are listed under "Linked from" at the end of the reading column. The list itself is F03. If the open page has changed on disk since it was loaded, the shell shows "This page changed on disk." and a "Load disk version" control.

## Contracts

Column widths, the 860px shell, the 640px and 420px reading padding, the 17px reading line, and the solid fills with a 0px column border are in [`specs/contracts/tokens.md`](../../contracts/tokens.md). Shell shortcuts are in [`specs/contracts/keymap.md`](../../contracts/keymap.md) under global and document scope. This design uses those bindings. F20 owns their behavior.
