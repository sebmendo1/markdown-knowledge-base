# F02: Type schemas

## Summary

A document type is a Markdown file under `.ledger/types/` whose frontmatter is the schema and whose body is writing guidance. markdown-kb ships six built-in types as those files, and a space adds a type by adding another file, with no code change.

## Status and scope

Not started. The editor stores pages with `type` and `title` and does not load `.ledger/types/` or enforce field kinds.

This spec covers the six seed types, the field kinds, `required_when`, and the meta-schema a type file must pass. The checks that run on a document are F06. The `get_template` tool is F13. The frontmatter form is F09.

ADR-0014, ADR-0015, and ADR-0016 are Proposed. This spec follows them.

## Users and stories

- **F02-US-001** As the owner, I want the six built-in types to require the fields an experiment needs, so that results can be compared later.
- **F02-US-002** As the owner, I want a new type to be a Markdown file, so that changing a schema does not take a release.
- **F02-US-003** As an agent, I want each type's writing guidance in the schema file, so that a template arrives with the rules for that type.

## Requirements

- **F02-REQ-001** The system shall ship the six built-in types as editable schema files: harness, eval, experiment, finding, decision, and doc. The seed field lists are the JSON Schemas in `specs/contracts/frontmatter/`.
- **F02-REQ-002** The system shall accept only these field kinds: `string`, `number`, `date`, `enum`, `boolean`, `list`, `link`, `links`, and `metrics`.
- **F02-REQ-003** When a space adds `.ledger/types/<name>.md` and the file passes the meta-schema, the system shall load `name` as a document type with no code change.
- **F02-REQ-004** If a schema file fails a load check, the system shall refuse that save with `schema_invalid` and shall not replace the previous bytes of that file. When the failing file is a second file for a name already loaded, the system shall keep the loaded file and shall not load the second file.
- **F02-REQ-005** Where `required_when` is present, the system shall require it to be a one-key map whose key is another field on the same schema and whose value is a string, a number, or a boolean.
- **F02-REQ-006** The system shall treat a field as required if and only if `required` is true, or `required_when`'s watched field equals that scalar. Equality is the same YAML type and the same value.
- **F02-REQ-007** Where a link or links field has `pinned: true`, the system shall record that each link must include `@version`. The missing-version check is F06 `link_unpinned`.
- **F02-REQ-008** Where a field has `kind: metrics`, the system shall record that each key matches a metric on the eval linked from the `from` field. The document check is F06.
- **F02-REQ-009** The system shall treat `sections` as the heading names a document of that type should contain. A missing heading is F06 `section_missing`, a warning.
- **F02-REQ-010** When a type schema changes, the system shall not revalidate documents already stored. They are checked on their next change.
- **F02-REQ-011** The system shall treat the body of a schema file as writing guidance, and shall not require that body to use the `sections` headings.
- **F02-REQ-012** The system shall treat a `list` value as a list of strings.
- **F02-REQ-013** The system shall keep `type` and `title` required on every document when the schema's `fields` map omits them. A schema that defines `title` may set `max`, and the seed max is 120 characters.
- **F02-REQ-014** The system shall load a schema file only when its frontmatter satisfies `specs/contracts/type-schema.schema.json` and the loader checks in that contract's description.
- **F02-REQ-015** If a `required_when` scalar is not a value the watched field can hold, the system shall fail the schema with `schema_invalid`. An enum scalar must be one of `values`. A boolean field requires a boolean scalar. A number field requires a number scalar. A string field requires a string scalar.

## Acceptance scenarios

### F02-AC-001a

Given a new space, when its type files are read, then `.ledger/types/` contains `harness.md`, `eval.md`, `experiment.md`, `finding.md`, `decision.md`, and `doc.md`, and each file's frontmatter matches the seed JSON Schema of that name.

### F02-AC-001b

Given the seed experiment schema, when its fields are listed, then `verdict` has `required_when: { status: concluded }` and `filename` is `{date}-{slug}`.

### F02-AC-002a

Given a field whose `kind` is `table`, when the schema file is saved, then the code is `schema_invalid` and the message is `{field} kind must be one of string, number, date, enum, boolean, list, link, links, metrics.`

