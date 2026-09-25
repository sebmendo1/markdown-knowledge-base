# F06: Validation

## Summary

Validation is the quality gate for markdown-kb. One pure function checks a document against the loaded type schemas and the space's documents, and it returns the codes in `specs/contracts/errors.md`. Errors block a proposal and a save. Warnings do not.

## Status and scope

Not started. Nothing in the product runs this catalog. Frontmatter is parsed (F01) and types are specified (F02). Links resolve far enough to render a page, and that resolver is not this validator.

This spec covers the 18 PRD rules, the 4 rendering checks, and `schema_invalid`. It covers who is blocked and who is warned. It does not cover the editor chrome (F09), the review screen layout (F12), or sign-in (F15). Permission refusals stay on F01 as `permission_denied`.

The product name is markdown-kb. Sign-in is not built. When roles exist, Owner and Editor may save directly, Contributors propose, Viewers read, and agents never merge. The validator itself does not grant those rights. It answers whether the bytes are acceptable.

## Users and stories

- **F06-US-001** As an agent, I want a code, a message, and a hint, so that I can fix a proposal without asking a person.
- **F06-US-002** As the owner, I want errors to block a save and warnings to allow it, so that a finding can land while a diagram is still wrong.
- **F06-US-003** As a reviewer, I want the same checks on a proposal, a save, and an import, so that invalid text never becomes a document.

## Requirements

- **F06-REQ-001** The system shall run one pure validator for a proposal, a human save, an import, and the `validate` tool. The inputs are the file bytes, the path, the loaded schemas, and the space's documents. The output is `{ valid, errors, warnings }`.
- **F06-REQ-002** If the result contains an error, the system shall block the proposal and the save, and shall write no document and no revision.
- **F06-REQ-003** If the result contains only warnings, the system shall allow the proposal and the save.
- **F06-REQ-004** The system shall give every issue a `code`, a `severity`, a `field` or a `line`, a `message`, and a `hint`, using the templates in `specs/contracts/errors.md`.
- **F06-REQ-005** When a type schema changes, the system shall leave stored documents unchecked until the next change to each document.
- **F06-REQ-006** If the frontmatter block is missing, is not a YAML map, or the parser throws, the system shall report `yaml_invalid` and shall not report field codes for that file.
- **F06-REQ-007** If `type` is present and matches no loaded schema, the system shall report `type_unknown`. The system shall not report `type_unknown` for `type: schema` on `.ledger/types/<name>.md`.
- **F06-REQ-008** If a required field is absent or null, including a field whose `required_when` condition is true, the system shall report `field_missing`.
- **F06-REQ-009** If a value has the wrong kind, the system shall report `field_kind` with the variant message for that kind.
- **F06-REQ-010** If a frontmatter key is outside the schema, the system shall report `field_unknown` as a warning.
- **F06-REQ-011** If a wiki link's slug matches no document, the system shall report `link_broken` as an error in frontmatter and as a warning in the body. An archived document matches.
- **F06-REQ-012** If a `pinned: true` field is a wiki link without `@version`, the system shall report `link_unpinned` and shall not also report `field_kind` for that value.
- **F06-REQ-013** If a link names `@version` and no revision of that document has that version, the system shall report `version_missing`.
- **F06-REQ-014** If a `results` key is not defined on the linked eval, the system shall report `metric_unknown`.
- **F06-REQ-015** If `status` is `concluded` and an eval metric has no `results` key, the system shall report `metric_missing` as a warning, one issue per missing key.
- **F06-REQ-016** If a result lies outside the eval metric's declared range, the system shall report `metric_range`. Bounds are inclusive.
- **F06-REQ-017** If the path does not match the type folder and filename pattern, the date token cannot be filled, or the path is already taken, the system shall report `path_invalid`.
- **F06-REQ-018** If a create or a rename uses a slug another document already has, the system shall report `slug_taken`. Archived documents count.
- **F06-REQ-019** If a proposal update lacks a `base_revision_id` that is a revision of that document, the system shall report `base_missing`. A create and a human direct save shall not report this code.
- **F06-REQ-020** If a harness or eval change leaves `version` less than or equal to the head's version, the system shall report `version_not_bumped` as a warning. The pin stays on the earliest revision of that version.
- **F06-REQ-021** If a schema section has no heading of that name in the body, the system shall report `section_missing` as a warning.
- **F06-REQ-022** If the full file is byte-identical to the head, the system shall report `no_change`. A create shall not report this code.
- **F06-REQ-023** If the file's UTF-8 length is greater than 204800 bytes, the system shall report `too_large`. A file of 204800 bytes shall pass this check.
- **F06-REQ-024** If a `chart` fence fails the Vega-Lite v6 schema or uses a disallowed data source, the system shall report `chart_invalid` as a warning from the server validator.
- **F06-REQ-025** If KaTeX rejects a math span, the system shall report `math_invalid` as a warning from the server validator.
- **F06-REQ-026** If an embed would pass depth 3 or repeat a document already in the chain, the system shall report `embed_broken` as a warning. `{reason}` is `depth limit` or `cycle`.
- **F06-REQ-027** When a `mermaid` fence is rendered for reading or for review and Mermaid rejects it, the system shall report `mermaid_invalid` as a warning. The server `validate` tool shall not run Mermaid.
- **F06-REQ-028** If a file at `.ledger/types/<name>.md` fails a schema-file check, the system shall report `schema_invalid` and shall not apply the document field rules to that file.
- **F06-REQ-029** While sign-in is not built, the system shall run these checks for the person at the keyboard with no role gate. When sign-in exists, the system shall still run the same checks after F01 has allowed the caller. A Viewer, a Contributor's direct save, an agent key, and an OAuth grant are refused by F01 before these codes apply.

