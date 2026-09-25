# F02 tasks: type schemas

Steps are in dependency order. Size is one module or several modules. These steps do not change a contract. Each test title is the acceptance-scenario id. F02-T01 adds `lib/types/*.test.ts` to the `test` script in `package.json`.

Schema predicates return the issue F06 will emit. They do not wait for the full rule catalog.

## F02-T01. Field kinds

- **Size:** several modules
- **Depends on:** none
- **Requirements:** F02-REQ-002
- **Test:** `lib/types/kinds.test.ts` › `F02-AC-002a`

`lib/types/kinds.ts` accepts only `string`, `number`, `date`, `enum`, `boolean`, `list`, `link`, `links`, and `metrics`. Kind `table` fails the save with `schema_invalid` and message `{field} kind must be one of string, number, date, enum, boolean, list, link, links, metrics.`

## F02-T02. Lists of strings

- **Size:** one module
- **Depends on:** F02-T01
- **Requirements:** F02-REQ-012
- **Test:** `lib/types/kinds.test.ts` › `F02-AC-012a`

A `list` value `[1, 2]` is `field_kind` with message `{field} must be a list of strings.`

## F02-T03. Load a schema file

- **Size:** several modules
- **Depends on:** F02-T01
- **Requirements:** F02-REQ-014
- **Tests:** `lib/types/load.test.ts` › `F02-AC-014a`, `F02-AC-014b`, `F02-AC-014c`

Add `ajv` and `lib/types/load.ts`. Compile [type-schema.schema.json](../../contracts/type-schema.schema.json) with the `x-ledger` keyword registered. `folder: assets` is `schema_invalid` with message `folder must not be assets.` Stem `widget` with `name: widget` loads. `.ledger/types/other.md` with `name: widget` is `schema_invalid` with message `File name must be widget.md.`

## F02-T04. `required_when` shape

- **Size:** one module
- **Depends on:** F02-T03
- **Requirements:** F02-REQ-005
- **Tests:** `lib/types/load.test.ts` › `F02-AC-005a`, `F02-AC-005b`

Two keys fail with hint `Use one key, for example status: concluded.` A key that is not a field fails with message `{field} required_when names missing, which is not a field.`

## F02-T05. `required_when` scalar

- **Size:** one module
- **Depends on:** F02-T04
- **Requirements:** F02-REQ-015
- **Test:** `lib/types/load.test.ts` › `F02-AC-015a`

`required_when: { status: 1 }` on an enum of strings is `schema_invalid` with message `{field} required_when value is not allowed for status.`

## F02-T06. Six seed files

- **Size:** several modules
- **Depends on:** F02-T03
- **Requirements:** F02-REQ-001
- **Tests:** `lib/types/seed.test.ts` › `F02-AC-001a`, `F02-AC-001b`

Write `seeds/types/harness.md`, `eval.md`, `experiment.md`, `finding.md`, `decision.md`, and `doc.md` from the design's seed table. Each frontmatter matches the JSON Schema of that name, including `x-ledger` folder, filename, and sections. The experiment seed has `verdict.required_when` of `{ status: concluded }` and filename `{date}-{slug}`.

## F02-T07. A custom type loads

- **Size:** one module
- **Depends on:** F02-T03
- **Requirements:** F02-REQ-003
- **Test:** `lib/types/catalog.test.ts` › `F02-AC-003a`

`.ledger/types/note.md` with `name: note`, `folder: notes`, and `filename: {slug}` loads `note`. A document may use `type: note`.

## F02-T08. A bad schema save

- **Size:** several modules
- **Depends on:** F02-T07
- **Requirements:** F02-REQ-004
- **Tests:** `lib/types/save.test.ts` › `F02-AC-004a`, `F02-AC-004b`

A second file with `name: experiment` fails `schema_invalid`, message `name "experiment" is already loaded from {other}.`, and the first file stays loaded. A schema whose YAML is a list fails with message `Schema frontmatter is not a YAML map.` The previous bytes of that file stay. When that name was not already loaded, a later document save of that name is `type_unknown`.

