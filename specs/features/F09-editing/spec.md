# F09 Editing

## Summary

Preview is the default. Editing turns the page into blocks in the same column, and Markdown source is a separate full-page editor, not a preview beside the source. What you type is stored in this browser, and Command-S or Control-S keeps a local version. The Ledger target specified after those shipped requirements is a frontmatter form, a structure-only slash menu, a `[[` picker with `@version`, image paste into `assets/`, a server draft every 2 seconds, a commit message on save, validation that blocks a save, Propose for a contributor, and a three-way merge banner. Inline CodeMirror live preview is a later option, not this editor.

## Status and scope

Partly built. This spec covers how editing turns on and off, how source is shown, and how a save is stored today.

Section 2.2 describes editing as source beside a preview, switched with ⌘/ and the Edit button. The code does not put source beside a preview. What shipped, and what this spec requires, is three modes:

| Mode | What fills the page | Status label |
| --- | --- | --- |
| Preview (the default) | The rendered page (F04) | Viewing |
| Editing | A block editor in the reading column | Editing |
| Source | The stored Markdown in a code editor, with no rendered column beside it | Markdown source |

⌘/ switches between editing and source. From preview it opens source. The Edit button turns editing on from preview, and turns it off (back to preview) from either editing or source. C2 and C8 are the requests that put preview first and added the Edit button. The layout that shipped is the one in this table.

F09-REQ-001 through F09-REQ-016 are the editor that shipped. Their text stays. That includes preview by default, the block editor in the reading column, full-page source, Command-/ or Control-/ between the block editor and source, the Edit button, and local drafts. D7's Owner and Editor save rule is not in force for that local save (F09-REQ-013, D3).

F09-REQ-017 states that inline CodeMirror live preview is not this editor. It stays a later option (ADR-0004).

F09-REQ-018 through F09-REQ-036 are the PRD editor target that did not ship. They do not change F09-REQ-001 through F09-REQ-016. F09-REQ-015 remains the frontmatter row when no type schema is loaded. F09-REQ-018 applies once a schema is loaded. The server draft, the commit message, Propose, and the revision merge apply where revisions and a signed-in role exist (ADR-0002, ADR-0003). Until then, the browser save in F09-REQ-009 through F09-REQ-013 stands.

The block editor can already insert a block with `/` and link a page with `[[`. Those built menus are wider than the target below, and opening one block's source is built. Neither is a shipped requirement. The requirements below are the target.

## Users and stories

There is no sign-in. The person at the keyboard can edit the copy in that browser. That is not a role and it does not change the repository file for anyone else.

- **F09-US-001** As a reader, I want the page to open as a document, so that reading does not start in an editor.
- **F09-US-002** As the owner, I want one control to turn editing on and off, and a shortcut to see the Markdown, so that I can change a page and still read the source.
- **F09-US-003** As the owner, I want typing to stay in this browser, and a shortcut to keep a version, so that an experiment note is not lost when I refresh.
- **F09-US-004** As the owner, I want frontmatter as a form, so that I can change a field without editing YAML by hand.
- **F09-US-005** As the owner, I want a slash menu of structure and a link picker that can pin a version, so that I can insert a heading or `[[slug@7]]` from the page.
- **F09-US-006** As the owner, I want a pasted image stored in `assets/`, so that the page links to a file in the space.
- **F09-US-007** As the owner, I want a server draft every 2 seconds and a commit message on save, so that a revision has a note and an interrupted edit comes back.
- **F09-US-008** As a contributor, I want Propose instead of Save, so that my change waits for review.
- **F09-US-009** As the owner, I want a banner when the document changed under me, so that a save merges or stops for a conflict.

## Requirements

**F09-REQ-001** The system shall open a page in preview unless this browser has stored `edit` or `source` under the key `markdown-kb:mode`. The stored value `split` shall be read as editing. Any other stored value shall be read as preview. The mode is one value for the browser, shared by every page and project.

**F09-REQ-002** When the reader activates the Edit control and the mode is preview, the system shall enter editing. When the mode is editing or source, the same control shall return to preview. In preview the control shall read `Edit`, with accessible name `Turn editing on` and pressed state false. In editing and in source it shall read `Editing`, with accessible name `Turn editing off` and pressed state true.

**F09-REQ-003** When the reader presses Command-/ or Control-/, the system shall enter source if the mode is preview or editing, and shall enter editing if the mode is source. The shortcut shall work while focus is in the source editor. It shall not leave the reader in preview.

**F09-REQ-004** When the reader presses `E` or `e`, a page is open, focus is not in a text field, the source editor, or another editable region, and no dialog or menu is open, the system shall enter editing. The key shall not leave editing.

