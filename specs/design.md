# Design direction

The look markdown-kb is going for, read from the owner's Paper file **Markdown KB → Product** (artboards "Markdown KB / Product", 1200×969, and "Sidebar - Outline", 208×286), pulled on 2026-09-26. Values below are the file's computed styles, not estimates from screenshots.

[ADR-0037](decisions/ADR-0037-paper-design-direction.md) adopts this direction. The requirements that make it testable are F21-REQ-020 to F21-REQ-027 and F08-REQ-036 to F08-REQ-041. Until those are built, [contracts/tokens.md](contracts/tokens.md) keeps recording what shipped.

## The feel in one line

A dark reading room: near-black paper, quiet grey chrome that steps back, one voice of display type for what the page *is*, and a single deep-cobalt control for the one action that leaves the room.

## Principles

1. **The page is the brightest thing on screen.** Body text is `#ECECEC` on `#111111` (16:1). Everything around it — file column, header, outline — is dimmer, smaller, or both.
2. **Chrome is grey, never colored.** Rows, labels, icons, and secondary buttons stay in the neutral ramp. Color appears once per screen, on the primary action.
3. **Surfaces are fills, not lines.** Columns separate by tone (`#1B1B1B` beside `#111111`), tables by row fills, the outline by a faint card. No hairlines, no drop shadows on columns (ADR-0006 still holds).
4. **Depth comes from soft vertical gradients, used twice.** The search field and the primary button carry a top-to-bottom gradient that reads as a slight bevel. Nothing else gets one.
5. **Display type names things; Geist does the work.** The page title, its lead paragraph, and the project name are set in Seb Sans Display. Headings below the title, body, tables, and UI stay in Geist, with Geist Mono for paths and code.
6. **Round, generous, consistent radii.** 12px controls, 10px small fields, 16px cards, 18px content blocks, 8px inline code.
7. **Dense chrome, roomy page.** Chrome uses 11–13px type on 30px rows. The page uses 17px type at 1.7 line height with 36px above each section.

## Palette (dark)

| Role | Value | Where in the file |
| --- | --- | --- |
| Page | `#111111` | Body, header, outline column |
| File column | `#1B1B1B` | Sidebar |
| Sunken | `#1F1F1F` | Table header and even rows, keyboard hint |
| Raised | `#2C2C2C` | Inline code, outline card base |
| Outline card | `#2C2C2C` at 20% over the page (≈ `#161616`) | Floating outline |
| Active row | white at 8% (`#FFFFFF14`, ≈ `#2D2D2D` on the sidebar) | Open page in the file list |
| Text | `#ECECEC` | Body, headings, active row, outline title |
| Text dim | `#A3A3A3` | Nav rows, Edit, path, table header |
| Text faint | `#737373` in the file, **`#8C8C8C` in the product** | Section labels, outline rows, inactive icons |
| Kbd text | `#B0B0B0` | ⌘K |
| Primary | gradient `#0E3ED2` → `#011FAD` (oklab 45.1% −0.023 −0.229 → 36.3% −0.022 −0.217), label `#FFFFFF` | Share |
| Search field | gradient `#484848` at 60% → 40% over the sidebar (≈ `#363636` → `#2F2F2F`) | Search |

Light theme: the file has no light artboard. The light theme keeps today's values (F21-REQ-002), with the primary gradient reused as is, since white on it is 8:1 or better. Two Light values are chosen here: the search field runs `#e2e2de` → `#ecece8`, and the outline card uses the sunken surface.

### Why the faint grey moves

The file's `#737373` fails WCAG 2.2 AA (X-REQ-013) where it is used: the "PAGES" label on the sidebar is 3.63:1, and outline rows on the card are 3.82:1. `#8C8C8C` passes on the page (5.62:1), the sidebar (5.12:1), the card (5.38:1), and dialogs on `#242424` (4.62:1) and keeps the same step below `#A3A3A3`. The search placeholder sits on the lighter field (2.55:1 in the file), so it uses `#A3A3A3` instead. This also closes X-T-013.

## Type

| Use | Family | Weight | Size / line height | Tracking | Color |
| --- | --- | --- | --- | --- | --- |
| Page title (H1) | Seb Sans Display | Bold 700 | 30 / 37.5px | −0.03em (−0.9px) | Text |
| Lead paragraph (first paragraph after the title) | Seb Sans Display | Regular 400 | 17 / 28.9px | 0 | Text |
| Body | Geist | Regular 400 | 17 / 28.9px (1.7) | 0 | Text |
| H2 | Geist | SemiBold 600 | 20 / 25px, 36px above | −0.02em | Text |
| H3 | Geist | SemiBold 600 | 16.8 / 21px, 23.5px above | −0.02em | Text |
| Inline code | Geist Mono | Regular 400 | 0.86em (14.6px) | 0 | Text on Raised, radius 8 |
| Table header | Geist | SemiBold 600 | 12.5 / 21.25px | 0 | Text dim |
| Table cell | Geist | Regular 400 | 14.5 / 24.65px (1.7) | 0 | Text |
| Project name | Seb Sans Display | Bold 700 | 16 / 18.85px | −0.008em | Text |
| Nav row | Geist | Regular 400 | 13 / 17.55px | 0 | Text dim; active Text |
| Section label ("Pages", "Outline") | Geist | Regular / Medium | 11 / 16px, uppercase | +0.06em | Text faint |
| Outline title / rows | Geist | Medium / Regular | 12.5 / 16.9px | 0 | Text / Text faint |
| File name in header | Geist Mono | Medium 500 | 12 / 17.4px | 0 | Text dim |
| Primary button label | Seb Sans Var | Medium 500 | 13 / 18.85px | 0 | `#FFFFFF` |
| Kbd hint | Geist Mono | Regular 400 | 11 / 16px | 0 | Kbd text |

