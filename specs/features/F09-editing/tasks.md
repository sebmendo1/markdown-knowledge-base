# F09 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Shipped steps are the editor in the tree. The later-option step does not build inline live preview. Not-started steps are the Ledger target. They are not in the tree, and a shipped test is not proof of them. Until those steps exist, Command-S stores a local snapshot (F09-T-006).

## Shipped

### F09-T-001 Store one mode for the browser

- Requirements: F09-REQ-001
- Test: `a fresh visit opens in preview` (F09-AC-001a). `mode is shared across pages` (F09-AC-001b).
- Size: one module
- Depends on: none
- Module: `useMode` and `setMode` in `components/draft-store.ts`. The key is `markdown-kb:mode`. `edit` and `split` read as editing. `source` reads as source. Anything else reads as preview.

### F09-T-002 Turn editing on and off from the Edit control

- Requirements: F09-REQ-002
- Test: `Edit toggles preview and editing` (F09-AC-002a). Preview reads `Edit`, accessible name `Turn editing on`, pressed false. Editing and source read `Editing`, accessible name `Turn editing off`, pressed true.
- Size: one module
- Depends on: F09-T-001
- Module: the Edit control in `components/document-chrome.tsx`

### F09-T-003 Switch mode from the keyboard and from the address

- Requirements: F09-REQ-003, F09-REQ-004, F09-REQ-005
- Test: `Control-slash toggles source and editing` (F09-AC-003a). `E enters editing from preview` (F09-AC-004a). `edit=1 opens editing and leaves the address` (F09-AC-005a).
- Size: several modules
- Depends on: F09-T-001
- Modules: `components/use-editor-keys.ts` for Command-/ and `E`, and the `edit` parameter effect in `components/workspace.tsx`. Command-/ never lands on preview. `E` does not leave editing, and it does not run in a field, in the source editor, or while a dialog or menu is open. `edit=0` and `edit=1` are removed without a reload and grant no right to change another person's files.

### F09-T-004 Show preview, blocks, or full-page source

- Requirements: F09-REQ-006, F09-REQ-007, F09-REQ-008
- Test: `preview shows the rendered page only` (F09-AC-006a). `editing does not place source beside preview` (F09-AC-007a). `source fills the page at 13.5px and 15px` (F09-AC-008a).
- Size: several modules
- Depends on: F09-T-001, F09-T-002
- Modules: `components/preview-stage.tsx`, `components/block-editor/block-editor.tsx` (accessible name `Page content`), `components/editor.tsx`. Source type is 13.5px, and 15px when the column is at most 640px. The outline is hidden in source. Status labels are `Viewing`, `Editing`, and `Markdown source`.

### F09-T-005 Keep the typed text in this browser

- Requirements: F09-REQ-009
- Test: `a local edit is marked edited in this browser` (F09-AC-009a).
- Size: several modules
- Depends on: F09-T-004
- Modules: `components/workspace-store.ts` and the status copy in `components/document-chrome.tsx`. A change writes local storage and does not wait for a server draft. The status is `Edited in this browser`, `Created in this browser`, or `Repository copy`.

### F09-T-006 Keep local snapshots

- Requirements: F09-REQ-010, F09-REQ-011
- Test: `a quiet period of 10 minutes stores Before editing` (F09-AC-010a). `Control-S saves a version and reports a repeat` (F09-AC-011a).
- Size: one module
- Depends on: F09-T-005
- Module: `components/history-store.ts`, with `saveVersion` in `components/page-actions.ts`. The quiet label is `Before editing` when the newest snapshot is missing or more than 10 minutes old. Command-S stores `Saved version`, shows `Version saved`, and keeps at most 50, newest first. An unchanged text shows `No changes since the last version` and adds nothing.

### F09-T-007 Write a folder project to disk, and leave repository projects in the browser

- Requirements: F09-REQ-012
- Test: `guide edits are not posted as repository writes` (F09-AC-012a). The 500 millisecond send is also covered by `pending changes follow origin and base` and `a disk edit updates an untouched page and keeps local typing` in `lib/store/sync.test.ts`.
- Size: several modules
- Depends on: F09-T-005
- Modules: `components/disk-sync.ts` and the `sync` flag on the project route. Guide and specs are not written back to repository files. A folder project with the local files API sends pending changes 500 milliseconds after the last local write.