**F09-REQ-005** When the address has `edit=1`, the system shall enter editing. When it has `edit=0`, the system shall enter preview. In either case the system shall remove the `edit` parameter from the address without reloading. A shared link uses this parameter to choose the starting mode and grants no right to change another person's files (C8).

**F09-REQ-006** While the mode is preview, the system shall show the rendered page (F04) and shall not show the source editor. The status line shall include `Viewing`.

**F09-REQ-007** While the mode is editing, the system shall show the page as blocks in the reading column and shall not show the source editor. The editable surface shall have the accessible name `Page content`. The status line shall include `Editing`.

**F09-REQ-008** While the mode is source, the system shall show the page's stored Markdown in a code editor that fills the page, with line wrapping and line numbers, and shall not show a rendered preview beside it. The outline shall be hidden. The status line shall include `Markdown source`. The editor type size shall be 13.5px, and 15px when the column is at most 640px wide.

**F09-REQ-009** When the page text changes, the system shall write the project workspace to this browser's local storage and shall not wait for a server draft. If the text differs from the repository base, the status shall read `Edited in this browser`. If the page has no repository origin, the status shall read `Created in this browser`. If the text matches the repository base, the status shall read `Repository copy`.

**F09-REQ-010** When the page text changes, and there is no local snapshot or the newest snapshot is more than 10 minutes old, the system shall store the previous text as a snapshot labeled `Before editing` before applying the change.

**F09-REQ-011** When the reader presses Command-S or Control-S on an open page, the system shall store the current text as a snapshot labeled `Saved version` and shall show the notice `Version saved`. The system shall keep at most 50 snapshots for that page, newest first. If the current text equals the newest snapshot, the system shall show `No changes since the last version` and shall not add a snapshot.

**F09-REQ-012** The system shall not write the built-in guide or specs projects back to their repository files. Where the open project is a folder on this computer and the local files API is available, the system shall send pending page changes 500 milliseconds after the last local write.

**F09-REQ-013** The system shall not require a signed-in role to edit or to save a local version. There is no sign-in (D3). D7's Owner and Editor save rule is not in force.

**F09-REQ-014** The status line shall show the page state, then the word count, then the mode label, for an open page. The word count shall be the number of whitespace-separated tokens in the stored source, including frontmatter. An open page whose trimmed source is empty shall show `0 words`. The writing page's repository source is 548 words.

**F09-REQ-015** While editing, if the frontmatter is a YAML map, the system shall show each scalar field other than `title` and `type` as a text field above the body, labeled with the field name. A non-scalar value shall be shown as JSON and shall not be a text field. The system shall not render enums as dropdowns, dates as date inputs, or links as pickers.

**F09-REQ-016** At a viewport 390px wide, the system shall keep preview and editing type at 17px, hide the outline, and not scroll the page sideways. On a coarse pointer the Edit control shall be 44px tall. In source, the editor type shall be 15px.

**F09-REQ-017** The current editor shall be the block editor in the reading column and the full-page source editor. Inline CodeMirror live preview, with syntax revealed on the cursor line, shall not be that editor. It remains a later option and shall not replace either surface.

**F09-REQ-018** Where a type schema is loaded for the open document, while editing, the system shall show the property header as one control per schema field. A string shall be a text field. A number shall be a numeric field. A date shall be a date input. An enum shall be a dropdown of the schema's values. A boolean shall be a checkbox. A list shall be a list of text values. A link shall be a document picker. Links shall be a list of document pickers. Metrics shall be numeric fields for the linked eval's metric keys.

**F09-REQ-019** Where a schema field has `pinned: true`, the link picker shall require an `@version` before that field counts as filled, and the stored value shall be `[[slug@n]]`.

**F09-REQ-020** When the reader changes one frontmatter control, the system shall write that value into the document's YAML and shall not rewrite any other line. While the mode is source, the system shall show that YAML as text.

**F09-REQ-021** When the reader types `/` at the start of a block in the block editor, the system shall open a menu whose only inserts are a heading, a table, a code block, a callout, a checklist, an image, and a link. Heading 1, Heading 2, and Heading 3 count as a heading. The callout insert may offer the GitHub alert kinds NOTE, TIP, IMPORTANT, WARNING, and CAUTION. The menu shall contain no item that sends text to a model. Choosing an item shall insert that structure and remove the `/` query.

**F09-REQ-022** When the reader types `[[` in the block editor, the system shall open a picker of documents in the space, narrowed by the text typed after `[[`. Choosing a document shall insert `[[slug]]`.