## Acceptance scenarios

### F06-AC-001a

Given the same bytes, schemas, and documents, when validate runs twice, then both results are equal and no document is written.

### F06-AC-001b

Given an invalid experiment, when it is submitted as a proposal, saved by a person, imported, or passed to `validate`, then each caller receives the same `errors` array.

### F06-AC-002a

Given a result that contains `field_missing`, when a save is attempted, then no file is written and no revision is created.

### F06-AC-003a

Given a result whose only issue is `section_missing`, when the owner saves, then the save succeeds and the warning is kept on the result.

### F06-AC-004a

Given `link_unpinned` on `harness`, when the result is returned, then the issue has code `link_unpinned`, severity `error`, field `harness`, message `harness link needs a version.`, and a hint.

### F06-AC-005a

Given a stored doc that is missing a heading, when its schema gains that section name and the doc is not saved, then the stored file is not reported.

### F06-AC-006a

Given a file that is `# Title` with no `---` block, when validate runs, then the only frontmatter issue is `yaml_invalid` with message `Frontmatter is missing or is not a YAML map.`

### F06-AC-006b

Given a frontmatter block whose YAML is `[1, 2]`, when validate runs, then the code is `yaml_invalid` and `field_missing` is absent.

### F06-AC-007a

Given `type: notebook` and no loaded schema of that name, when validate runs, then the code is `type_unknown`, the message is `Unknown type "notebook".`, and the hint is `Use a name that matches a loaded file in .ledger/types/.`

### F06-AC-007b

Given `.ledger/types/experiment.md` with `type: schema` and a valid schema, when validate runs, then `type_unknown` is absent.

### F06-AC-008a

Given an experiment with no `hypothesis`, when validate runs, then the code is `field_missing`, the field is `hypothesis`, and the hint is `Add hypothesis.`

### F06-AC-008b

Given `status: concluded` and `verdict: null`, when validate runs, then the code is `field_missing` on `verdict` and the hint is `Add verdict when status is concluded.`

### F06-AC-009a

Given `date: 2026-02-31`, when validate runs, then the code is `field_kind`, the message is `date must be a real date as YYYY-MM-DD.`, and the hint is `Use a calendar date, for example 2026-09-22.`

### F06-AC-009b

Given `sample_size: 0` on a field whose `min` is 1, when validate runs, then the message is `sample_size must be at least 1.`

### F06-AC-010a

Given a doc with frontmatter key `mood`, when validate runs, then the code is `field_unknown`, the severity is `warning`, and `valid` is true when no error is present.

### F06-AC-011a

