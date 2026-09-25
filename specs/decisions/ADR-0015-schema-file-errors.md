# ADR-0015: Schema file errors

**Status:** Proposed

## Context

A type schema is a Markdown file whose frontmatter is the schema. The PRD lists field kinds and shows one experiment schema. It does not define a meta-schema, so a broken schema file has no error code, no message, and no effect on documents that name that type.

`type_unknown` means the type matches a schema in `.ledger/types/`. That check cannot run if a broken file still counts as a schema.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Ignore a broken schema file and skip the error.
2. Reject a broken schema file with `schema_invalid`, do not load that type, and let documents of that type fail `type_unknown` on their next change.
3. Accept any YAML mapping as a schema.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

A file in `.ledger/types/` is loaded only if every check below passes. If one fails, the file is not a type.

Checks:

- The frontmatter parses as YAML.
- `type` is `schema`.
- `name` matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is 1 to 80 characters.
- `folder` is one path segment and matches the same pattern as `name`.
- `filename` is a string. The only placeholders are `{date}` and `{slug}` (ADR-0013).
- `fields` is a mapping. Each field's `kind` is one of: `string`, `number`, `date`, `enum`, `boolean`, `list`, `link`, `links`, `metrics`.
- An `enum` field has a non-empty `values` list.
- If `required_when` is present, it matches ADR-0016.

The error code is `schema_invalid`. Severity is error. It blocks the save of that schema file. The error's field is the schema path. The message names the failed check. The hint names the expected form.

A type name whose file did not load is not a known type. On the next save of a document that uses it, that document fails `type_unknown`. Existing documents are not rewritten when the schema breaks (the PRD already skips retroactive revalidation). They are checked on their next change.

## Replaces

The missing meta-schema error for a broken type schema file in section 2.3.

## Consequences

- F02: type files either load under these checks or are not types.
- F06: the rule catalog gains `schema_invalid`. `type_unknown` follows from a type that failed to load.