**F09-REQ-023** When the chosen document is a harness or an eval and the reader types `@`, the system shall list that document's saved versions. Choosing version n shall insert `[[slug@n]]`. That pin shall mean the earliest revision whose version is n.

**F09-REQ-024** When the reader pastes or drops an image while editing, the system shall store the bytes under `assets/` and insert a Markdown image whose target is that path. A file that already has a name shall keep that name. A paste with no name shall be named `image` plus the extension for png, jpeg, gif, webp, or svg. If that path is taken, the system shall append `-2`, `-3`, and so on, before the extension. The alt text shall be empty when the paste has none.

**F09-REQ-025** Where documents are stored as revisions, while the author is editing and the text differs from the last server draft, the system shall write an unsaved draft to the server within 2 seconds (2000 milliseconds) of the change, and shall not write that draft more than once per 2 seconds. The draft shall be private to the author. Another member opening the document shall not receive it.

**F09-REQ-026** Where the author has a server draft, when that author leaves the document and opens it again, the system shall restore the draft into the editor.

**F09-REQ-027** Where documents are stored as revisions, when the reader presses Command-S or Control-S and validation reports no error, the system shall open a one-line field labeled `Commit message` on the page, not in a dialog. The message shall be optional. Enter on an empty field shall create a revision with no message. Enter on text shall create a revision with that message. Escape shall close the field and shall not create a revision. While the field is focused, a single-character shortcut shall not fire.

**F09-REQ-028** If validation returns an error, when the reader presses Command-S or Control-S, or activates Save or Propose, the system shall not create a revision or a proposal, shall not open the commit-message field, and shall show each error inline beside its field or line, with the validator's code, message, and hint.

**F09-REQ-029** While validation returns warnings and no errors, the system shall show each warning inline beside its field or line, with the validator's code, message, and hint, and shall still allow Save or Propose.

**F09-REQ-030** Where the signed-in role is Contributor, the system shall show `Propose` and shall not show `Save`. Activating Propose, when validation reports no error, shall create a proposal and shall not create a revision.

**F09-REQ-031** Where the signed-in role is Owner or Editor, the system shall show `Save`. Activating Save shall follow F09-REQ-027.

**F09-REQ-032** Where the signed-in role is Viewer, the system shall show neither `Save` nor `Propose`, and shall not create a revision or a proposal from that document.

**F09-REQ-033** If another revision becomes the head while the document is open for editing, the system shall show a banner reading `This document changed. Review changes.` The banner shall not be a dialog.

**F09-REQ-034** When the reader saves while that banner is showing, and validation reports no error, the system shall run a three-way line merge of the base the editor opened, the current head, and the draft. The merge shall split each text on `\n`, shall not parse YAML, shall not sort keys, and shall not treat list items as a set. A line changed on both sides in different ways, or two changed hunks that overlap, is a conflict.

**F09-REQ-035** If that merge is clean, the system shall save the merged file as the revision and shall show the notice `Rebased onto latest`. YAML key order shall be the order of the surviving lines.

**F09-REQ-036** If that merge conflicts, the system shall not save, and shall open a side-by-side resolver on the page, not in a dialog, showing the reader's text, the other text, and the base. No revision shall be written until the reader submits a resolved document.

**F09-REQ-037** When the reader edits and saves an untouched document, the system shall produce an empty diff.

## Acceptance scenarios

### F09-AC-001a Preview is the default

Given a browser with no `markdown-kb:mode` entry, when `/guide/docs/writing` is opened, then the Edit control reads `Edit`, pressed is false, the status includes `Viewing` and `Repository copy`, and the stage is preview with no source editor.

Test name: `a fresh visit opens in preview`. Manual, passed. Chrome, local dev server, desktop 1280×900. The first load stored no mode until a control was used.

### F09-AC-001b One mode for the browser

Given editing was turned on for the writing page, when the probe page is opened in the same browser, then that page is in editing too.

Test name: `mode is shared across pages`. Manual, passed. Desktop. The probe page was removed after the check.

### F09-AC-002a Edit turns on and off

Given preview, when Edit is activated, then the control reads `Editing`, the accessible name is `Turn editing off`, pressed is true, the status includes `Editing`, and a block surface with accessible name `Page content` is shown. When Edit is activated again, then the control reads `Edit` and the status includes `Viewing`.

Test name: `Edit toggles preview and editing`. Manual, passed. Desktop and 390×844.

### F09-AC-003a Slash switches source and blocks

Given editing, when Control-/ is pressed, then the stage is source, the status includes `Markdown source`, a code editor is shown, and the rendered column is not. When Control-/ is pressed again, then the block surface returns. Given preview, when Control-/ is pressed, then source opens. Given source, when Edit is activated, then preview returns.

