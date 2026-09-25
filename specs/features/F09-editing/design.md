# F09 design

Written against `spec.md` in this folder, from `origin/cursor/spec-rest-of-editing-b39a`. That branch is not merged. It contains the editor that shipped and the Ledger editor that did not.

F09-REQ-001 through F09-REQ-016 are in the tree. F09-REQ-017 records that inline CodeMirror live preview is not this editor. F09-REQ-018 through F09-REQ-037 are not in the tree. They do not replace the shipped save. Until revisions and a signed-in role exist, Command-S still stores a local snapshot.

The block editor already opens a `/` menu and a `[[` picker. Those menus are wider than F09-REQ-021 and do not insert `[[slug@n]]`. They are not the shipped requirements. F20 records the keys that open them.

## Shipped modules

| Module | Role |
| --- | --- |
| `components/draft-store.ts` | `Mode` and `markdown-kb:mode` |
| `components/document-chrome.tsx` | Edit control and the status line |
| `components/use-editor-keys.ts` | Command-/, `E`, and Command-S |
| `components/workspace.tsx` | Reads `edit=1` and `edit=0`, then removes the parameter |
| `components/preview-stage.tsx` | Preview, the block surface, or the source editor |
| `components/block-editor/block-editor.tsx` | Blocks in the reading column. Accessible name `Page content` |
| `components/editor.tsx` | Full-page Markdown source |
| `components/history-store.ts` | Local snapshots |
| `components/page-actions.ts` | `saveVersion` |
| `components/workspace-store.ts` | Writes the workspace to this browser |
| `components/disk-sync.ts` | Sends folder-project changes 500ms after the last local write |
| `components/block-editor/properties.tsx` | Scalar frontmatter fields while editing, when no schema is loaded |
| `app/reading.css`, `app/block-editor.css` | 17px editing type, 13.5px source type, 15px source type at 640px |

## Shipped data and state

```ts
type Mode = "preview" | "edit" | "source";

type Snapshot = { at: number; content: string; label: string };
```

`markdown-kb:mode` is one value for the browser, shared by every page and project. A missing value, or any value other than `edit`, `source`, or `split`, reads as preview. `split` reads as editing.

| Mode | Surface | Status label | Edit control |
| --- | --- | --- | --- |
| `preview` | Rendered page (F04). No source editor | `Viewing` | `Edit`, accessible name `Turn editing on`, pressed false |
| `edit` | Blocks in the reading column. No source editor | `Editing` | `Editing`, accessible name `Turn editing off`, pressed true |
| `source` | Stored Markdown in a code editor that fills the page. Line wrap and line numbers. No preview beside it. Outline hidden | `Markdown source` | Still `Editing`, pressed true |

The Edit control enters editing from preview and returns to preview from editing or from source. Command-/ or Control-/ enters source from preview or editing, and enters editing from source. It works while focus is in the source editor. It does not land on preview. `E` or `e` enters editing when a page is open, focus is outside a text field, the source editor, and any other editable region, and no dialog or menu is open. It does not leave editing. `edit=1` enters editing and `edit=0` enters preview. Either value is removed from the address without a reload. The parameter chooses a starting mode and grants no right to change another person's files.

The status line is the page state, then the word count, then the mode label. The word count is the number of whitespace-separated tokens in the stored source, including frontmatter. A trimmed empty source is `0 words`. The writing page's repository source is 548 words. Page state copy is "Edited in this browser" when the text differs from the repository base, "Created in this browser" when the page has no repository origin, and "Repository copy" when the text matches the base.

A text change writes the project workspace to this browser's local storage and does not wait for a server draft. If there is no snapshot, or the newest snapshot is more than 10 minutes old, the previous text is stored first, labeled `Before editing`. Command-S or Control-S stores the current text labeled `Saved version` and shows `Version saved`. At most 50 snapshots are kept, newest first. If the current text equals the newest snapshot, the notice is `No changes since the last version` and no snapshot is added.

The built-in guide and specs projects are not written back to their repository files. A folder project, where the local files API is available, sends pending page changes 500 milliseconds after the last local write. No signed-in role is required to edit or to save a local version.

While editing, a YAML map shows each scalar field other than `title` and `type` as a text field above the body, labeled with the field name. A non-scalar value is shown as JSON and is not a text field. Enums are not dropdowns, dates are not date inputs, and links are not pickers. That row is `components/block-editor/properties.tsx`. It re-serializes the map on commit. That is the no-schema row. It is not the one-line YAML write in F09-REQ-020.

At 390px, preview and editing type stay 17px, the outline is hidden, and the page does not scroll sideways. On a coarse pointer the Edit control is 44px tall. In source, the editor type is 15px at a column of at most 640px, and 13.5px otherwise.

