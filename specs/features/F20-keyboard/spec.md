# F20 Keyboard

## Summary

The keyboard shortcuts that exist open search, settings, and shortcut help, and they switch the open page between viewing, editing, and Markdown source. Review shortcuts from the PRD are not started.

## Status and scope

Partly built. This spec is the behavioral spec for shortcuts. The key list with scopes is `specs/contracts/keymap.md`, which this spec does not define.

Built and required here:

| Keys | What it does |
| --- | --- |
| Command-K or Control-K | Open page search and close shortcut help |
| Command-/ or Control-/ | Switch between Markdown source and editing |
| Command-\ or Control-\ | Show or hide the outline |
| Command-S or Control-S | Save a version of the open page |
| Command-, or Control-, | Toggle settings |
| `?` while not typing in a field | Open shortcut help and close search |
| `E` while not typing, with a page open and no dialog | Start editing |
| `C` while not typing and no dialog | Start a new page in the open folder |
| Escape | Close search, shortcut help, and the phone file drawer. Settings and share close themselves on Escape. |
| `/` while editing, outside a code fence | Open the block insert menu |
| `[[` while editing | Open a page picker of up to 8 pages |

The shortcut help dialog lists those shell shortcuts and says "On Linux and Windows, Ctrl is the modifier."

Not started. These PRD "Keyboard shortcuts" and review keys are not required:

| Keys | PRD action |
| --- | --- |
| `G` then `I`, `G` then `T`, `G` then `M` | Go to Inbox, Timeline, or Metrics |
| `M`, `R`, and `C` in review | Merge, reject, or request changes. `C` outside a dialog creates a page instead. |
| `D` in review | Toggle rendered and source diff |
| `J` and `K` | Next and previous item in a list |
| `E` in review | Edit before merge. `E` on a page starts editing instead. |

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual. Control was the modifier that was pressed. Command was pressed for Command-K at 390px.

## Users and stories

No sign-in exists (decision D3). Anyone who can open a page may use these shortcuts. There is no other role and no refusal.

- F20-ST-001 As the owner, I want the shell shortcuts to work from the keyboard, so that I can search, change mode, and open settings without the pointer.
- F20-ST-002 As the owner, I want a list of those shortcuts, so that I can see what the build actually answers.
- F20-ST-003 As the owner, I want single keys to stay quiet while I type, so that writing a page does not fire them.

## Requirements

