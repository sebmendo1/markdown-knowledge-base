# F06 tasks: validation

Steps are in dependency order. They start after the F01 parser and the F02 catalog exist. Size is one module or several modules. These steps do not change a contract. Each test title is the acceptance-scenario id. F06-T01 adds `lib/validate/**/*.test.ts` to the `test` script in `package.json`.

Messages and hints are the rows in [errors.md](../../contracts/errors.md).

## F06-T01. One pure function, four callers

- **Size:** several modules
- **Depends on:** F01 frontmatter parser, F02 catalog
- **Requirements:** F06-REQ-001
- **Tests:** `lib/validate/validate.test.ts` › `F06-AC-001a`, `F06-AC-001b`

`validate` returns equal results for two calls with the same bytes, schemas, and documents, and it writes nothing. An invalid experiment submitted through `validateProposal`, `validateSave`, `validateImport`, and `validateTool` yields the same `errors` array. A clean result uses the success copy `Valid.`

## F06-T02. Issue fields

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-004
- **Test:** `lib/validate/issue.test.ts` › `F06-AC-004a`

`link_unpinned` on `harness` has code `link_unpinned`, severity `error`, field `harness`, message `harness link needs a version.`, and a hint.

## F06-T03. `yaml_invalid`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-006
- **Tests:** `lib/validate/rules/yaml.test.ts` › `F06-AC-006a`, `F06-AC-006b`

A file that is `# Title` with no `---` block reports only `yaml_invalid`, message `Frontmatter is missing or is not a YAML map.` A frontmatter value `[1, 2]` is `yaml_invalid`, and `field_missing` is absent.

## F06-T04. `type_unknown`

- **Size:** one module
- **Depends on:** F06-T03
- **Requirements:** F06-REQ-007
- **Tests:** `lib/validate/rules/type.test.ts` › `F06-AC-007a`, `F06-AC-007b`

`type: notebook` with no loaded schema of that name uses message `Unknown type "notebook".` and hint `Use a name that matches a loaded file in .ledger/types/.` A valid `.ledger/types/experiment.md` with `type: schema` omits `type_unknown`.

## F06-T05. `field_missing`

- **Size:** one module
- **Depends on:** F06-T04
- **Requirements:** F06-REQ-008
- **Tests:** `lib/validate/rules/fields.test.ts` › `F06-AC-008a`, `F06-AC-008b`

An experiment with no `hypothesis` reports `field_missing` on `hypothesis` with hint `Add hypothesis.` `status: concluded` and `verdict: null` report `field_missing` on `verdict` with hint `Add verdict when status is concluded.`

## F06-T06. `field_kind`

- **Size:** one module
- **Depends on:** F06-T05
- **Requirements:** F06-REQ-009
- **Tests:** `lib/validate/rules/fields.test.ts` › `F06-AC-009a`, `F06-AC-009b`

`date: 2026-02-31` uses message `date must be a real date as YYYY-MM-DD.` and hint `Use a calendar date, for example 2026-09-22.` `sample_size: 0` on a field whose `min` is 1 uses message `sample_size must be at least 1.` The same test file walks the other kind sentences in [errors.md](../../contracts/errors.md).

## F06-T07. `field_unknown`

- **Size:** one module
- **Depends on:** F06-T04
- **Requirements:** F06-REQ-010
- **Test:** `lib/validate/rules/fields.test.ts` › `F06-AC-010a`

A doc key `mood` is `field_unknown` at severity `warning`. `valid` is true when no error is present.

## F06-T08. `link_broken`

- **Size:** one module
- **Depends on:** F06-T04
- **Requirements:** F06-REQ-011, F06-REQ-030
- **Tests:** `lib/validate/rules/links.test.ts` › `F06-AC-030a`, `F06-AC-030b`, `F06-AC-030c`

F06-REQ-011 is superseded (ADR-0035), and its scenarios F06-AC-011a to F06-AC-011c are replaced by F06-AC-030a to F06-AC-030c. The rule resolves targets with `resolveDoc` from `lib/markdown/links.ts`. Frontmatter `evidence: ["[[missing-page]]"]` is an error, message `No document matches "missing-page".` A body link to a file name two pages share is a warning on that line. A link to an archived document omits `link_broken`.

## F06-T09. `link_unpinned`

- **Size:** one module
- **Depends on:** F06-T06
- **Requirements:** F06-REQ-012
- **Test:** `lib/validate/rules/links.test.ts` › `F06-AC-012a`

Pinned `harness: "[[memento-journal]]"` with active version 7 uses hint `Use [[memento-journal@7]]. Active version is 7.` The result has no `field_kind` for that value.

## F06-T10. `version_missing`

