# F10 design

Written against `spec.md` in this folder, from `origin/cursor/reading-shell-specs-6322`. That branch is not merged. Settings, as specified here, is built. Members, agent-key administration, type schemas, and import and export are not in this dialog.

## Modules

| Module | Role |
| --- | --- |
| `components/settings-host.tsx` | The dialog, the section list, and the three panes |
| `components/theme-store.ts` | `ThemeChoice`, storage, and the painted theme |
| `app/layout.tsx` | Applies the stored theme before the first paint |
| `lib/mcp/snippets.ts` | Cursor, Claude Code, and Codex snippets |
| `app/api` snippet route used by the MCP pane | Live folder paths when the local server answers |
| `components/file-sidebar.tsx` | Settings at the foot of the file column |
| `components/document-chrome.tsx` | The gear labeled "Settings" |
| `app/settings.css`, `app/theme.css` | Dialog size and the theme colors |

## Data shapes

```ts
type Section = "general" | "appearance" | "mcp";

type ThemeChoice = "light" | "dark" | "system";

type McpSnippets = {
  cursor: string;
  claude: string;
  codex: string;
};
```

The dialog is labeled "Settings" and its heading is "Settings". Sections are General, Appearance, and MCP, in that order.

General shows "General", "This copy stays on this machine.", the label "Pages", and "Pages you create or edit live in this browser, one project at a time. Export a project from the Pages menu to keep a copy or move it to another device."

Appearance shows "Appearance", "How markdown-kb looks on this machine.", the label "Theme", "Use the system setting, or keep one look.", and the choices Light, Dark, and System.

MCP, when the local snippet endpoint responds, shows "MCP", a lead naming the knowledge-base folder, and the three snippets, each with a Copy control. When the endpoint does not respond, the lead is "Run npm run dev on this machine to fill in the folder paths. Paste one of these into Cursor, Claude Code, or Codex." and the snippets are the placeholders from `mcpSnippets`. A successful copy tells the owner "Copied {label} settings".

## State

| Key | Where | Rule |
| --- | --- | --- |
| `markdown-kb:theme` | `localStorage` | `light`, `dark`, or `system`. Anything else, including a missing key, is Dark |
| Dialog open | React state in `SettingsHost` | Closed until opened |
| Section | React state | Opens on Appearance from the file column or the gear. Command-, toggles the dialog and leaves the section as it was |

Choosing Light, Dark, or System stores that choice and paints the shell with it. While the choice is System, the paint is Light when the machine prefers a light scheme and Dark otherwise, including when that preference changes. `applyTheme` sets `document.documentElement.dataset.theme` to `light` or `dark`. The script in `app/layout.tsx` runs the same rule before the first paint, so the first frame uses the stored choice.

Opening: Settings in the file column, or the gear labeled "Settings" while the file column is hidden or the viewport is 860px or narrower, opens the dialog on Appearance. Command-, or Control-, toggles the dialog. "Close settings", Escape, and a press on the overlay close it.

While the viewport is wider than 640px, the dialog is at most 760px wide and 520px tall, with a 180px section list beside the section. At 640px or narrower, the dialog is the viewport minus 16px on each axis and the section list is a row.

## Contracts

The painted colors are the Dark and Light rows in [`specs/contracts/tokens.md`](../../contracts/tokens.md): `--bg`, `--bg-sidebar`, `--bg-raised`, and the accent. This dialog does not redefine them. F21 owns the paint rules. The toggle chord is `⌘,` in [`specs/contracts/keymap.md`](../../contracts/keymap.md), dialog scope. F20 owns the shortcut. This design owns the dialog it opens.