### F02-AC-003a

Given a valid file `.ledger/types/note.md` with `name: note`, `folder: notes`, and `filename: {slug}`, when it is saved, then `note` is a document type and a document may use `type: note`.

### F02-AC-004a

Given `.ledger/types/experiment.md` already loaded, when a second file tries to use `name: experiment`, then that second file fails `schema_invalid`, the message is `name "experiment" is already loaded from {other}.`, and the first file stays loaded.

### F02-AC-004b

Given a schema file whose YAML is a list, when it is saved, then the code is `schema_invalid`, the message is `Schema frontmatter is not a YAML map.`, and documents of that name fail `type_unknown` on their next save.

### F02-AC-005a

Given `required_when: { status: concluded, confidence: high }`, when the schema is loaded, then the code is `schema_invalid` and the hint is `Use one key, for example status: concluded.`

### F02-AC-005b

Given `required_when: { missing: concluded }` and no field named `missing`, when the schema is loaded, then the code is `schema_invalid` and the message is `{field} required_when names missing, which is not a field.`

### F02-AC-006a

Given an experiment with `status: concluded` and no `verdict`, when the document is validated, then the code is `field_missing` on `verdict` and the hint is `Add verdict when status is concluded.`

### F02-AC-006b

Given an experiment with `status: planned` and no `verdict`, when the document is validated, then `field_missing` is not reported for `verdict`.

### F02-AC-006c

Given `required_when: { status: concluded }` and a document whose `status` is `Concluded`, when the document is validated, then `field_missing` is not reported for `verdict`.

### F02-AC-015a

Given `required_when: { status: 1 }` on an enum `status` whose values are strings, when the schema is loaded, then the code is `schema_invalid` and the message is `{field} required_when value is not allowed for status.`

### F02-AC-007a

Given harness field `pinned: true` and the value `[[memento-journal]]`, when the document is validated, then the code is `link_unpinned`.

### F02-AC-008a

Given `results: { kind: metrics, from: eval }` and a result key that the linked eval does not define, when the document is validated, then the code is `metric_unknown`.

### F02-AC-009a

Given experiment sections `Setup`, `Observations`, `Surprises`, and `Next`, when the body has no heading `Surprises`, then the code is `section_missing` and the save is still allowed.

### F02-AC-010a

Given a stored experiment that omits `hypothesis`, when the experiment schema later marks `hypothesis` required, then the stored file is left unchanged until the next save of that document.

### F02-AC-011a

Given a schema body that is one paragraph and no `##` headings, when the schema file is loaded, then the load succeeds and the paragraph is the writing guidance.

### F02-AC-012a

Given a `list` field whose value is `[1, 2]`, when the document is validated, then the code is `field_kind` and the message is `{field} must be a list of strings.`

### F02-AC-013a

Given a custom schema that does not list `title`, when a document of that type has no `title`, then the code is `field_missing` on `title`.

### F02-AC-014a

Given a schema with `folder: assets`, when it is saved, then the code is `schema_invalid` and the message is `folder must not be assets.`

### F02-AC-014b

Given `.ledger/types/widget.md` whose frontmatter `name` is `widget`, when it is loaded, then the file stem matches `name`.

### F02-AC-014c

Given `.ledger/types/other.md` whose `name` is `widget`, when it is saved, then the code is `schema_invalid` and the message is `File name must be widget.md.`

## Edge cases and errors

Schema load failures are `schema_invalid`. Document failures caused by a schema are the F06 codes. Messages and hints are the rows in `specs/contracts/errors.md`.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| `type` is not `schema` | `schema_invalid` | `type must be schema.` | `Set type: schema in this file.` |
| Empty `required_when` | `schema_invalid` | `{field} required_when must be one field equal to a scalar.` | `Use one key, for example status: concluded.` |
| Enum field without `values` | `schema_invalid` | `{field} needs a non-empty values list.` | `Add values as a list of strings.` |
| `required_when` value not in the watched enum | `schema_invalid` | `{field} required_when value is not allowed for {watch}.` | `Use one of the values {watch} allows.` |
| Broken schema, then a document uses that name | `type_unknown` | `Unknown type "{type}".` | `Use a name that matches a loaded file in .ledger/types/.` |
| Condition true and the field is null | `field_missing` | `{field} is required.` | `Add {field} when {watch} is {value}.` |