Given frontmatter `evidence: ["[[missing-slug]]"]`, when validate runs, then `link_broken` is an error and the message is `No document has slug "missing-slug".`

### F06-AC-011b

Given a body line `See [[missing-slug]].`, when validate runs, then `link_broken` is a warning on that line.

### F06-AC-011c

Given a link to a document that is archived, when validate runs, then `link_broken` is absent.

### F06-AC-012a

Given `harness: "[[memento-journal]]"` on a pinned field, and an active version 7, when validate runs, then the hint is `Use [[memento-journal@7]]. Active version is 7.`

### F06-AC-013a

Given `[[memento-journal@9]]` and no revision with version 9, when validate runs, then the code is `version_missing` and the message is `memento-journal has no version 9.`

### F06-AC-014a

Given results key `bleu` and an eval that defines only `faithfulness`, when validate runs, then the field is `results.bleu` and the code is `metric_unknown`.

### F06-AC-015a

Given a concluded experiment whose eval defines `faithfulness` and `latency_ms`, and whose results include only `faithfulness`, when validate runs, then one `metric_missing` warning names `latency_ms` and the save is allowed.

### F06-AC-016a

Given metric range `[0, 1]` and result `1.2`, when validate runs, then the message is `faithfulness must be between 0 and 1.`

### F06-AC-016b

Given the same range and result `1`, when validate runs, then `metric_range` is absent.

### F06-AC-017a

Given an experiment file at `notes/hello.md`, when validate runs, then the code is `path_invalid` and the message starts with `Path does not match experiments/`.

### F06-AC-017b

Given pattern `{date}-{slug}` and no `date`, when validate runs, then the message is `date does not fit the filename pattern.`

### F06-AC-018a

Given a create whose slug is `hello` and an archived document already uses `hello`, when validate runs, then the code is `slug_taken`.

### F06-AC-019a

Given a proposal `update` with no `base_revision_id`, when validate runs, then the code is `base_missing` and the hint is `Send the revision id you read, as base_revision_id.`

### F06-AC-019b

Given a human direct save with no `base_revision_id`, when validate runs, then `base_missing` is absent.

### F06-AC-020a

Given a harness head at version 7, when the body changes, `version` stays 7, and validate runs, then `version_not_bumped` is a warning, the save is allowed, and a pin to `@7` still resolves to the earliest revision of version 7.

### F06-AC-021a

Given an experiment body with no heading `Next`, when validate runs, then the message is `Missing section "Next".` and the hint is `Add a heading named Next.`

### F06-AC-022a

Given a proposal whose bytes equal the head, including line endings, when validate runs, then the code is `no_change` and no proposal is created.

### F06-AC-023a

Given a file of 204800 bytes that is otherwise valid, when validate runs, then `too_large` is absent.

### F06-AC-023b

Given a file of 204801 bytes, when validate runs, then the message is `Document is 204801 bytes. The limit is 204800 bytes (200 KB).`

### F06-AC-024a

Given a `chart` fence whose data URL is `https://example.com/data.json`, when validate runs on the server, then the code is `chart_invalid` and the message is `Chart uses a data source that is not allowed.`

### F06-AC-025a

Given inline math `$ \frac{ $`, when the server validator runs, then the code is `math_invalid` and the message starts with `Math failed to parse:`.

### F06-AC-026a

Given an embed chain four transclusions deep, when validate runs, then the fourth target is `embed_broken` with message `Not embedded (depth limit): {slug}.` and the first three are not that code.

### F06-AC-026b

Given a document that embeds itself, when validate runs, then the message is `Not embedded (cycle): {slug}.` and the hint is `Open the source document.`

### F06-AC-027a

Given a `mermaid` fence with the text `not a diagram`, when the review screen renders it, then the code is `mermaid_invalid` and the proposal stays open.

### F06-AC-027b

Given that same fence, when the server `validate` tool runs, then `mermaid_invalid` is absent from the tool result.

### F06-AC-028a

Given `.ledger/types/experiment.md` with `filename: "{title}"`, when the schema is saved, then the code is `schema_invalid`, the field is `.ledger/types/experiment.md`, and the hint is `Remove any other {token} from filename.`

### F06-AC-029a