- **Size:** one module
- **Depends on:** F06-T08
- **Requirements:** F06-REQ-013
- **Test:** `lib/validate/rules/links.test.ts` › `F06-AC-013a`

`[[memento-journal@9]]` with no revision at version 9 uses message `memento-journal has no version 9.`

## F06-T11. `metric_unknown`

- **Size:** one module
- **Depends on:** F06-T04
- **Requirements:** F06-REQ-014
- **Test:** `lib/validate/rules/metrics.test.ts` › `F06-AC-014a`

Results key `bleu` against an eval that defines only `faithfulness` is `metric_unknown` on field `results.bleu`.

## F06-T12. `metric_missing`

- **Size:** one module
- **Depends on:** F06-T11
- **Requirements:** F06-REQ-015
- **Test:** `lib/validate/rules/metrics.test.ts` › `F06-AC-015a`

A concluded experiment whose eval defines `faithfulness` and `latency_ms`, and whose results include only `faithfulness`, gets one `metric_missing` warning for `latency_ms`. The save is allowed.

## F06-T13. `metric_range`

- **Size:** one module
- **Depends on:** F06-T11
- **Requirements:** F06-REQ-016
- **Tests:** `lib/validate/rules/metrics.test.ts` › `F06-AC-016a`, `F06-AC-016b`

Range `[0, 1]` and result `1.2` use message `faithfulness must be between 0 and 1.` Result `1` omits `metric_range`.

## F06-T14. `path_invalid`

- **Size:** one module
- **Depends on:** F06-T04
- **Requirements:** F06-REQ-017
- **Tests:** `lib/validate/rules/path.test.ts` › `F06-AC-017a`, `F06-AC-017b`

An experiment at `notes/hello.md` is `path_invalid` and the message starts with `Path does not match experiments/`. Pattern `{date}-{slug}` with no `date` uses message `date does not fit the filename pattern.`

## F06-T15. `slug_taken`

- **Size:** one module
- **Depends on:** F06-T04
- **Requirements:** F06-REQ-018
- **Test:** `lib/validate/rules/slug.test.ts` › `F06-AC-018a`

A create whose slug is `hello` reports `slug_taken` when an archived document already uses `hello`.

## F06-T16. `base_missing`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-019
- **Tests:** `lib/validate/rules/revision.test.ts` › `F06-AC-019a`, `F06-AC-019b`

A proposal `update` with no `base_revision_id` uses hint `Send the revision id you read, as base_revision_id.` A human direct save omits `base_missing`.

## F06-T17. `version_not_bumped`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-020
- **Test:** `lib/validate/rules/revision.test.ts` › `F06-AC-020a`

A harness head at version 7, with a body change and `version` still 7, is a warning. The save is allowed. The earliest revision of version 7 stays first in the revision list.

## F06-T18. `section_missing`

- **Size:** one module
- **Depends on:** F06-T04
- **Requirements:** F06-REQ-021
- **Test:** `lib/validate/rules/sections.test.ts` › `F06-AC-021a`

An experiment body with no heading `Next` uses message `Missing section "Next".` and hint `Add a heading named Next.`

## F06-T19. `no_change`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-022
- **Test:** `lib/validate/rules/revision.test.ts` › `F06-AC-022a`

A proposal whose bytes equal the head, including line endings, is `no_change`. No proposal is created.

## F06-T20. `too_large`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-023
- **Tests:** `lib/validate/rules/size.test.ts` › `F06-AC-023a`, `F06-AC-023b`

A file of 204800 bytes that is otherwise valid omits `too_large`. A file of 204801 bytes uses message `Document is 204801 bytes. The limit is 204800 bytes (200 KB).`

## F06-T21. Errors block the write

- **Size:** several modules
- **Depends on:** F06-T05
- **Requirements:** F06-REQ-002
- **Test:** `lib/validate/gate.test.ts` › `F06-AC-002a`

`commitDocument` with `field_missing` writes no file and calls no revision callback. The report lead-in is `Fix these errors before saving.`

## F06-T22. Warnings allow the write

- **Size:** one module
- **Depends on:** F06-T18, F06-T21
- **Requirements:** F06-REQ-003
- **Test:** `lib/validate/gate.test.ts` › `F06-AC-003a`

A result whose only issue is `section_missing` saves, and the warning stays on the result. The lead-in is `Valid, with warnings.`

## F06-T23. `chart_invalid`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-024
- **Test:** `lib/validate/rules/chart.test.ts` › `F06-AC-024a`

A server validate of a `chart` fence whose data URL is `https://example.com/data.json` is `chart_invalid` with message `Chart uses a data source that is not allowed.`

## F06-T24. `math_invalid`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-025
- **Test:** `lib/validate/rules/math.test.ts` › `F06-AC-025a`

