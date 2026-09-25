# ADR-0018: Rename and existing links

**Status:** Proposed

## Context

Proposal actions in v1 are create and update. Rename is human-only. The PRD gives no screen, no steps, and no rule for links that still use the old slug.

`link_broken` means the linked slug does not exist. A rename that leaves those links untouched makes them broken. A rename that rewrites every file, or that keeps an alias, is a different product.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Leave rename without a flow, so each implementer chooses.
2. A human changes the slug. Other documents are not rewritten. Links to the old slug are `link_broken`. The old slug can be used again.
3. Rename rewrites every link in the space, and the old slug redirects forever.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Agents cannot rename. `propose_change` accepts only `create` and `update`. No OAuth scope and no API key can rename.

A human renames by setting a new slug. The new slug must match ADR-0012 (character set, length, and uniqueness). The path is recomputed from the type folder and filename pattern (ADR-0013). The save writes one new revision. Older revisions are not edited.

No other document is rewritten. There is no alias and no redirect. A link that still uses the old slug does not resolve. The next validation of the linking document reports `link_broken`: an error when the link is in frontmatter, a warning when it is in the body.

After the rename, the old slug is free for another document.

Who may rename follows ADR-0002. While the first release has no sign-in, the local user may rename. When roles exist, only Owner and Editor may rename. Anyone else gets a refusal and the slug stays unchanged.

## Replaces

The missing rename flow and the missing rule for links to the old slug in section 2.3.

## Consequences

- F01: a rename changes slug and path on the document only.
- F03: links are not rewritten. The old slug does not resolve.
- F06: those links fail `link_broken` on the next validation.
- F15: when roles exist, only Owner and Editor may rename.