Given sign-in is not built, when the person at the keyboard saves a file with `field_missing`, then the response is that validation error and not `permission_denied`.

### F06-AC-029b

Given sign-in is built and the caller is a Viewer, when they submit bytes, then F01 returns `permission_denied` and the validator does not write a file.

## Edge cases and errors

Normative strings live in `specs/contracts/errors.md`. This table is the same catalog, for review beside the requirements.

### 18 rules

| Code | Severity | Field or line | Message | Hint |
| --- | --- | --- | --- | --- |
| `yaml_invalid` | Error | Line 1, or the parser line | `Frontmatter is missing or is not a YAML map.` or `Frontmatter YAML failed: {parser}.` | `Start the file with ---, then a YAML map that includes type and title, then a closing ---.` or `Fix the YAML between the --- lines. The block must be a map.` |
| `type_unknown` | Error | `type` | `Unknown type "{type}".` | `Use a name that matches a loaded file in .ledger/types/.` |
| `field_missing` | Error | `{field}` | `{field} is required.` | `Add {field}.` or `Add {field} when {watch} is {value}.` |
| `field_kind` | Error | `{field}` | The kind variant in `errors.md` | The kind variant in `errors.md` |
| `field_unknown` | Warning | `{field}` | `{field} is not a field on {type}.` | `Remove {field}, or add it to the type schema.` |
| `link_broken` | Error in frontmatter, warning in the body | Field or body line | `No document has slug "{slug}".` | `Use a slug that exists in this space. Archived documents still count.` |
| `link_unpinned` | Error | `{field}` | `{field} link needs a version.` | `Use [[{slug}@{version}]]. Active version is {version}.` or `Add @ and a version, for example [[slug@7]].` |
| `version_missing` | Error | Field or body line | `{slug} has no version {version}.` | `Use a version saved on that document.` |
| `metric_unknown` | Error | `results.{key}` | `{key} is not a metric on {eval}.` | `Use a key from that eval's metrics list.` |
| `metric_missing` | Warning | `results` | `results is missing {key}.` | `Report every metric the eval defines, including ones that got worse.` |
| `metric_range` | Error | `results.{key}` | `{key} must be between {min} and {max}.` | `Use a value inside the range declared for {key}.` |
| `path_invalid` | Error | `path` | `Path does not match {folder}/{pattern}.` or `date does not fit the filename pattern.` or `Path "{path}" is already used.` | `Save the file at {expected}.` or `Set date to YYYY-MM-DD, which the path uses.` or `Keep the current path, or pick a date and slug that are free.` |
| `slug_taken` | Error | `slug` | `Slug "{slug}" is already used.` | `Use a free slug. The next suffix is -{n}.` |
| `base_missing` | Error | `base_revision_id` | `Update needs a base revision.` | `Send the revision id you read, as base_revision_id.` |
| `version_not_bumped` | Warning | `version` | `version is still {version} after a content change.` | `Increase version. A pin keeps the first save of this version.` |
| `section_missing` | Warning | `body` | `Missing section "{name}".` | `Add a heading named {name}.` |
| `no_change` | Error | `content` | `Content is identical to the current head.` | `Change the document, or skip this save.` |
| `too_large` | Error | `content` | `Document is {bytes} bytes. The limit is 204800 bytes (200 KB).` | `Shorten the file to 204800 bytes or less, UTF-8.` |

### 4 rendering checks

| Code | Severity | Field or line | Message | Hint |
| --- | --- | --- | --- | --- |
| `chart_invalid` | Warning | Fence line | `Chart does not match the Vega-Lite schema.` or `Chart uses a data source that is not allowed.` | `Fix the chart spec. Data must be inline, an assets/ CSV, or a metrics query.` or `Use inline data, a CSV in assets/, or a metrics query.` |
| `math_invalid` | Warning | Math line | `Math failed to parse: {parser}.` | `Fix the KaTeX in this block.` |
| `embed_broken` | Warning | Embed line | `Not embedded ({reason}): {slug}.` | `Open the source document.` |
| `mermaid_invalid` | Warning | Fence line | `Diagram failed to parse: {parser}.` | `Fix the Mermaid syntax in this block.` |

### Schema file

