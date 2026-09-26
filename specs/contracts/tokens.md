# Tokens

Values from the stylesheets in `app/`. Later files override earlier ones. Import order: `globals.css`, `sidebar.css`, `reading.css`, `shape.css`, `theme.css`, `settings.css`, `columns.css`, `share.css`, `tree.css`, `block-editor.css`, `projects.css`.

`globals.css` imports Tailwind and defines no `@theme` tokens. Tailwind's default theme is not part of this contract.

A number from `specs/PLAN.md` that the CSS does not use is recorded on the shipped value, as not what shipped.

## Color

Dark is `:root` in `globals.css`, plus `--selection` in `theme.css`. Light is `[data-theme="light"]` in `theme.css`. Unset theme is dark (`components/theme-store.ts` is the behavior; the CSS itself does not set the attribute).

| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#111111` | `#f6f6f4` |
| `--bg-sidebar` | `#1b1b1b` | `#efefec` |
| `--bg-chrome` | `#1b1b1b` | `#efefec` |
| `--bg-outline` | `#191919` | `#f3f3f0` |
| `--bg-source` | `#191919` | `#f3f3f0` |
| `--bg-raised` | `#242424` | `#ffffff` |
| `--bg-hover` | `#2c2c2c` | `#e6e6e2` |
| `--bg-sunken` | `#1f1f1f` | `#ecece8` |
| `--text` | `#ececec` | `#1a1a1a` |
| `--text-dim` | `#a3a3a3` | `#3a3a3a` |
| `--text-faint` | `#8c8c8c` | `#6a6a66` |
| `--accent` | `#7aa2f7` | `#3b6fd6` |
| `--amber` | `#e6c07b` | `#8a5a10` |
| `--danger` | `#f0a8a8` | `#a33b3b` |
| `--selection` | `#2a3a55` | `#d5e2fb` |

`color-scheme` is `dark` on `:root` and `light` on `[data-theme="light"]`.

### Paper design direction (ADR-0037)

| Token | Dark | Light |
| --- | --- | --- |
| `--primary-top` / `--primary-bottom` | `#0e3ed2` / `#011fad` | same |
| `--field-top` / `--field-bottom` | `rgb(72 72 72 / 0.6)` / `rgb(72 72 72 / 0.4)` | `#e2e2de` / `#ecece8` |
| `--outline-card` | `rgb(44 44 44 / 0.2)` | `var(--bg-sunken)` |
| `--row-active` | `rgb(255 255 255 / 0.08)` | `rgb(0 0 0 / 0.06)` |
| `--kbd-text` | `#b0b0b0` | `var(--text-dim)` |
| `--font-display` | `var(--font-seb-display, var(--font-geist-sans)), sans-serif` | same |
| `--font-button` | `var(--font-seb-var, var(--font-geist-sans)), sans-serif` | same |

`--font-seb-display` and `--font-seb-var` are not defined until the Seb Sans files are loaded in `app/layout.tsx`, so both families resolve to Geist today. The Share button is the gradient with a `#fff` label. The title row is 56px. Tables sit in an 18px rounded wrapper. The outline column is `--bg` with the card inside.

Dark `::selection` in `globals.css` is hardcoded `#2a3a55`, the same value as `--selection`. Light `::selection` uses `var(--selection)`.

### Project tiles

Defined on `.project-tile`. `--tile-hue` is not given a value in CSS. See Referenced names.

| Token | Dark | Light |
| --- | --- | --- |
| `--tile-bg` | `oklch(0.36 0.07 var(--tile-hue))` | `oklch(0.9 0.05 var(--tile-hue))` |
| `--tile-fg` | `oklch(0.9 0.06 var(--tile-hue))` | `oklch(0.38 0.1 var(--tile-hue))` |

### Links, marks, callouts

These colors are not custom properties.

