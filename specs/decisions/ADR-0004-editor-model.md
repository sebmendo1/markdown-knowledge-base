# ADR-0004: Editor model

**Status:** Accepted

## Context

The PRD editor is CodeMirror with inline live preview. Syntax renders on the line, and the cursor line shows source. `⌘/` toggles raw source. `E` edits.

Change request C2 removed the on-screen mode switch. Preview is the default, and Command-/ switches mode. Change request C8 added an Edit button that turns editing on and off.

Plan section 2.2 described the live editor incorrectly. The as-built editor spec is the behavior below. Inline live preview, the PRD's CodeMirror model, did not ship.

Section 7 Q4 asks which model to spec. The recommended answer, which this decision adopts, is to keep what shipped and treat inline live preview as a later option inside F09.

## Options

1. Inline live preview, as in the PRD, with `⌘/` showing raw source.
2. What shipped: preview by default, a block editor in the reading column, and source as a full-page editor.
3. Ship the block editor and inline live preview together in the first release.

## Decision

Preview is the default.

Editing is a block editor in the reading column. It is not a split pane.

Source is a full-page editor.

Command-/ or Control-/ switches between the block editor and source.

The Edit button turns editing on from preview. From editing or from source, it turns editing off.

There is no mode control on screen for switching preview and source.

Inline live preview is not what shipped. F09 may specify it later as an option. It does not replace the block editor or the full-page source editor.

## Replaces

PRD editor behavior: inline live preview, `⌘/` shows raw source, and `E` is the way into edit. Superseded by C2, C8, and the as-built editor. Section 7 Q4 keeps inline live preview as a later F09 option only. The plan's section 2.2 description of this conflict is not the shipped behavior.

## Consequences

- F09: preview is the default. Editing is a block editor in the reading column. Source is a full-page editor. Inline live preview is a later option, not this release.
- F20: Command-/ or Control-/ switches between the block editor and source. The Edit button turns editing on from preview, and turns it off from editing or from source.
