# ADR-0037: Paper design direction

**Status:** Accepted

## Context

The owner's Paper file **Markdown KB → Product** shows the look they want. [specs/design.md](../design.md) records it, with values taken from the file's computed styles.

Most of it matches what shipped: the same surfaces, text colors, radii, and reading type. It departs from shipped decisions in five places:

- The primary control is a deep-cobalt gradient, not the light accent (F21-REQ-004).
- A display face, Seb Sans Display, names the page and the project (F21-REQ-009).
- The outline is a floating card in a page-colored column, with collapsible sections. ADR-0008 made it a full-height column in the sidebar color (F08-REQ-006).
- The header puts the page actions beside the file name (F08-REQ-015).
- The sidebar foot has one account row, and no Trash or Settings pair (F08-REQ-013).

Its faint grey, `#737373`, fails WCAG 2.2 AA where the file uses it (X-REQ-013).

## Options

1. Keep the shipped design and file the Paper design as reference only.
2. Adopt the Paper design as the target, with the faint grey raised to pass AA.

## Decision

Option 2. The product owner chose it on 2026-09-26.

- The primary action uses the cobalt gradient with a white label. The accent `#7AA2F7` stays for focus, links, and agent marks.
- Two soft vertical gradients are allowed, on the primary button and the search field. ADR-0006 still rules out hairlines between surfaces and shadows on columns.
- Seb Sans Display sets the page title, the lead paragraph, and the project name. Seb Sans Var sets the primary button label. Geist and Geist Mono set everything else. Until the font files ship, Geist is the fallback.
- The outline is a card inside a page-colored column. This replaces ADR-0008's full-height sidebar-colored outline. The right column still shows only the outline.
- Faint text is `#8C8C8C` in Dark, not the file's `#737373`.

Where the file leaves a gap, the recommended answers in design.md D-Q-1 to D-Q-5 apply until the owner answers.

## Replaces

- ADR-0008, for the outline surface and shape.
- F21-REQ-004 and F21-REQ-009, replaced by F21-REQ-020 to F21-REQ-022.
- F08-REQ-006, F08-REQ-013, and F08-REQ-015, replaced by F08-REQ-036 to F08-REQ-038.

## Consequences

- F21: new requirements F21-REQ-020 to F21-REQ-027.
- F08: new requirements F08-REQ-036 to F08-REQ-041.
- X: the new faint grey closes X-T-013 in Dark.
- `specs/contracts/tokens.md` changes when the tasks are built. It records what shipped.