- F20-REQ-001 When the owner presses Command-K or Control-K, the system shall open page search and close shortcut help, including while the owner is typing in a field.
- F20-REQ-002 When the owner presses Command-/ or Control-/, the system shall switch to Markdown source if the mode is not source, and to editing if the mode is source.
- F20-REQ-003 When the owner presses Command-\ or Control-\, the system shall toggle the outline choice.
- F20-REQ-004 When the owner presses Command-S or Control-S and a page is open, the system shall save a version of that page.
- F20-REQ-005 When the owner presses Command-, or Control-,, the system shall toggle the settings dialog.
- F20-REQ-006 When the owner presses `?` and the focus is not in a text field, the system shall open shortcut help and close page search.
- F20-REQ-007 While shortcut help is open, the system shall list Search pages (⌘K), Switch between blocks and Markdown source (⌘/), Show or hide the outline (⌘\), Start editing (E), Insert a block while editing (/), Link to a page while editing ([[), Create a page (C), Save a version (⌘S), Open settings (⌘,), and Show this list (?), and shall show "On Linux and Windows, Ctrl is the modifier."
- F20-REQ-008 When the owner presses `E` with a page open, no dialog open, and the focus outside a text field, the system shall start editing and shall not turn editing off.
- F20-REQ-009 When the owner presses `C` with no dialog open and the focus outside a text field, the system shall open the file column and start a new page in the open page's folder.
- F20-REQ-010 If `C` or `E` is pressed while a dialog is open, or while the owner is typing in a field, then the system shall not run that shortcut.
- F20-REQ-011 When the owner presses Escape, the system shall close page search, shortcut help, and the phone file drawer.
- F20-REQ-012 While the owner is editing and types `/` at the start of a block that is not a code fence, the system shall open the block insert menu.
- F20-REQ-013 While the owner is editing and types `[[`, the system shall open a picker of up to 8 pages whose title or path contains the text typed after `[[`.
- F20-REQ-014 The system shall not bind `G` `I`, `G` `T`, `G` `M`, review `M`, review `R`, review `C`, review `D`, or `J` and `K`.

F20-REQ-002 does not return to viewing. From viewing, the first press opens Markdown source. The Edit control, not this chord, returns to viewing.

## Acceptance scenarios

### F20-AC-001a Control-K opens search

Test name: `control k opens page search`

Given a page is open, when the owner presses Control-K, then the search dialog is visible.

Checked: ran, Chrome, 1280×800. Command-K ran at 390×844 and also opened it.

### F20-AC-002a Slash chord opens source

Test name: `control slash from viewing opens markdown source`

Given the mode is viewing, when the owner presses Control-/, then the status line says "Markdown source" and the source editor is shown.

Checked: ran, Chrome, 1280×800.

### F20-AC-002b Slash chord returns to editing

Test name: `control slash from source returns to editing`

Given the mode is Markdown source, when the owner presses Control-/, then the mode is editing.

Checked: manual. The first press from viewing was run. The return press was not. The handler sets editing when the mode is source.

### F20-AC-003a Outline chord

Test name: `control backslash toggles the outline`

Given the outline is open at 1280px, when the owner presses Control-\, then the outline column is gone and the page uses the width beside the file column.

Checked: ran, Chrome, 1280×800. After the toggle the columns were 248px and 1032px.

### F20-AC-004a Save a version

Test name: `control s saves a version`

Given a page is open, when the owner presses Control-S, then a version is saved and the notice is "Version saved", or "No changes since the last version" when the text matches the last version.

Checked: manual. The chord was not pressed. The notice strings are the save action's two messages.

### F20-AC-005a Settings chord

Test name: `control comma opens settings`

Given settings is closed, when the owner presses Control-,, then the settings dialog is visible.

Checked: ran, Chrome, 1280×800.

### F20-AC-006a Question mark opens help

Test name: `question mark opens shortcut help`

Given focus is not in a text field, when the owner presses `?`, then the shortcut dialog is visible.

Checked: ran, Chrome, 1280×800.

### F20-AC-007a Help lists the built shortcuts

Test name: `shortcut help lists the built keys`

Given shortcut help is open, when the list renders, then it shows the ten rows in F20-REQ-007 and the sentence "On Linux and Windows, Ctrl is the modifier."

Checked: ran, Chrome, 1280×800. The captured list matched those rows and did not include Inbox, Merge, or J and K.

### F20-AC-008a E starts editing

Test name: `e starts editing and does not toggle off`

Given a page is in viewing and no dialog is open, when the owner presses `E`, then the mode becomes editing. Pressing `E` again leaves it in editing.

Checked: manual. Editing was turned on with the Edit control and with `?edit=1`, not with the `E` key.

### F20-AC-009a C starts a page

Test name: `c starts a new page in the open folder`

Given `docs/layout.md` is open and no dialog is open, when the owner presses `C`, then the file column opens and a new-page field is ready in `docs`.

Checked: manual. `C` was not pressed, so a page was not created during the check.

### F20-AC-010a Single keys stay quiet

Test name: `c and e do nothing while typing or in a dialog`

Given the search field is focused, or a dialog is open, when the owner presses `C` or `E`, then the mode stays the same and no new-page field opens.

Checked: manual. The handler skips those keys while typing or while an overlay is open. It was not pressed in those states.

### F20-AC-011a Escape closes search

Test name: `escape closes search and shortcut help`

Given search is open, when the owner presses Escape, then search is closed. Given shortcut help is open, Escape closes it.

Checked: ran, Chrome, 1280×800, both dialogs. The phone drawer was closed with the scrim, not with Escape.

### F20-AC-012a Slash menu

Test name: `slash while editing opens the block menu`

Given the owner is editing a normal block, when they type `/`, then the block insert menu opens. Inside a code fence, `/` does not open it.

Checked: manual. The menu was not opened in the browser. The editor binds `/` as the suggestion character and refuses it inside a code fence.

### F20-AC-013a Page picker

Test name: `double bracket while editing opens the page picker`

Given the owner is editing, when they type `[[`, then a picker lists up to 8 pages matching the following text.

Checked: manual. `[[` was not typed in the browser. The editor binds that character and slices the match list to 8.

### F20-AC-014a Review keys are absent

Test name: `shortcut help omits review chords`

Given shortcut help is open, when the owner reads the list, then Merge, Reject, Request changes, Inbox, Timeline, Metrics, and J and K are not listed.

Checked: ran, Chrome, 1280×800, by reading the help dialog. The keys were not pressed to prove they do nothing.

## Edge cases and errors

These shortcuts do not show a coded error.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Command-S or Control-S with no page open | none shown | nothing is saved and no message is shown | none |
| Command-S when the text is unchanged | none shown | "No changes since the last version" | none |
| Command-S when the text changed | none shown | "Version saved" | none |
| `C` or `E` while typing or in a dialog | none shown | the key is ignored | none |
| `E` with no page open | none shown | the key is ignored | none |
| `/` inside a code fence | none shown | the character is inserted and the menu stays closed | none |
| Escape with nothing open | none shown | the phone drawer closes if it was open; otherwise no message | none |

## Limits and budgets

| Item | Value | Where |
| --- | --- | --- |
| Page picker | 8 pages | editor suggestion list |
| Modifier on Linux and Windows | Control, as stated in shortcut help | help dialog checked |
| Search button hint | the file column shows ⌘K even when Control is the key that was pressed | seen at 390px |
| No timing budget | shortcuts run on the key event | not timed |
| Review go-to chords | not bound | help dialog |

## UI states

Shortcut help is the screen this spec owns. Search, settings, and share own their own dialogs.

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success | A dialog labeled "Shortcuts" with the ten rows in F20-REQ-007 and "On Linux and Windows, Ctrl is the modifier." | Same copy. The dialog uses the same overlay width rule as search, up to 520px and inset 32px. Not re-opened at 390px. |
| Empty | The list is fixed. It has no empty state. | Same. |
| Loading | The list is local. There is no loading sentence. | Same. |
| Error | No error sentence. A shortcut that does not apply is ignored. | Same. |

## Out of scope

- The review keys listed in Status and scope. Not started.
- Bold, italic, and inline code chords, and the line rules for `#`, `-`, `1.`, `[ ]`, and `>`. Those exist in the editor and on the Shortcuts page in the guide. Their behavior belongs to F09. Shortcut help does not list them.
- What each saved version contains (F18). This spec only requires that Command-S or Control-S saves one and which notice appears.
- The search, settings, and share dialogs' contents (F17, F10, F11), beyond opening and closing them.
- `specs/contracts/keymap.md`.

## Open questions

- F20-Q-001 Owner. When review exists, which scope owns `C` and `E`: create and edit on a page, or request changes and edit before merge? Recommended answer: page scope keeps create and edit; review scope gets the PRD meanings. Blocks F12 and the keymap.
- F20-Q-002 Owner. Should `J` and `K` move through the file list and the outline? The PRD "Interaction rules" section says every list is navigable with J and K. Recommended answer: add them when those lists are specified, not as a silent binding now.

## Trace

- PRD "Keyboard shortcuts" and "Interaction rules".
- Change requests C2 (Command-/ switches, viewing is the default), C6 (settings, opened from the keyboard by Command-,), and C8 (editing on and off; the Edit control is the toggle, and `E` only starts editing).
- Decision D3: no sign-in.
- The shortcut table in the guide page "Shortcuts" matches the help dialog for the shell keys.
- No ADR is written yet. `specs/contracts/keymap.md` is the companion contract and is not part of this spec.