Test name: `Control-slash toggles source and editing`. Manual, passed. Desktop for both directions, and from preview on `/guide/docs/layout`. At 390px, Control-/ from editing also opened source. Command-/ was not pressed; the handler treats Command and Control as the same modifier, and the shortcut list says Ctrl on Linux and Windows.

### F09-AC-004a E starts editing

Given preview, when `E` is pressed with focus not in a field, then the mode becomes editing.

Test name: `E enters editing from preview`. Manual, passed. Desktop. The case of `E` typed inside the block editor or the source editor was not run; those surfaces are editable regions, so the key is a character there.

### F09-AC-005a The edit parameter sets the mode

Given the address `/guide/docs/writing?edit=1`, when the page loads, then editing is on and the address no longer contains `edit`.

Test name: `edit=1 opens editing and leaves the address`. Manual, passed. Desktop. `edit=0` was not loaded separately; it is the other branch of the same load step and removes the parameter the same way.

### F09-AC-006a Preview hides the editor

Given preview on the writing page, when the stage is inspected, then the rendered article is present, the source pane is absent, and the outline is shown at desktop width.

Test name: `preview shows the rendered page only`. Manual, passed. Desktop and 390px. At 390px the outline is hidden by the shell, not by the mode.

### F09-AC-007a Editing is blocks, not a split

Given editing, when the stage is inspected, then the block surface is in the reading column, the source pane is absent, and no second column shows the source.

Test name: `editing does not place source beside preview`. Manual, passed. Desktop and 390px. This is the check against the section 2.2 wording.

### F09-AC-008a Source is the stored Markdown

Given source on the writing page at 1280px, when the editor is measured, then the font size is 13.5px and the preview pane is absent. At 390px the font size is 15px.

Test name: `source fills the page at 13.5px and 15px`. Manual, passed. Both viewports. Line numbers and wrapping are set on the editor and were not counted node by node. The empty-editor placeholder `Start writing…` was not shown, because every opened page had text.

### F09-AC-009a Typing marks the page edited

Given source on the repository writing page, when one character is typed, then the status reads `Edited in this browser 548 words Markdown source`. The token count stayed 548 for that edit. The repository file on disk was not modified.

Test name: `a local edit is marked edited in this browser`. Manual, passed. Desktop, source mode. `Created in this browser` was not opened; no page was created in the browser during this check.

### F09-AC-010a Quiet snapshot

Given a page with no snapshot, or a newest snapshot older than 10 minutes, when the text changes, then the previous text is stored with the label `Before editing`.

Test name: `a quiet period of 10 minutes stores Before editing`. Manual, not run. Waiting 10 minutes was not part of the browser check. The rule is the history store: 10 minutes is 600000 milliseconds, and the label is `Before editing`.

### F09-AC-011a Save a version

Given an open page whose text differs from the newest snapshot, when Control-S is pressed, then a notice reads `Version saved`. When Control-S is pressed again without a further change, then the notice reads `No changes since the last version`.

Test name: `Control-S saves a version and reports a repeat`. Manual, passed. Desktop, on the writing page after entering editing, and again after a source edit. The 50-snapshot cap was not filled.

### F09-AC-012a Repository projects stay in the browser

Given the guide project, when a character is typed, then the status says the edit is in this browser. The guide project is not marked for disk sync, so the dev server does not receive that write.

Test name: `guide edits are not posted as repository writes`. Manual, passed for the status. A disk-folder project was not opened, so the 500 millisecond send was not timed in the browser. The send and the conflict merge are covered by `pending changes follow origin and base` and `a disk edit updates an untouched page and keeps local typing`, automated, passed (`npm test`).

### F09-AC-013a No role check

Given no signed-in session, when Edit and Control-S are used, then both succeed.

Test name: `editing and saving do not ask for a role`. Manual, passed. Desktop. No sign-in screen exists on these routes.

### F09-AC-014a Word count

Given the repository source of `content/docs/writing.md`, when tokens are counted by trimming and splitting on whitespace, then the count is 548. The status line on that page reads `548 words`.

Test name: `status word count matches the stored source`. Manual, passed. Desktop and 390px, preview. The count includes frontmatter and Markdown marks.

### F09-AC-015a Scalar fields while editing

Given editing and frontmatter that is a map with a scalar field other than `title` and `type`, when the page is shown, then that field is a text input above the body.

Test name: `scalar frontmatter is a text field while editing`. Manual, not run. No seeded page has an extra scalar field, and the probe page's frontmatter was not a map. The row is `components/block-editor/properties.tsx`. Non-scalar JSON and the tooltip `Edit in Markdown source (⌘/)` were not shown in the browser.

