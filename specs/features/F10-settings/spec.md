# F10 Settings and theme

## Summary

Settings is a dialog where the owner chooses how markdown-kb looks and behaves on this machine, sees what this browser stores, watches and controls agent activity, and copies agent connection snippets. The theme is Light, Dark, or System, and Dark is the choice when nothing is stored.

## Status and scope

Built through F10-REQ-016. F10-REQ-017 to F10-REQ-030 follow ADR-0036 and are being built. This spec covers the settings dialog, its six sections, and the theme that the shell paints. It leaves the reading layout to F08, the share sheet to F11, and the radius, type, and surface tokens to F21. Members, agent-key administration, type schemas, and import and export are not in this dialog.

The PRD "Screens" row for Settings lists members, agent keys, types, and import and export. Those are not started. The MCP section that shipped is a copy-out of connection snippets, not key administration.

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual.

## Users and stories

No sign-in exists (decision D3). Anyone who can open the app may open Settings. There is no other role and no refusal.

- F10-ST-001 As the owner, I want a settings window with a section list, so that appearance stays separate from other machine settings.
- F10-ST-002 As the owner, I want Light, Dark, and System, so that the shell matches the room or stays on one look.
- F10-ST-003 As the owner, I want the choice remembered on this machine, so that the next visit starts in the same theme.

## Requirements

- F10-REQ-001 The system shall present settings as a dialog labeled "Settings", with the heading "Settings".
- F10-REQ-002 When the owner activates Settings in the file column, or the gear control labeled "Settings" while the file column is hidden or the viewport is 860px wide or narrower, the system shall open the dialog on Appearance.
- F10-REQ-003 When the owner presses Command-, or Control-,, the system shall toggle the dialog and shall leave the current section as it was.
- F10-REQ-004 When the owner activates "Close settings", presses Escape, or presses the overlay, the system shall close the dialog.
- F10-REQ-005 The system shall offer the sections General, Appearance, and MCP. Superseded by F10-REQ-017 (ADR-0036).
- F10-REQ-006 When General is selected, the system shall show "General", "This copy stays on this machine.", the label "Pages", and "Pages you create or edit live in this browser, one project at a time. Export a project from the Pages menu to keep a copy or move it to another device."
- F10-REQ-007 When Appearance is selected, the system shall show "Appearance", "How markdown-kb looks on this machine.", the label "Theme", "Use the system setting, or keep one look.", and the choices Light, Dark, and System.
- F10-REQ-008 When the owner chooses Light, Dark, or System, the system shall store that choice on this machine and paint the shell with it.
- F10-REQ-009 If no theme is stored, or the stored value is not `light`, `dark`, or `system`, then the system shall use Dark.
- F10-REQ-010 While the choice is System, the system shall paint Light when the machine prefers a light scheme and Dark otherwise, including when that preference changes.
- F10-REQ-011 The system shall apply the theme on the document before the first paint, so the first frame uses the stored choice.
- F10-REQ-012 When MCP is selected and the local snippet endpoint responds, the system shall show "MCP", a lead naming the knowledge-base folder, and Cursor, Claude Code, and Codex snippets, each with a Copy control. Superseded by F10-REQ-018 (ADR-0036).
- F10-REQ-013 If the snippet endpoint does not respond, then the system shall show "Run npm run dev on this machine to fill in the folder paths. Paste one of these into Cursor, Claude Code, or Codex." and the placeholder snippets.
- F10-REQ-014 When a snippet copy succeeds, the system shall tell the owner "Copied {label} settings".
- F10-REQ-015 While the viewport is wider than 640px, the system shall size the dialog up to 760px wide and 520px tall, with a 180px section list beside the section.
- F10-REQ-016 While the viewport is 640px wide or narrower, the system shall size the dialog to the viewport minus 16px on each axis and shall lay the section list in a row.
- F10-REQ-017 The system shall offer the sections General, Appearance, Editor, Agents, Keyboard, and About, in that order.
- F10-REQ-018 When Agents is selected, the system shall show, under "Connect an agent", the MCP lead and snippets that F10-REQ-012 and F10-REQ-013 describe, each with a Copy control, and a line naming the MCP tools.
- F10-REQ-019 When General is selected, the system shall show a Storage area with the number of projects this browser holds, the pages created or edited in this browser, the saved versions, and the space those use. While the local server answers, it shall also show the knowledge-base folder.
- F10-REQ-020 When the owner activates "Reset this browser's copy", the system shall ask for confirmation in the same pane with "Reset and reload" and "Cancel", and shall change nothing until "Reset and reload" is activated.
- F10-REQ-021 When the owner activates "Reset and reload", the system shall remove this browser's pages, saved versions, project list, and view state, shall keep the theme and preferences, shall leave every file on disk and in the repository unchanged, and shall reload.
- F10-REQ-022 When Appearance is selected, the system shall show the label "Motion" with the choices System and Reduce. System is the choice when nothing is stored.
- F10-REQ-023 While Motion is Reduce, or Motion is System and the machine prefers reduced motion, the system shall run no animation or transition and shall scroll without smooth motion. The system shall apply a stored Reduce before the first paint.
- F10-REQ-024 When Editor is selected, the system shall show the switch "Spellcheck", on when nothing is stored. While it is off, the block editor and the Markdown source editor shall set `spellcheck` to false.
- F10-REQ-025 When Agents is selected, the system shall show the agent seen most recently and how long ago, or "No agent has connected yet." when none is recorded, and shall update it while the dialog is open.
- F10-REQ-026 When Agents is selected, the system shall list at most 10 recent agent actions, newest first, each with the agent, the action, and how long ago.
- F10-REQ-027 When Agents is selected, the system shall show the switch "Follow agents to the page they edit", on when nothing is stored. While it is off, an agent edit to another page shall show the Watch prompt and shall not change the open page.
- F10-REQ-028 When Agents is selected, the system shall show the switch "Highlight what agents change", on when nothing is stored. While it is off, the agent editing screen shall mark no block as changed.
- F10-REQ-029 When Keyboard is selected, the system shall show "Every core action has a shortcut. Press ? anywhere to see them." While a page is open, it shall also show "Show shortcuts", which closes Settings and opens the shortcut help.
- F10-REQ-030 When About is selected, the system shall show the app version and links to the guide, the specs, and the source repository.

