# F21 design

Written against `spec.md` in this folder, from `origin/cursor/reading-shell-specs-6322`. That branch is not merged. The paint rules in this spec are built. The token catalog is [`specs/contracts/tokens.md`](../../contracts/tokens.md). This design names the modules that apply those tokens. It does not restate every color as a second catalog.

Feature specs own what each screen says. This feature owns how the shell is painted.

## Modules

| Module | Role |
| --- | --- |
| `app/theme.css` | Light overrides for the surfaces, text, accent, warning, and danger |
| `app/globals.css` | Dark defaults, interface type, focus ring, and the overlay scrim |
| `app/shape.css` | The radius scale that wins for controls, blocks, and dialogs |
| `app/reading.css` | Reading type, the 760px cap, and the padding steps |
| `app/columns.css` | The 860px shell, the 248px file column, and the 220px outline |
| `app/tree.css` | The 120ms disclosure |
| `app/settings.css`, `app/share.css` | Phone dialog sizes |
| `app/layout.tsx` | Geist Sans and Geist Mono, and the theme script |
| `components/theme-store.ts` | Dark when the stored theme is missing or invalid |

Import order is the order in `app/layout.tsx`: `globals.css`, `sidebar.css`, `reading.css`, `shape.css`, `theme.css`, `settings.css`, `columns.css`, `share.css`, `tree.css`, `block-editor.css`, `projects.css`. Later files override earlier ones. The token contract records which rule wins.

## Data shapes

The painted theme is `light` or `dark` on `document.documentElement.dataset.theme`. The stored choice is `light`, `dark`, or `system` (F10). A missing or invalid stored value paints Dark. This feature requires that fallback. F10 stores the choice.

```ts
type PaintedTheme = "light" | "dark";
```

Surfaces are solid fills. In Dark, the page is `#111111`, the file column and the outline are `#1b1b1b`, and a dialog is `#242424`. In Light, those surfaces are `#f6f6f4`, `#efefec`, and `#ffffff`. The file column, the page, and the outline are separated by those fills. The border between them is 0px. Those columns have no drop shadow.

The accent, for focus and the primary control, is `#7aa2f7` in Dark and `#3b6fd6` in Light. Warning and danger text are `#e6c07b` and `#f0a8a8` in Dark, and `#8a5a10` and `#a33b3b` in Light.

Radius: controls 12px, outline rows 10px, content blocks 18px, dialogs 20px, inline code and keyboard marks 8px, a highlight mark 6px.

Type: interface text 13px with line height 1.45, reading text 17px with line height 1.7, path and status line 12px. Geist Sans is the interface and reading face. Geist Mono is the face for paths, the search hint, and the share link. The reading column stays within 760px and within 66ch plus 64px, as F08 requires. Both numbers are in the stylesheet. At 17px the 760px cap is what binds.

Motion: the file-tree disclosure is 120ms ease. Page text is not animated. While the owner prefers reduced motion, scroll behavior is auto and the 120ms transition on project cards is dropped.

A visible focus ring is a 2px solid accent outline, 2px outside the control.

Breakpoints, matching the token contract:

| Query | What the shell does |
| --- | --- |
| Viewport 860px or narrower | No outline column. The file column is a drawer |
| Page column 640px or narrower | Tighter reading padding |
| Page column 420px or narrower | 16px of side padding |
| Viewport 640px or narrower | Phone sizes of the settings and share dialogs, as F10 and F11 specify |

On a coarse pointer, icon controls, Search, Edit, and Share are at least 44px tall.

Settings, share, page search, and shortcut help are dialogs over a scrim of `rgba(0, 0, 0, 0.55)`. Menus, toasts, and the project switcher may use a drop shadow. The three shell columns do not.

## State

Paint reads `dataset.theme`. It does not keep a second store. Reduced motion is the `prefers-reduced-motion` media query. Coarse pointer is the `pointer: coarse` media query. Breakpoints are the width queries above. None of these are written by this feature.

## Contracts

Every value named above is the shipped value in [`specs/contracts/tokens.md`](../../contracts/tokens.md). Where an earlier stylesheet disagrees, the contract says which rule wins, and this feature requires the winning rule. The PRD values this feature leaves unused (16px body, 1.6 line height, a 720px measure, 6px controls, 8px panels, and a 1px hairline) are recorded there as values that did not ship.