### F09-AC-016a Narrow editing

Given a 390×844 viewport with a coarse pointer, when the writing page is shown in preview, editing, and source, then the Edit control is 44px tall, preview and editing type stay 17px, the outline is not shown, source type is 15px, and the page does not scroll sideways.

Test name: `390px editing keeps 17px type and a 44px Edit control`. Manual, passed. Chrome, local dev server.

### F09-AC-017a Inline live preview is not this editor

Given the writing page is in editing, when the stage is shown, then the surface is the block editor in the reading column and not a CodeMirror buffer with syntax revealed on the cursor line.

Test name: `editing is blocks, not inline live preview`. Not run as a new check. The shipped block surface is F09-AC-002a, which passed. This scenario records that inline live preview is the later option in F09-REQ-017.

### F09-AC-018a Frontmatter is a form

Given a loaded schema whose fields include an enum `status`, a date `date`, and a link `harness`, when the document is in editing, then `status` is a dropdown of the schema's values, `date` is a date input, and `harness` is a document picker.

Test name: `schema fields render as dropdown, date, and picker`. Not run. No type schema is loaded in the editor that shipped.

### F09-AC-019a A pinned link needs a version

Given a schema field `harness` with `pinned: true`, when the reader picks `memento-journal` and does not choose a version, then the field is not filled. When the reader chooses version 7, then the stored value is `[[memento-journal@7]]`.

Test name: `pinned link stores slug at version`. Not run.

### F09-AC-020a A field writes one YAML value

Given the form is showing, when the reader sets `status` to `concluded` and switches to source, then the YAML contains `status: concluded` and no other line changed because of that edit.

Test name: `one form edit writes one YAML value`. Not run.

### F09-AC-021a Slash menu is structure only

Given the block editor, when the reader types `/` at the start of a block, then the menu offers a heading, a table, a code block, a callout, a checklist, an image, and a link, and no item that sends text to a model. When the reader chooses a heading, then a heading is inserted and the `/` query is gone.

Test name: `slash menu inserts structure only`. Not run. The built menu also lists diagrams, charts, and math; that wider menu is not this requirement.

### F09-AC-022a Bracket opens a document picker

Given the block editor, when the reader types `[[mem`, then the picker lists documents in the space whose title or slug matches that text. When the reader chooses a doc with slug `writing`, then the editor inserts `[[writing]]`.

Test name: `double bracket inserts a document link`. Not run as this scenario. The built picker has no version step.

### F09-AC-023a At-sign picks a version

Given the picker has the harness `memento-journal` selected, when the reader types `@` and chooses 7, then the inserted text is `[[memento-journal@7]]`, and that pin is the earliest revision whose version is 7.

Test name: `at-sign pins the earliest version`. Not run.

### F09-AC-024a Paste stores an image in assets

Given the block editor, when the reader pastes a PNG that has no file name, then the bytes are stored at `assets/image.png`, or `assets/image-2.png` if that path is taken, and the page contains a Markdown image link to that path with empty alt text.

Test name: `pasted image lands in assets`. Not run.

### F09-AC-025a Server draft every 2 seconds

Given revisions are stored and the author types one character and stops, when 2 seconds have passed, then the server holds a draft of that text for that author only, and no second draft write was made before 2 seconds. Another member opening the document does not receive the draft.

Test name: `draft writes once within 2 seconds and stays private`. Not run. The shipped editor writes local storage and does not wait on a server (F09-REQ-009).

### F09-AC-026a Returning restores the draft

Given the author has a server draft that differs from the head, when that author leaves and opens the document again, then the editor shows the draft.

Test name: `return restores the author's server draft`. Not run.

### F09-AC-027a Command-S asks for a commit message

Given revisions are stored and validation reports no error, when the reader presses Command-S, then a one-line field labeled `Commit message` is focused on the page and no dialog opens. When the reader presses Enter on an empty field, then a revision is created with no message. When the field contains `note the harness` and the reader presses Enter, then the revision message is `note the harness`. When the reader presses Escape, then no revision is created.

Test name: `command-s opens an optional commit message`. Not run. On the shipped editor, Command-S stores a local snapshot (F09-AC-011a).

### F09-AC-028a Errors block the save

Given a required field is missing, when the reader activates Save, then no revision is created, the commit-message field does not open, and `field_missing` is shown inline beside that field with the validator's message and hint.

Test name: `a validation error blocks save`. Not run.

### F09-AC-029a Warnings do not block

Given the only validation result is a warning, when the reader activates Save and confirms the commit message, then the warning is shown inline and a revision is created.

Test name: `a warning still allows save`. Not run.

