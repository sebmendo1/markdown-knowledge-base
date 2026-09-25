# F02 design: type schemas

A type is a Markdown file at `.ledger/types/<name>.md`. The frontmatter is the schema. The body is writing guidance. The six built-in types ship as those files, and a space adds a type by adding another file. Document checks that use a loaded schema are F06. This feature has no screen and no schema builder.

## Modules

| Module | Role |
| --- | --- |
| `lib/types/kinds.ts` | The nine field kinds and the string-list rule. |
| `lib/types/load.ts` | Parses a schema file with F01's frontmatter parser, checks it against the meta-schema, then runs the loader checks. |
| `lib/types/catalog.ts` | The loaded map from `name` to schema. A failed file stays out of the map. |
| `lib/types/required.ts` | Decides when a field is required, including `required_when` equality. |
| `lib/types/pinned.ts` | Reads `pinned: true` and reports a wiki link that has no `@version`. |
| `lib/types/metrics.ts` | Reads `kind: metrics` and compares result keys with the linked eval. |
| `lib/types/sections.ts` | Lists heading names a document should contain. A miss is a warning. |
| `lib/types/metric-record.ts` | The eval metric record from [eval.schema.json](../../contracts/frontmatter/eval.schema.json) `$defs/metric`. |
| `lib/types/save.ts` | Refuses a schema save that fails, and leaves the previous bytes in place. |
| `seeds/types/*.md` | The six shipped schema files. F22 copies them into a new space. |

`lib/issues/messages.ts` (F01) supplies the `schema_invalid` sentences. Add the `ajv` package for draft 2020-12. Register the keyword `x-ledger` before compiling the six frontmatter JSON Schemas and the meta-schema, so those files compile with their annotation kept.

Runtime document checks use the loaded Markdown schema. Custom types never need a generated JSON Schema. The six JSON Schemas are the seed contract the Markdown files match.

## Data shapes

```ts
type FieldKind =
  | "string"
  | "number"
  | "date"
  | "enum"
  | "boolean"
  | "list"
  | "link"
  | "links"
  | "metrics";

type FieldDef = {
  kind: FieldKind;
  required?: boolean;
  requiredWhen?: { field: string; value: string | number | boolean };
  max?: number;
  min?: number;
  values?: string[];
  to?: string;
  pinned?: boolean;
  from?: string;
  /** Set only by the seed compiler for eval `metrics`. */
  metricRecords?: true;
};

type TypeSchema = {
  path: string;
  name: string;
  folder: string;
  filename: string;
  fields: Record<string, FieldDef>;
  sections: string[];
  guidance: string;
  nested: boolean; // true only when name is "doc"
};

type SchemaCatalog = ReadonlyMap<string, TypeSchema>;

type MetricRecord = {
  key: string; // ^[a-z][a-z0-9_]*$, 1 to 64 code points
  unit: string; // 1 to 40 code points
  better: "higher" | "lower";
  range?: [number, number];
};
```

`required_when` is stored as one field and one scalar. A character is one Unicode code point.

## State

`SchemaCatalog` is rebuilt by reading `.ledger/types/*.md`. The catalog keeps no document list.

- A file that fails a load check is omitted. Documents that name it fail `type_unknown` on their next save (F06).
- A failed save of a file that already loaded keeps the previous bytes and the previous catalog entry.
- A second file whose `name` is already loaded fails. The loaded file stays. The second file is not loaded and is not written.
- Reloading the catalog does not read or rewrite documents. They are checked on their next change.
- The body is `guidance`. The loader does not compare it with `sections`.

Copy for a host that later shows a schema load, from `lib/types/copy.ts`:

| State | Copy |
| --- | --- |
| Empty | `No types loaded.` |
| Loading | `Checking…` |
| Error | `This type schema did not load.` then the `schema_invalid` message and hint |
| Partial | `Valid, with warnings.` |
| Success | `Type loaded.` |

## Contracts

- [specs/contracts/type-schema.schema.json](../../contracts/type-schema.schema.json) — a file loads only when its frontmatter satisfies this schema and the loader checks named in its `description`: file stem equals `name`, the name is not already loaded, `required_when` names another field, the scalar is one that field can hold, and `folder` is not `assets`.
- [specs/contracts/frontmatter/harness.schema.json](../../contracts/frontmatter/harness.schema.json), [eval.schema.json](../../contracts/frontmatter/eval.schema.json), [experiment.schema.json](../../contracts/frontmatter/experiment.schema.json), [finding.schema.json](../../contracts/frontmatter/finding.schema.json), [decision.schema.json](../../contracts/frontmatter/decision.schema.json), [doc.schema.json](../../contracts/frontmatter/doc.schema.json) — the seed field lists. `x-ledger` holds folder, filename, sections, and `nested` on doc.
- [specs/contracts/errors.md](../../contracts/errors.md) — every `schema_invalid` row, plus `field_missing`, `field_kind`, `link_unpinned`, `metric_unknown`, and `section_missing` for the predicates below.

F01's `filenamePlaceholders` rejects a pattern other than `{date}` and `{slug}`.

## Loader

