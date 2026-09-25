# Keymap

Shortcuts that exist in the code, plus PRD shortcuts that are not built. `⌘` is `metaKey` or `ctrlKey`: Command on macOS, Ctrl on Linux and Windows.

## Scopes

| Scope | When the shortcut applies |
| --- | --- |
| global | The window listener, whether or not a page is open |
| document | A page is open |
| editor | The block editor, the Markdown source editor, or a widget inside them |
| review | The proposal review screen. Not built |
| dialog | A dialog, menu, palette, or sheet is open |

## Collisions

The same key is a different action in different scopes. A binding in one scope must not steal the other.

| Key | global or document | review |
| --- | --- | --- |
| `C` | New page. Built | Request changes, and the note is required. Not started |
| `E` | Start editing, when a page is open. Built | Edit before merge. Not started |

`C` and `E` run only when the target is not an input, textarea, contenteditable, or `.cm-content`, and no `.overlay` or `.menu` is open, and neither ⌘ nor Alt is held. Shift is ignored (`c` and `C` both match). That is what keeps `C` from firing while typing and while a dialog is open. It does not define the review binding. Review is not built, so review `C` and review `E` have no handler yet.

`⌘E` in the editor toggles inline code. It is not `E`. The plain `E` handler requires ⌘ to be up, so the two do not fire together.

## Global