| Code | Severity | Field or line | Message | Hint |
| --- | --- | --- | --- | --- |
| `schema_invalid` | Error | Schema path | The failed-check sentence in `errors.md` | The expected-form sentence in `errors.md` |

A heading matches a section when the body has an ATX heading of level 1 to 6 whose text equals the section name after trim. A closing hash run is ignored. The match is case-sensitive.

`link_broken` ignores the heading fragment. A missing heading on a slug that exists is not this code.

Until server revisions exist, the only version on a document is the `version` in the current file. `version_missing` uses that value. When revisions exist, any revision with that version counts, and the pin still returns the earliest (F03, F07).

## Limits and budgets

A character is one Unicode code point.

| Limit | Value |
| --- | --- |
| Document size | 204800 bytes (200 KB = 200 × 1024). 204800 bytes is allowed |
| Embed depth | 3 transclusions. The open document is not a level |
| Rules | 18, plus 4 rendering checks, plus `schema_invalid` |
| Parser message stored in `{parser}` | At most 200 characters |
| Vega-Lite schema | v6, the `vega-lite` major version the app already depends on |
| KaTeX | The `katex` version the app already depends on |
| Mermaid | The `mermaid` version the app already depends on, on the reading surface and the review surface |

The PRD sets no latency number for the validator. See the open question. Do not treat that figure as a requirement yet.

## UI states

The validation report is inline text beside the field or the line. It is not a dialog. Reading and review host it (F09, F12). Those screens are out of scope here. Copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower.

| State | Copy |
| --- | --- |
| Empty | `Nothing to check.` |
| Loading | `Checking…` |
| Error | `Fix these errors before saving.` then each error message and hint |
| Partial | `Valid, with warnings.` then each warning message and hint |
| Success | `Valid.` |
| Schema error | `This type schema did not load.` then the `schema_invalid` message and hint |

A rendering warning uses the same partial state. The last good diagram, chart, or math render is a display concern of F04 and stays out of this copy.

No role sees a different sentence. A caller who may not write is stopped by F01 with `permission_denied` and does not see this report applied as a save.

## Out of scope

- Drawing the editor, the property form, and the review diff (F09, F12).
- Choosing which revision bytes a pin displays, beyond the warning that the pin does not move (F03, F07).
- Rate limits, the 20-open-proposal cap, and OAuth (F13, F14).
- Turning a validation failure into an MCP payload shape beyond the fields in F06-REQ-004 (F13).
- Sanitizing HTML (F04).
- Sign-in and session checks (F15).

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F06-Q-001 | What latency should one validate call meet? | Under 50 ms at the 95th percentile for one 204800-byte document, schemas for the six built-in types, and 10000 documents in memory, on one Node.js 22 process. No disk and no network inside the call. | Product owner | A performance test. Not a requirement until confirmed |
| F06-Q-002 | Should the server `validate` tool also run Mermaid? | No. `mermaid_invalid` is added on the reading surface and the review surface. Chart and math stay on the server. | Product owner | F06-REQ-027 |

ADR-0015, ADR-0016, ADR-0017, ADR-0019, and ADR-0020 are Proposed and already applied above. They are not open questions.

## Trace

- PRD anchors (`cursor/rebuild-prd-tables-f4c0`, `specs/source/ledger-prd.md`): `<!-- prd:error-format -->` (lines 537–547), `<!-- prd:limits -->` (lines 570–573), `<!-- prd:validation -->` through `<!-- prd:validation-behavior -->` (lines 575–608), `<!-- prd:write-or-edit -->` (lines 274–276), `<!-- prd:performance-and-safety -->` (lines 420–423), `<!-- prd:roles -->` (lines 648–656).
- Decisions: D3, D7. Humans with the Editor role save directly once sign-in exists. Agents never merge.
- Change requests: none.
- ADRs: ADR-0002, ADR-0012, ADR-0013, ADR-0014, ADR-0015, ADR-0016, ADR-0017, ADR-0018, ADR-0019, ADR-0020.
- Contracts: `specs/contracts/errors.md`, `specs/contracts/type-schema.schema.json`, `specs/contracts/frontmatter/`.
- Depends on F01 and F02. Link rendering beyond these codes is F03.
