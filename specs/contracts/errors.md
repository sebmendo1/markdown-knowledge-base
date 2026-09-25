# Validation errors

Catalog for the validator in F06. The same codes are returned for a proposal, a human save, an import, and the `validate` tool.

Eighteen rules come from the PRD validation table. Four rendering checks are warnings in the body. `schema_invalid` is the extra code from ADR-0015 for a type schema file that does not load.

Placeholders in a message or hint are filled by the validator. `{field}` is the frontmatter key. `{line}` is a 1-based line number in the file. `{bytes}` is an integer count of UTF-8 bytes. A character is one Unicode code point.

An issue is one object:

| Key | Value |
| --- | --- |
| `code` | The code in this catalog |
| `severity` | `error` or `warning` |
| `field` | Frontmatter key, `path`, `slug`, `content`, `base_revision_id`, `results.{key}`, or the schema path |
| `line` | 1-based line when the issue is in the body or the YAML parser names a line. Omitted when the issue is only a field |
| `message` | The sentence below, with placeholders filled |
| `hint` | The sentence below, with placeholders filled |

`valid` is false when the result contains any error. Warnings leave `valid` true.

## The 18 rules

| Code | Condition | Severity | Field or line | Message | Hint |
| --- | --- | --- | --- | --- | --- |
| `yaml_invalid` | The file has no frontmatter block, the block is not a YAML map, or the YAML parser throws | Error | Line 1, or the parser line | See variants | See variants |
| `type_unknown` | `type` is present and matches no schema that loaded from `.ledger/types/` | Error | `type` | `Unknown type "{type}".` | `Use a name that matches a loaded file in .ledger/types/.` |
| `field_missing` | A required field is absent or null, including a field whose `required_when` condition is true | Error | `{field}` | `{field} is required.` | See variants |
| `field_kind` | The value is the wrong YAML type, outside an enum, over a max, under a min, or not a real calendar date | Error | `{field}` | See variants | See variants |
| `field_unknown` | A frontmatter key is not `type` and is not in the loaded schema | Warning | `{field}` | `{field} is not a field on {type}.` | `Remove {field}, or add it to the type schema.` |
| `link_broken` | The slug matches no document in the space, archived documents included | Error in frontmatter. Warning in the body | Field, or the body line | `No document has slug "{slug}".` | `Use a slug that exists in this space. Archived documents still count.` |
| `link_unpinned` | A field with `pinned: true` is a wiki link and has no `@version` | Error | `{field}` | `{field} link needs a version.` | See variants |
| `version_missing` | The link names `@version` and no revision of that document has that version | Error | Field, or the body line | `{slug} has no version {version}.` | `Use a version saved on that document.` |
| `metric_unknown` | A key in `results` is not a metric `key` on the linked eval | Error | `results.{key}` | `{key} is not a metric on {eval}.` | `Use a key from that eval's metrics list.` |
| `metric_missing` | `status` is `concluded` and a metric on the linked eval has no `results` key | Warning | `results` | `results is missing {key}.` | `Report every metric the eval defines, including ones that got worse.` |
| `metric_range` | The eval declares `range` and the result number is outside it, inclusive bounds | Error | `results.{key}` | `{key} must be between {min} and {max}.` | `Use a value inside the range declared for {key}.` |
| `path_invalid` | The path does not match the type folder and filename pattern, the date token cannot be filled, or the new path is already taken | Error | `path` | See variants | See variants |
| `slug_taken` | A create or a rename uses a slug that another document in the space already has, including an archived document | Error | `slug` | `Slug "{slug}" is already used.` | `Use a free slug. The next suffix is -{n}.` |
| `base_missing` | A proposal `update` omits `base_revision_id`, or the id is not a revision of that document | Error | `base_revision_id` | `Update needs a base revision.` | `Send the revision id you read, as base_revision_id.` |
| `version_not_bumped` | A harness or eval save changes the file and the new `version` is not an integer greater than the head's `version` | Warning | `version` | `version is still {version} after a content change.` | `Increase version. A pin keeps the first save of this version.` |
| `section_missing` | A name in the schema `sections` list has no matching heading in the body | Warning | `body` | `Missing section "{name}".` | `Add a heading named {name}.` |
| `no_change` | The full file is byte-identical to the head | Error | `content` | `Content is identical to the current head.` | `Change the document, or skip this save.` |
| `too_large` | The UTF-8 byte length of the file is greater than 204800 bytes (200 KB, 200 × 1024) | Error | `content` | `Document is {bytes} bytes. The limit is 204800 bytes (200 KB).` | `Shorten the file to 204800 bytes or less, UTF-8.` |

A file of 204800 bytes is allowed. A file of 204801 bytes is `too_large`.

## The 4 rendering checks

These are warnings. They do not block a save or a proposal. A broken diagram does not block a finding.

