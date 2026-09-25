# F21 Design language

## Summary

The design language is the set of visible rules for the shell: solid surfaces, the radius scale, the type, the short motion, and the breakpoints. The values are the ones from change requests C2 through C7.

## Status and scope

Built. This spec states those rules as requirements. The token catalog is `specs/contracts/tokens.md`, which this spec does not define. Feature specs own what each screen says; this spec owns how the shell is painted.

PLAN section 2.2 matches the rules that shipped, with one measure disagreement owned by F08: the stylesheet asks for 66ch and also caps the reading column at 760px. At 17px in the browser check, the cap won. F21 requires both numbers because both are in the stylesheet.

The PRD "Design language" values that these requests replace are not requirements: 16px body, 1.6 line height, 720px measure, 6px controls, 8px panels, and hairline 1px borders.

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual.

## Users and stories

No sign-in exists (decision D3). The rules apply to every person who can open the app.

- F21-ST-001 As the owner, I want the page, the file column, and the outline to read as solid surfaces, so that the type is what I see.
- F21-ST-002 As the owner, I want one radius and type scale, so that dialogs, controls, and the page feel like the same product.
- F21-ST-003 As the owner, I want the layout to change at known widths, so that a phone stays readable.

## Requirements

- F21-REQ-001 The system shall paint the shell in Dark or Light, and shall use Dark when the stored theme is missing or invalid.
- F21-REQ-002 The system shall paint shell surfaces as solid fills. In Dark, the page surface is `#111111`, the file column and outline are `#1b1b1b`, and a dialog surface is `#242424`. In Light, those surfaces are `#f6f6f4`, `#efefec`, and `#ffffff`.
- F21-REQ-003 The system shall separate the file column, the page, and the outline by those fills, with a border width of 0px and no drop shadow on those columns.
- F21-REQ-004 The system shall use one accent for focus and the primary control: `#7aa2f7` in Dark and `#3b6fd6` in Light.
- F21-REQ-005 The system shall use `#e6c07b` and `#f0a8a8` in Dark, and `#8a5a10` and `#a33b3b` in Light, for warning and danger text.
- F21-REQ-006 The system shall round controls to 12px, outline rows to 10px, content blocks to 18px, and dialogs to 20px.
- F21-REQ-007 The system shall round inline code and keyboard marks to 8px, and a highlight mark to 6px.
- F21-REQ-008 The system shall set interface text at 13px with a line height of 1.45, reading text at 17px with a line height of 1.7, and the path and status line at 12px.
- F21-REQ-009 The system shall use Geist Sans for interface and reading text, and Geist Mono for paths, the search hint, and the share link.
- F21-REQ-010 The system shall keep the reading column within 760px and within 66ch plus 64px, as F08 requires.
- F21-REQ-011 The system shall animate the file-tree disclosure in 120ms ease, and shall not animate the page text.
- F21-REQ-012 While the owner prefers reduced motion, the system shall scroll with auto behavior and shall drop the 120ms transition on project cards.
- F21-REQ-013 When focus is visible on a control, the system shall draw a 2px solid accent outline, 2px outside the control.
- F21-REQ-014 While the viewport is 860px wide or narrower, the system shall use the narrow shell: no outline column, and the file column as a drawer.
- F21-REQ-015 While the page column is 640px wide or narrower, the system shall tighten reading padding, and while it is 420px wide or narrower, the system shall use 16px of side padding.
- F21-REQ-016 While the viewport is 640px wide or narrower, the system shall use the phone sizes of the settings and share dialogs specified in F10 and F11.
- F21-REQ-017 While the pointer is coarse, the system shall make icon controls, Search, Edit, and Share at least 44px tall.
- F21-REQ-018 The system shall present settings, share, page search, and shortcut help as dialogs over a scrim of `rgba(0, 0, 0, 0.55)`.
- F21-REQ-019 Menus, toasts, and the project switcher may use a drop shadow. The three shell columns shall not.

Green and red for insertions and deletions are not part of this shell. They belong to review, which is not started.

## Acceptance scenarios

### F21-AC-001a Dark is the unset theme

Test name: `unset theme paints dark`

Given no stored theme, when a page loads, then the document theme is dark.

Checked: ran, Chrome, first load of the profile.

### F21-AC-002a Dark surfaces

Test name: `dark shell uses the page and sidebar fills`

Given Dark, when `/guide/docs/layout` is shown at 1280px, then the page, title row, and status line are `rgb(17, 17, 17)` and the file column and outline are `rgb(27, 27, 27)`.

Checked: ran, Chrome, 1280×800. The dialog fill `#242424` was not sampled.

### F21-AC-002b Light page surface

Test name: `light theme paints the page surface`