**Seb Sans Display** (Regular, Bold) and **Seb Sans Var** (variable: `wght` 100–900, `XHGT` 82–122, `opsz` 14–32) are the owner's own families. They are installed on the design machine and are not on Google Fonts, so the app needs the font files, and a license that allows shipping them, before F21-T-011 can be built. Until then the fallback is Geist at the same size and weight.

## Layout

At 1200px wide (grid `248px 1fr`, with the outline inside the page column):

- **File column, 248px, `#1B1B1B`.** From the top:
  - the hide-sidebar control, alone on a 32px row
  - the project name in display type with an up-down chevron, no letter tile
  - Search: a 30px field with radius 10, the gradient fill, and ⌘K in a 1F1F1F chip
  - "PAGES" with + and ⋯
  - page rows: 30px tall, radius 12, padding 6px 8px 6px 12px
  - at the foot, one account row: a gear icon and the account label
- **Header, 56px, page color.**
  - On the left, the file name in Geist Mono, then the page actions ⋯ right beside it.
  - On the right, Edit (text only, dim) and Share (primary).
- **Page column.**
  - The reading column is padded 64px on the sides and 24px on top.
  - The paragraph measure stays under ADR-0005's cap.
  - Tables and code blocks are clipped to radius 18.
- **Outline.**
  - A 240px column in the page color, padded 16px on the sides and 24px on top.
  - It holds a floating card, 208px wide, radius 16, filled `#2C2C2C` at 20%.
  - The card lists:
    - "OUTLINE"
    - the page title
    - one row per H2, with a chevron that expands its H3s

## Components

- **Primary button (Share):** 28px tall, 12px side padding, radius 12, the cobalt gradient, a white Seb Sans Var Medium label. It is the only colored control on the screen.
- **Secondary button (Edit):** same box, no fill, dim label. Hover uses the hover fill.
- **Search field:** described above. Placeholder "Search" in Text dim.
- **Nav row:** 30px tall, radius 12. The active row has a white 8% fill and Text color. Its ⋯ action (26px, radius 9) shows at the right on hover and on the active row.
- **Outline card:** 12px padding. The "OUTLINE" label has 16px above and 8px below. Rows are 4px by 12px with radius 10, each with a 24px chevron slot at the right, so rows line up whether or not they have children.
- **Table:**
  - The container has radius 18 and clips its content.
  - Cells are padded 8px by 10px.
  - The header row and every even body row are filled `#1F1F1F`.
  - There are no borders.
- **Inline code:** `#2C2C2C` fill, radius 8, Geist Mono at 0.86em.

## What changes from the shipped app

| Area | Shipped | This direction |
| --- | --- | --- |
| Primary control | `--accent` `#7AA2F7` fill | Cobalt gradient, white label (F21-REQ-020) |
| Focus ring | Accent `#7AA2F7` | Unchanged; the accent stays for focus and links (F21-REQ-021) |
| Display type | None | Seb Sans Display on the title, lead, and project name (F21-REQ-022) |
| Search field | `--bg-hover` fill, radius 6 | Gradient fill, radius 10 (F21-REQ-023) |
| Faint text | `#737373` | `#8C8C8C` (F21-REQ-026) |
| Tables | Square corners | Radius 18 container (F21-REQ-025) |
| Outline | Full-height column in the sidebar color | Floating card in a page-colored column, collapsible sections (F08-REQ-036, F08-REQ-039, F08-REQ-040) |
| Header | Path, then Edit, Share, ⋯ on the right | File name and ⋯ on the left; Edit and Share on the right (F08-REQ-038) |
| Project header | Letter tile and name | Name in display type and a chevron, no tile (F08-REQ-041) |
| Sidebar foot | Trash and Settings | One account row that opens Settings; Trash moves to the Pages menu (F08-REQ-037) |

## Open questions

- **D-Q-1 Lead paragraph.** Only the first paragraph under the title uses the display face in the file. Is that a lead style, or an artifact of the import? Recommended: a lead style, for the first paragraph directly after the H1 only.
- **D-Q-2 Trash.** The file's sidebar has no Trash. Recommended: move Trash into the Pages ⋯ menu, which keeps one way in (constitution §6).
- **D-Q-3 Account row.** The label is `user-profile` in the file. Sign-in does not exist yet (ADR-0002). Recommended: the row reads "Settings" until sign-in, then the person's name.
- **D-Q-4 Fonts.** Can the Seb Sans files be shipped with the app, and under what license?
- **D-Q-5 Light theme.** The file is dark only. Recommended: keep today's light values until a light artboard exists.
