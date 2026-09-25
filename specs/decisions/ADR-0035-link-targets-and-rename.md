# ADR-0035: Link targets and rename

**Status:** Accepted

## Context

Two sets of specs disagreed about wiki links.

F01 and F06 say a wiki link names a slug (`[[slug]]`, `[[slug@N]]`, `[[slug#Heading]]`). ADR-0018 says a rename leaves every other file unchanged, so links to the old slug fail `link_broken`.

F03 describes what shipped. A target resolves to a page path, or to a file name when exactly one page has it (F03-REQ-001). A link may carry a `|label` (F03-REQ-002). Renaming or moving a page or folder rewrites every link that pointed there (F03-REQ-009, `lib/workspace/relink.ts`, `lib/workspace/moves.ts`).

In a Ledger space, a document's file name is its slug (F01-REQ-006, F01-REQ-020), so a slug target is a file-name target. The two rules differ only in whether paths and labels are allowed, and in what a rename does to other files.

## Options

1. Follow F01 and ADR-0018. Match by slug only, and leave links to break on rename. This changes shipped behavior, and existing pages lose their links.
2. Follow F03. Match by path or unique file name, allow `|label`, and rewrite links on rename and move.

## Decision

Option 2. The product owner chose it on 2026-09-25.

- F03-REQ-001 is the only resolution rule. A slug target resolves because the slug is the file name.
- A wiki-link string is `[[target]]` with optional `@N`, `#Heading`, and `|label`, in that order. `@N` keeps the ADR-0017 meaning where revisions exist. Until then, F03-REQ-003 renders a target with `@` as unresolved.
- A rename or move rewrites every wiki target that resolved to the old path, keeping `#Heading` and `|label`. A rename changes the renamed document and each linking document in one save.
- `link_broken` means the target does not resolve under F03-REQ-001, including a file name that more than one page has. An archived document still resolves (ADR-0019).
- Only a human renames or moves. Agents still cannot (ADR-0002, constitution §3).

## Replaces

- ADR-0018, from the Decision section to the end. Its rule that agents cannot rename still stands.
- F01-REQ-014 and F01-REQ-018, replaced by F01-REQ-021 and F01-REQ-022.
- F06-REQ-011, replaced by F06-REQ-030.

## Consequences

- F01: the wiki grammar allows a path target and `|label`. A rename rewrites links.
- F03: unchanged. It already describes this behavior.
- F06: `link_broken` resolves with the F03 rule. The message names the target, not a slug.
- F07: a rename writes a revision for each document whose links were rewritten.
- `specs/contracts/errors.md`: the `link_broken` message and hint change.
