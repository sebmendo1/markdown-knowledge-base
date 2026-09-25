# F06 design: validation

One pure function checks a document against the loaded type schemas and the space's documents. It returns the codes in [errors.md](../../contracts/errors.md). Errors block a proposal and a save. Warnings do not. The function writes nothing. This feature has no screen. Reading and review (F09, F12) show the report copy below.

F06 depends on F01 for bytes, paths, slugs, and the access gate, and on F02 for the catalog and the field predicates.

## Modules

| Module | Role |
| --- | --- |
| `lib/validate/validate.ts` | `validate(input)`. Same inputs, same output. No I/O. |
| `lib/validate/callers.ts` | `validateProposal`, `validateSave`, `validateImport`, and `validateTool` call `validate` and return its `errors`. |
| `lib/validate/issue.ts` | Builds an `Issue` from an [errors.md](../../contracts/errors.md) row. Truncates `{parser}` to one line of at most 200 characters. |
| `lib/validate/rules/yaml.ts` | `yaml_invalid`. |
| `lib/validate/rules/type.ts` | `type_unknown`. |
| `lib/validate/rules/fields.ts` | `field_missing`, `field_kind`, `field_unknown`. Calls F02 `isRequired` and list checks. |
| `lib/validate/rules/links.ts` | `link_broken`, `link_unpinned`, `version_missing`. |
| `lib/validate/rules/metrics.ts` | `metric_unknown`, `metric_missing`, `metric_range`. |
| `lib/validate/rules/path.ts` | `path_invalid`. Calls F01 filename checks. |
| `lib/validate/rules/slug.ts` | `slug_taken`. |
| `lib/validate/rules/revision.ts` | `base_missing`, `version_not_bumped`, `no_change`. |
| `lib/validate/rules/sections.ts` | `section_missing`. Calls F02 `missingSections`. |
| `lib/validate/rules/size.ts` | `too_large`. |
| `lib/validate/rules/chart.ts` | `chart_invalid` on the server, Vega-Lite v6 from the `vega-lite` dependency. |
| `lib/validate/rules/math.ts` | `math_invalid` on the server, via `katex`. |
| `lib/validate/rules/embed.ts` | `embed_broken`. |
| `lib/validate/rules/mermaid.ts` | `mermaid_invalid` only when the caller passes a checker. |
| `lib/validate/rules/schema-file.ts` | `schema_invalid` for `.ledger/types/<name>.md`. Document field rules do not run. |
| `lib/validate/copy.ts` | The five report sentences plus the schema-error lead-in. |
| `lib/format/save.ts` | Already planned in F01. F06 replaces the injected stub with `validate`. |

`validateForReview` is `validate` plus a Mermaid checker. The server tool does not use it. F12 calls it when a review screen renders a diagram. F04 calls it when a reading view renders one.

## Data shapes

```ts
type Issue = {
  code: string;
  severity: "error" | "warning";
  field?: string;
  line?: number;
  message: string;
  hint: string;
};

type ValidateResult = {
  valid: boolean;
  errors: Issue[];
  warnings: Issue[];
};

type SpaceDocument = {
  path: string;
  slug: string;
  archived: boolean;
  frontmatter: Record<string, unknown>;
  version: number | null;
  revisions: { id: string; version: number }[];
};

type ValidateInput = {
  bytes: Uint8Array;
  path: string;
  schemas: ReadonlyMap<string, TypeSchema>;
  documents: readonly SpaceDocument[];
  caller: "proposal" | "save" | "import" | "validate";
  operation: "create" | "update" | "rename";
  baseRevisionId?: string;
  head?: { bytes: Uint8Array; version: number | null; revisions: { id: string; version: number }[] };
  mermaid?: (source: string) => { ok: true } | { ok: false; parser: string };
};
```

`valid` is false when `errors` is non-empty. Warnings leave `valid` true.

Until F07 stores revisions, `version` on `SpaceDocument` is the `version` in the current file, and `revisions` may be empty. `version_missing` then compares `@N` with that current version. When `revisions` is non-empty, any entry with that version counts. The pin target stays the earliest revision of that version. This function does not reorder `revisions`.

## State

`validate` has no stored state. A schema reload (F02) does not call it. A stored file is checked on the next proposal, save, import, or `validate` call for that file.

`lib/format/access.ts` runs before `validate` inside `commitDocument`. A Viewer, a Contributor's direct save, an agent key, and an OAuth grant receive `permission_denied` from F01. The validator does not write a file in that case, and the response is the access refusal. While sign-in is off, the person at the keyboard receives the validation issues.

Report copy in `lib/validate/copy.ts`. Hosts use the same sentences at 860px and at 420px.

