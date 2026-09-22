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

- Dark three-pane screen: files, page, outline
- Preview, split, and source, with a CodeMirror Markdown source
- GitHub-flavored Markdown, callouts, math, Mermaid, Vega-Lite charts, CSV tables, footnotes, and wiki links
- Local drafts in the browser, with reset back to the file in `content/`

Sign-in, agent proposals, and hosted review are later. Pages live in `content/` as `.md` files.

## Design

The layout follows the quiet density of Cursor and Devin: near-black surfaces, a stable file column, a reading measure near 720px, and an outline that tracks the page. References: [Cursor](https://mobbin.com/screens/a771cd9c-0a79-4699-abc7-1c3dd9143a10), [Cursor command palette](https://mobbin.com/screens/01f954bf-7922-44b7-b228-45d25f214d34), [Devin](https://mobbin.com/screens/3563ed9d-b08f-4d5d-b8a4-9204bd55ff83).