| Use | Dark | Light |
| --- | --- | --- |
| Markdown link, missing link, wiki chip | `#9db7ff` | `#2451b5` |
| Markdown link hover | `#c5d6ff` | `#1a3d8f` |
| Wiki chip underline | `rgba(157, 183, 255, 0.4)` | (no light override) |
| Mark background / text | `#3a3116` / `#f3e6c0` | `#f4e3b0` / `#3a3014` |
| Callout note background / title | `#1a2438` / `#9db7ff` | `#e7eefc` / `#2451b5` |
| Callout tip background / title | `#173026` / `#7dcea0` | `#e5f4eb` / `#1d6b45` |
| Callout important background / title | `#261f38` / `#c4b5fd` | `#efe8fb` / `#5b3d9e` |
| Callout warning background / title | `#2e2818` / `#e6c07b` | `#f8efd8` / `#8a5a10` |
| Callout caution background / title | `#321c1c` / `var(--danger)` | `#f8e4e4` / `#9a3030` |
| Scrollbar thumb | `#333` | `#c8c8c2` |
| Share button label | `#fff` | `#fff` |
| Destructive share button | `#b64242` | (no light override) |
| Overlay scrim | `rgba(0, 0, 0, 0.55)` | (same) |
| Mobile files scrim | `rgba(0, 0, 0, 0.45)` | (same) |

### Shadows

Shadows are in the CSS. C2 removed hairline borders in favor of solid fills. These shadows still shipped.

| Use | Dark | Light |
| --- | --- | --- |
| Switcher | `0 12px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04)` | `0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)` |
| Menu, block menu, suggest | `0 12px 32px rgba(0, 0, 0, 0.35)` | (no light override) |
| Bubble | `0 10px 28px rgba(0, 0, 0, 0.35)` | (no light override) |
| Toast | `0 12px 32px rgba(0, 0, 0, 0.3)` | (no light override) |
| Toast button hover | `rgba(127, 127, 127, 0.18)` | (same) |
| Light project card | — | `0 0 0 1px rgba(0, 0, 0, 0.06)` |
| Light project card hover | — | `0 0 0 1px rgba(0, 0, 0, 0.1), 0 6px 18px rgba(0, 0, 0, 0.06)` |

Inset rings use `var(--accent)`, `var(--bg-hover)`, or `var(--bg)` and are not separate colors. Drop-target and divider rings are `1px` or `1.5px`.

## Type

| Token | Value |
| --- | --- |
| `--font-sans` | `var(--font-geist-sans), sans-serif` |
| `--font-mono` | `var(--font-geist-mono), ui-monospace, monospace` |

UI text on `body` is 13px, line-height 1.45. Mono is used for paths, kbd, code, and the share-link field.

### Reading line

Shipped, from `reading.css`, and it wins over `globals.css`:

| Property | Shipped | Earlier rule, not what you see |
| --- | --- | --- |
| Font size | 17px on `.md-column`; `.md` inherits | `globals.css` sets `.md` to 16.5px |
| Line height | 1.7 on `.md` | `globals.css` sets 1.65 |
| Measure | Column capped at 760px; text 696px wide | `reading.css` sets `width: min(100%, calc(66ch + 64px))`. 66ch at 17px is 744px, so that width is 808px and `max-width: 760px` from `globals.css` binds. Padding is 32px on each side inside the border box, so the text is 696px wide. PRD 720px is not what shipped. A line near 66 characters is not the shipped width |

Below the 640px container breakpoint the column `width` becomes `100%`, and the 760px cap does not bind.

C4 asked for a line near 66 characters at 17px and 1.7 line height. The type size matches the CSS. The width that ships is the 760px cap.

### Reading headings

From `reading.css`, on `.md`. Root font size is the browser default (the CSS does not set it); rem below assumes 16px.

| Level | Size |
| --- | --- |
| h1 | `clamp(1.6rem, 1.15rem + 1.5vw, 1.875rem)` |
| h2 | `clamp(1.15rem, 1rem + 0.5vw, 1.25rem)` |
| h3 | `1.05rem` |
| h4 | No font-size in the CSS. Line-height 1.25 and letter-spacing `-0.02em` come from `globals.css` |