Given the owner chooses Light, when the page background is read, then it is `rgb(246, 246, 244)`.

Checked: ran, Chrome, 1280×800. The light sidebar fill `#efefec` and the light dialog fill `#ffffff` were not sampled.

### F21-AC-003a No hairline between columns

Test name: `shell columns have no border and no shadow`

Given Dark at 1280px, when the file column is measured, then its border width is 0px and its drop shadow is none.

Checked: ran, Chrome, 1280×800.

### F21-AC-004a Accent focus

Test name: `light focus ring uses the light accent`

Given Light, when Edit is focused, then the outline is a 2px solid `rgb(59, 111, 214)` with a 2px offset.

Checked: ran, Chrome, 1280×800, Light. The dark accent `#7aa2f7` was not sampled.

### F21-AC-005a Warning and danger colors

Test name: `warning and danger colors match the theme`

Given a warning or danger string is shown, when its color is measured, then it uses the amber or danger value for that theme.

Checked: manual. Those strings were not on the screens that were measured. The values are the theme variables.

### F21-AC-006a Radius scale

Test name: `controls blocks and dialogs use the radius scale`

Given the shell is open, when radii are measured, then Search is 12px, an outline row is 10px, a code block and a callout are 18px, and the settings, share, and search dialogs are 20px.

Checked: ran, Chrome. Search, the outline row, and the three dialogs were measured in the session. The code block and callout were measured on `docs/writing.md` after the theme had been set to Light.

### F21-AC-007a Inline radius

Test name: `inline code and marks use 8px and 6px`

Given a page with inline code, a keyboard mark, and a highlight, when they are measured, then code and the keyboard mark are 8px and the highlight is 6px.

Checked: ran, Chrome, on `docs/writing.md`.

### F21-AC-008a Type scale

Test name: `ui text is 13px and reading text is 17px`

Given a page in viewing, when type is measured, then the document is 13px with a computed line height of 18.85px, and the reading text is 17px with a computed line height of 28.9px.

Checked: ran, Chrome, 1280×800. The 12px path and status size were not measured; the status line's words were read.

### F21-AC-009a Fonts

Test name: `the shell uses geist sans and geist mono`

Given the app has loaded, when the root font variables are the Geist faces from the layout, then interface text uses the sans variable and the path uses the mono variable.

Checked: manual. The faces are loaded in the root layout. The computed family string was not read back.

### F21-AC-010a Reading cap

Test name: `reading column keeps the 760px cap`

Given a 1280px viewport, when the reading column is measured, then it is 760px wide. A 66ch measure of the 17px font is 744px.

Checked: ran, Chrome, 1280×800. See F08 for the disagreement with a 66-character line.

### F21-AC-011a Disclosure motion

Test name: `folder disclosure animates in 120ms`

Given the file tree, when a folder opens, then its chevron transitions over 120ms ease and the page text does not animate.

Checked: manual. The 120ms duration is the chevron transition in the stylesheet. It was not timed in the browser.

### F21-AC-012a Reduced motion

Test name: `reduced motion disables smooth scroll`

Given the owner prefers reduced motion, when an outline row is chosen, then the scroll behavior is auto.

Checked: manual. The preference was not set. The outline jump that was run used the default smooth path.

### F21-AC-013a Focus ring

Test name: `focused control has a 2px accent outline`

Given Light, when Edit is focused, then the outline width is 2px and the offset is 2px.

Checked: ran, Chrome, 1280×800. Same measurement as F21-AC-004a.

### F21-AC-014a Narrow shell

Test name: `390px uses the drawer shell`

Given a 390px viewport, when a page is open, then the outline is not shown and the file column is an off-screen drawer until it is opened.

Checked: ran, Chrome, 390×844. The boundary at 860px versus 861px was not measured.

### F21-AC-015a Reading padding steps

Test name: `390px reading padding is 16px`

Given a 390px viewport, when the reading column is measured, then each side padding is 16px.

Checked: ran, Chrome, 390×844. The 20px step, for a page column from 420px through 640px, was not measured.

### F21-AC-016a Phone dialogs

Test name: `phone settings and share use the 16px inset`

Given a 390px viewport, when settings or share is open, then the dialog is 374px wide.

Checked: ran, Chrome, 390×844, both dialogs.

### F21-AC-017a Coarse pointer targets

Test name: `coarse pointer controls are 44px tall`

Given a coarse pointer, when Search, Edit, and Share are measured, then each is at least 44px tall.

Checked: manual. The headless Chrome session reported a fine pointer, so the 44px rule was read from the stylesheet and not seen on screen. At a fine pointer, Search measured 30px tall.

### F21-AC-018a The four dialogs

Test name: `settings share search and help are dialogs`