### F09-T-008 Edit without a role

- Requirements: F09-REQ-013
- Test: `editing and saving do not ask for a role` (F09-AC-013a).
- Size: one module
- Depends on: F09-T-005
- Module: the local save path in `components/page-actions.ts`. It does not read a session or a role. The Owner and Editor save rule is not in force for this save.

### F09-T-009 Count words on the status line

- Requirements: F09-REQ-014
- Test: `status word count matches the stored source` (F09-AC-014a).
- Size: one module
- Depends on: F09-T-005
- Module: the word count in `components/workspace.tsx`, shown by `components/document-chrome.tsx`. Tokens are whitespace-separated, over the stored source, including frontmatter. Trimmed empty source is `0 words`. The writing page's repository source is 548 words. The line is state, then words, then the mode label.

### F09-T-010 Show scalar frontmatter while editing

- Requirements: F09-REQ-015
- Test: `scalar frontmatter is a text field while editing` (F09-AC-015a).
- Size: one module
- Depends on: F09-T-004
- Module: `components/block-editor/properties.tsx`. Each scalar other than `title` and `type` is a text field labeled with the field name. A non-scalar is JSON and is not a field. There is no enum dropdown, date input, or link picker. This row is what shows when no type schema is loaded.

### F09-T-011 Keep editing usable at 390px

- Requirements: F09-REQ-016
- Test: `390px editing keeps 17px type and a 44px Edit control` (F09-AC-016a).
- Size: one module
- Depends on: F09-T-004
- Module: `app/reading.css` and `app/block-editor.css`. Preview and editing stay 17px. The outline is hidden. The page does not scroll sideways. On a coarse pointer the Edit control is 44px tall. Source type is 15px.

## Later option

This step does not add a surface. Inline live preview stays unimplemented.

### F09-T-012 Keep inline live preview out of this editor

- Requirements: F09-REQ-017
- Test: `editing is blocks, not inline live preview` (F09-AC-017a). The shipped block surface is F09-AC-002a.
- Size: one module
- Depends on: F09-T-004
- Module: `components/preview-stage.tsx`. The two surfaces stay the block editor and the full-page source editor. Do not add an inline CodeMirror preview that reveals syntax on the cursor line, and do not replace either surface with one.

## Not started

These steps are the target. They are not in the tree. Do not treat F09-T-006 or the shipped slash menu as already satisfying them.

### F09-T-013 Show a schema form and write one YAML value

- Requirements: F09-REQ-018, F09-REQ-019, F09-REQ-020
- Test: `schema fields render as dropdown, date, and picker` (F09-AC-018a). `pinned link stores slug at version` (F09-AC-019a). `one form edit writes one YAML value` (F09-AC-020a).
- Size: several modules
- Depends on: F09-T-010, and on a loaded type schema (F02)
- Modules: a schema form used only when a schema is loaded, and a YAML patch that writes one value without rewriting any other line. F09-T-010 remains the row when no schema is loaded. A `pinned: true` link requires `@version` before the field counts as filled, and stores `[[slug@n]]`. Source mode still shows the YAML as text. String, number, date, enum, boolean, list, link, links, and metrics use the controls named in F09-REQ-018.

### F09-T-014 Narrow the slash menu to structure

- Requirements: F09-REQ-021
- Test: `slash menu inserts structure only` (F09-AC-021a).
- Size: one module
- Depends on: F09-T-004
- Module: the item list in `components/block-editor/commands.ts`. The inserts are a heading (1, 2, and 3), a table, a code block, a callout (NOTE, TIP, IMPORTANT, WARNING, CAUTION), a checklist, an image, and a link. No item sends text to a model. Choosing an item inserts that structure and removes the `/` query. The wider shipped catalog is not this list.

### F09-T-015 Insert a document link and a version pin

- Requirements: F09-REQ-022, F09-REQ-023
- Test: `double bracket inserts a document link` (F09-AC-022a). `at-sign pins the earliest version` (F09-AC-023a).
- Size: several modules
- Depends on: F09-T-004, and on saved revisions for the version list (F07)
- Modules: a `[[` picker of documents in the space that inserts `[[slug]]`, and an `@` list of saved versions for a harness or an eval that inserts `[[slug@n]]`. The pin means the earliest revision whose version is n. The shipped picker of up to 8 pages is the F20 key binding. It does not insert `[[slug@n]]` and is not this step.