Other reading sizes that shipped: footnotes 14px; table 14.5px; table header 12.5px; code block 13.5px; embed body 15px; embed h1 and h2 16px; history preview 15px; palette input 16px (the 15px in `globals.css` loses).

### Other sizes in the CSS

11px labels and kbd, 12px meta and crumbs, 12.5px outline entries, 14px dialog titles and settings section titles, 15px palette rows and project card titles, 18px settings pane title, 26px missing-page title, 28px launcher title (24px at the 640px breakpoint). Letter-spacing on titles is `-0.01em` or `-0.03em`. Uppercase labels use `0.06em`.

## Radius

C5 shipped for the roles it names. `shape.css` is the rule that wins for those selectors.

| Role | Shipped | Where |
| --- | --- | --- |
| Controls | 12px | Search, tree link, text button, icon button, palette row, files button, edit toggle, share button, settings entry, several inputs |
| Outline rows | 10px | `.outline button` |
| Inline code and kbd | 8px | `.md :not(pre) > code`, `.md kbd`, shortcut kbd, copy button |
| Mark | 6px | `.md mark` |
| Blocks | 18px | Callout, embed, blockquote, details, image, code fence, Mermaid, chart, table scroll |
| Dialogs | 20px | Palette, shortcut help, settings, share dialog, sheet |

The PRD radii, 6px controls and 8px panels, are not what shipped for those roles.

Other radii that are in the CSS, and are not the C5 roles:

| Value | Where |
| --- | --- |
| 3px | Current-page bar in the file tree |
| 4px | Selected inline math, inline math field. `globals.css` also sets 4px on kbd, outline buttons, inline code, and the copy button; `shape.css` overrides those |
| 6px | Block-handle buttons, bubble buttons, source-editor controls, menu glyphs, project tile. `globals.css` 6px on search, tree links, text buttons, and palette rows loses to 12px |
| 7px | Project tile in the switcher |
| 8px | Project tile at medium size, folder chips, disk-banner button, block atom, empty block, suggest and block-menu rows, embed picker. `globals.css` 8px on blockquote, details, image, callout, embed, and code loses to 18px |
| 9px | Theme-switch option, MCP copy button, tree action, menu row |
| 10px | Project switch, switcher rows, settings nav, count pill, toast button, bubble, source editor, backlink chip |
| 12px | Tree rows, tree folders, tree inputs, history rows, project fields, launcher buttons, MCP sample, new-project icon, large project tile |
| 14px | Switcher panel, menu, toast |
| 16px | Project card. Block menu becomes `16px 16px 0 0` as a bottom sheet |
| 999px | Frontmatter chips |

## Spacing

Spacing is not a custom-property scale. These are the layout values in the CSS.

| Use | Value |
| --- | --- |
| Top bar and brand row | 44px, plus `env(safe-area-inset-top)` |
| Status line | 28px, plus `env(safe-area-inset-bottom)` |
| Coarse-pointer targets | 44px on icon buttons, search, text buttons, edit toggle, share, tree rows, menu rows, settings entry, project switch, launcher buttons |
| Reading padding | 40px 32px, bottom `96px` plus the safe area |
| Reading padding at the 640px container | 28px 20px, bottom `72px` plus the safe area |
| Reading padding at the 420px container | inline 16px |
| Focus outline | 2px solid `var(--accent)`, offset 2px (0 on project fields) |

`globals.css` padding of 36px 32px on `.md-column` loses to the reading padding above. The 24px 18px padding at the 860px breakpoint also loses to `reading.css` for the column.

## Column widths

| Column | Shipped |
| --- | --- |
| Files | 248px (`grid-template-columns` on `.shell` and `.shell.has-outline`) |
| Outline | 220px (same shell rule, and the old `.stage.preview` rule in `globals.css`) |
| Page | `minmax(0, 1fr)` |

`columns.css` wins for the shell: files, page, and outline are three full-height columns. `.stage.preview` is forced back to one column so the outline is not a second 220px inside the page.