Given each is opened, when its role is read, then settings, share, search, and shortcut help are dialogs.

Checked: ran, Chrome, 1280×800, all four. The scrim color was not sampled.

### F21-AC-019a Menu shadow is allowed

Test name: `menus may shadow and columns do not`

Given a menu or the project switcher is open, when it is measured, then it may have a drop shadow. The file column's shadow is none.

Checked: the file column ran, Chrome, 1280×800. A menu was not opened, so its shadow was not sampled. The stylesheet gives menus, toasts, and the project switcher a shadow.

## Edge cases and errors

The design language does not emit an error code. A missing or invalid theme paints Dark and shows no message, as F10 specifies.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Theme missing or invalid | none shown | Dark surfaces, no error sentence | none |
| Reduced motion | none shown | no message; scroll and the card transition change | none |
| Viewport between the breakpoints | none shown | the matching rule applies, no message | none |

## Limits and budgets

| Item | Value | Where |
| --- | --- | --- |
| Page surface | `#111111` Dark, `#f6f6f4` Light | Dark measured; Light page measured |
| Sidebar and outline | `#1b1b1b` Dark, `#efefec` Light | Dark measured |
| Dialog surface | `#242424` Dark, `#ffffff` Light | stylesheet |
| Accent | `#7aa2f7` Dark, `#3b6fd6` Light | Light focus ring measured |
| Warning / danger | `#e6c07b` / `#f0a8a8` Dark; `#8a5a10` / `#a33b3b` Light | stylesheet |
| Radius | 12px controls, 10px outline rows, 18px blocks, 20px dialogs, 8px code and keyboard, 6px highlight | measured as in the scenarios |
| Interface type | 13px, line height 1.45, computed 18.85px | measured |
| Reading type | 17px, line height 1.7, computed 28.9px | measured |
| Path and status | 12px | stylesheet |
| Motion | 120ms ease on the disclosure; none on page text | stylesheet |
| Shell breakpoint | 860px | behavior checked at 1280px and 390px |
| Column breakpoints | 640px and 420px on the page column | 16px padding checked at 390px |
| Dialog breakpoint | 640px | settings and share checked at 390px |
| Coarse target | 44px minimum height | stylesheet; not seen in the fine-pointer session |
| File column / outline | 248px / 220px | measured at 1280px |
| Scrim | `rgba(0, 0, 0, 0.55)` | stylesheet |

No paint-time percentile is specified, and none was measured.

## UI states

This spec has no screen of its own. The states below are how the shell looks when the screens in F08, F10, F11, F17, and F20 are showing.

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success | Three solid columns, 0px borders, reading text at 17px, dialogs at 20px when opened. Dark unless the owner chose otherwise. | One column of page. Outline hidden. File column is a drawer. Dialogs inset by 16px. Reading text stays 17px. |
| Empty | Empty copy from the owning spec, on the same surfaces. | Same surfaces. The outline's "No headings" is not on screen because the outline is hidden. |
| Loading | No skeleton theme. A blank page stage uses the page surface. | Same. |
| Error | Missing and unknown screens use the page surface and the same type. No separate error color unless the owning spec uses danger text. | Same. |

## Out of scope

- The full token file `specs/contracts/tokens.md`.
- Callout, chart, and syntax-highlight palettes (F04).
- Green and red diff colors (PRD "Design language", review). Not started.
- Editor chrome radius inside the block menu, except where a shell control is shared.
- Copy for settings, share, search, help, and the reading shell (F10, F11, F17, F20, F08).

## Open questions

- F21-Q-001 Owner. Should the 760px reading cap remain beside the 66ch rule? Recommended answer: F08-Q-002. This spec keeps both until that question is decided.
- F21-Q-002 Owner. Should menus lose their drop shadow so the PRD "no shadows" rule returns? Recommended answer: keep the menu shadow. C2 removed hairline borders from the shell in favor of solid fills; it did not restyle menus.

## Trace

- PRD "Design language": dark default, light, follows system; surfaces; accent; semantic colors; interface type; reading type; mono; radius; motion of 120–160ms ease-out and no motion on content. C2 through C7 replace the surface, radius, and reading-type numbers named in Status and scope.
- PRD "Interaction rules": prefer side panels over modals. Change requests C6 and C8, and PLAN question Q5, make settings, share, search, and shortcut help dialogs.
- Change requests C2 (solid fills, borders removed), C3 (the file column), C4 (17px, 1.7, phones, 44px targets on a coarse pointer), C5 (12px controls, 10px outline rows, 18px blocks, 20px dialogs, 8px inline code, 6px highlight), C6 (Light, Dark, System), and C7 (three columns, shared page surface).
- PLAN section 2.2.
- No ADR is written yet.