## F02-T09. When a field is required

- **Size:** one module
- **Depends on:** F02-T05
- **Requirements:** F02-REQ-006
- **Tests:** `lib/types/required.test.ts` › `F02-AC-006a`, `F02-AC-006b`, `F02-AC-006c`

`lib/types/required.ts` reports `field_missing` on `verdict` when `status` is `concluded` and `verdict` is absent, with hint `Add verdict when status is concluded.` `status: planned` does not. `status: Concluded` does not.

## F02-T10. Implicit `type` and `title`

- **Size:** one module
- **Depends on:** F02-T09
- **Requirements:** F02-REQ-013
- **Test:** `lib/types/required.test.ts` › `F02-AC-013a`

A custom schema that omits `title` still reports `field_missing` on `title` when the document has none.

## F02-T11. Pinned links

- **Size:** one module
- **Depends on:** F02-T03
- **Requirements:** F02-REQ-007
- **Test:** `lib/types/pinned.test.ts` › `F02-AC-007a`

A harness field with `pinned: true` and value `[[memento-journal]]` reports `link_unpinned`. The field records that `@version` is required. F06 uses this predicate and does not also emit `field_kind`.

## F02-T12. Metrics keys

- **Size:** one module
- **Depends on:** F02-T03
- **Requirements:** F02-REQ-008
- **Test:** `lib/types/metrics.test.ts` › `F02-AC-008a`

`results: { kind: metrics, from: eval }` records `from`. A result key the linked eval does not define is `metric_unknown`. The document-level rule in F06 calls this function.

## F02-T13. Sections

- **Size:** one module
- **Depends on:** F02-T03
- **Requirements:** F02-REQ-009
- **Test:** `lib/types/sections.test.ts` › `F02-AC-009a`

Experiment sections `Setup`, `Observations`, `Surprises`, and `Next`, with no heading `Surprises`, report `section_missing`. The result is a warning, so the save is allowed.

## F02-T14. Writing guidance

- **Size:** one module
- **Depends on:** F02-T03
- **Requirements:** F02-REQ-011
- **Test:** `lib/types/load.test.ts` › `F02-AC-011a`

A schema body that is one paragraph and has no `##` headings loads. That paragraph is `guidance`.

## F02-T15. Stored documents stay unchecked

- **Size:** one module
- **Depends on:** F02-T08
- **Requirements:** F02-REQ-010
- **Test:** `lib/types/catalog.test.ts` › `F02-AC-010a`

A stored experiment that omits `hypothesis` is left byte-identical when the experiment schema later marks `hypothesis` required. The catalog reload does not call a document validator.

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F02-REQ-001 | F02-T06 | F02-AC-001a, F02-AC-001b |
| F02-REQ-002 | F02-T01 | F02-AC-002a |
| F02-REQ-003 | F02-T07 | F02-AC-003a |
| F02-REQ-004 | F02-T08 | F02-AC-004a, F02-AC-004b |
| F02-REQ-005 | F02-T04 | F02-AC-005a, F02-AC-005b |
| F02-REQ-006 | F02-T09 | F02-AC-006a, F02-AC-006b, F02-AC-006c |
| F02-REQ-007 | F02-T11 | F02-AC-007a |
| F02-REQ-008 | F02-T12 | F02-AC-008a |
| F02-REQ-009 | F02-T13 | F02-AC-009a |
| F02-REQ-010 | F02-T15 | F02-AC-010a |
| F02-REQ-011 | F02-T14 | F02-AC-011a |
| F02-REQ-012 | F02-T02 | F02-AC-012a |
| F02-REQ-013 | F02-T10 | F02-AC-013a |
| F02-REQ-014 | F02-T03 | F02-AC-014a, F02-AC-014b, F02-AC-014c |
| F02-REQ-015 | F02-T05 | F02-AC-015a |