| State | Copy |
| --- | --- |
| Empty | `Nothing to check.` |
| Loading | `Checking…` |
| Error | `Fix these errors before saving.` then each error message and hint |
| Partial | `Valid, with warnings.` then each warning message and hint |
| Success | `Valid.` |
| Schema error | `This type schema did not load.` then the `schema_invalid` message and hint |

A rendering warning uses the partial state. The last good diagram, chart, or math render stays with F04.

## Contracts

- [specs/contracts/errors.md](../../contracts/errors.md) — the 18 rules, the 4 rendering checks, `schema_invalid`, the variant sentences, and the precedence list. The orchestrator follows that precedence.
- [specs/contracts/type-schema.schema.json](../../contracts/type-schema.schema.json) — schema-file checks.
- [specs/contracts/frontmatter/](../../contracts/frontmatter/) — seed fields the rule tests load through F02.

## Orchestrator

`validate` walks the file in this order. One condition produces one issue, except `metric_missing`, which produces one warning per missing key, and `too_large`, which is added beside any other code that still applies.

1. A path under `.ledger/types/` is only `schema_invalid`. `type: schema` on `.ledger/types/<name>.md` does not produce `type_unknown`. Document field rules do not run.
2. `too_large` when the UTF-8 length is greater than 204800 bytes. 204800 bytes passes. The message uses the actual count: `Document is {bytes} bytes. The limit is 204800 bytes (200 KB).`
3. `yaml_invalid` when the frontmatter block is missing, is not a YAML map, or the parser throws. Field codes are omitted for that file. `too_large` still applies.
4. Missing `type` is `field_missing` and is not also `type_unknown`.
5. `type_unknown` when `type` matches no loaded schema.
6. Required fields, then kinds, then unknown keys. Null on a required field is `field_missing` only. Null on an optional field is absent.
7. A pinned wiki link without `@version` is `link_unpinned` only.
8. Links, versions, metrics, path, slug, proposal base, version bump, sections, byte identity, then chart, math, and embed.
9. Mermaid runs when `mermaid` is set.

A create omits `base_missing`, `version_not_bumped`, and `no_change`. A human direct save omits `base_missing`. That code is for a proposal `update` whose `baseRevisionId` is missing or is not a revision of that document.

`link_broken` uses the slug. A missing heading fragment is ignored. An archived document matches, so the code is absent. Frontmatter is an error. A body line is a warning on that line.

`metric_range` runs when the eval declares `range` and the result is a number. Bounds are inclusive. A non-number is `field_kind`.

`version_missing` runs when the link has `@version`. A pinned field with no version is `link_unpinned` instead.

`version_not_bumped` is a warning when a harness or eval file changes and the new `version` is not an integer greater than the head's version. The save is allowed. The earliest revision of that version stays the pin target.

`no_change` is an error when the full file is byte-identical to the head, including line endings. The proposal is not created.

## Rendering

Chart fences are `chart` fences whose body is YAML or JSON. Check the data source first. An `https:` or `http:` URL, including `https://example.com/data.json`, is message `Chart uses a data source that is not allowed.` Allowed sources are inline `data.values`, a `data.url` under `assets/` that ends in `.csv`, and `data.metrics` with `eval` and `metric`. A body that fails Vega-Lite v6 is message `Chart does not match the Vega-Lite schema.`

Math is inline `$…$`, a `$$` block, or a `math` fence. KaTeX's message is `{parser}`. The issue message starts with `Math failed to parse:`.

Embeds use the shipped forms `![[slug]]`, `![[slug#Heading]]`, and `![[slug@N]]`. The open document is not a level. A pinned embed counts as one level. Three nested transclusions are fine. The fourth target is `embed_broken` with `{reason}` `depth limit`, and the first three are not that code. A document that embeds a slug already in the chain uses `{reason}` `cycle` and hint `Open the source document.`

`validateTool` leaves `mermaid` unset, so `mermaid_invalid` is absent. `validateForReview` passes a checker. A fence whose text is `not a diagram` becomes a warning. `valid` stays true, so the proposal stays open.

## Callers and the write gate

The four functions in `lib/validate/callers.ts` pass the same bytes, schemas, and documents into `validate` and return the same `errors` array. They do not write.

`commitDocument` (F01) calls `access`, then `validate`. When `errors` is non-empty it writes no file and does not call `onRevision`. When every issue is a warning, it writes and returns the warnings. The error lead-in is `Fix these errors before saving.` The partial lead-in is `Valid, with warnings.`

## Tests

Node's test runner. Titles are the scenario ids. F06-T01 adds `lib/validate/**/*.test.ts` to the `test` script in `package.json`. Fixtures build a `SchemaCatalog` through F02 and a document list in memory. No network and no disk inside `validate`.

Steps are in [tasks.md](tasks.md).