## Acceptance scenarios

### F10-AC-001a Settings is a dialog

Test name: `settings opens as a dialog`

Given a page is open, when the owner activates Settings in the file column, then a dialog labeled "Settings" is shown with the heading "Settings".

Checked: ran, Chrome, 1280×800.

### F10-AC-002a Settings starts on Appearance

Test name: `settings from the file column opens appearance`

Given the dialog was opened from the file column, when it appears, then Appearance is the selected section and the pane shows the theme choices.

Checked: ran, Chrome, 1280×800.

### F10-AC-002b Gear on a phone

Test name: `phone gear opens settings`

Given a 390px viewport, when the owner activates the control labeled "Settings", then the dialog opens.

Checked: ran, Chrome, 390×844.

### F10-AC-003a Command comma toggles settings

Test name: `control comma toggles settings`

Given the dialog is closed, when the owner presses Control-,, then the dialog opens.

Checked: ran, Chrome, 1280×800, Control-,. Command-, was not pressed. Closing with the same chord was not pressed; Escape was used instead.

### F10-AC-004a Escape closes settings

Test name: `escape closes settings`

Given the dialog is open, when the owner presses Escape, then the dialog is gone.

Checked: ran, Chrome, 1280×800. Overlay press and "Close settings" were not pressed.

### F10-AC-005a Section list

Test name: `settings lists general appearance and mcp`

Given the dialog is open, when the section list renders, then it contains General, Appearance, and MCP.

Checked: ran, Chrome, 1280×800.

### F10-AC-006a General copy

Test name: `general section explains local pages`

Given the dialog is open, when the owner selects General, then the pane shows "This copy stays on this machine." and the Pages paragraph about this browser and exporting from the Pages menu.

Checked: ran, Chrome, 1280×800.

### F10-AC-007a Appearance copy

Test name: `appearance section offers three themes`

Given the dialog is open on Appearance, when the pane renders, then it shows "How markdown-kb looks on this machine.", "Use the system setting, or keep one look.", and Light, Dark, and System.

Checked: ran, Chrome, 1280×800 and 390×844.

### F10-AC-008a Theme choices paint the shell

Test name: `light dark and system update the document theme`

Given Appearance is open, when the owner chooses Light, then the document theme is light and the page background is `rgb(246, 246, 244)`. When the owner chooses Dark, the theme is dark and the background is `rgb(17, 17, 17)`. When the owner chooses System on a machine that prefers light, the stored choice is system and the painted theme is light.

Checked: ran, Chrome, 1280×800.

### F10-AC-009a Unset theme is dark

Test name: `missing theme uses dark`

Given a fresh profile with no stored theme, when a page loads, then the document theme is dark.

Checked: ran, Chrome, first load of the profile.

### F10-AC-010a System follows the machine

