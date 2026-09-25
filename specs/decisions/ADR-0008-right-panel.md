# ADR-0008: Right panel

**Status:** Accepted

## Context

The PRD layout is three panes. The right panel holds properties, backlinks, and history, toggled with `⌘\`. The outline is also described there.

Change request C7, already live, makes a three-column layout: files, page, and outline, each full height. The title row and the status line use the page color. The right column is the outline only.

## Options

1. Right panel with properties, backlinks, history, and outline.
2. A full-height outline column only. Title row and status line use the page color.
3. No right column.

## Decision

The shell is three full-height columns: files, page, and outline. The right column shows the outline only. It does not show properties, backlinks, or history.

The title row and the status line use the same color as the page.

## Replaces

PRD right panel contents (properties, backlinks, history, outline) and the separate chrome color for the title row. Superseded by C7.

## Consequences

- F03: backlinks are not shown in the right column.
- F08: the third column is the outline, full height, and the title row and status line match the page color.
- F18: history is not a section of the right column.
