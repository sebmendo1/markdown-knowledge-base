# markdown-kb

A hostable Markdown knowledge base for product specs, experiment notes, and the decisions around them. Documents stay Markdown. This repository is the first slice: a readable editor.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page lists every project as a card.

```bash
npm test
npm run lint
npm run build
```

## What this slice does

- Projects: a grid of project cards on launch, and a project menu at the top of the sidebar to switch between them, as in Notion. Each project keeps its own pages, folders, Trash, and last open page
- Open a folder of `.md` files from disk as a new project, keeping its subfolders
- Three columns: page tree, page, outline, with light, dark, and system themes
- Preview by default. Edit (E) turns the page into blocks, as in Notion: a `/` menu, a drag handle with block actions, a selection toolbar, and `[[` page links. ⌘/ shows the Markdown source
- Editing keeps the file exact: blocks you leave alone are written back byte for byte, and diagrams, charts, math, and code edit their source inside the block
- GitHub-flavored Markdown, callouts, math, Mermaid, Vega-Lite charts, CSV tables, footnotes, and wiki links
- A page tree you can grow: nested folders, create, rename, drag to move, duplicate, Trash with Undo
- Links follow pages: renaming or moving rewrites every `[[wiki link]]` that points there
- Version history per page, backlinks under each page, and a create button on links to missing pages
- Import `.md` files, download a page, and export a whole project as a `.zip`

Repository projects are folders in this repository, listed in `lib/docs.ts`: `content/` is the **markdown-kb guide** and `specs/` is **Ledger specs**. Each page lives at `/<project>/<path>`. Pages you create or edit, and projects you create or open from a folder, live in the browser's local storage, so export and import move them between devices. Sign-in, a shared database, and agent proposals come later.

## Design

The layout follows the quiet density of Cursor and Devin: solid surfaces, a stable file column, a reading measure near sixty-six characters, and an outline that tracks the page. References: [Cursor](https://mobbin.com/screens/a771cd9c-0a79-4699-abc7-1c3dd9143a10), [Cursor command palette](https://mobbin.com/screens/01f954bf-7922-44b7-b228-45d25f214d34), [Devin](https://mobbin.com/screens/3563ed9d-b08f-4d5d-b8a4-9204bd55ff83).
