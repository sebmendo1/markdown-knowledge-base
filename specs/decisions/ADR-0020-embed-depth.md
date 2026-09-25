# ADR-0020: Embed depth and cycles

**Status:** Proposed

## Context

Embeds transclude another document or section: `![[slug]]`, `![[slug#Heading]]`, and `![[slug@7]]`. The PRD says embeds resolve at most three levels deep and never loop. `embed_broken` is a body warning.

It does not say what the reader sees when the fourth level is reached, or what the reader sees when a cycle is found.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Leave the cutoff blank, so the reader might see a blank hole, the raw syntax, or a partial render.
2. Show the first three transclusions. At the next level, and on a cycle, show a link and a fixed sentence, and raise `embed_broken`.
3. Refuse to save a document that nests deeper than three or that cycles.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Depth counts transclusions. The document on screen is not a level.

- The host embeds A. Depth 1. A is transcluded.
- A embeds B. Depth 2. B is transcluded.
- B embeds C. Depth 3. C is transcluded.
- C embeds D. Depth 4. D is not transcluded.

A pinned embed (`![[slug@7]]`) uses the revision from ADR-0017 and still counts as one level.

When the next embed would be deeper than 3, the reader sees a link to that target (slug, plus `#Heading` or `@version` when present) and the sentence `Not embedded (depth limit).` The nested body is not rendered.

When the target slug is the host, or is any document already expanded in the current chain, the embed is not transcluded. The reader sees the same kind of link and the sentence `Not embedded (cycle).`

Both cases add the warning `embed_broken`. The message includes the target slug and either `depth limit` or `cycle`. The hint says to open the source document. The warning does not block save or merge.

## Replaces

The unstated reader-facing result at the three-level limit and on a cycle, in section 2.3.

## Consequences

- F03: embed resolution stops at depth 3 and on a cycle, with the sentences above.
- F04: the reading view shows the link and the sentence instead of a further transclusion.
- F06: those cases are `embed_broken` warnings, not errors.
