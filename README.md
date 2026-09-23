# markdown-kb

A hostable Markdown knowledge base for product specs, experiment notes, and the decisions around them. Documents stay Markdown. This repository is the first slice: a readable editor.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The writing guide is the home page.

```bash
npm test
npm run lint
npm run build
```

## What this slice does

- Three columns: page tree, page, outline, with light, dark, and system themes
- Preview by default. Edit, or ⌘/, puts the source beside the page
- GitHub-flavored Markdown, callouts, math, Mermaid, Vega-Lite charts, CSV tables, footnotes, and wiki links
- A page tree you can grow: nested folders, create, rename, drag to move, duplicate, Trash with Undo
- Links follow pages: renaming or moving rewrites every `[[wiki link]]` that points there
- Version history per page, backlinks under each page, and a create button on links to missing pages
- Import `.md` files, download a page, and export the whole workspace as a `.zip`

The files in `content/` seed the workspace. Pages you create or edit live in the browser's local storage, so export and import move them between devices. Sign-in, a shared database, and agent proposals come later.

## Design

The layout follows the quiet density of Cursor and Devin: solid surfaces, a stable file column, a reading measure near sixty-six characters, and an outline that tracks the page. References: [Cursor](https://mobbin.com/screens/a771cd9c-0a79-4699-abc7-1c3dd9143a10), [Cursor command palette](https://mobbin.com/screens/01f954bf-7922-44b7-b228-45d25f214d34), [Devin](https://mobbin.com/screens/3563ed9d-b08f-4d5d-b8a4-9204bd55ff83).