| Keys | Action |
| --- | --- |
| `⌘K` | Open search. Close shortcut help. Runs while typing |
| `⌘/` | If the mode is Markdown source, switch to editing. Otherwise switch to Markdown source. From viewing this opens source, not editing. Runs while typing. In the source editor, CodeMirror's comment binding on `⌘/` is swallowed and does not run |
| `⌘\` | Show or hide the outline. Runs while typing |
| `⌘,` | Open or close settings. Runs while typing |
| `?` | Open shortcut help and close search. Suppressed while typing. Not suppressed by an open dialog |
| `Escape` | Close search, close shortcut help, and close the mobile files drawer. Separate listeners also close settings and the share sheet. A dialog that stops the key (the table under Dialog) keeps this from running too |
| `C` | New page in the open page's folder, or at the top level when no page is open. Opens the files column and starts the name field. Suppressed while typing or while a dialog or menu is open |

## Document

| Keys | Action |
| --- | --- |
| `E` | Set the mode to editing. Requires a page. Suppressed while typing or while a dialog or menu is open |
| `⌘S` | Save a version of the open page into the browser version list. If nothing changed since the last version, say so. No page, no save. The source editor swallows `⌘S` so the browser does not save the page itself; the window listener still records the version |

The page menu shows `⌘/` and `⌘S` as hints. Those menu rows call the same actions. They are not extra shortcuts.

A link with `?edit=1` opens editing, and `?edit=0` opens viewing. The query is then removed. That is not a key binding.

## Editor

### Written in this repo

| Keys | Action |
| --- | --- |
| `/` | Open the slash menu at the start of a suggestion. Inserts a block. Does not run inside a code fence |
| `[[` | Open the page picker and insert a wiki link |
| ` ``` ` then space or newline | Turn the line into a code fence. An optional language sticks |
| `$$` then space | Turn the line into a math block |
| `Escape` | Close the slash menu or the page picker |
| `ArrowDown` / `ArrowUp` | Move the slash or page-picker highlight |
| `Enter` or `Tab` | Pick the highlighted slash or page-picker item |
| `Escape` or `⌘Enter` | Close a block's source editor and return to the page |
| `Tab` | In a block source editor, insert two spaces |
| `Backspace` | In an empty block source editor, delete the block |
| `Enter` or `Escape` | Finish inline math |
| `Escape` | Close the embed picker |
| `Enter` | In the embed picker, embed the first match |
| `Enter` | Commit a frontmatter field |
| `Escape` | Revert a frontmatter field |
| `Escape` | Close the bubble link field and return to the page |

The bubble labels name `⌘B`, `⌘I`, and `⌘E`. Those bindings come from the editor extensions below, not from a keymap in `components/`.

### Enabled by the editor extensions

`lib/editor/nodes.ts` turns on StarterKit (code block and underline off; bullet list and ordered list replaced by the tight lists), task list, task item with nesting, table, and highlight. These bindings are that configuration. They apply in the block editor.

| Keys | Action |
| --- | --- |
| `⌘B` | Bold |
| `⌘I` | Italic |
| `⌘E` | Inline code |
| `⌘⇧S` | Strikethrough |
| `⌘⇧H` | Highlight |
| `⌘⌥1` through `⌘⌥6` | Heading levels 1–6 |
| `⌘⇧B` | Blockquote |
| `⌘⇧8` | Bullet list |
| `⌘⇧7` | Numbered list |
| `⌘⇧9` | To-do list |
| `⌘Enter` or `⇧Enter` | Hard break |
| `Enter` | Split a list item |
| `Tab` / `⇧Tab` | Indent or outdent a list item. On a to-do, Tab indents only because nesting is on |
| `Backspace` | Lift an empty blockquote or list item |
| `Tab` / `⇧Tab` | Next or previous table cell. Tab on the last cell adds a row |
| `Backspace` or `Delete`, with or without `⌘` | Delete a table when every cell is selected |

Markdown typed in the block editor also converts, from those same extensions:

| Typed | Becomes |
| --- | --- |
| `#` through `######` then space | Heading 1–6 |
| `-`, `*`, or `+` then space | Bullet list |
| `1.` then space | Numbered list |
| `[ ]` or `[x]` then space | To-do |
| `>` then space | Blockquote |
| `---`, `—-`, `___ `, or `*** ` | Divider |
| `**`, `__`, `*`, `_`, `` ` ``, `~~`, `==` around a word | Bold, italic, code, strike, highlight, using the extension's own pattern |

Underline is off, so `⌘U` is not a binding. The StarterKit code block is off; the fence rule above is the one that runs.

### Markdown source

`components/editor.tsx` binds `Tab` to indent and `⇧Tab` to outdent. It also swallows `⌘S` and `⌘/`.

`basicSetup` leaves these CodeMirror maps on (`defaultKeymap`, `historyKeymap`, `searchKeymap`, `foldKeymap`, `completionKeymap`, `lintKeymap`, `closeBracketsKeymap`). Autocompletion and the fold gutter are off; the keymaps are still registered. `⌘/` in that default map would toggle a comment; the swallow above wins, and the global handler switches mode instead.

| Keys | Action |
| --- | --- |
| `Tab` / `⇧Tab` | Indent / outdent |
| `⌘Z` | Undo |
| `⌘Y`, or `⌘⇧Z` on macOS, or `Ctrl⇧Z` on Linux | Redo |
| `⌘U` | Undo selection |
| `⌥U`, or `⌘⇧U` on macOS | Redo selection |
| `⌘F` | Open the source find panel |
| `F3` or `⌘G` | Find next. Shift finds previous |
| `Escape` | Close the find panel, when that panel is open |
| `⌘⇧L` | Select matches of the selection |
| `⌘⌥G` | Go to line |
| `⌘D` | Select the next occurrence |
| `⌘Enter` | Insert a blank line |
| `⌘[` / `⌘]` | Indent less / more |
| `⌘⌥\` | Indent the selection |
| `⌘⇧K` | Delete the line |
| `⌘⇧\` | Jump to the matching bracket |
| `⌥A` | Toggle a block comment. `⌘/` does not; see above |
| `CtrlM`, or `⇧⌥M` on macOS | Toggle Tab-focus mode |
| `⌥Left` / `⌥Right` (`Ctrl` on macOS) | Move by syntax group |
| `⌥Up` / `⌥Down` | Move the line |
| `⇧⌥Up` / `⇧⌥Down` | Copy the line |
| `Escape` | Simplify the selection, when find is not taking it |
| `⌘I` | Select the parent syntax node. This is the source editor, not italic |
| `Ctrl⇧[` / `Ctrl⇧]` (`⌘⌥` on macOS) | Fold / unfold |
| `Ctrl⌥[` / `Ctrl⌥]` | Fold / unfold all |
| `⌘⇧M` | Open the lint panel |
| `F8` | Next diagnostic |
| `CtrlSpace`, or `` ⌥` `` on macOS | Start completion |
| `Escape`, arrows, `PageUp`, `PageDown`, `Enter` | Completion menu, when it is open |
| `Backspace` | Delete an empty bracket pair |

CodeMirror's standard map also binds the usual cursor, selection, and deletion keys inside the source editor (arrows, Home, End, Page Up, Page Down, Backspace, Delete, and their ⌘ and Shift variants).

## Dialog

| Where | Keys | Action |
| --- | --- | --- |
| Search | `ArrowDown` / `ArrowUp` | Move the highlight |
| Search | `Enter` | Open the highlighted page |
| Search | `Escape` | Close, via the global handler |
| Move | `ArrowDown` / `ArrowUp` | Move the highlight |
| Move | `Enter` | Move to the highlighted folder |
| Move | `Escape` | Close |
| History, trash, share, delete-project | `Escape` | Close |
| Project create or rename | `Escape` | Close |
| Project description | `Enter` without Shift | Submit |
| Project switcher | `ArrowDown` / `ArrowUp` | Move through projects |
| Project switcher | `Escape` | Close and focus the switcher button |
| Project switcher | `Tab` | Close |
| Page or block menu | `ArrowDown` / `ArrowUp` | Move through items |
| Page or block menu | `Escape` | Close. The block menu also returns focus to the editor |
| Shortcut help | `Escape` | Close, via the global handler |
| Settings | `⌘,` | Close, because the global binding toggles |
| Settings | `Escape` | Close |
| Tree name field | `Enter` | Commit the name |
| Tree name field | `Escape` | Cancel |

## Review

Not started. No handler in the code.

| Keys | Action | Status |
| --- | --- | --- |
| `G` then `I` | Go to Inbox | Not started |
| `G` then `T` | Go to Timeline | Not started |
| `G` then `M` | Go to Metrics | Not started |
| `M` | Merge | Not started |
| `R` | Reject. A reason is optional | Not started |
| `C` | Request changes. A note is required. See Collisions | Not started |
| `E` | Edit before merge. See Collisions | Not started |
| `D` | Toggle the rendered diff and the source diff | Not started |
| `J` / `K` | Next / previous item | Not started |
| `⌘⇧F` | New finding from this experiment | Not started |

`⌘K`, `C`, `E`, `⌘S`, `⌘\`, `⌘/`, and `?` are the PRD bindings that are built. Their shipped actions are in the tables above. `⌘\` toggles the outline, not the PRD right panel of properties, backlinks, and history. `⌘/` switches between editing and Markdown source, not the PRD raw-source toggle on an inline preview.
