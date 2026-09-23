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
- Preview by default. Edit (E) turns the page into blocks, as in Notion: a `/` menu, a drag handle with block actions, a selection toolbar, and `⌘/` shows the Markdown source
- Editing keeps the file exact: blocks you leave alone are written back byte for byte, and diagrams, charts, math, and code edit their source inside the block
- GitHub-flavored Markdown, callouts, math, Mermaid, Vega-Lite charts, CSV tables, footnotes, and wiki links
- A page tree you can grow: nested folders, create, rename, drag to move, duplicate, Trash with Undo
- Links follow pages: renaming or moving rewrites every `[[wiki link]]` that points there
- Version history per page, backlinks under each page, and a create button on links to missing pages
- Import `.md` files, download a page, and export a whole project as a `.zip`

Repository projects are folders in this repository, listed in `lib/docs.ts`: `content/` is the **markdown-kb guide** and `specs/` is **Ledger specs**. Each page lives at `/<project>/<path>`. Pages you create or edit, and projects you create or open from a folder, live in the browser's local storage, so export and import move them between devices.

`npm run dev` also reads and writes a third kind of project: folders of `.md` files under `kb/` (or `KB_DIR`). Those projects sync with the local MCP server below. Sign-in, a shared database, and agent proposals come later.

## Connect your agents

The MCP server runs on your machine over stdio. It does not listen on the network. Point `KB_DIR` at the same folder the dev server uses, which is `kb/` inside this repository unless you set the variable.

```bash
npm run mcp
```

`npm run mcp:inspect` opens the MCP Inspector against that server.

Cursor, in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "markdown-kb": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/markdown-knowledge-base/mcp/server.ts"],
      "env": { "KB_DIR": "/absolute/path/to/markdown-knowledge-base/kb" }
    }
  }
}
```

Claude Code:

```bash
claude mcp add markdown-kb --scope user -e KB_DIR=/absolute/path/to/markdown-knowledge-base/kb \
  -- npx tsx /absolute/path/to/markdown-knowledge-base/mcp/server.ts
```

Codex, in `~/.codex/config.toml`:

```toml
[mcp_servers.markdown-kb]
command = "npx"
args = ["tsx", "/absolute/path/to/markdown-knowledge-base/mcp/server.ts"]
env = { KB_DIR = "/absolute/path/to/markdown-knowledge-base/kb" }
```

Start the app with `npm run dev`, then ask an agent to create a project and a page. The page shows up in the browser within a few seconds. Edits you type are written back to the same files. Open the site at [http://localhost:3000](http://localhost:3000); `127.0.0.1` works too. The save route is on only while `KB_LOCAL=1`, which `npm run dev` sets, so a deployed build does not expose it.

## Design

The layout follows the quiet density of Cursor and Devin: solid surfaces, a stable file column, a reading measure near sixty-six characters, and an outline that tracks the page. References: [Cursor](https://mobbin.com/screens/a771cd9c-0a79-4699-abc7-1c3dd9143a10), [Cursor command palette](https://mobbin.com/screens/01f954bf-7922-44b7-b228-45d25f214d34), [Devin](https://mobbin.com/screens/3563ed9d-b08f-4d5d-b8a4-9204bd55ff83).