Inline math `$ \frac{ $` on the server is `math_invalid` and the message starts with `Math failed to parse:`.

## F06-T25. `embed_broken`

- **Size:** one module
- **Depends on:** F06-T01
- **Requirements:** F06-REQ-026
- **Tests:** `lib/validate/rules/embed.test.ts` › `F06-AC-026a`, `F06-AC-026b`

A chain four transclusions deep marks the fourth target with message `Not embedded (depth limit): {slug}.` The first three omit that code. A document that embeds itself uses message `Not embedded (cycle): {slug}.` and hint `Open the source document.`

## F06-T26. `mermaid_invalid`

- **Size:** several modules
- **Depends on:** F06-T22
- **Requirements:** F06-REQ-027
- **Tests:** `lib/validate/rules/mermaid.test.ts` › `F06-AC-027a`, `F06-AC-027b`

`validateForReview` on a `mermaid` fence with the text `not a diagram` reports `mermaid_invalid`, and `valid` stays true so the proposal stays open. `validateTool` on that fence omits `mermaid_invalid`.

## F06-T27. `schema_invalid`

- **Size:** one module
- **Depends on:** F06-T03
- **Requirements:** F06-REQ-028
- **Test:** `lib/validate/rules/schema-file.test.ts` › `F06-AC-028a`

`.ledger/types/experiment.md` with `filename: "{title}"` is `schema_invalid`. The field is `.ledger/types/experiment.md`. The hint is `Remove any other {token} from filename.` Document field rules are absent.

## F06-T28. A schema change leaves stored files

- **Size:** several modules
- **Depends on:** F06-T18
- **Requirements:** F06-REQ-005
- **Test:** `lib/validate/catalog.test.ts` › `F06-AC-005a`

A stored doc that is missing a heading is not reported when its schema gains that section name and the doc is not saved.

## F06-T29. Access runs first

- **Size:** several modules
- **Depends on:** F06-T21
- **Requirements:** F06-REQ-029
- **Tests:** `lib/validate/gate.test.ts` › `F06-AC-029a`, `F06-AC-029b`

While sign-in is off, a keyboard save of a file with `field_missing` returns that validation error and not `permission_denied`. When sign-in is on, a Viewer receives `permission_denied` from F01, and the validator writes no file.

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F06-REQ-001 | F06-T01 | F06-AC-001a, F06-AC-001b |
| F06-REQ-002 | F06-T21 | F06-AC-002a |
| F06-REQ-003 | F06-T22 | F06-AC-003a |
| F06-REQ-004 | F06-T02 | F06-AC-004a |
| F06-REQ-005 | F06-T28 | F06-AC-005a |
| F06-REQ-006 | F06-T03 | F06-AC-006a, F06-AC-006b |
| F06-REQ-007 | F06-T04 | F06-AC-007a, F06-AC-007b |
| F06-REQ-008 | F06-T05 | F06-AC-008a, F06-AC-008b |
| F06-REQ-009 | F06-T06 | F06-AC-009a, F06-AC-009b |
| F06-REQ-010 | F06-T07 | F06-AC-010a |
| F06-REQ-011 | F06-T08 | F06-AC-011a, F06-AC-011b, F06-AC-011c (superseded) |
| F06-REQ-012 | F06-T09 | F06-AC-012a |
| F06-REQ-013 | F06-T10 | F06-AC-013a |
| F06-REQ-014 | F06-T11 | F06-AC-014a |
| F06-REQ-015 | F06-T12 | F06-AC-015a |
| F06-REQ-016 | F06-T13 | F06-AC-016a, F06-AC-016b |
| F06-REQ-017 | F06-T14 | F06-AC-017a, F06-AC-017b |
| F06-REQ-018 | F06-T15 | F06-AC-018a |
| F06-REQ-019 | F06-T16 | F06-AC-019a, F06-AC-019b |
| F06-REQ-020 | F06-T17 | F06-AC-020a |
| F06-REQ-021 | F06-T18 | F06-AC-021a |
| F06-REQ-022 | F06-T19 | F06-AC-022a |
| F06-REQ-023 | F06-T20 | F06-AC-023a, F06-AC-023b |
| F06-REQ-024 | F06-T23 | F06-AC-024a |
| F06-REQ-025 | F06-T24 | F06-AC-025a |
| F06-REQ-026 | F06-T25 | F06-AC-026a, F06-AC-026b |
| F06-REQ-027 | F06-T26 | F06-AC-027a, F06-AC-027b |
| F06-REQ-028 | F06-T27 | F06-AC-028a |
| F06-REQ-029 | F06-T29 | F06-AC-029a, F06-AC-029b |
| F06-REQ-030 | F06-T08 | F06-AC-030a, F06-AC-030b, F06-AC-030c |
