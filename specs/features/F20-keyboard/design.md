# F20 design

Written against `spec.md` in this folder, from `origin/cursor/reading-shell-specs-6322`. That branch is not merged. The shortcuts in this spec are built. The key list with scopes is [`specs/contracts/keymap.md`](../../contracts/keymap.md). This design leaves unbound every key the contract marks as not started.

Review keys are not bound: `G` then `I`, `G` then `T`, `G` then `M`, review `M`, review `R`, review `C`, review `D`, review `E`, and `J` and `K`. `C` outside a dialog creates a page. `E` on a page starts editing. Those two collisions are recorded in the keymap contract and are not given review handlers here.

## Modules

| Module | Role |
| --- | --- |
| `components/use-editor-keys.ts` | The window listener for the shell chords and the plain keys |
| `components/shortcut-help.tsx` | The dialog labeled "Shortcuts" |
| `components/settings-host.tsx` | Command-, toggles settings, and Escape closes it |
| `components/share-host.tsx` | Escape closes the share sheet |
| `components/page-search.tsx` | Arrows and Enter inside search |
| `components/editor.tsx` | Swallows Command-S and Command-/ in the source editor so the window listener still owns them |
| `components/block-editor/extensions.ts` | `/` opens the block insert menu. `[[` opens the page picker |
| `components/block-editor/commands.ts` | The items that menu inserts. The catalog width is F09, not this feature |
| `components/draft-store.ts` | `setMode`, which Command-/ and `E` call |

## Data shapes

A binding is a key, a scope, and an action. The scopes used here are global, document, editor, and dialog, as named in the keymap contract. Review scope has no handler.

```ts
type Scope = "global" | "document" | "editor" | "dialog";

type Chord = {
  key: string;
  meta: boolean;
  scope: Scope;
  runsWhileTyping: boolean;
};
```

`meta` means Command or Control. The help dialog says "On Linux and Windows, Ctrl is the modifier."

| Keys | Scope | Action |
| --- | --- | --- |
| Command-K or Control-K | global | Open page search and close shortcut help, including while typing |
| Command-/ or Control-/ | global | Source if the mode is not source. Editing if the mode is source. Does not return to viewing |
| Command-\\ or Control-\\ | global | Toggle the outline choice, including while typing |
| Command-S or Control-S | document | Save a version of the open page. No page, no save |
| Command-, or Control-, | global | Toggle the settings dialog, including while typing |
| `?` | global | Open shortcut help and close page search. Suppressed while typing. Not suppressed by an open dialog |
| `E` | document | Start editing. Requires a page. Does not turn editing off. Suppressed while typing or while a dialog or menu is open |
| `C` | global | Open the file column and start a new page in the open page's folder, or at the top level when no page is open. Suppressed while typing or while a dialog or menu is open |
| Escape | global | Close page search, shortcut help, and the phone file drawer. Settings and share close on their own listeners |
| `/` | editor | Open the block insert menu at the start of a block that is not a code fence |
| `[[` | editor | Open a picker of up to 8 pages whose title or path contains the text typed after `[[` |

`C` and `E` also require that neither Command nor Alt is held. Shift is ignored, so `c` and `C` both match, and `e` and `E` both match.

The help dialog lists these ten rows, in this order: Search pages (⌘K), Switch between blocks and Markdown source (⌘/), Show or hide the outline (⌘\\), Start editing (E), Insert a block while editing (/), Link to a page while editing ([[), Create a page (C), Save a version (⌘S), Open settings (⌘,), Show this list (?). It also shows "On Linux and Windows, Ctrl is the modifier." It does not list the review keys.

## State

The listener reads the current mode, the open page id, and whether a dialog or menu is open (`.overlay` or `.menu`). It does not store a keymap of its own. Outline open, search open, and help open are the shell state in `components/workspace.tsx`. Settings open is the state in `SettingsHost`. Mode is `markdown-kb:mode` (F09).

Command-/ from viewing opens source, not editing. The Edit control, not this chord, returns to viewing. That split is F09-REQ-002 and F09-REQ-003. This feature requires the chord's half of it.

The `/` menu and the `[[` picker are the editor suggestions that already ship. F09-REQ-021 and F09-REQ-022 are a narrower catalog and a version pin. Those are not this feature. This feature requires that the keys open the menus, and that the page picker offers at most 8 pages.

## Contracts

Every row above is the built row in [`specs/contracts/keymap.md`](../../contracts/keymap.md). The review table in that contract stays not started, which is F20-REQ-014. Dialog sizes for shortcut help follow the search dialog in [`specs/contracts/tokens.md`](../../contracts/tokens.md): up to 520px, inset 32px.