Test name: `system theme tracks the color scheme`

Given the choice is System, when the machine's preferred scheme changes, then the painted theme changes with it.

Checked: manual. The check set System and saw Light, because that Chrome preferred light. The preference was not flipped while the dialog stayed open.

### F10-AC-011a Theme before paint

Test name: `stored theme is applied before first paint`

Given Dark or Light is stored, when the document starts, then the root theme is set by the startup script before the page body renders.

Checked: manual. The script is in the root layout. The check observed the theme after load, not the frame before paint.

### F10-AC-012a MCP snippets from the local server

Test name: `mcp section shows live snippets`

Given the dev server answers `/api/mcp`, when the owner selects MCP, then the lead names the knowledge-base folder and the pane shows Cursor, Claude Code, and Codex, each with Copy.

Checked: ran, Chrome, 1280×800. The lead named `/workspace/kb`.

### F10-AC-013a MCP placeholder

Test name: `mcp section falls back when the endpoint is down`

Given the snippet endpoint does not respond, when the owner selects MCP, then the lead is "Run npm run dev on this machine to fill in the folder paths. Paste one of these into Cursor, Claude Code, or Codex."

Checked: manual. The local endpoint responded, so the fallback lead was not shown.

### F10-AC-014a Copy snippet

Test name: `copying a snippet confirms the client name`

Given an MCP snippet is shown, when the owner activates Copy, then a notice reads "Copied {label} settings".

Checked: manual. Copy was not activated, so clipboard permission and the notice were not seen.

### F10-AC-015a Desktop dialog size

Test name: `settings dialog is 760 by 520 on a wide screen`

Given a 1280px viewport, when the dialog is open, then it is 760px wide and 520px tall.

Checked: ran, Chrome, 1280×800.

### F10-AC-016a Phone dialog

Test name: `settings dialog fills the phone and stacks the sections`

Given a 390×844 viewport, when the dialog is open, then it is 374px wide and 828px tall and the section list is a row.

Checked: ran, Chrome, 390×844.

### F10-AC-017a Six sections

Test name: `F10-AC-017a settings lists six sections in order`

Given the dialog is open, when the section list renders, then it contains General, Appearance, Editor, Agents, Keyboard, and About, in that order.

### F10-AC-018a Connect an agent

Test name: `F10-AC-018a agents section shows the connection snippets`

Given the dev server answers `/api/mcp`, when the owner selects Agents, then "Connect an agent" shows a lead naming the knowledge-base folder, and Cursor, Claude Code, and Codex, each with Copy.

### F10-AC-019a Storage counts

Test name: `F10-AC-019a storage summary counts this browser's pages`

Given this browser holds two projects, one page created here, and three saved versions, when the storage summary is computed, then it reports 2 projects, 1 page, 3 versions, and the bytes of those keys.

### F10-AC-020a Reset asks first

Test name: `F10-AC-020a reset asks for confirmation`

Given General is open, when the owner activates "Reset this browser's copy", then "Reset and reload" and "Cancel" are shown and the stored pages are unchanged. When the owner activates "Cancel", the reset button returns.

### F10-AC-021a Reset keeps the theme

Test name: `F10-AC-021a reset clears browser pages and keeps the theme`

Given a page created in this browser and the Light theme, when the owner activates "Reset and reload", then after the reload the page is gone, the theme is still Light, and the files on disk are unchanged.

### F10-AC-022a Motion choices

Test name: `F10-AC-022a appearance offers motion system and reduce`

Given Appearance is open, when the pane renders, then it shows "Motion" with System and Reduce, and System is chosen on a fresh profile.

### F10-AC-023a Reduce stops motion

Test name: `F10-AC-023a reduce motion stops animation and survives a reload`

Given Appearance is open, when the owner chooses Reduce, then the document is marked for reduced motion and an animated element has no animation. After a reload, the mark is present before the page is interactive.

### F10-AC-024a Spellcheck off

Test name: `F10-AC-024a spellcheck off reaches the editor`

Given Editor is open, when the owner turns "Spellcheck" off and turns editing on, then the block editor's `spellcheck` attribute is `false`.

### F10-AC-025a Agent status

Test name: `F10-AC-025a agents section names the last agent`

Given an agent has read a page through MCP, when the owner selects Agents, then the status names that agent and how long ago. Given no activity is recorded, the status is "No agent has connected yet."

### F10-AC-026a Recent activity

Test name: `F10-AC-026a agents section lists recent actions`

Given an agent read one page and edited another, when the owner selects Agents, then the list shows both actions, newest first.

### F10-AC-027a Follow off

