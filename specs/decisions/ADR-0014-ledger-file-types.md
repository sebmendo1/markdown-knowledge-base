# ADR-0014: Ledger file types

**Status:** Proposed

## Context

Every document file starts with frontmatter, and `type` plus `title` are required. The six document types are harness, eval, experiment, finding, decision, and doc. `type_unknown` fires when `type` matches no schema in `.ledger/types/`.

Schema files use `type: schema`, which is not one of the six. `space.md` and `agents.md` are called ordinary documents, but they have no frontmatter spec. A validator that only knows the six types would reject the schema files, and an implementer would have to guess the frontmatter of `space.md` and `agents.md`.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Run `type_unknown` on schema files, and leave `space.md` and `agents.md` without a required shape.
2. Treat `.ledger/types/*.md` as schema files outside the six types. Treat `space.md` and `agents.md` as `type: doc` at fixed paths.
3. Invent a seventh document type for each of those files.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Files at `.ledger/types/<name>.md` are schema files, not documents of the six types.

- Frontmatter `type` is `schema`.
- `type_unknown` does not apply to these files.
- They are checked by the schema-file rules in ADR-0015.

`.ledger/space.md` and `.ledger/agents.md` are ordinary documents.

- Frontmatter includes `type: doc` and a `title` whose value is a non-empty string.
- Their paths are exactly those two paths. They do not have to sit in the doc type's folder or match the doc filename pattern.
- `path_invalid` does not fire only because the path is under `.ledger/`.

A missing `type` or `title` on either file is `field_missing`. A `type` other than `doc` fails `field_kind` on the `type` field. The message is `type must be doc`. The hint is `Use type: doc for space.md and agents.md.`

## Replaces

The missing frontmatter spec for `space.md`, `agents.md`, and schema files in section 2.3, including the clash between `type: schema` and `type_unknown`.

## Consequences

- F01: `.ledger/space.md`, `.ledger/agents.md`, and `.ledger/types/*.md` have the shapes above.
- F02: a schema file is loaded as a type definition, not as a document of one of the six types.
- F06: `type_unknown` does not reject `type: schema` on a file under `.ledger/types/`.