`type: schema` on a file under `.ledger/types/` does not produce `type_unknown`.

Seed paths and patterns, also stored as `x-ledger` on each frontmatter JSON Schema:

| Type | Folder | Filename | Extra path segments |
| --- | --- | --- | --- |
| harness | `harnesses` | `{slug}` | No |
| eval | `evals` | `{slug}` | No |
| experiment | `experiments` | `{date}-{slug}` | No |
| finding | `findings` | `{slug}` | No |
| decision | `decisions` | `{slug}` | No |
| doc | `docs` | `{slug}` | Yes, slug segments only |

Seed sections are the `x-ledger.sections` arrays. Doc has none. Finding `supersedes` may be null. Eval `baseline` and harness `parent` are optional pinned links. Decision `results_in` is an optional pinned link.

`x-ledger` is an annotation for the seed folder, filename, nested flag, and sections. It is not a frontmatter key on a document. A JSON Schema compiler registers the keyword `x-ledger` before it compiles these files.

## Limits and budgets

A character is one Unicode code point.

| Limit | Value |
| --- | --- |
| Type `name` and `folder` | 1 to 80 characters |
| Field name | 1 to 64 characters, pattern `^[a-z][a-z0-9_]*$` |
| Filename pattern | 1 to 200 characters |
| Section heading | 1 to 200 characters |
| Enum value | 1 to 80 characters |
| String `max` | 1 to 100000 characters |
| Title on a seed type | 1 to 120 characters |
| Field kinds | 9 |
| Built-in types | 6 |
| `required_when` keys | 1 |

## UI states

This feature has no screen. A schema that fails to load uses the F06 report. The copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower.

| State | Copy |
| --- | --- |
| Empty | `No types loaded.` |
| Loading | `Checking…` |
| Error | `This type schema did not load.` followed by the `schema_invalid` message and hint |
| Partial | `Valid, with warnings.` |
| Success | `Type loaded.` |

There is no illustration and no dialog. Types are not edited in a separate builder. The file is the schema.

## Out of scope

- Emitting document errors other than by the rules F06 already names.
- The template tool and the syntax card returned to agents (F13).
- Property forms, dropdowns, and link pickers (F09).
- Metric charts and the baseline average (F16).
- Seeding the files into a new space on first run (F22). This spec defines the seed shape.

## Open questions

These rules are in the requirements. The product owner has not confirmed them. An ADR does not yet cover them.

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F02-Q-001 | What is the item kind of `list`? | Strings only. No `of` key in this version. | Product owner | F02-REQ-012 |
| F02-Q-002 | Must a `required_when` scalar be a value the watched field can hold? | Yes. Otherwise the schema fails `schema_invalid`. | Product owner | F02-REQ-015 |
| F02-Q-003 | What pattern is a metric `key`? | `^[a-z][a-z0-9_]*$`, 1 to 64 characters. | Product owner | The eval JSON Schema |
| F02-Q-004 | May a type other than `doc` allow extra folders? | No. Only the type named `doc`. | Product owner | F01-REQ-010 |

## Trace

- PRD anchors (`cursor/rebuild-prd-tables-f4c0`, `specs/source/ledger-prd.md`): `<!-- prd:document-types -->` (lines 72–83), `<!-- prd:custom-types -->` (lines 97–98), `<!-- prd:frontmatter-per-type -->` through `<!-- prd:type-schemas -->` (lines 124–238), `<!-- prd:space-and-agents -->` (lines 247–249).
- Decisions: D6, D8. D8 leaves run-log attachments out. Assets are enough, and this spec adds no run-log field.
- Change requests: none.
- ADRs: ADR-0013, ADR-0014, ADR-0015, ADR-0016.
- Contracts: `specs/contracts/frontmatter/*.schema.json`, `specs/contracts/type-schema.schema.json`, `specs/contracts/errors.md`.