`loadSchemaFile` returns either a `TypeSchema` or one `schema_invalid` issue. Ajv failures are mapped to the sentences in [errors.md](../../contracts/errors.md). Raw Ajv text is not shown.

After the meta-schema accepts the map:

| Check | Message |
| --- | --- |
| File stem differs from `name` | `File name must be {name}.md.` |
| `name` already loaded from another path | `name "{name}" is already loaded from {other}.` |
| `required_when` is empty or has more than one key | `{field} required_when must be one field equal to a scalar.` |
| The key is not another field on this schema (`type` and `title` count even when `fields` omits them; a field may not watch itself) | `{field} required_when names {watch}, which is not a field.` |
| The scalar is not a value the watched field can hold | `{field} required_when value is not allowed for {watch}.` |
| `folder` is `assets` | `folder must not be assets.` |

A watched enum holds only its `values`. A boolean holds a boolean. A number holds a number. A string or a date holds a string, and a date string is a real `YYYY-MM-DD`. A link holds a wiki-link string, so the scalar has to match the F01 grammar. A list, a links field, or a metrics field holds a collection, so a scalar fails the schema.

`nested` is true only when `name` is `doc`. The meta-schema has no `nested` key. Extra folders on any other type fail in F01.

## Seed files

`seeds/types/` contains `harness.md`, `eval.md`, `experiment.md`, `finding.md`, `decision.md`, and `doc.md`. Each frontmatter has `type: schema` and matches [type-schema.schema.json](../../contracts/type-schema.schema.json). Folder, filename, and sections equal `x-ledger` on the JSON Schema of that name. Doc sections are `[]` and `x-ledger.nested` is true.

The experiment file uses the `fields` map in the meta-schema's example: `verdict` has `required_when: { status: concluded }` and `filename` is `{date}-{slug}`.

| Type | Folder | Filename | Fields beyond `title` |
| --- | --- | --- | --- |
| harness | `harnesses` | `{slug}` | `version` number required min 1; `status` enum `draft`, `active`, `retired` required; `model` string required; `parent` link `to: harness`, pinned, optional; `changes` string |
| eval | `evals` | `{slug}` | `version` number required min 1; `status` enum `draft`, `active`, `retired` required; `baseline` link `to: harness`, pinned, optional; `metrics` as below, required |
| experiment | `experiments` | `{date}-{slug}` | The meta-schema example |
| finding | `findings` | `{slug}` | `status` enum `current`, `superseded`, `disputed` required; `confidence` enum `low`, `medium`, `high` required; `evidence` links `to: experiment`, not pinned, required; `supersedes` link `to: finding`, not pinned, optional, null allowed |
| decision | `decisions` | `{slug}` | `date` required; `status` enum `proposed`, `accepted`, `reversed` required; `based_on` links `to: finding`, not pinned, required; `results_in` link `to: harness`, pinned, optional |
| doc | `docs` | `{slug}` | `tags` list of strings, optional. `title` required, max 120 |

`title` on every seed is a required string with `max: 120`. `type` is not repeated inside `fields`. The document still requires `type`.

Eval `metrics` is a list of metric records in [eval.schema.json](../../contracts/frontmatter/eval.schema.json), and kind `list` is strings only. The seed file records:

```yaml
metrics:
  kind: list
  required: true
```

The seed compiler sets `metricRecords: true` on that in-memory field when `name` is `eval`. The string-list check skips that field. A custom type cannot set the flag. Its `list` values are strings. F06 reads `key`, `unit`, `better`, and optional inclusive `range` through `lib/types/metric-record.ts`. A range whose first number is greater than the second is `field_kind`.

`to` is required by the meta-schema on link fields. F06's `link_broken` matches a slug. It does not compare the target's type with `to`.

A field named `version` with kind `number` uses the integer range 1 through 999999999 from [errors.md](../../contracts/errors.md). The meta-schema stores the lower bound as `min`.

## Predicates F06 calls

`isRequired(field, data)` is true when `required` is true, or when `requiredWhen.field` is present on the document and the YAML type and the value are equal. `Concluded` does not equal `concluded`. `type` and `title` are required on every document when `fields` omits them. A schema that defines `title` may set `max`. The effective maximum is the smaller of 120 and that `max`.

`unpinned(field, value)` is set when `pinned` is true, the value matches the F01 wiki-link grammar, and `version` is absent. F06 emits `link_unpinned` and skips `field_kind` for that value.

`unknownResultKeys(results, evalMetrics)` lists keys in a `metrics` value that the linked eval does not define. F06 emits `metric_unknown`.

`missingSections(sections, body)` lists section names with no ATX heading of level 1 to 6 whose trimmed text equals the name. A closing hash run is ignored. The match is case-sensitive. Headings inside fenced code do not count. The result is a warning. The save is still allowed.

`listKindError` reports `field_kind` with message `{field} must be a list of strings.` when a `list` value is not a list of strings.

## Tests

Node's test runner. Test titles are the scenario ids. F02-T01 adds `lib/types/*.test.ts` to the `test` script in `package.json`.

Steps are in [tasks.md](tasks.md).