### F09-AC-030a A contributor sees Propose

Given the signed-in role is Contributor and the document is in editing, when the title row is shown, then the control reads `Propose` and does not read `Save`. When the reader activates Propose and validation reports no error, then a proposal is created and the head revision is unchanged.

Test name: `contributor propose does not write a revision`. Not run. There is no sign-in on the shipped routes (F09-REQ-013).

### F09-AC-031a Owner and Editor see Save

Given the signed-in role is Owner, or the role is Editor, when the document is in editing, then the control reads `Save`.

Test name: `owner and editor see save`. Not run.

### F09-AC-032a A viewer cannot save or propose

Given the signed-in role is Viewer, when the document is open, then neither `Save` nor `Propose` is shown, and no revision or proposal is created from that page.

Test name: `viewer has no save or propose`. Not run.

### F09-AC-033a A newer revision shows the banner

Given the document is open for editing, when another revision becomes the head, then a banner reads `This document changed. Review changes.` and it is not a dialog.

Test name: `a newer head shows the conflict banner`. Not run. The shipped disk banner is `This page changed on disk.` and is a different case.

### F09-AC-034a Save runs a line merge

Given the banner is showing and validation reports no error, when the reader saves, then the merge input is the base, the head, and the draft, split on newline, with YAML keys left in the order the surviving lines have.

Test name: `save merges the three texts as lines`. Not run.

### F09-AC-035a A clean merge saves

Given the reader's edit and the other revision change different lines, when the reader saves, then the revision is the merged file and the notice is `Rebased onto latest`.

Test name: `a clean merge notices rebased onto latest`. Not run.

### F09-AC-036a A conflict does not save

Given both sides changed the same line, when the reader saves, then no revision is written and the page shows the reader's text, the other text, and the base side by side, not in a dialog.

Test name: `a conflict opens the three texts and does not save`. Not run.

### F09-AC-037a An untouched save is an empty diff

Given a document the reader has opened and not changed, when the reader saves, then the diff is empty.

Test name: `editing and saving an untouched document produces an empty diff`. Not run.

## Edge cases and errors

The shipped local save has no product error code. Where a message exists for that save, it is the whole report, and there is no hint.

| Situation | Code | Message | Hint |
| --- | --- | --- | --- |
| Local storage refuses the workspace write | None | `This browser is out of room for pages. Export a project, then empty its Trash.` The previous stored workspace is kept. | None. Not raised in the browser. |
| Command-S when nothing changed since the newest snapshot | None | `No changes since the last version` | None. Observed. |
| Command-S when the snapshot is stored | None | `Version saved` | None. Observed. |
| Command-S when the snapshot cannot be stored and older snapshots exist | None | `No changes since the last version` | None. The notice does not say the write failed. Not raised in the browser. |
| Disk save request fails, and the local files API is on | None | `Couldn't save pages to disk. They'll be tried again.` | None. Not raised in the browser. The client retries after 2 seconds, and stops scheduling after 4 failed responses. |
| The files API responds 404 | None | None. Sync stops. The guide and specs projects never start it. | None |
| The disk file changed while this browser also has edits | None | Banner: `This page changed on disk.` Button: `Load disk version`. | None. Not shown in the browser. The guide project does not sync. |
| Frontmatter is not a map, while editing | None | No `.block-error` on the probe page in editing. Preview shows the F04 message. | None. Observed. |

The page menu item `View Markdown source` (hint ⌘/) and, in source, `Edit as blocks` (hint ⌘/) call the same mode change as F09-REQ-003. The menu was not clicked. The shortcut was.

Creating a page from the tree, from an empty project, or from the missing-page button enters editing. Opening a folder of files enters preview. Those actions were not clicked in this check.

A notice stays up for 6 seconds.

The Ledger target uses the validator's code, message, and hint (F06). F09 shows that triple inline. It does not define each rule's condition. Errors block a revision and a proposal. Warnings do not.

