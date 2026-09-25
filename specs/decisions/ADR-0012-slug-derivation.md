# ADR-0012: Slug derivation

**Status:** Proposed

## Context

The PRD says the file name is the slug: lowercase, hyphens, unique in the space. It does not say how a title becomes a slug, which characters survive, whether letters outside ASCII are transliterated, what happens on a collision, or how long a slug may be.

Two implementers following the PRD would mint different slugs for the same title. This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Leave the algorithm unspecified.
2. Derive an ASCII slug from the title with a fixed transliteration, an 80-character cap, and a numeric suffix on collision.
3. Keep the raw title as the file name.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Derive the slug from the title in this order:

1. Trim leading and trailing whitespace. If nothing remains, the base is `untitled` and steps 2–7 are skipped.
2. Normalize with Unicode NFKD.
3. Remove characters in the Unicode category Mark (combining marks).
4. Lowercase `A`–`Z` to `a`–`z`. Leave other characters as they are.
5. Replace every character that is not `a`–`z` or `0`–`9` with `-`.
6. Collapse each run of `-` to a single `-`, then remove a leading or trailing `-`.
7. If nothing remains, the base is `untitled`.
8. If the base is longer than 80 characters, cut it to 80 and remove a trailing `-`.

The slug matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is at most 80 characters.

Uniqueness is against every document in the space, including archived documents. If the base is free, use it. If it is taken, append `-2`, then `-3`, and so on. Use the smallest integer `n >= 2` whose candidate is free. The candidate is the base plus `-` plus the decimal `n`, shortened until it is at most 80 characters: drop characters from the end of the base first, and drop a trailing `-` after that cut.

Examples that must hold:

| Title | Slug |
| --- | --- |
| `Context window 8k vs 4k` | `context-window-8k-vs-4k` |
| `Café` | `cafe` |
| `  Hello!! ` | `hello` |
| `---` | `untitled` |
| a second document also titled `Hello` | `hello-2` |

## Replaces

The unspecified slug algorithm behind the PRD sentence "file name = slug (lowercase, hyphens, unique in the space)" in section 2.3 (slug derivation).

## Consequences

- F01: document file names use this slug.
- F06: `slug_taken` uses this uniqueness check, including archived documents.
