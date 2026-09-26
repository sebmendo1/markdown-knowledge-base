# F10 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Steps F10-T-001 to F10-T-007 are shipped. Steps F10-T-008 to F10-T-014 follow ADR-0036.

## Shipped

### F10-T-001 Open Settings as a dialog with three sections

- Requirements: F10-REQ-001, F10-REQ-004, F10-REQ-005
- Test: `settings opens as a dialog` (F10-AC-001a). `escape closes settings` (F10-AC-004a). `settings lists general appearance and mcp` (F10-AC-005a).
- Size: one module
- Depends on: none
- Module: `components/settings-host.tsx`. The dialog is labeled "Settings" and the heading is "Settings". "Close settings", Escape, and the overlay close it. The sections are General, Appearance, and MCP.

### F10-T-002 Open on Appearance, and toggle without changing the section

- Requirements: F10-REQ-002, F10-REQ-003
- Test: `settings from the file column opens appearance` (F10-AC-002a). `phone gear opens settings` (F10-AC-002b). `control comma toggles settings` (F10-AC-003a).
- Size: several modules
- Depends on: F10-T-001
- Modules: Settings in `components/file-sidebar.tsx`, the gear labeled "Settings" in `components/document-chrome.tsx`, and the Command-, handler in `components/settings-host.tsx`. The gear is the entry while the file column is hidden or the viewport is 860px or narrower. Command-, toggles and leaves the current section as it was. The file-column and gear entries open on Appearance.

### F10-T-003 Show the General copy

- Requirements: F10-REQ-006
- Test: `general section explains local pages` (F10-AC-006a).
- Size: one module
- Depends on: F10-T-001
- Module: the General pane in `components/settings-host.tsx`. The strings are "General", "This copy stays on this machine.", "Pages", and the sentence about pages living in this browser.

### F10-T-004 Store and paint Light, Dark, and System

- Requirements: F10-REQ-007, F10-REQ-008, F10-REQ-009, F10-REQ-010
- Test: `appearance section offers three themes` (F10-AC-007a). `light dark and system update the document theme` (F10-AC-008a). `missing theme uses dark` (F10-AC-009a). `system theme tracks the color scheme` (F10-AC-010a).
- Size: one module
- Depends on: F10-T-001
- Module: `components/theme-store.ts`. The key is `markdown-kb:theme`. A missing or unknown value is Dark. System follows `(prefers-color-scheme: light)` and updates when that preference changes. The Appearance copy is the heading, the machine sentence, the Theme label, and "Use the system setting, or keep one look."

### F10-T-005 Apply the theme before the first paint

- Requirements: F10-REQ-011
- Test: `stored theme is applied before first paint` (F10-AC-011a).
- Size: one module
- Depends on: F10-T-004
- Module: the inline script in `app/layout.tsx`. It reads `markdown-kb:theme` and sets `document.documentElement.dataset.theme` before the first frame. An invalid stored value uses Dark, the same rule as `readTheme`.

### F10-T-006 Show MCP snippets and confirm a copy

- Requirements: F10-REQ-012, F10-REQ-013, F10-REQ-014
- Test: `mcp section shows live snippets` (F10-AC-012a). `mcp section falls back when the endpoint is down` (F10-AC-013a). `copying a snippet confirms the client name` (F10-AC-014a).
- Size: several modules
- Depends on: F10-T-001
- Modules: the MCP pane in `components/settings-host.tsx` and `mcpSnippets` in `lib/mcp/snippets.ts`. A live endpoint shows the folder lead and Cursor, Claude Code, and Codex snippets, each with Copy. A down endpoint shows "Run npm run dev on this machine to fill in the folder paths. Paste one of these into Cursor, Claude Code, or Codex." and the placeholders. A successful copy says "Copied {label} settings".

### F10-T-007 Size the dialog for a wide screen and a phone

