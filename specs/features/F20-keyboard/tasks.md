# F20 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Every step here is shipped. The review keys are absent on purpose. There is no task that adds them.

## Shipped

### F20-T-001 Bind the modifier chords

- Requirements: F20-REQ-001, F20-REQ-002, F20-REQ-003, F20-REQ-004, F20-REQ-005
- Test: `control k opens page search` (F20-AC-001a). `control slash from viewing opens markdown source` (F20-AC-002a). `control slash from source returns to editing` (F20-AC-002b). `control backslash toggles the outline` (F20-AC-003a). `control s saves a version` (F20-AC-004a). `control comma opens settings` (F20-AC-005a).
- Size: one module
- Depends on: the search dialog (F17-T-001), the mode store (F09-T-001), the outline choice (F08-T-009), the local version save (F09-T-006), and the settings dialog (F10-T-001)
- Module: `components/use-editor-keys.ts`. Command and Control are the same modifier. Command-K opens page search and closes shortcut help, including while typing. Command-/ opens source unless the mode is already source, in which case it opens editing, and it does not return to viewing. Command-\\ toggles the outline. Command-S saves a version when a page is open. Command-, toggles settings. The source editor swallows Command-S and Command-/ so the browser and CodeMirror do not take them. The window listener still runs.

### F20-T-002 Open shortcut help and list the built keys

- Requirements: F20-REQ-006, F20-REQ-007
- Test: `question mark opens shortcut help` (F20-AC-006a). `shortcut help lists the built keys` (F20-AC-007a).
- Size: one module
- Depends on: F20-T-001
- Module: `components/shortcut-help.tsx`, opened by `?` in `use-editor-keys.ts`. `?` is suppressed while typing and is not suppressed by an open dialog. It closes page search. The dialog lists the ten rows in F20-REQ-007 and the sentence "On Linux and Windows, Ctrl is the modifier."

### F20-T-003 Start editing or a new page from a plain key

- Requirements: F20-REQ-008, F20-REQ-009, F20-REQ-010
- Test: `e starts editing and does not toggle off` (F20-AC-008a). `c starts a new page in the open folder` (F20-AC-009a). `c and e do nothing while typing or in a dialog` (F20-AC-010a).
- Size: one module
- Depends on: F20-T-001
- Module: the plain-key branch in `components/use-editor-keys.ts`. `E` requires a page and sets editing. It does not turn editing off. `C` opens the file column and starts a new page in the open page's folder. Both stay quiet while a dialog or menu is open, while the owner is typing in a field, and while Command or Alt is held.

### F20-T-004 Close search, help, and the phone drawer on Escape

- Requirements: F20-REQ-011
- Test: `escape closes search and shortcut help` (F20-AC-011a).
- Size: several modules
- Depends on: F20-T-001, F20-T-002
- Modules: the Escape branch in `components/use-editor-keys.ts`, plus the Escape listeners on settings (`components/settings-host.tsx`) and the share sheet (`components/share-host.tsx`). The window listener closes page search, shortcut help, and the phone file drawer.

### F20-T-005 Open the block menu and the page picker

- Requirements: F20-REQ-012, F20-REQ-013
- Test: `slash while editing opens the block menu` (F20-AC-012a). `double bracket while editing opens the page picker` (F20-AC-013a).
- Size: one module
- Depends on: the block editor (F09-T-004)
- Module: `createSlash` and `createPagePicker` in `components/block-editor/extensions.ts`. `/` runs at the start of a block that is not a code fence. `[[` lists up to 8 pages whose title or path contains the text typed after it. The narrower structure catalog and the version pin are F09-T-014 and F09-T-015. They are not this step.

### F20-T-006 Leave the review keys unbound

- Requirements: F20-REQ-014
- Test: `shortcut help omits review chords` (F20-AC-014a).
- Size: one module
- Depends on: F20-T-002
- Module: `components/use-editor-keys.ts` and `components/shortcut-help.tsx`. There is no handler for `G` then `I`, `G` then `T`, `G` then `M`, review `M`, review `R`, review `C`, review `D`, or `J` and `K`. The help list does not show them. The keymap contract records those keys as not started.
