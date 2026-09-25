# ADR-0004: Editor model

**Status:** Accepted

## Context

The PRD editor is CodeMirror with inline live preview. Syntax renders on the line, and the cursor line shows source. `⌘/` toggles raw source. `E` edits.

Change request C2 removed the on-screen mode switch. Preview is the default, and `⌘/` switches mode. Change request C8 added an Edit button that turns editing on and off. The live editor shows source beside a preview. That mode is called editing.

Section 7 Q4 asks which model to spec. The recommended answer, which this decision adopts, is to keep the built mode and treat inline live preview as a later option inside F09.

## Options

1. Inline live preview, as in the PRD, with `⌘/` showing raw source.
2. Source beside a preview, called editing, toggled by `⌘/` and the Edit button. Preview is the default. No mode control on screen.
3. Source beside a preview, and also inline live preview, in the first release.

## Decision

Preview is the default. Editing means the source is shown beside the preview. `⌘/` and the Edit button in the title row turn editing on and off. There is no Preview/split control on screen.

Inline live preview is not in the first release. F09 may specify it later as an option. It does not replace the side-by-side editing mode.

## Replaces

PRD editor behavior: inline live preview, `⌘/` shows raw source, and `E` is the way into edit. Superseded by C2 and C8. Section 7 Q4 keeps inline live preview as a later F09 option only.

## Consequences

- F09: the editing mode is side-by-side source and preview, defaulting to preview.
- F20: `⌘/` toggles editing. It is not a raw-source toggle inside an inline preview.