## Later option, not a surface

F09-REQ-017: the editor is the block surface and the full-page source editor. Inline CodeMirror live preview, with syntax revealed on the cursor line, is not either surface. No module implements it. A later option would be a new surface. It does not replace `preview-stage.tsx`.

## Not started

These modules are not in the tree. Building them does not change F09-REQ-001 through F09-REQ-016.

| Module | Requirement | What it does |
| --- | --- | --- |
| Schema form beside `properties.tsx` | F09-REQ-018 | Used only when a type schema is loaded. One control per field: string text, number numeric, date a date input, enum a dropdown, boolean a checkbox, list a list of text values, link a document picker, links a list of pickers, metrics numeric fields for the linked eval's metric keys |
| Pin rule on the link picker | F09-REQ-019 | A field with `pinned: true` requires `@version` before it counts as filled. The stored value is `[[slug@n]]` |
| YAML patch, not a full re-serialize | F09-REQ-020 | One control writes that value and does not rewrite any other line. Source mode shows the YAML as text |
| Narrowed slash catalog in `components/block-editor/commands.ts` | F09-REQ-021 | The only inserts are a heading (levels 1, 2, and 3), a table, a code block, a callout (NOTE, TIP, IMPORTANT, WARNING, CAUTION), a checklist, an image, and a link. No item sends text to a model. Choosing an item inserts that structure and removes the `/` query. The shipped catalog also inserts lists, quotes, dividers, toggles, embeds, Mermaid, charts, CSV, and math. That catalog is not this requirement |
| Document picker on `[[` | F09-REQ-022 | Pages in the space, narrowed by the text after `[[`. Choosing one inserts `[[slug]]` |
| Version list on `@` | F09-REQ-023 | After a harness or an eval, `@` lists that document's saved versions. Choosing n inserts `[[slug@n]]`. The pin means the earliest revision whose version is n |
| `assets/` store | F09-REQ-024 | Paste or drop stores the bytes under `assets/` and inserts a Markdown image. A named file keeps its name. A paste with no name is `image` plus the extension for png, jpeg, gif, webp, or svg. A taken path appends `-2`, `-3`, and so on, before the extension. Empty alt text when the paste has none |
| Server draft | F09-REQ-025, F09-REQ-026 | Where documents are revisions: an unsaved draft is written within 2000 milliseconds of a change, and not more than once per 2 seconds. The draft is private to the author. Opening the document again restores it. This is not the local snapshot |
| Commit line on the page | F09-REQ-027 | Where documents are revisions and validation reports no error, Command-S opens a one-line field labeled `Commit message`, on the page, not in a dialog. The message is optional. Enter on an empty field creates a revision with no message. Enter on text creates a revision with that message. Escape closes the field and creates nothing. A single-character shortcut does not fire while the field is focused |
| Inline validation | F09-REQ-028, F09-REQ-029 | An error blocks the revision, the proposal, and the commit field, and shows each error beside its field or line with the validator's code, message, and hint. Warnings show the same way and still allow Save or Propose |
| Save and Propose by role | F09-REQ-030, F09-REQ-031, F09-REQ-032 | Contributor sees `Propose` and not `Save`. Propose creates a proposal and not a revision. Owner or Editor sees `Save`, which follows the commit line. Viewer sees neither and creates neither |
| Conflict banner and line merge | F09-REQ-033 through F09-REQ-036 | Banner text is `This document changed. Review changes.` It is not a dialog. Save then runs a three-way line merge of the base the editor opened, the current head, and the draft. The split is `\n`. The merge does not parse YAML, does not sort keys, and does not treat list items as a set. A line changed on both sides in different ways, or two overlapping hunks, is a conflict. A clean merge saves and shows `Rebased onto latest`. Key order is the order of the surviving lines. A conflict does not save, and opens a side-by-side resolver on the page with the reader's text, the other text, and the base. No revision is written until the reader submits a resolved document |
| Untouched save | F09-REQ-037 | The reader opens a document, changes nothing, and saves. The diff is empty. The save does not rewrite the Markdown |

The disk banner `This page changed on disk.` stays the local-folder case (F08). It is not the revision banner.

## Contracts

Mode chords are in [`specs/contracts/keymap.md`](../../contracts/keymap.md): document `E` and `⌘S`, global `⌘/`, and the editor `/` and `[[` bindings. Reading type, source type, and the 44px coarse target are in [`specs/contracts/tokens.md`](../../contracts/tokens.md). The schema form depends on the type schema from F02. The server draft, the revision, and the merge depend on F07. Validation codes depend on F06. Propose and the role labels depend on F15. None of those contracts are implemented by the shipped editor.