| Code | Condition | Severity | Field or line | Message | Hint |
| --- | --- | --- | --- | --- | --- |
| `chart_invalid` | A `chart` fence fails the Vega-Lite v6 schema, or its data is not inline, a CSV under `assets/`, or a metrics query | Warning | The fence's first line | See variants | See variants |
| `math_invalid` | KaTeX rejects inline math, a `$$` block, or a `math` fence | Warning | The line where the math starts | `Math failed to parse: {parser}.` | `Fix the KaTeX in this block.` |
| `embed_broken` | The next transclusion would pass depth 3, or the target is already in the embed chain | Warning | The embed line | `Not embedded ({reason}): {slug}.` | `Open the source document.` |
| `mermaid_invalid` | Mermaid rejects a `mermaid` fence | Warning | The fence's first line | `Diagram failed to parse: {parser}.` | `Fix the Mermaid syntax in this block.` |

`chart_invalid` and `math_invalid` are produced by the server validator. `mermaid_invalid` is produced when a diagram is rendered for reading or for review. The server `validate` tool does not run Mermaid.

`{reason}` is `depth limit` or `cycle`. Depth counts transclusions. The document on screen is not a level. Three nested embeds render. The fourth does not. A pinned embed counts as one level. The bytes a pin returns are the earliest revision with that version (ADR-0017). Which bytes render is F03. This code is only the warning.

## schema_invalid

Not one of the 18. A file at `.ledger/types/<name>.md` that fails any check below does not load. Documents that name it then fail `type_unknown` on their next save. Existing documents are not rewritten.

| | |
| --- | --- |
| Code | `schema_invalid` |
| Severity | Error |
| Field | The schema path, for example `.ledger/types/experiment.md` |
| Blocks | The save of that schema file |

| Condition | Message | Hint |
| --- | --- | --- |
| Frontmatter is missing or is not a YAML map | `Schema frontmatter is not a YAML map.` | `Start the file with ---, a YAML map, and a closing ---.` |
| `type` is not `schema` | `type must be schema.` | `Set type: schema in this file.` |
| `name` fails the slug pattern or is outside 1 to 80 characters | `name must match the slug pattern and be 1 to 80 characters.` | `Use lowercase letters, digits, and hyphens. For example experiment.` |
| `folder` is not one slug segment of 1 to 80 characters | `folder must be one slug segment, 1 to 80 characters.` | `Use a single folder name, for example experiments.` |
| `folder` is `assets` | `folder must not be assets.` | `Pick a folder other than assets.` |
| `filename` is empty, longer than 200 characters, or contains a `{…}` other than `{date}` and `{slug}` | `filename may only use the placeholders {date} and {slug}.` | `Remove any other {token} from filename.` |
| `fields` is not a map | `fields must be a map of field names to kinds.` | `Add a fields map. Each entry needs a kind.` |
| A field name fails `^[a-z][a-z0-9_]*$` or is longer than 64 characters | `{field} is not a legal field name.` | `Use a lowercase name that starts with a letter. Digits and underscores are allowed.` |
| `kind` is not one of the nine kinds | `{field} kind must be one of string, number, date, enum, boolean, list, link, links, metrics.` | `Set kind to one of those nine.` |
| `kind` is `enum` and `values` is missing or empty | `{field} needs a non-empty values list.` | `Add values as a list of strings.` |
| `kind` is `link` or `links` and `to` is missing | `{field} needs a to type.` | `Set to to a type name, for example harness.` |
| `kind` is `metrics` and `from` is missing | `{field} needs a from field.` | `Set from to the link field that points at the eval.` |
| A key is present that the kind does not allow | `{field} uses keys its kind does not allow.` | `Keep only the keys listed for that kind.` |
| `required_when` is not a one-key map to a string, number, or boolean | `{field} required_when must be one field equal to a scalar.` | `Use one key, for example status: concluded.` |
| `required_when` names a field that is not on this schema | `{field} required_when names {watch}, which is not a field.` | `Name a field on this schema.` |
| `required_when` holds a scalar the watched field cannot hold | `{field} required_when value is not allowed for {watch}.` | `Use one of the values {watch} allows.` |
| The file stem differs from `name` | `File name must be {name}.md.` | `Rename the file to match name, under .ledger/types/.` |
| Another loaded file already uses `name` | `name "{name}" is already loaded from {other}.` | `Keep one schema file for this name.` |

Kind keys that are allowed, besides `kind`, `required`, and `required_when`:

| Kind | Also allowed |
| --- | --- |
| `string` | `max` (integer, at least 1, at most 100000), the unit is characters |
| `number` | `min` (number, inclusive) |
| `date` | none |
| `enum` | `values` (non-empty list of strings, each 1 to 80 characters, unique) |
| `boolean` | none |
| `list` | none. Items are strings |
| `link` | `to`, `pinned` |
| `links` | `to`, `pinned` |
| `metrics` | `from` |

## Variants

### yaml_invalid

| Condition | Message | Hint |
| --- | --- | --- |
| No opening `---` block, or the parsed value is a list, a scalar, or null | `Frontmatter is missing or is not a YAML map.` | `Start the file with ---, then a YAML map that includes type and title, then a closing ---.` |
| The YAML parser throws | `Frontmatter YAML failed: {parser}.` | `Fix the YAML between the --- lines. The block must be a map.` |