Test name: `F10-AC-027a follow off keeps the open page`

Given "Follow agents to the page they edit" is off and a page is open in view mode, when an agent edits another page, then the open page stays and the Watch prompt names the edited page.

### F10-AC-028a Highlight off

Test name: `F10-AC-028a highlight off marks no changes`

Given "Highlight what agents change" is off, when an agent edits the open page, then the agent editing screen shows the edit and no block is marked as changed.

### F10-AC-029a Keyboard pointer

Test name: `F10-AC-029a keyboard section opens shortcut help`

Given a page is open, when the owner selects Keyboard and activates "Show shortcuts", then Settings closes and the shortcut help opens.

### F10-AC-030a About

Test name: `F10-AC-030a about shows the version and links`

Given the dialog is open, when the owner selects About, then the pane shows the version from `package.json` and links to the guide, the specs, and the source repository.

## Edge cases and errors

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Stored theme is not `light`, `dark`, or `system` | none shown | Dark is painted | none shown |
| Snippet endpoint fails or returns not OK | none shown | "Run npm run dev on this machine to fill in the folder paths. Paste one of these into Cursor, Claude Code, or Codex." | none shown |
| Clipboard write fails | none shown | the Copy control tries a textarea fallback, then still shows no error of its own | none shown |
| Clipboard write succeeds | none shown | "Copied {label} settings" | none |
| Stored preferences are not valid JSON, or a value has the wrong type | none shown | that preference uses its default | none shown |
| Activity endpoint fails | none shown | "No agent has connected yet." and an empty list | none shown |
| Browser storage cannot be read | none shown | the Storage area shows 0 for each count | none shown |

## Limits and budgets

| Item | Value | Where |
| --- | --- | --- |
| Dialog, wider than 640px | up to 760px wide and 520px tall, inset 32px from the viewport edges and 48px from the viewport height | measured 760×520 at 1280×800 |
| Dialog, 640px and below | viewport width minus 16px, viewport height minus 16px | measured 374×828 at 390×844 |
| Section list | 180px | stylesheet, wider than 640px |
| Gear control | shown when the file column is hidden, and whenever the viewport is 860px or narrower | gear used at 390px |
| Theme values | `light`, `dark`, `system` | storage key `markdown-kb:theme` |
| Preferences | `followAgents`, `highlightAgentChanges`, `spellcheck` (booleans, default true), `motion` (`system` or `reduce`, default `system`) | storage key `markdown-kb:prefs` |
| Recent agent actions | at most 10 | `/api/activity?recent=10` |
| No latency budget | theme apply is synchronous on the document | not timed |

## UI states

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success, Appearance | Dialog 760×520. "Appearance", "How markdown-kb looks on this machine.", Light, Dark, and System. The chosen theme is marked. | Same copy. Dialog 374×828. Section list in a row. |
| Success, General | "General", "This copy stays on this machine.", and the Pages paragraph. | Same copy. Not re-opened at 390px. |
| Success, MCP online | "MCP", a lead naming the folder, three snippets, and Copy on each. | Same copy. Not re-opened at 390px. |
| Empty | General has no empty list. Appearance always shows three choices. MCP always shows three snippets. | Same. |
| Loading | MCP shows the placeholder snippets until the endpoint returns. There is no spinner and no loading sentence of its own. | Same. |
| Error, endpoint down | The placeholder lead in F10-REQ-013. | Same copy. Not shown in the browser check. |
| Error, bad stored theme | Dark, with no error sentence. | Same. |

## Out of scope

- Members, roles, and invites (F11, F15).
- Creating, revoking, and listing agent keys (PRD "Settings"). The Agents section only copies snippets and shows local activity.
- Type schemas, import, and export.
- The color values, radii, and type scale (F21). This spec requires which theme is painted, not the palette.
- Search and the share sheet.

## Open questions

- F10-Q-001 Owner. When sign-in exists, does this dialog gain the PRD Settings sections (members, keys, types, import, export)? Recommended answer: yes, as later sections, without removing Appearance. Blocks F15's settings screens.
- F10-Q-002 Owner. Should Command-, reset the section to Appearance the way the Settings control does? Recommended answer: keep the current section, which is what the chord does today.

## Trace

- PRD "Screens" (Settings) and "Design language" (Theme: dark default, light available, follows system).
- Change request C6: a settings window structured as a section list and a pane, with Light, Dark, and System, and Dark when unset.
- Decision D3: no sign-in, so the dialog is not limited to an admin role.
- PLAN section 2.2, theme row.
- ADR-0036 (six sections).