Also in the CSS, not the two named columns:

| Use | Value |
| --- | --- |
| Mobile files drawer | `min(280px, 88vw)` |
| Source editor text | `max-width: 860px` on `.stage.source .cm-content` |
| Settings | `min(760px, calc(100vw - 32px))` by `min(520px, calc(100dvh - 48px))`; nav 180px |
| Share dialog | `min(480px, calc(100vw - 32px))` |
| Search palette and shortcut help | `min(520px, calc(100vw - 32px))` |
| History sheet | `min(980px, 100%)`, list 240px |
| Trash and move sheets | `min(560px, 100%)` |
| Switcher | 264px |
| Menu | 224px |
| Block menu | 260px |
| Launcher content | `min(1120px, 100%)` |
| Project grid | `repeat(auto-fill, minmax(280px, 1fr))` |

The plan's 248px files column and 220px outline column match the CSS.

## Breakpoints

| Query | What changes |
| --- | --- |
| `max-width: 860px` | Shell stacks. Outline hides. Files drawer and scrim. Settings gear shows when the sidebar is collapsed |
| `max-width: 720px` | History becomes one column; the version list scrolls sideways |
| `max-width: 640px` | Launcher stacks. Settings becomes one column and nearly full screen. Share dialog width `calc(100vw - 16px)` |
| `max-width: 420px` | Status line gap 8px and inline padding 12px |
| `@container (max-width: 840px)` | Block handle moves in; the add button hides |
| `@container (max-width: 640px)` | Reading column goes to 100% width. Source font size 15px. Block handle buttons shrink to 20px |
| `@container (max-width: 420px)` | Reading inline padding 16px |
| `(hover: none) and (max-width: 900px)`, also `max-width: 640px` | Block menu becomes a bottom sheet |

The plan's 860px shell, 640px column, and 420px column match the CSS.

The plan's 900px split breakpoint is not what shipped. 900px appears only in the block-menu query above. Preview and Markdown source are separate modes, not columns that stack at 900px.

`(pointer: coarse)` and `(hover: none)` are in the CSS and are not width breakpoints. `(prefers-reduced-motion: reduce)` is under Motion.

## Motion

| Use | Value |
| --- | --- |
| Chevron | `transform 120ms ease` |
| Project card | `background 120ms ease, transform 120ms ease` |
| Reduced motion | Card transition `none`. `scroll-behavior: auto` on everything |

The PRD range of 120–160ms is not what shipped. 120ms is in the CSS. 160ms is not.

## Referenced names

These names appear in the CSS and have no value in the stylesheets. They are recorded here so they are not invented.

| Name | Role | Where the value comes from |
| --- | --- | --- |
| `--font-geist-sans` | Type | `next/font` on `<html>` in `app/layout.tsx` |
| `--font-geist-mono` | Type | `next/font` on `<html>` in `app/layout.tsx` |
| `--shiki-dark` | Color | Shiki sets it on highlighted code. The CSS only reads it |
| `--shiki-light` | Color | Shiki sets it. The CSS only reads it, under `[data-theme="light"]` |
| `--tile-hue` | Color | `components/project-tile.tsx` sets 250, 160, 30, 290, 200, 340, 110, or 60 |
| `--depth` | Spacing | Tree rows set an integer. The CSS uses `calc(var(--depth, 0) * 14px)`. The fallback `0` is in the CSS |

## Values outside the categories

These are in the CSS and are not a color, a type size, a radius, a space, a column width, a breakpoint, or a motion duration.

| Kind | Values |
| --- | --- |
| z-index | 1 outline heading, 5 block handle, 30 mobile scrim, 40 files drawer, 50 overlay and bubble, 60 settings, share, block menu, and suggest, 70 switcher and menu, 80 toast |
| opacity | 0, 0.45 (disabled buttons), 0.8 (callout switch hover), 1 |
| filter | `brightness(1.08)` share button hover, `brightness(1.12)` launcher secondary hover, `brightness(0.96)` that hover in light |
