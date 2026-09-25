# F09 Editing

## Summary

Preview is the default. Editing turns the page into blocks in the same column, and Markdown source is a separate full-page editor, not a preview beside the source. What you type is stored in this browser, and Command-S or Control-S keeps a local version.

## Status and scope

Partly built. This spec covers how editing turns on and off, how source is shown, and how a save is stored today.

Section 2.2 describes editing as source beside a preview, switched with ⌘/ and the Edit button. The code does not put source beside a preview. What shipped, and what this spec requires, is three modes:

| Mode | What fills the page | Status label |
| --- | --- | --- |
| Preview (the default) | The rendered page (F04) | Viewing |
| Editing | A block editor in the reading column | Editing |
| Source | The stored Markdown in a code editor, with no rendered column beside it | Markdown source |

⌘/ switches between editing and source. From preview it opens source. The Edit button turns editing on from preview, and turns it off (back to preview) from either editing or source. C2 and C8 are the requests that put preview first and added the Edit button. The layout that shipped is the one in this table.

Not started: the PRD editor's inline live preview, the schema-driven frontmatter form (dropdowns, date fields, link fields), server drafts every 2 seconds, the one-line commit message, blocking a save on validation, "Propose" for contributors, and the three-way conflict resolver. D7's rule that Owner and Editor may save, and contributors propose, waits on sign-in (D3).

The block editor can insert a block with `/`, link a page with `[[`, and open one block's source. Those behaviors are built and are not requirements in this spec. A later pass of F09 owns them. While editing, scalar frontmatter other than `title` and `type` is a text field above the body; that limited row is specified below. It is not the PRD form.

## Users and stories

There is no sign-in. The person at the keyboard can edit the copy in that browser. That is not a role and it does not change the repository file for anyone else.

- **F09-US-001** As a reader, I want the page to open as a document, so that reading does not start in an editor.
- **F09-US-002** As the owner, I want one control to turn editing on and off, and a shortcut to see the Markdown, so that I can change a page and still read the source.
- **F09-US-003** As the owner, I want typing to stay in this browser, and a shortcut to keep a version, so that an experiment note is not lost when I refresh.

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

## Edge cases and errors

No save failure in this feature has a product error code. Where a message exists, it is the whole report, and there is no hint.

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

## Limits and budgets

No percentile save budget is published. The numbers below are the implemented limits.

- Mode storage key: `markdown-kb:mode`. Workspace key: `markdown-kb:workspace:{project}`, with the older `markdown-kb:workspace` still read for the guide project. Snapshot key: `markdown-kb:history:{page id}`.
- Snapshots: at most 50 per page. Quiet snapshot gap: 10 minutes (600000 milliseconds).
- Disk send delay, when the local files API is on and the project syncs: 500 milliseconds after the last write. Remote check interval: 3 seconds, plus another check when the window gains focus. Failed send retry: 2 seconds, up to 4 failures.
- Notice duration: 6 seconds.
- Source type: 13.5px, and 15px at a column width of at most 640px. Measured in Chrome at 1280px and 390px.
- Edit control: 28px tall on a fine pointer at 1280px, and 44px tall on a coarse pointer at 390px. Measured.
- Word count on `content/docs/writing.md`: 548 words.

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

Production `https://markdown-kb-editor.vercel.app/guide/docs/writing` returned `Edit`, `Turn editing on`, `Repository copy`, and `Viewing` in the HTML. Production was not clicked, so editing, source, and save were not exercised there.

## Out of scope

- Inline live preview, syntax revealed on the cursor line, and ⌘/ as a raw-source toggle inside that preview (Editor). Not started. ⌘/ in the built app switches source and blocks.
- The schema-driven frontmatter form, the `[[` version picker, the slash menu's full catalog, image upload, and table cell navigation (Editor). The slash menu and page picker are built and are not requirements here. Image upload is also out of scope under D8.
- Server drafts every 2 seconds, the commit-message field, validation that blocks a save, and Propose instead of Save (Saving). Not started.
- The banner `This document changed. Review changes.` and the three-way merge resolver (Conflicts). Not started. The disk banner above is the local-folder behavior only.
- Wiki resolution, embeds, and "Linked from" (F03). Rendering of preview (F04). The outline column (F08). The share sheet's access copy beyond the `edit` parameter (F11).
- Proposals, the validation engine, and sign-in.

## Open questions

| Question | Owner | Blocks |
| --- | --- | --- |
| After sign-in, does "Can edit" on a link stay only a starting mode, with save rights coming from a role? Plan question Q3 recommends that. | Product owner | F11 and F15. It does not change today's local save. |
| Should server drafts, once storage exists, still autosave every 2 seconds, as Saving asks? | Product owner | The unbuilt server draft. Today's save is local. |
| Should the quiet snapshot stay at 10 minutes, or follow a different gap? | Product owner | A change to F09-REQ-010. The built gap is 10 minutes. |

Plan question Q4, the editor model, is closed for this spec by the behavior above: blocks in the column, source on its own, preview by default. Inline live preview stays not started.

## Trace

- PRD sections: Editor (Behavior, Saving, Conflicts, New documents); Markdown capabilities is F04.
- Plan section 2.2, row "Editor model": the PRD's CodeMirror live preview is replaced by the built modes. The row's phrase "source beside a preview" is not what the code does; this spec records the three modes. C2, C8.
- Plan section 2.2, row "Storage": files in `content/`, drafts in browser local storage, not a server draft every 2 seconds. D5. D2's hosted database is not this save path.
- Plan section 2.2, rows "Reading type" and "Phones": 17px and editing on a narrow screen. C4.
- Plan section 2.2, row "Sharing": the link sets the starting mode and grants no rights. C8.
- Decisions: D3 (no sign-in), D5, D6 (markdown-kb), D7 (the later save rule, not in force), D8 (attachments not in this editor).
- Change requests: C2, C4, C8.
- ADRs: none recorded yet.
- Code: `components/draft-store.ts`, `components/document-chrome.tsx`, `components/use-editor-keys.ts`, `components/preview-stage.tsx`, `components/editor.tsx`, `components/workspace.tsx`, `components/history-store.ts`, `components/workspace-store.ts`, `components/disk-sync.ts`, `components/block-editor/properties.tsx`, `components/shortcut-help.tsx`.