When this code is reported, field errors are not reported for that file. `too_large` is still reported when the byte length is over 204800 bytes.

### field_missing

| Condition | Hint |
| --- | --- |
| The field is `required: true`, or it is `type` or `title` | `Add {field}.` |
| `required_when` matches | `Add {field} when {watch} is {value}.` |

The message is always `{field} is required.`

`type` and `title` are required on every document even when `fields` omits them. A missing `type` is `field_missing` and is not also `type_unknown`.

### field_kind

| Condition | Message | Hint |
| --- | --- | --- |
| A string kind received a non-string | `{field} must be a string.` | `Use a YAML string for {field}.` |
| A string is empty and the minimum length is 1 character | `{field} must not be empty.` | `Add text for {field}.` |
| A string is longer than `max` characters | `{field} must be at most {max} characters.` | `Shorten {field} to {max} characters or fewer.` |
| A number kind received a non-number | `{field} must be a number.` | `Use a YAML number for {field}, not a string.` |
| A number is below `min` | `{field} must be at least {min}.` | `Use a value of {min} or greater.` |
| A date is not a real calendar date `YYYY-MM-DD` | `{field} must be a real date as YYYY-MM-DD.` | `Use a calendar date, for example 2026-09-22.` |
| An enum value is not in `values` | `{field} must be one of {values}.` | `Pick one of the listed values.` |
| A boolean kind received a non-boolean | `{field} must be true or false.` | `Use a YAML boolean, not a string.` |
| A list kind is not a list of strings | `{field} must be a list of strings.` | `Use a YAML list of strings for {field}.` |
| A link is not a wiki link | `{field} must be a wiki link.` | `Use [[slug]], [[slug@7]], or [[slug#Heading]].` |
| A links value is not a list of wiki links | `{field} must be a list of wiki links.` | `Use a YAML list of [[slug]] strings.` |
| A metrics value is not a map of keys to numbers | `{field} must be a map of metric keys to numbers.` | `Set each metric to a YAML number.` |
| An eval metric `range` has a first number greater than the second | `{field} range minimum is greater than its maximum.` | `Put the lower bound first.` |
| `version` is not an integer from 1 to 999999999 | `version must be an integer from 1 to 999999999.` | `Use a whole number, for example 7.` |
| `.ledger/space.md` or `.ledger/agents.md` has `type` other than `doc` | `type must be doc.` | `Use type: doc for space.md and agents.md.` |

A pinned field that is a wiki link without `@version` is `link_unpinned` only. It is not also `field_kind`.

`{values}` is the enum list, comma-separated, in schema order.

### link_unpinned

| Condition | Hint |
| --- | --- |
| The link's slug is a document whose `status` is `active` and whose `version` is an integer | `Use [[{slug}@{version}]]. Active version is {version}.` |
| Otherwise | `Add @ and a version, for example [[slug@7]].` |

The message is always `{field} link needs a version.`

### path_invalid

| Condition | Message | Hint |
| --- | --- | --- |
| The path is not the type folder, the filename pattern, and `.md` | `Path does not match {folder}/{pattern}.` | `Save the file at {expected}.` |
| The pattern contains `{date}` and `date` is missing or is not `YYYY-MM-DD` | `date does not fit the filename pattern.` | `Set date to YYYY-MM-DD, which the path uses.` |
| The recomputed path is already another document's path | `Path "{path}" is already used.` | `Keep the current path, or pick a date and slug that are free.` |

For type `doc`, `{expected}` may include extra slug segments under `docs/`. `.ledger/space.md` and `.ledger/agents.md` do not use this code only because they sit under `.ledger/`.

### chart_invalid

| Condition | Message | Hint |
| --- | --- | --- |
| The fence body fails the Vega-Lite v6 schema | `Chart does not match the Vega-Lite schema.` | `Fix the chart spec. Data must be inline, an assets/ CSV, or a metrics query.` |
| Data comes from an external URL or another source | `Chart uses a data source that is not allowed.` | `Use inline data, a CSV in assets/, or a metrics query.` |

`{parser}` is the parser's own message, one line, truncated to 200 characters.

## Precedence

1. A schema file is checked only with `schema_invalid`. `type_unknown` does not apply to `type: schema` on `.ledger/types/<name>.md`.
2. `yaml_invalid` suppresses field codes for that file.
3. `too_large` is reported together with any other code that still applies.
4. Null on a required field is `field_missing` only.
5. Null on an optional field is treated as absent.
6. A create does not report `base_missing`, `version_not_bumped`, or `no_change`.
7. A human direct save does not report `base_missing`. That code is for a proposal `update`.
8. `link_broken` looks at the slug. A missing heading is not this code.
9. An archived document is not `link_broken`.
10. `metric_range` is skipped when the eval declares no `range`, and when the value is not a number (`field_kind` covers that).
11. `version_missing` is skipped when the link has no `@version` (`link_unpinned` covers a pinned field).
12. One condition produces one issue. A concluded experiment missing three metrics produces three `metric_missing` warnings, one per key.