### F09-T-016 Store a pasted image under assets

- Requirements: F09-REQ-024
- Test: `pasted image lands in assets` (F09-AC-024a).
- Size: several modules
- Depends on: F09-T-004
- Modules: an `assets/` store and the paste and drop handler in the block editor. A named file keeps its name. A nameless paste is `image` plus png, jpeg, gif, webp, or svg. A taken path appends `-2`, `-3`, and so on, before the extension. Alt text is empty when the paste has none.

### F09-T-017 Write a private server draft

- Requirements: F09-REQ-025, F09-REQ-026
- Test: `draft writes once within 2 seconds and stays private` (F09-AC-025a). `return restores the author's server draft` (F09-AC-026a).
- Size: a schema change
- Depends on: F09-T-005, and on documents stored as revisions (F07)
- Schema: a draft row private to the author, separate from the local snapshot in F09-T-006. While the text differs from the last server draft, write within 2000 milliseconds and not more than once per 2 seconds. Another member opening the document does not receive it. The author who leaves and returns gets the draft back in the editor. The shipped editor keeps writing local storage and does not wait on this draft.

### F09-T-018 Ask for a commit message when validation is clean

- Requirements: F09-REQ-027, F09-REQ-028, F09-REQ-029
- Test: `command-s opens an optional commit message` (F09-AC-027a). `a validation error blocks save` (F09-AC-028a). `a warning still allows save` (F09-AC-029a).
- Size: several modules
- Depends on: F09-T-017, and on the validator (F06)
- Modules: a one-line `Commit message` field on the page, not in a dialog, and inline errors and warnings. An error does not create a revision or a proposal, does not open the field, and shows the validator's code, message, and hint beside the field or line. Warnings show the same way and still allow Save or Propose. Enter on an empty field creates a revision with no message. Enter on text uses that message. Escape closes the field and creates nothing. A single-character shortcut does not fire while the field is focused. On the shipped editor, Command-S is still F09-T-006.

### F09-T-019 Show Save or Propose from the role

- Requirements: F09-REQ-030, F09-REQ-031, F09-REQ-032
- Test: `contributor propose does not write a revision` (F09-AC-030a). `owner and editor see save` (F09-AC-031a). `viewer has no save or propose` (F09-AC-032a).
- Size: several modules
- Depends on: F09-T-018, and on a signed-in role (F15)
- Modules: the save controls on the document. A Contributor sees `Propose` and not `Save`. Propose creates a proposal and not a revision. An Owner or an Editor sees `Save`, which follows F09-T-018. A Viewer sees neither and creates neither. There is no sign-in on the shipped routes, so F09-T-008 still applies until this step exists.

### F09-T-020 Merge or stop when the head moved

- Requirements: F09-REQ-033, F09-REQ-034, F09-REQ-035, F09-REQ-036
- Test: `a newer head shows the conflict banner` (F09-AC-033a). `save merges the three texts as lines` (F09-AC-034a). `a clean merge notices rebased onto latest` (F09-AC-035a). `a conflict opens the three texts and does not save` (F09-AC-036a).
- Size: several modules
- Depends on: F09-T-018
- Modules: a page banner reading `This document changed. Review changes.` (not a dialog), a three-way line merge, and a side-by-side resolver on the page. The merge splits on `\n`, does not parse YAML, does not sort keys, and does not treat list items as a set. A line changed on both sides in different ways, or two overlapping hunks, is a conflict. A clean merge saves and shows `Rebased onto latest`, with YAML key order taken from the surviving lines. A conflict does not save. The resolver shows the reader's text, the other text, and the base, and no revision is written until the reader submits a resolved document. The shipped disk banner `This page changed on disk.` is F08 and is not this banner.

### F09-T-021 Produce an empty diff for an untouched save

- Requirements: F09-REQ-037
- Test: `editing and saving an untouched document produces an empty diff` (F09-AC-037a).
- Size: one module
- Depends on: F09-T-018
- Module: the save path. The reader opens a document, changes nothing, and saves. The diff is empty. The save does not rewrite the Markdown. F09-AC-020a writes one YAML value, and F06-AC-022a returns `no_change` for identical proposal bytes. Neither is this step.
