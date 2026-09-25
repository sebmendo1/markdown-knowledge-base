# ADR-0029: Search score

**Status:** Proposed

## Context

Search is full-text over title, body, and frontmatter values, ranked by title match, then recency. The `search` tool returns a `score` with each hit. The PRD gives no formula beyond that ranking, so two servers can return different scores and, when recency ties, a different order.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Return an undefined score and an undefined order for ties.
2. Rank title matches first, then `updated_at` descending, then slug ascending. Set `score` to 1 or 0 from the title match.
3. Rank with a term-frequency formula across the body.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Split the query on whitespace, lowercase each piece, and drop empty pieces. Those are the terms. The typed filters in the PRD (`type:`, `status:`, and the rest) still select the candidate set and are not part of the score.

A document matches when every term is a case-insensitive substring of the title, the body, or a frontmatter scalar. A title match means every term is a case-insensitive substring of the title.

Return hits in this order:

1. Title matches before other matches.
2. Then `updated_at` descending.
3. Then slug ascending.

`score` is `1` for a title match and `0` otherwise. The list is already ordered, so a client that sorts by `score` descending and otherwise keeps this order sees the same list.

## Replaces

The missing ranking formula for `search` beyond "title match, then recency" in section 2.3.

## Consequences

- F17: search results use this order and this 0/1 score.
