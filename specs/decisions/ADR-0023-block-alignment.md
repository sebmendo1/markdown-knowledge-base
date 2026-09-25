# ADR-0023: Diff block alignment

**Status:** Proposed

## Context

The review diff parses both versions into Markdown blocks, aligns blocks by position and similarity, then runs a word diff inside changed blocks. The PRD does not give the similarity measure or the threshold, so the same two documents can pair different blocks.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Align only by index. Block `i` pairs with block `i`.
2. Pair same-type blocks in order when word-set Jaccard is at least 0.5, using the greedy walk below.
3. Pair any blocks with a similarity above a threshold the implementer chooses.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Blocks are the top-level Markdown blocks of the body, after frontmatter is removed. A list is one block. A blockquote is one block. Frontmatter is not a block in this alignment; the frontmatter diff stays the field table described in the PRD.

The words of a block are the matches of `[A-Za-z0-9]+` in its source, lowercased. Similarity is the Jaccard index of the two word multisets: the size of the multiset intersection divided by the size of the multiset union. If both word sets are empty, similarity is 1 when the block types are equal and 0 otherwise.

A pair is eligible only when both blocks have the same type and the similarity is greater than or equal to 0.5.

Walk the old blocks from first to last. Track the last matched index in the new document, starting at -1. For each old block, consider unused new blocks whose index is greater than that cursor. Among eligible ones, pick the highest similarity. If several tie, pick the earliest index. If none qualify, the old block is a deletion. New blocks skipped by the cursor, and new blocks left over at the end, are insertions, in their original order.

The word diff runs only inside a pair. An insertion or a deletion is not word-diffed against a neighbor.

## Replaces

The unspecified similarity measure and threshold for "align blocks by position and similarity" in section 2.3.

## Consequences

- F12: the rendered diff pairs blocks with this Jaccard rule and the 0.5 threshold.