- Requirements: F10-REQ-015, F10-REQ-016
- Test: `settings dialog is 760 by 520 on a wide screen` (F10-AC-015a). `settings dialog fills the phone and stacks the sections` (F10-AC-016a).
- Size: one module
- Depends on: F10-T-001
- Module: `app/settings.css`. Wider than 640px: at most 760px by 520px, with a 180px section list beside the section. At 640px or narrower: the viewport minus 16px on each axis, and the section list in a row. Those sizes are the settings row in [`specs/contracts/tokens.md`](../../contracts/tokens.md).

## ADR-0036

### F10-T-008 Six sections, with the snippets under Agents

- Requirements: F10-REQ-005, F10-REQ-012, F10-REQ-017, F10-REQ-018
- Test: `F10-AC-017a settings lists six sections in order`. `F10-AC-018a agents section shows the connection snippets`.
- Size: several modules
- Depends on: F10-T-001, F10-T-006
- Modules: `components/settings-host.tsx` keeps the dialog and the section list. Each pane is its own module in `components/settings/`. F10-REQ-005 and F10-REQ-012 are superseded (ADR-0036); the MCP pane's copy moves to Agents under "Connect an agent".

### F10-T-009 Preferences store

- Requirements: F10-REQ-022, F10-REQ-024, F10-REQ-027, F10-REQ-028
- Test: `F10-AC-022a appearance offers motion system and reduce`.
- Size: several modules
- Depends on: none
- Modules: `lib/settings/preferences.ts` parses `markdown-kb:prefs` and falls back per value. `components/preferences.ts` stores and publishes it, like `components/theme-store.ts`.

### F10-T-010 Storage summary and reset

- Requirements: F10-REQ-019, F10-REQ-020, F10-REQ-021
- Test: `F10-AC-019a storage summary counts this browser's pages`. `F10-AC-020a reset asks for confirmation`. `F10-AC-021a reset clears browser pages and keeps the theme`.
- Size: several modules
- Depends on: F10-T-008
- Modules: `lib/settings/storage.ts` counts keys and lists the keys a reset removes. `components/settings/general.tsx` shows the summary, the folder from `/api/mcp`, and the two-step reset.

### F10-T-011 Reduce motion

- Requirements: F10-REQ-023
- Test: `F10-AC-023a reduce motion stops animation and survives a reload`.
- Size: several modules
- Depends on: F10-T-009
- Modules: `data-motion` on the root from `components/preferences.ts` and the inline script in `app/layout.tsx`; the reduce rule in `app/globals.css`; `prefersReducedMotion()` replaces the media query in `components/workspace.tsx` and `components/agent-stage.tsx`.

### F10-T-012 Spellcheck

- Requirements: F10-REQ-024
- Test: `F10-AC-024a spellcheck off reaches the editor`.
- Size: several modules
- Depends on: F10-T-009
- Modules: `components/settings/editor.tsx`, the `spellcheck` attribute in `components/block-editor/block-editor.tsx`, and CodeMirror content attributes in `components/editor.tsx`.

### F10-T-013 Agent status, activity, follow, and highlight

- Requirements: F10-REQ-025, F10-REQ-026, F10-REQ-027, F10-REQ-028
- Test: `F10-AC-025a agents section names the last agent`. `F10-AC-026a agents section lists recent actions`. `F10-AC-027a follow off keeps the open page`. `F10-AC-028a highlight off marks no changes`.
- Size: several modules
- Depends on: F10-T-008, F10-T-009
- Modules: `?recent=N` on `app/api/activity/route.ts`; `components/settings/agents.tsx`; the follow check in `components/workspace.tsx`; the changed lines in `components/agent-stage.tsx`.

### F10-T-014 Keyboard and About

- Requirements: F10-REQ-029, F10-REQ-030
- Test: `F10-AC-029a keyboard section opens shortcut help`. `F10-AC-030a about shows the version and links`.
- Size: several modules
- Depends on: F10-T-008
- Modules: `components/settings/keyboard.tsx` emits `markdown-kb-help`, which `components/workspace.tsx` handles. `components/settings/about.tsx` reads `NEXT_PUBLIC_APP_VERSION`, set from `package.json` in `next.config.ts`.