| Situation | Code | Message | Hint |
| --- | --- | --- | --- |
| Save or Propose while validation returns an error | The validator's code. Blocking codes are `yaml_invalid`, `type_unknown`, `field_missing`, `field_kind`, `link_broken` in frontmatter, `link_unpinned`, `version_missing`, `metric_unknown`, `metric_range`, `path_invalid`, `slug_taken`, `base_missing`, `no_change`, and `too_large`. | The validator's message, inline beside the field or line. No revision and no proposal. | The validator's hint. |
| Save or Propose while validation returns only warnings | The validator's code. Warning codes are `field_unknown`, `link_broken` in the body, `metric_missing`, `version_not_bumped`, `section_missing`, `chart_invalid`, `math_invalid`, `embed_broken`, and `mermaid_invalid`. | The validator's message, inline. The save or proposal still proceeds. | The validator's hint. |
| Server draft write fails | `draft_failed` | `Couldn't save the draft. It will be tried again.` The draft stays in this browser, and the next try is on the following 2-second interval. | `Keep this page open. The draft stays in this browser until the server accepts it.` |
| Another member opens a document that has someone else's draft | None | The head document. The draft is not shown. | None |
| Head moves during editing | None | Banner: `This document changed. Review changes.` | None |
| Clean three-way merge | None | `Rebased onto latest` | None |
| Conflicting three-way merge | None | No message in place of the resolver. The resolver shows the reader's text, the other text, and the base. Nothing is written. | None |
| Contributor | None | Control: `Propose` | None |
| Viewer | None | Neither `Save` nor `Propose`. | None |

## Limits and budgets

No percentile save budget is published. The numbers below are the implemented limits.

- Mode storage key: `markdown-kb:mode`. Workspace key: `markdown-kb:workspace:{project}`, with the older `markdown-kb:workspace` still read for the guide project. Snapshot key: `markdown-kb:history:{page id}`.
- Snapshots: at most 50 per page. Quiet snapshot gap: 10 minutes (600000 milliseconds).
- Disk send delay, when the local files API is on and the project syncs: 500 milliseconds after the last write. Remote check interval: 3 seconds, plus another check when the window gains focus. Failed send retry: 2 seconds, up to 4 failures.
- Notice duration: 6 seconds.
- Source type: 13.5px, and 15px at a column width of at most 640px. Measured in Chrome at 1280px and 390px.
- Edit control: 28px tall on a fine pointer at 1280px, and 44px tall on a coarse pointer at 390px. Measured.
- Word count on `content/docs/writing.md`: 548 words.

The numbers below are the Ledger target. They are not measured on the shipped editor.

- Server draft interval: within 2 seconds (2000 milliseconds) of a change, and at most one write per 2 seconds. The draft is private to the author.
- Document size that validation rejects as `too_large`: over 200 KB.
- Clean-merge notice: `Rebased onto latest`.
- Conflict banner: `This document changed. Review changes.`

## UI states

| State | Desktop (1280px) | 390px wide |
| --- | --- | --- |
| Success, preview | Control `Edit`. Status `Repository copy`, `548 words`, `Viewing`. Rendered column. Outline visible. | Control `Edit`, 44px tall. Same status. Outline hidden. Type 17px. |
| Success, editing | Control `Editing`. Status includes `Editing`. Block surface in the column. No source pane. | Same, 44px control, type 17px, outline hidden. |
| Success, source | Control still `Editing`. Status `Markdown source`. Code editor only. Outline hidden. Type 13.5px. | Type 15px. Outline hidden. No sideways page scroll. |
| Empty | A missing path shows the F03 screen, not an editor. An empty editor would show `Start writing…`. That placeholder was not on screen. | The missing screen was not reopened at 390px. |
| Loading | The block editor's loading marker is `aria-busy="true"` with no sentence. It was not caught on screen; the block surface was present when the check looked. | Same. |
| Error | Notices and the disk banner use the copy in the table above. Quota and disk errors were not raised. | Not raised. |
| Partial | `Edited in this browser` means the local text differs from the repository base. The share sheet, not opened in this check, says `Your edits live in this browser. The link opens the repository copy.` | The edited status was checked at desktop only. |
| Target, form | Property header as schema controls. Source shows the YAML those controls write. | Same controls, stacked in the column, no sideways page scroll. Not built. |
| Target, slash and links | Menu of heading, table, code block, callout, checklist, image, and link. `[[` picker, then `@` for a harness or eval version. | Same menu and picker. Not built. |
| Target, save | Field `Commit message` on the page. Owner and Editor see `Save`. Contributor sees `Propose`. Viewer sees neither. | Same copy, stacked in the column. Not built. |
| Target, draft | No sentence while a draft is current. After a failed write, `Couldn't save the draft. It will be tried again.` | Same copy. Not built. |
| Target, conflict | Banner `This document changed. Review changes.` Clean merge notice `Rebased onto latest`. Conflict shows the reader's text, the other text, and the base. | Same copy, stacked, no sideways page scroll. Not built. |

Production `https://markdown-kb-editor.vercel.app/guide/docs/writing` returned `Edit`, `Turn editing on`, `Repository copy`, and `Viewing` in the HTML. Production was not clicked, so editing, source, and save were not exercised there.

## Out of scope

