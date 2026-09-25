# F21 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Every step here is shipped. The tests named below already prove it. The numbers are the ones in [`specs/contracts/tokens.md`](../../contracts/tokens.md).

## Shipped

### F21-T-001 Paint Dark when the theme is missing

- Requirements: F21-REQ-001
- Test: `unset theme paints dark` (F21-AC-001a).
- Size: one module
- Depends on: none
- Module: `readTheme` in `components/theme-store.ts`, and the same fallback in the script in `app/layout.tsx`. A missing or invalid stored theme paints Dark. Light and Dark are the only painted values.

### F21-T-002 Paint solid surfaces and no column hairline

- Requirements: F21-REQ-002, F21-REQ-003
- Test: `dark shell uses the page and sidebar fills` (F21-AC-002a). `light theme paints the page surface` (F21-AC-002b). `shell columns have no border and no shadow` (F21-AC-003a).
- Size: several modules
- Depends on: F21-T-001
- Modules: `app/globals.css` for the Dark fills and `app/theme.css` for the Light fills. Page, sidebar, and dialog are `#111111`, `#1b1b1b`, and `#242424` in Dark, and `#f6f6f4`, `#efefec`, and `#ffffff` in Light. The file column, the page, and the outline meet at a 0px border and have no drop shadow.

### F21-T-003 Use one accent and the warning and danger colors

- Requirements: F21-REQ-004, F21-REQ-005
- Test: `light focus ring uses the light accent` (F21-AC-004a). `warning and danger colors match the theme` (F21-AC-005a).
- Size: one module
- Depends on: F21-T-001
- Module: `app/theme.css` together with the Dark defaults in `app/globals.css`. Accent is `#7aa2f7` in Dark and `#3b6fd6` in Light. Warning and danger are `#e6c07b` and `#f0a8a8` in Dark, and `#8a5a10` and `#a33b3b` in Light.

### F21-T-004 Apply the radius scale

- Requirements: F21-REQ-006, F21-REQ-007
- Test: `controls blocks and dialogs use the radius scale` (F21-AC-006a). `inline code and marks use 8px and 6px` (F21-AC-007a).
- Size: one module
- Depends on: none
- Module: `app/shape.css`. Controls are 12px, outline rows 10px, content blocks 18px, dialogs 20px, inline code and keyboard marks 8px, and a highlight mark 6px. This file wins over the earlier radii in `globals.css`.

### F21-T-005 Set the type scale, the fonts, and the reading cap

- Requirements: F21-REQ-008, F21-REQ-009, F21-REQ-010
- Test: `ui text is 13px and reading text is 17px` (F21-AC-008a). `the shell uses geist sans and geist mono` (F21-AC-009a). `reading column keeps the 760px cap` (F21-AC-010a).
- Size: several modules
- Depends on: none
- Modules: `app/globals.css` and `app/reading.css` for the sizes, and `app/layout.tsx` for Geist Sans and Geist Mono. Interface text is 13px at line height 1.45. Reading text is 17px at line height 1.7. The path and the status line are 12px. Mono is used for paths, the search hint, and the share link. The reading column stays within 760px and within 66ch plus 64px, as F08 requires.

### F21-T-006 Animate the disclosure and honor reduced motion

- Requirements: F21-REQ-011, F21-REQ-012
- Test: `folder disclosure animates in 120ms` (F21-AC-011a). `reduced motion disables smooth scroll` (F21-AC-012a).
- Size: one module
- Depends on: none
- Module: `app/tree.css` for the 120ms ease on the file-tree disclosure, and the reduced-motion rule that sets scroll behavior to auto and drops the 120ms transition on project cards. Page text is not animated.

### F21-T-007 Draw the focus ring

- Requirements: F21-REQ-013
- Test: `focused control has a 2px accent outline` (F21-AC-013a).
- Size: one module
- Depends on: F21-T-003
- Module: the focus rule in `app/globals.css`. A visible focus ring is a 2px solid accent outline, 2px outside the control.

### F21-T-008 Step the shell, the reading padding, and the phone dialogs

- Requirements: F21-REQ-014, F21-REQ-015, F21-REQ-016
- Test: `390px uses the drawer shell` (F21-AC-014a). `390px reading padding is 16px` (F21-AC-015a). `phone settings and share use the 16px inset` (F21-AC-016a).
- Size: several modules
- Depends on: F21-T-005
- Modules: `app/columns.css` for the 860px shell, `app/reading.css` for the 640px and 420px padding steps, and `app/settings.css` with `app/share.css` for the phone dialogs. At 860px or narrower there is no outline column and the file column is a drawer. At a page column of 640px or narrower the reading padding tightens. At 420px or narrower the side padding is 16px. At a viewport of 640px or narrower, settings and share use the phone sizes in F10 and F11.

### F21-T-009 Enlarge coarse-pointer controls

- Requirements: F21-REQ-017
- Test: `coarse pointer controls are 44px tall` (F21-AC-017a).
- Size: several modules
- Depends on: none
- Modules: the `(pointer: coarse)` rules in the shell stylesheets. Icon controls, Search, Edit, and Share are at least 44px tall.

### F21-T-010 Present the four dialogs on a scrim, and keep shadows off the columns

- Requirements: F21-REQ-018, F21-REQ-019
- Test: `settings share search and help are dialogs` (F21-AC-018a). `menus may shadow and columns do not` (F21-AC-019a).
- Size: several modules
- Depends on: F21-T-002
- Modules: the overlay in `app/globals.css` and the dialogs in settings, share, page search, and shortcut help. The scrim is `rgba(0, 0, 0, 0.55)`. Menus, toasts, and the project switcher may use a drop shadow. The three shell columns do not.