- Building inline CodeMirror live preview. F09-REQ-017 keeps it a later option and not the current editor. Command-/ in the shipped editor switches the block editor and full-page source.
- The Editor support slash catalog: Mermaid starters, charts, math, footnotes, CSV blocks, embeds, and `<details>`. F09-REQ-021 is structure only.
- Table cell navigation (Editor, Behavior).
- Run-log attachments beyond `assets/` (D8). Image paste into `assets/` is F09-REQ-024.
- How a wiki link resolves, embeds, and "Linked from" (F03). The picker in F09-REQ-022 and F09-REQ-023 only inserts the link text.
- Rendering of preview (F04). The outline column (F08). The share sheet's access copy beyond the `edit` parameter (F11).
- The validation rule conditions (F06). F09 shows the validator's code, message, and hint, and blocks on errors.
- Sign-in, sessions, and how a role is assigned (F15). The Save and Propose labels apply where a role is already signed in.
- The proposal review screen (F12). Propose creates a proposal; it does not review one.
- The type picker for a new document (New documents).
- The disk banner `This page changed on disk.` That remains the local-folder case in the table above. The revision banner is F09-REQ-033.

## Open questions

| Question | Owner | Blocks |
| --- | --- | --- |
| After sign-in, does "Can edit" on a link stay only a starting mode, with save rights coming from a role? Plan question Q3 recommends that. | Product owner | F11 and F15. It does not change today's local save. |
| Should the quiet snapshot stay at 10 minutes, or follow a different gap? | Product owner | A change to F09-REQ-010. The built gap is 10 minutes. |

Saving's 2-second server draft is F09-REQ-025. It is not an open question. The shipped save stays local until revisions exist (ADR-0003).

Plan question Q4 is closed: blocks in the column, source on its own, preview by default. Inline CodeMirror live preview is the later option in F09-REQ-017, not the current editor (ADR-0004).

ADR-0017 and ADR-0022 are Proposed. This spec follows them for the pin target and the line merge. A different decision would replace F09-REQ-023 and F09-REQ-034 through F09-REQ-036.

## Trace

- PRD Editor, and Behavior: live preview is not this editor (F09-REQ-017); frontmatter form (F09-REQ-018 through F09-REQ-020); `[[` picker and `@` version (F09-REQ-022, F09-REQ-023); slash menu of structure only (F09-REQ-021); image paste into `assets/` (F09-REQ-024).
- PRD Saving: server draft every 2 seconds (F09-REQ-025, F09-REQ-026); Command-S commit message (F09-REQ-027); errors block a save (F09-REQ-028); warnings do not (F09-REQ-029); contributors see Propose (F09-REQ-030); Owner and Editor see Save (F09-REQ-031); a Viewer sees neither (F09-REQ-032).
- PRD Conflicts: banner `This document changed. Review changes.` (F09-REQ-033); three-way merge (F09-REQ-034, F09-REQ-035); side-by-side resolver (F09-REQ-036).
- PRD acceptance: editing and saving an untouched document produces an empty diff (F09-REQ-037).
- PRD Links: `[[slug@7]]` is a harness or eval at a version. PRD Validation, Behavior: errors block proposals and saves; warnings do not. PRD Roles per space, and Keyboard shortcuts (`⌘S` saves a revision).
- Plan section 2.2, row "Editor model": the shipped modes replace inline live preview for this editor. The row's phrase "source beside a preview" is not what the code does. C2, C8. ADR-0004.
- Plan section 2.2, row "Storage": the shipped save is files in `content/` and drafts in browser local storage. The Ledger target adds the server draft. D2, D5. ADR-0003.
- Plan section 2.2, rows "Reading type" and "Phones": 17px and editing on a narrow screen. C4.
- Plan section 2.2, row "Sharing": the link sets the starting mode and grants no rights. C8.
- Plan section 2.2, row "Modals": editing does not use a dialog for the commit field or the resolver. ADR-0009.
- Decisions: D3 (no sign-in for the shipped save), D5, D6 (markdown-kb), D7 (Owner and Editor save, contributors propose, once a role exists), D8 (run-log attachments stay out; `assets/` is the image path).
- Change requests: C2, C4, C8.
- ADRs: ADR-0002, ADR-0003, ADR-0004, ADR-0009, ADR-0017, ADR-0022, ADR-0024.
- Code for the shipped requirements: `components/draft-store.ts`, `components/document-chrome.tsx`, `components/use-editor-keys.ts`, `components/preview-stage.tsx`, `components/editor.tsx`, `components/workspace.tsx`, `components/history-store.ts`, `components/workspace-store.ts`, `components/disk-sync.ts`, `components/block-editor/properties.tsx`, `components/shortcut-help.tsx`.
