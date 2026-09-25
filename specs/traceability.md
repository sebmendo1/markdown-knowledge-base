# Requirements traceability

Phase 6 of [PLAN.md](PLAN.md). This matrix traces each requirement in the feature specs to the task step that names it and the test that step names. Task names and test names are copied from the task files. Nothing here is merged from those branches.

A requirement that a step lists next to several others takes the tests on that step whose acceptance id uses the same number (`F12-REQ-014` takes `F12-AC-014a`). A step with one requirement takes every test that step names. Where the task file gives a prose title and an acceptance id, both are shown.

## Sources

Requirements are the `Fnn-REQ-nnn` and `X-REQ-nnn` lines that open a requirement in each `spec.md`. When two branches carry the same feature, the row uses the branch that holds the full set.

| Feature | Requirements read from | Tasks read from |
| --- | --- | --- |
| F01, F02, F06 | `cursor/file-format-types-validation-3ed9` | `cursor/design-tasks-format-types-validation-279e` |
| F03, F04 | `cursor/spec-rest-of-editing-b39a` (same ids as `cursor/spec-links-rendering-editing-7df9`) | `cursor/design-tasks-editor-shell-bbc1` |
| F05, F16 | `cursor/spec-charts-metrics-58b3` | `cursor/design-charts-metrics-history-import-home-4ba1` |
| F07 | `cursor/spec-storage-db-f59c` | `cursor/storage-design-tasks-5c9d` |
| F08, F10, F20, F21 | `cursor/reading-shell-specs-6322` (same ids on `cursor/spec-invites-public-link-5902` and `cursor/spec-rest-of-search-b39a`) | `cursor/design-tasks-editor-shell-bbc1` |
| F09 | `cursor/spec-rest-of-editing-b39a` (`F09-REQ-017` through `F09-REQ-036` are not on `cursor/spec-links-rendering-editing-7df9`) | `cursor/design-tasks-editor-shell-bbc1` |
| F11 | `cursor/spec-invites-public-link-5902` (`F11-REQ-015` through `F11-REQ-037` are not on the earlier sharing specs) | `cursor/design-tasks-editor-shell-bbc1` |
| F12 | `cursor/spec-proposals-review-a40a` | `cursor/design-review-agents-auth-9270` |
| F13 | `cursor/spec-mcp-rest-069c` | `cursor/design-review-agents-auth-9270` |
| F14 | `cursor/spec-oauth-assistants-f1dd` | `cursor/design-review-agents-auth-9270` |
| F15 | `cursor/spec-sign-in-roles-audit-bc2e` | `cursor/design-review-agents-auth-9270` |
| F17 | `cursor/spec-rest-of-search-b39a` (`F17-REQ-013` through `F17-REQ-026` are not on the earlier search specs) | `cursor/design-tasks-editor-shell-bbc1` |
| F18, F19, F22 | `cursor/spec-history-import-home-08e8` | `cursor/design-charts-metrics-history-import-home-4ba1` |
| X | `cursor/spec-cross-cutting-0fcc` | `cursor/design-tasks-cross-cutting-fb26` |

The 18 acceptance criteria are the checklist under `<!-- prd:acceptance-criteria -->` in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`. The feature id beside each criterion is the one in `specs/requirements-inventory.md` on `cursor/requirements-inventory-c89c` (REQ-465 through REQ-482). The five success metrics are the table under `<!-- prd:success-metrics -->` on that same PRD branch. Their queries are named in `specs/features/X-cross-cutting/design.md` on `cursor/design-tasks-cross-cutting-fb26`.

## Requirement to task to test

598 requirements, 613 rows. A requirement named by more than one step has one row per step.

| Requirement | Feature | Task file and step | Test |
| --- | --- | --- | --- |
| F01-REQ-001 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T01. UTF-8 documents without a BOM | F01-AC-001a |
| F01-REQ-002 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T02. Frontmatter block | F01-AC-002a; F01-AC-002b |
| F01-REQ-003 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T04. `type` and `title` | F01-AC-003a; F01-AC-003b |
| F01-REQ-004 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T05. Slug from a title | F01-AC-004a; F01-AC-004b; F01-AC-004c; F01-AC-004d; F01-AC-004e |
| F01-REQ-005 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T06. Unique slugs | F01-AC-005a; F01-AC-005b; F01-AC-005c |
| F01-REQ-006 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T08. Path on create | F01-AC-006a |
| F01-REQ-007 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T10. Date change moves the file | F01-AC-007a |
| F01-REQ-008 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T11. Occupied path rejects the save | F01-AC-008a |
| F01-REQ-009 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T07. Filename placeholders | F01-AC-009a |
| F01-REQ-010 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T09. Extra `doc` segments | F01-AC-010a; F01-AC-010b |
| F01-REQ-011 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T13. Type schema files | F01-AC-011a |
| F01-REQ-012 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T14. `space.md` and `agents.md` | F01-AC-012a; F01-AC-012b |
| F01-REQ-013 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T15. Assets | F01-AC-013a |
| F01-REQ-014 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T16. Wiki-link strings | F01-AC-014a |
| F01-REQ-015 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T17. Page URL | F01-AC-015a |
| F01-REQ-016 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T18. Keyboard writes | F01-AC-016a |
| F01-REQ-017 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T19. Roles after sign-in | F01-AC-017a; F01-AC-017b; F01-AC-017c; F01-AC-017d |
| F01-REQ-018 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T20. Human rename | F01-AC-018a |
| F01-REQ-019 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T03. CRLF delimiters | F01-AC-019a |
| F01-REQ-020 | F01 File format | specs/features/F01-file-format/tasks.md — F01-T12. Recover a slug from a path | F01-AC-020a |
| F02-REQ-001 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T06. Six seed files | F02-AC-001a; F02-AC-001b |
| F02-REQ-002 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T01. Field kinds | F02-AC-002a |
| F02-REQ-003 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T07. A custom type loads | F02-AC-003a |
| F02-REQ-004 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T08. A bad schema save | F02-AC-004a; F02-AC-004b |
| F02-REQ-005 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T04. `required_when` shape | F02-AC-005a; F02-AC-005b |
| F02-REQ-006 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T09. When a field is required | F02-AC-006a; F02-AC-006b; F02-AC-006c |
| F02-REQ-007 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T11. Pinned links | F02-AC-007a |
| F02-REQ-008 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T12. Metrics keys | F02-AC-008a |
| F02-REQ-009 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T13. Sections | F02-AC-009a |
| F02-REQ-010 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T15. Stored documents stay unchecked | F02-AC-010a |
| F02-REQ-011 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T14. Writing guidance | F02-AC-011a |
| F02-REQ-012 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T02. Lists of strings | F02-AC-012a |
| F02-REQ-013 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T10. Implicit `type` and `title` | F02-AC-013a |
| F02-REQ-014 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T03. Load a schema file | F02-AC-014a; F02-AC-014b; F02-AC-014c |
| F02-REQ-015 | F02 Type schemas | specs/features/F02-type-schemas/tasks.md — F02-T05. `required_when` scalar | F02-AC-015a |
| F03-REQ-001 | F03 Links | specs/features/F03-links/tasks.md — F03-T-001 Resolve a wiki target | `wiki refs resolve by file name when the path is unique` (F03-AC-001a); `exact wiki path renders the page title` (F03-AC-001b) |
| F03-REQ-002 | F03 Links | specs/features/F03-links/tasks.md — F03-T-003 Render a wiki link | `wiki link text is title, heading, or label` (F03-AC-002a) |
| F03-REQ-003 | F03 Links | specs/features/F03-links/tasks.md — F03-T-003 Render a wiki link | `unresolved wiki text is red and not a link` (F03-AC-003a) |
| F03-REQ-004 | F03 Links | specs/features/F03-links/tasks.md — F03-T-004 Render an embed | `embed shows the headed section and a source link` (F03-AC-004a) |
| F03-REQ-005 | F03 Links | specs/features/F03-links/tasks.md — F03-T-004 Render an embed | `missing embed names the target` (F03-AC-005a) |
| F03-REQ-006 | F03 Links | specs/features/F03-links/tasks.md — F03-T-004 Render an embed | `section extract stops at the next heading of the same rank` (F03-AC-006a); `unknown embed heading falls back to the page body` (F03-AC-006b) |
| F03-REQ-007 | F03 Links | specs/features/F03-links/tasks.md — F03-T-004 Render an embed | `embed depth stops at three levels` (F03-AC-007a) |
| F03-REQ-008 | F03 Links | specs/features/F03-links/tasks.md — F03-T-005 List who links here | `linked-from lists resolving pages and hides when empty` (F03-AC-008a) |
| F03-REQ-009 | F03 Links | specs/features/F03-links/tasks.md — F03-T-006 Rewrite targets on rename and move | `renaming a page moves the file and rewrites links to it`; `moving pages and folders keeps every link resolving` (F03-AC-009a) |
| F03-REQ-010 | F03 Links | specs/features/F03-links/tasks.md — F03-T-002 Slug heading ids | `headings skip fenced code and slug duplicates` (F03-AC-010a) |
| F03-REQ-011 | F03 Links | specs/features/F03-links/tasks.md — F03-T-007 Offer to create a missing page | `missing path offers to create the page` (F03-AC-011a) |
| F04-REQ-001 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-001 Render CommonMark and GFM | `guide page renders headings, lists, and inline code` (F04-AC-001a) |
| F04-REQ-002 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-001 Render CommonMark and GFM | `GFM alignment is text-align inside a scroll region` (F04-AC-002a) |
| F04-REQ-003 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-001 Render CommonMark and GFM | `preview task checkboxes are disabled` (F04-AC-003a) |
| F04-REQ-004 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-001 Render CommonMark and GFM | `tildes strike through and bare URLs link` (F04-AC-004a) |
| F04-REQ-005 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-002 Keep safe link schemes | `external links open outward and javascript links lose their address` (F04-AC-005a) |
| F04-REQ-006 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-003 Render footnotes | `footnotes link to the note and back` (F04-AC-006a) |
| F04-REQ-007 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-004 Render callouts | `only uppercase alert markers become callouts` (F04-AC-007a) |
| F04-REQ-008 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-005 Highlight code and copy it | `fenced code is highlighted with Shiki` (F04-AC-008a) |
| F04-REQ-009 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-005 Highlight code and copy it | `failed copy leaves the Copy label` (F04-AC-009a) |
| F04-REQ-010 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-006 Render math | `KaTeX renders valid math and titles a parse error` (F04-AC-010a) |
| F04-REQ-011 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-007 Draw Mermaid | `Mermaid draws a flowchart and shows a parse error` (F04-AC-011a) |
| F04-REQ-012 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-008 Render a CSV or TSV table | `CSV header sorts ascending` (F04-AC-012a) |
| F04-REQ-013 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-009 Render a highlight mark | `double equals render a mark` (F04-AC-013a) |
| F04-REQ-014 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-010 Strip unsafe HTML | `script tags are stripped without an error` (F04-AC-014a) |
| F04-REQ-015 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-011 Show a bad frontmatter message | `bad frontmatter shows the message and the body` (F04-AC-015a) |
| F04-REQ-016 | F04 Rendering | specs/features/F04-rendering/tasks.md — F04-T-012 Keep the reading measure | `reading column stays 17px and does not overflow at 390px` (F04-AC-016a) |
| F05-REQ-001 | F05 Charts | specs/features/F05-charts/tasks.md — 1. Draw an inline fence | F05-AC-001a; F05-AC-001b; F05-AC-001c |
| F05-REQ-002 | F05 Charts | specs/features/F05-charts/tasks.md — 1. Draw an inline fence | F05-AC-002a; F05-AC-002b |
| F05-REQ-003 | F05 Charts | specs/features/F05-charts/tasks.md — 1. Draw an inline fence | F05-AC-003a |
| F05-REQ-004 | F05 Charts | specs/features/F05-charts/tasks.md — 2. Apply the theme | F05-AC-004a; F05-AC-004b |
| F05-REQ-005 | F05 Charts | specs/features/F05-charts/tasks.md — 3. Load the embedder on intersection | F05-AC-005a; F05-AC-005b |
| F05-REQ-006 | F05 Charts | specs/features/F05-charts/tasks.md — 4. Refuse a remote URL and surface a thrown error | F05-AC-006a; F05-AC-006b |
| F05-REQ-007 | F05 Charts | specs/features/F05-charts/tasks.md — 4. Refuse a remote URL and surface a thrown error | F05-AC-007a; F05-AC-007b |
| F05-REQ-008 | F05 Charts | specs/features/F05-charts/tasks.md — 5. Empty and editing fences in the block editor | F05-AC-008a |
| F05-REQ-009 | F05 Charts | specs/features/F05-charts/tasks.md — 5. Empty and editing fences in the block editor | F05-AC-009a |
| F05-REQ-010 | F05 Charts | specs/features/F05-charts/tasks.md — 6. Insert the Chart starter | F05-AC-010a |
| F05-REQ-011 | F05 Charts | specs/features/F05-charts/tasks.md — 7. Figure chrome | F05-AC-011a |
| F05-REQ-012 | F05 Charts | specs/features/F05-charts/tasks.md — 1. Draw an inline fence | F05-AC-012a |
| F05-REQ-013 | F05 Charts | specs/features/F05-charts/tasks.md — 1. Draw an inline fence | F05-AC-013a |
| F05-REQ-014 | F05 Charts | specs/features/F05-charts/tasks.md — 8. Read a CSV in assets | F05-AC-014a; F05-AC-014b; F05-AC-014c |
| F05-REQ-015 | F05 Charts | specs/features/F05-charts/tasks.md — 9. Embed current metric points | F05-AC-015a; F05-AC-015b; F05-AC-015c |
| F05-REQ-016 | F05 Charts | specs/features/F05-charts/tasks.md — 10. Export PNG and SVG | F05-AC-016a; F05-AC-016b |
| F06-REQ-001 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T01. One pure function, four callers | F06-AC-001a; F06-AC-001b |
| F06-REQ-002 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T21. Errors block the write | F06-AC-002a |
| F06-REQ-003 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T22. Warnings allow the write | F06-AC-003a |
| F06-REQ-004 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T02. Issue fields | F06-AC-004a |
| F06-REQ-005 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T28. A schema change leaves stored files | F06-AC-005a |
| F06-REQ-006 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T03. `yaml_invalid` | F06-AC-006a; F06-AC-006b |
| F06-REQ-007 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T04. `type_unknown` | F06-AC-007a; F06-AC-007b |
| F06-REQ-008 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T05. `field_missing` | F06-AC-008a; F06-AC-008b |
| F06-REQ-009 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T06. `field_kind` | F06-AC-009a; F06-AC-009b |
| F06-REQ-010 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T07. `field_unknown` | F06-AC-010a |
| F06-REQ-011 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T08. `link_broken` | F06-AC-011a; F06-AC-011b; F06-AC-011c |
| F06-REQ-012 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T09. `link_unpinned` | F06-AC-012a |
| F06-REQ-013 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T10. `version_missing` | F06-AC-013a |
| F06-REQ-014 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T11. `metric_unknown` | F06-AC-014a |
| F06-REQ-015 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T12. `metric_missing` | F06-AC-015a |
| F06-REQ-016 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T13. `metric_range` | F06-AC-016a; F06-AC-016b |
| F06-REQ-017 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T14. `path_invalid` | F06-AC-017a; F06-AC-017b |
| F06-REQ-018 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T15. `slug_taken` | F06-AC-018a |
| F06-REQ-019 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T16. `base_missing` | F06-AC-019a; F06-AC-019b |
| F06-REQ-020 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T17. `version_not_bumped` | F06-AC-020a |
| F06-REQ-021 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T18. `section_missing` | F06-AC-021a |
| F06-REQ-022 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T19. `no_change` | F06-AC-022a |
| F06-REQ-023 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T20. `too_large` | F06-AC-023a; F06-AC-023b |
| F06-REQ-024 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T23. `chart_invalid` | F06-AC-024a |
| F06-REQ-025 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T24. `math_invalid` | F06-AC-025a |
| F06-REQ-026 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T25. `embed_broken` | F06-AC-026a; F06-AC-026b |
| F06-REQ-027 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T26. `mermaid_invalid` | F06-AC-027a; F06-AC-027b |
| F06-REQ-028 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T27. `schema_invalid` | F06-AC-028a |
| F06-REQ-029 | F06 Validation | specs/features/F06-validation/tasks.md — F06-T29. Access runs first | F06-AC-029a; F06-AC-029b |
| F07-REQ-001 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-001 — Read the file and insert nothing | `repository_read_inserts_no_rows` (F07-AC-001a) |
| F07-REQ-002 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-002 — Keep the working copy in localStorage | `shipped_draft_is_local_storage` (F07-AC-002a); `local_draft_restores` (F07-AC-002b) |
| F07-REQ-003 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-003 — Leave browser snapshots out of revisions | `browser_snapshots_are_not_revisions` (F07-AC-003a) |
| F07-REQ-004 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-005 — Install the contract and store a document row | `document_row_has_ledger_columns` (F07-AC-004a) |
| F07-REQ-005 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-005 — Install the contract and store a document row | `slug_taken_includes_archived` (F07-AC-005a); `path_taken_in_space` (F07-AC-005b) |
| F07-REQ-006 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-015 — Archive without deleting history | `archive_sets_database_clock` (F07-AC-006a) |
| F07-REQ-007 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-016 — Refuse document deletes | `delete_document_refused` (F07-AC-007a) |
| F07-REQ-008 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-007 — Store the full file and its frontmatter object | `revisions_store_full_markdown` (F07-AC-008a); `frontmatter_matches_content` (F07-AC-008b) |
| F07-REQ-009 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-008 — Refuse revision updates and deletes | `revision_update_or_delete_refused` (F07-AC-009a) |
| F07-REQ-010 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-010 — Move the head in the save transaction | `save_with_warning_appends_head` (F07-AC-010a) |
| F07-REQ-011 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-017 — Write the merge in one transaction | `merge_writes_revision_head_links_audit` (F07-AC-011a); `merge_concluded_inserts_metric_point` (F07-AC-011b); `merge_abandoned_inserts_no_metric_point` (F07-AC-011c) |
| F07-REQ-012 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-011 — Stop before insert when validation has an error | `revision_requires_valid_document` (F07-AC-012a) |
| F07-REQ-013 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-023 — Insert a revision only for a human save or a merge | `only_human_save_or_merge_inserts_revision` (F07-AC-013a) |
| F07-REQ-014 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-012 — Stamp the author, and the proposal on a merge | `human_save_author_nulls_proposal` (F07-AC-014a); `merge_copies_proposal_fields` (F07-AC-014b) |
| F07-REQ-015 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-013 — Keep the save message to one line | `omitted_message_is_empty` (F07-AC-015a); `message_over_120_refused` (F07-AC-015b); `message_with_line_feed_refused` (F07-AC-015c) |
| F07-REQ-016 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-018 — Append restore, tick, and import with their messages | `restore_appends_copy` (F07-AC-016a) |
| F07-REQ-017 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-018 — Append restore, tick, and import with their messages | `tick_task_appends_revision` (F07-AC-017a) |
| F07-REQ-018 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-018 — Append restore, tick, and import with their messages | `import_appends_revision` (F07-AC-018a); `invalid_import_writes_nothing` (F07-AC-018b) |
| F07-REQ-019 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-009 — Chain revisions, hash the bytes, and copy version | `revision_chain_one_child` (F07-AC-019a) |
| F07-REQ-020 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-009 — Chain revisions, hash the bytes, and copy version | `content_hash_is_sha256` (F07-AC-020a) |
| F07-REQ-021 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-009 — Chain revisions, hash the bytes, and copy version | `version_from_frontmatter` (F07-AC-021a); `version_null_without_integer` (F07-AC-021b) |
| F07-REQ-022 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-020 — Upsert the server draft on a 2-second interval | `server_draft_interval_is_2_seconds` (F07-AC-022a, F07-AC-022b); `draft_upsert_stores_invalid_frontmatter` (F07-AC-022c) |
| F07-REQ-023 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-019 — Store one private draft per document and user | `second_user_cannot_read_draft` (F07-AC-023a); `named_draft_is_forbidden` (F07-AC-023b) |
| F07-REQ-024 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-019 — Store one private draft per document and user | `open_returns_author_draft` (F07-AC-024a) |
| F07-REQ-025 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-022 — Delete drafts when the revision commits | `save_deletes_author_draft` (F07-AC-025a); `merge_deletes_both_drafts` (F07-AC-025b) |
| F07-REQ-026 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-024 — Rebuild links and metric points from revisions | `rebuild_links_and_metric_points` (F07-AC-026a) |
| F07-REQ-027 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-025 — Look up the first revision of version N | `version_lookup_earliest` (F07-AC-027a); `version_lookup_smaller_id` (F07-AC-027b); `version_lookup_missing_is_empty` (F07-AC-027c) |
| F07-REQ-028 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-004 — Skip role checks while sign-in is absent | `file_mode_skips_roles` (F07-AC-028a) |
| F07-REQ-029 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-026 — Allow a direct save only for Owner and Editor | `viewer_save_denied` (F07-AC-029a); `contributor_save_denied` (F07-AC-029b); `owner_save_inserts_revision` (F07-AC-029c); `agent_key_save_denied` (F07-AC-029d); `oauth_grant_save_denied` |
| F07-REQ-030 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-027 — Use Neon when Postgres storage is in use | `postgres_on_neon_with_pitr` (F07-AC-030a) |
| F07-REQ-031 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-014 — Refuse a save when the head moved | `stale_head_returns_head_moved` (F07-AC-031a) |
| F07-REQ-032 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-006 — Create the document and its first revision together | `create_document_commits_head` (F07-AC-032a); `document_without_revision_refused` (F07-AC-032b) |
| F07-REQ-033 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-006 — Create the document and its first revision together | `head_copies_title_and_type` (F07-AC-033a) |
| F07-REQ-034 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-015 — Archive without deleting history | `second_archive_keeps_timestamp` (F07-AC-034a); `clear_archived_at_refused` (F07-AC-034b) |
| F07-REQ-035 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-021 — Limit who can write a server draft | `viewer_writes_no_draft` (F07-AC-035a); `contributor_upserts_draft` (F07-AC-035b); `agent_key_writes_no_draft`; `oauth_grant_writes_no_draft` |
| F07-REQ-036 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-028 — Leave other documents' link slugs in place | `rename_leaves_other_to_slug` (F07-AC-036a) |
| F07-REQ-037 | F07 Storage | specs/features/F07-storage/tasks.md — F07-T-029 — Refuse content past 204800 bytes | `content_over_limit_is_too_large` (F07-AC-037a); `content_at_limit_is_stored` (F07-AC-037b) |
| F08-REQ-001 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-001 Address a page and redirect the old paths | `page url is project then page path` (F08-AC-001a) |
| F08-REQ-002 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-001 Address a page and redirect the old paths | `bare docs and ledger redirect to guide` (F08-AC-002a) |
| F08-REQ-003 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-001 Address a page and redirect the old paths | `nested docs and ledger redirect into guide` (F08-AC-003a) |
| F08-REQ-004 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-001 Address a page and redirect the old paths | `project home opens the home page` (F08-AC-004a) |
| F08-REQ-005 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-002 Lay out the three columns | `desktop shell is three full-height columns` (F08-AC-005a) |
| F08-REQ-006 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-002 Lay out the three columns | `columns use solid fills and no hairline` (F08-AC-006a) |
| F08-REQ-007 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-003 Show and hide the file column | `file column starts open on a wide screen` (F08-AC-007a) |
| F08-REQ-008 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-003 Show and hide the file column | `hide sidebar removes the file column` (F08-AC-008a) |
| F08-REQ-009 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-003 Show and hide the file column | `show sidebar restores the file column` (F08-AC-009a) |
| F08-REQ-010 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-004 Open the file column as a phone drawer | `phone width hides the outline and the file column` (F08-AC-010a) |
| F08-REQ-011 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-004 Open the file column as a phone drawer | `phone file column opens as a drawer` (F08-AC-011a) |
| F08-REQ-012 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-005 List pages in the file column | `file list marks the open page and opens its folders` (F08-AC-012a) |
| F08-REQ-013 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-005 List pages in the file column | `file column shows search trash and settings` (F08-AC-013a) |
| F08-REQ-014 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-006 Show the title row, the status line, and the document title | `title row shows the page path` (F08-AC-014a) |
| F08-REQ-015 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-006 Show the title row, the status line, and the document title | `title row shows edit share and page actions` (F08-AC-015a) |
| F08-REQ-016 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-006 Show the title row, the status line, and the document title | `status line names state words and mode` (F08-AC-016a) |
| F08-REQ-017 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-007 Open in viewing and show rendered Markdown | `unset mode opens in viewing` (F08-AC-017a) |
| F08-REQ-018 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-007 Open in viewing and show rendered Markdown | `viewing shows rendered markdown` (F08-AC-018a) |
| F08-REQ-019 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-008 Set the reading measure and the phone page | `reading text is 17px at 1.7 line height` (F08-AC-019a) |
| F08-REQ-020 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-008 Set the reading measure and the phone page | `reading column is capped at 760px` (F08-AC-020a); `390px page uses 16px side padding` (F08-AC-020b) |
| F08-REQ-021 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-008 Set the reading measure and the phone page | `390px page scrolls vertically and can edit` (F08-AC-021a) |
| F08-REQ-022 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-009 Fill and scroll the outline | `outline lists the page headings` (F08-AC-022a) |
| F08-REQ-023 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-009 Fill and scroll the outline | `outline says no headings` (F08-AC-023a) |
| F08-REQ-024 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-009 Fill and scroll the outline | `outline marks the top heading` (F08-AC-024a) |
| F08-REQ-025 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-009 Fill and scroll the outline | `outline row scrolls to the heading` (F08-AC-025a) |
| F08-REQ-026 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-009 Fill and scroll the outline | `source mode and phone width hide the outline` (F08-AC-026a) |
| F08-REQ-027 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-009 Fill and scroll the outline | `outline indents nested headings` (F08-AC-027a) |
| F08-REQ-028 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-010 Show the empty, missing, unknown, and loading screens | `missing page offers to create it` (F08-AC-028a) |
| F08-REQ-029 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-010 Show the empty, missing, unknown, and loading screens | `empty project offers the first page` (F08-AC-029a) |
| F08-REQ-030 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-010 Show the empty, missing, unknown, and loading screens | `unknown project sends the owner to the project list` (F08-AC-030a) |
| F08-REQ-031 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-010 Show the empty, missing, unknown, and loading screens | `missing route is blank before hydration` (F08-AC-031a) |
| F08-REQ-032 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-011 Show who links here | `backlinks sit under the page` (F08-AC-032a) |
| F08-REQ-033 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-012 Show a disk change | `disk change shows a load control` (F08-AC-033a) |
| F08-REQ-034 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-006 Show the title row, the status line, and the document title | `document title joins page and project` (F08-AC-034a) |
| F08-REQ-035 | F08 Reading shell | specs/features/F08-reading-shell/tasks.md — F08-T-004 Open the file column as a phone drawer | `phone scrim closes the file drawer` (F08-AC-035a) |
| F09-REQ-001 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-001 Store one mode for the browser | `a fresh visit opens in preview` (F09-AC-001a); `mode is shared across pages` (F09-AC-001b) |
| F09-REQ-002 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-002 Turn editing on and off from the Edit control | `Edit toggles preview and editing` (F09-AC-002a) |
| F09-REQ-003 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-003 Switch mode from the keyboard and from the address | `Control-slash toggles source and editing` (F09-AC-003a) |
| F09-REQ-004 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-003 Switch mode from the keyboard and from the address | `E enters editing from preview` (F09-AC-004a) |
| F09-REQ-005 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-003 Switch mode from the keyboard and from the address | `edit=1 opens editing and leaves the address` (F09-AC-005a) |
| F09-REQ-006 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-004 Show preview, blocks, or full-page source | `preview shows the rendered page only` (F09-AC-006a) |
| F09-REQ-007 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-004 Show preview, blocks, or full-page source | `editing does not place source beside preview` (F09-AC-007a) |
| F09-REQ-008 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-004 Show preview, blocks, or full-page source | `source fills the page at 13.5px and 15px` (F09-AC-008a) |
| F09-REQ-009 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-005 Keep the typed text in this browser | `a local edit is marked edited in this browser` (F09-AC-009a) |
| F09-REQ-010 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-006 Keep local snapshots | `a quiet period of 10 minutes stores Before editing` (F09-AC-010a) |
| F09-REQ-011 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-006 Keep local snapshots | `Control-S saves a version and reports a repeat` (F09-AC-011a) |
| F09-REQ-012 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-007 Write a folder project to disk, and leave repository projects in the browser | `guide edits are not posted as repository writes` (F09-AC-012a) |
| F09-REQ-013 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-008 Edit without a role | `editing and saving do not ask for a role` (F09-AC-013a) |
| F09-REQ-014 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-009 Count words on the status line | `status word count matches the stored source` (F09-AC-014a) |
| F09-REQ-015 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-010 Show scalar frontmatter while editing | `scalar frontmatter is a text field while editing` (F09-AC-015a) |
| F09-REQ-016 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-011 Keep editing usable at 390px | `390px editing keeps 17px type and a 44px Edit control` (F09-AC-016a) |
| F09-REQ-017 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-012 Keep inline live preview out of this editor | `editing is blocks, not inline live preview` (F09-AC-017a); F09-AC-002a |
| F09-REQ-018 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-013 Show a schema form and write one YAML value | `schema fields render as dropdown, date, and picker` (F09-AC-018a) |
| F09-REQ-019 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-013 Show a schema form and write one YAML value | `pinned link stores slug at version` (F09-AC-019a) |
| F09-REQ-020 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-013 Show a schema form and write one YAML value | `one form edit writes one YAML value` (F09-AC-020a) |
| F09-REQ-021 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-014 Narrow the slash menu to structure | `slash menu inserts structure only` (F09-AC-021a) |
| F09-REQ-022 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-015 Insert a document link and a version pin | `double bracket inserts a document link` (F09-AC-022a) |
| F09-REQ-023 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-015 Insert a document link and a version pin | `at-sign pins the earliest version` (F09-AC-023a) |
| F09-REQ-024 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-016 Store a pasted image under assets | `pasted image lands in assets` (F09-AC-024a) |
| F09-REQ-025 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-017 Write a private server draft | `draft writes once within 2 seconds and stays private` (F09-AC-025a) |
| F09-REQ-026 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-017 Write a private server draft | `return restores the author's server draft` (F09-AC-026a) |
| F09-REQ-027 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-018 Ask for a commit message when validation is clean | `command-s opens an optional commit message` (F09-AC-027a) |
| F09-REQ-028 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-018 Ask for a commit message when validation is clean | `a validation error blocks save` (F09-AC-028a) |
| F09-REQ-029 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-018 Ask for a commit message when validation is clean | `a warning still allows save` (F09-AC-029a) |
| F09-REQ-030 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-019 Show Save or Propose from the role | `contributor propose does not write a revision` (F09-AC-030a) |
| F09-REQ-031 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-019 Show Save or Propose from the role | `owner and editor see save` (F09-AC-031a) |
| F09-REQ-032 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-019 Show Save or Propose from the role | `viewer has no save or propose` (F09-AC-032a) |
| F09-REQ-033 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-020 Merge or stop when the head moved | `a newer head shows the conflict banner` (F09-AC-033a) |
| F09-REQ-034 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-020 Merge or stop when the head moved | `save merges the three texts as lines` (F09-AC-034a) |
| F09-REQ-035 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-020 Merge or stop when the head moved | `a clean merge notices rebased onto latest` (F09-AC-035a) |
| F09-REQ-036 | F09 Editing | specs/features/F09-editing/tasks.md — F09-T-020 Merge or stop when the head moved | `a conflict opens the three texts and does not save` (F09-AC-036a) |
| F10-REQ-001 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-001 Open Settings as a dialog with three sections | `settings opens as a dialog` (F10-AC-001a) |
| F10-REQ-002 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-002 Open on Appearance, and toggle without changing the section | `settings from the file column opens appearance` (F10-AC-002a); `phone gear opens settings` (F10-AC-002b) |
| F10-REQ-003 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-002 Open on Appearance, and toggle without changing the section | `control comma toggles settings` (F10-AC-003a) |
| F10-REQ-004 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-001 Open Settings as a dialog with three sections | `escape closes settings` (F10-AC-004a) |
| F10-REQ-005 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-001 Open Settings as a dialog with three sections | `settings lists general appearance and mcp` (F10-AC-005a) |
| F10-REQ-006 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-003 Show the General copy | `general section explains local pages` (F10-AC-006a) |
| F10-REQ-007 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-004 Store and paint Light, Dark, and System | `appearance section offers three themes` (F10-AC-007a) |
| F10-REQ-008 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-004 Store and paint Light, Dark, and System | `light dark and system update the document theme` (F10-AC-008a) |
| F10-REQ-009 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-004 Store and paint Light, Dark, and System | `missing theme uses dark` (F10-AC-009a) |
| F10-REQ-010 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-004 Store and paint Light, Dark, and System | `system theme tracks the color scheme` (F10-AC-010a) |
| F10-REQ-011 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-005 Apply the theme before the first paint | `stored theme is applied before first paint` (F10-AC-011a) |
| F10-REQ-012 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-006 Show MCP snippets and confirm a copy | `mcp section shows live snippets` (F10-AC-012a) |
| F10-REQ-013 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-006 Show MCP snippets and confirm a copy | `mcp section falls back when the endpoint is down` (F10-AC-013a) |
| F10-REQ-014 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-006 Show MCP snippets and confirm a copy | `copying a snippet confirms the client name` (F10-AC-014a) |
| F10-REQ-015 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-007 Size the dialog for a wide screen and a phone | `settings dialog is 760 by 520 on a wide screen` (F10-AC-015a) |
| F10-REQ-016 | F10 Settings and theme | specs/features/F10-settings/tasks.md — F10-T-007 Size the dialog for a wide screen and a phone | `settings dialog fills the phone and stacks the sections` (F10-AC-016a) |
| F11-REQ-001 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-001 Open the share sheet and close it | `share dialog names the page` (F11-AC-001a) |
| F11-REQ-002 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-001 Open the share sheet and close it | `share sheet says anyone with the link` (F11-AC-002a) |
| F11-REQ-003 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-002 Remember Can view or Can edit for this page | `can view is selected when nothing is stored` (F11-AC-003a) |
| F11-REQ-004 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-002 Remember Can view or Can edit for this page | `can edit is stored for the page` (F11-AC-004a) |
| F11-REQ-005 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-002 Remember Can view or Can edit for this page | `can view and can edit set the edit query` (F11-AC-005a) |
| F11-REQ-006 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-002 Remember Can view or Can edit for this page | `can edit does not create a permission` (F11-AC-006a) |
| F11-REQ-007 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-003 Apply the edit parameter as a starting mode | `edit query sets the starting mode and is removed` (F11-AC-007a) |
| F11-REQ-008 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-004 Note a browser-only page | `edited page warns that the link is the repository copy` (F11-AC-008a) |
| F11-REQ-009 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-004 Note a browser-only page | `created page warns the link will not show it` (F11-AC-009a) |
| F11-REQ-010 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-004 Note a browser-only page | `repository copy has no extra share note` (F11-AC-010a) |
| F11-REQ-011 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-005 Copy the link | `copy link changes the button to copied` (F11-AC-011a) |
| F11-REQ-012 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-005 Copy the link | `failed copy leaves the button unchanged` (F11-AC-012a) |
| F11-REQ-013 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-001 Open the share sheet and close it | `escape closes the share sheet` (F11-AC-013a) |
| F11-REQ-014 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-001 Open the share sheet and close it | `share dialog uses the phone width` (F11-AC-014a) |
| F11-REQ-015 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-006 Keep invites off this sheet | `share sheet has no invite while sign-in is absent` (F11-AC-015a) |
| F11-REQ-016 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-007 Leave the page link as a starting mode | `can edit stays a starting mode after sign-in` (F11-AC-016a); `can view stays a starting mode after sign-in` (F11-AC-016b) |
| F11-REQ-017 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-008 Store one unused invite | `owner invite stores the role and the expiry` (F11-AC-017a) |
| F11-REQ-018 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-008 Store one unused invite | `a new invite revokes the older unused invite` (F11-AC-018a) |
| F11-REQ-019 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-008 Store one unused invite | `an invite email over 254 characters is rejected` (F11-AC-019a) |
| F11-REQ-020 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-008 Store one unused invite | `an invite role outside the four is rejected` (F11-AC-020a) |
| F11-REQ-021 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-009 Allow only an Owner to invite | `an owner can store an invite` (F11-AC-021a); `an editor cannot invite` (F11-AC-021b); `non-owners cannot invite` (F11-AC-021c); `an agent key a grant and an endpoint cannot invite` (F11-AC-021d) |
| F11-REQ-022 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-010 Accept an invite into one membership | `accepting an invite sets the invited role` (F11-AC-022a); `a second accept does not change the membership` (F11-AC-022b) |
| F11-REQ-023 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-010 Accept an invite into one membership | `an invite older than 7 days is refused` (F11-AC-023a) |
| F11-REQ-024 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-010 Accept an invite into one membership | `a different email cannot accept the invite` (F11-AC-024a) |
| F11-REQ-025 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-010 Accept an invite into one membership | `a revoked invite cannot be accepted` (F11-AC-025a) |
| F11-REQ-026 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-011 Keep a new space private | `a new space has public read off` (F11-AC-026a) |
| F11-REQ-027 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-011 Keep a new space private | `public read off refuses a caller with no membership` (F11-AC-027a) |
| F11-REQ-028 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-012 Let an Owner turn the public link on or off | `an owner can turn the public read-only link on` (F11-AC-028a); `an editor cannot change the public read-only link` (F11-AC-028b); `non-owners cannot change the public read-only link` (F11-AC-028c) |
| F11-REQ-029 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-013 Read a public space at the document URL | `public read opens the document url with no secret token` (F11-AC-029a); `public read still treats can edit as a starting mode` (F11-AC-029b) |
| F11-REQ-030 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-013 Read a public space at the document URL | `a public view does not show proposals keys or members` (F11-AC-030a); `a public view does not show audit events` (F11-AC-030b) |
| F11-REQ-031 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-014 Save only as an Owner or an Editor | `can edit does not let a contributor save` (F11-AC-031a); `can edit does not let a viewer save` (F11-AC-031b); `public read does not grant a save` (F11-AC-031c); `can view does not remove an editor save` (F11-AC-031d); `can edit does not let a signed-out caller save` (F11-AC-031e); `can edit does not let an agent key save` (F11-AC-031f); `an endpoint cannot save from a page link` (F11-AC-031g) |
| F11-REQ-032 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-015 Show Members to an Owner | `only an owner sees the invite form` (F11-AC-032a); `an editor does not see the invite form` (F11-AC-032b) |
| F11-REQ-033 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-015 Show Members to an Owner | `a stored invite says it expires in 7 days` (F11-AC-033a) |
| F11-REQ-034 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-015 Show Members to an Owner | `the public link tells the owner it is off` (F11-AC-034a); `the public link tells the owner it is on` (F11-AC-034b) |
| F11-REQ-035 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-015 Show Members to an Owner | `invite and public link controls meet the coarse target` (F11-AC-035a) |
| F11-REQ-036 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-007 Leave the page link as a starting mode | `sign-in does not replace anyone with the link` (F11-AC-036a) |
| F11-REQ-037 | F11 Sharing | specs/features/F11-sharing/tasks.md — F11-T-013 Read a public space at the document URL | `public read does not grant a proposal` (F11-AC-037a); `public read does not grant a merge` (F11-AC-037b) |
| F12-REQ-001 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T01 Keep the review loop off | F12-AC-001a |
| F12-REQ-002 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-002a; F12-AC-002b |
| F12-REQ-003 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-003a |
| F12-REQ-004 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-004a; F12-AC-004b; F12-AC-004c |
| F12-REQ-005 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-005a; F12-AC-005b |
| F12-REQ-006 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T05 Apply find-and-replace edits | F12-AC-006a; F12-AC-006b |
| F12-REQ-007 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T05 Apply find-and-replace edits | F12-AC-007a; F12-AC-007b; F12-AC-007c; F12-AC-007d; F12-AC-007e |
| F12-REQ-008 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T05 Apply find-and-replace edits | F12-AC-008a |
| F12-REQ-009 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T05 Apply find-and-replace edits | F12-AC-009a |
| F12-REQ-010 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-010a; F12-AC-010b |
| F12-REQ-011 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T02 Add author clock and grant id | F12-AC-011a |
| F12-REQ-011 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-011a |
| F12-REQ-012 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-012a |
| F12-REQ-013 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-013a |
| F12-REQ-014 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T02 Add author clock and grant id | F12-AC-014a |
| F12-REQ-014 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T10 Record the author | F12-AC-014a; F12-AC-014b |
| F12-REQ-015 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T20 Query the Inbox | F12-AC-015a |
| F12-REQ-016 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T20 Query the Inbox | F12-AC-016a; F12-AC-016b |
| F12-REQ-017 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T20 Query the Inbox | F12-AC-017a |
| F12-REQ-018 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T20 Query the Inbox | F12-AC-018a |
| F12-REQ-019 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T22 Serve Inbox routes | F12-AC-019a; F12-AC-019b |
| F12-REQ-020 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T03 Bind review keys | F12-AC-020a; F12-AC-020b |
| F12-REQ-021 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T25 Build the proposal screen | F12-AC-021a |
| F12-REQ-022 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T04 Align blocks and word-diff pairs | F12-AC-022a |
| F12-REQ-023 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T25 Build the proposal screen | F12-AC-023a |
| F12-REQ-024 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T07 Diff frontmatter and fold sections | F12-AC-024a; F12-AC-024b |
| F12-REQ-025 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T21 Render creates, charts, and diagrams | F12-AC-025a |
| F12-REQ-026 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T25 Build the proposal screen | F12-AC-026a; F12-AC-026b |
| F12-REQ-027 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T07 Diff frontmatter and fold sections | F12-AC-027a; F12-AC-027b |
| F12-REQ-028 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T04 Align blocks and word-diff pairs | F12-AC-028a; F12-AC-028b; F12-AC-028c; F12-AC-028d |
| F12-REQ-029 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T04 Align blocks and word-diff pairs | F12-AC-029a |
| F12-REQ-030 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T21 Render creates, charts, and diagrams | F12-AC-030a; F12-AC-030b |
| F12-REQ-031 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T02 Add author clock and grant id | F12-AC-031d |
| F12-REQ-031 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T13 Derive stale and conflicted marks | F12-AC-031a; F12-AC-031b; F12-AC-031c; F12-AC-031d |
| F12-REQ-032 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T14 Update a proposal | F12-AC-032a |
| F12-REQ-033 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T17 Merge | F12-AC-033a |
| F12-REQ-034 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T14 Update a proposal | F12-AC-034a; F12-AC-034b; F12-AC-034c; F12-AC-034d |
| F12-REQ-035 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T15 Withdraw a proposal | F12-AC-035a; F12-AC-035b; F12-AC-035c |
| F12-REQ-036 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T17 Merge | F12-AC-036a; F12-AC-036b |
| F12-REQ-037 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T06 Merge lines three ways | F12-AC-037a; F12-AC-037b; F12-AC-037c; F12-AC-037d |
| F12-REQ-038 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T12 Resolve a conflict | F12-AC-038a; F12-AC-038b; F12-AC-038c |
| F12-REQ-039 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T16 Reject and request changes | F12-AC-039a; F12-AC-039b |
| F12-REQ-040 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T16 Reject and request changes | F12-AC-040a; F12-AC-040b |
| F12-REQ-041 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T18 Edit before merge | F12-AC-041a; F12-AC-041b |
| F12-REQ-042 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T19 Check who may propose and review | F12-AC-042a; F12-AC-042b |
| F12-REQ-043 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T19 Check who may propose and review | F12-AC-043a; F12-AC-043b; F12-AC-043c; F12-AC-043d |
| F12-REQ-044 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T19 Check who may propose and review | F12-AC-044a; F12-AC-044b |
| F12-REQ-045 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T03 Bind review keys | F12-AC-045a; F12-AC-045b |
| F12-REQ-046 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T03 Bind review keys | F12-AC-046a; F12-AC-046b; F12-AC-046c |
| F12-REQ-047 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T26 Show merge and reject before the server returns | F12-AC-047a; F12-AC-047b |
| F12-REQ-048 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T26 Show merge and reject before the server returns | F12-AC-048a |
| F12-REQ-049 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T23 Hide proposals on a public read view | F12-AC-049a |
| F12-REQ-050 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T24 Show a new row within 2 seconds | F12-AC-050a |
| F12-REQ-051 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T13 Derive stale and conflicted marks | F12-AC-051a |
| F12-REQ-052 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T16 Reject and request changes | F12-AC-052a; F12-AC-052b |
| F12-REQ-053 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T11 Read a proposal for its author | F12-AC-053a |
| F12-REQ-054 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T03 Bind review keys | F12-AC-054a; F12-AC-054b |
| F12-REQ-055 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T25 Build the proposal screen | F12-AC-055a |
| F12-REQ-056 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T25 Build the proposal screen | F12-AC-056a |
| F12-REQ-057 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T14 Update a proposal | F12-AC-057a |
| F12-REQ-058 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T08 Submit a proposal | F12-AC-058a |
| F12-REQ-059 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T11 Read a proposal for its author | F12-AC-059a |
| F12-REQ-060 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T09 Refuse closed proposals | F12-AC-060a; F12-AC-060b |
| F12-REQ-061 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T14 Update a proposal | F12-AC-061a |
| F12-REQ-062 | F12 Proposals and review | specs/features/F12-proposals/tasks.md — F12-T15 Withdraw a proposal | F12-AC-062a |
| F13-REQ-001 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T01 Leave the editor server in place | F13-AC-001a; F13-AC-001b; F13-AC-001c |
| F13-REQ-002 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T19 Bind the ten tool contracts | F13-AC-002a |
| F13-REQ-003 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T05 Refuse an unknown route | F13-AC-003a |
| F13-REQ-004 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T20 Serve MCP and REST from one implementation | F13-AC-004a |
| F13-REQ-005 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T06 Reject a space argument | F13-AC-005a |
| F13-REQ-006 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T07 Authenticate a bearer | F13-AC-006a; F13-AC-006b; F13-AC-006c; F13-AC-006d |
| F13-REQ-007 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T07 Authenticate a bearer | F13-AC-007a |
| F13-REQ-008 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T02 Store credential windows | F13-AC-008a |
| F13-REQ-008 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T08 Create and revoke a key | F13-AC-008a; F13-AC-008b; F13-AC-008c |
| F13-REQ-009 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T08 Create and revoke a key | F13-AC-009a |
| F13-REQ-010 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T09 Enforce read and propose scope | F13-AC-010a; F13-AC-010b; F13-AC-010c |
| F13-REQ-011 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T07 Authenticate a bearer | F13-AC-011a |
| F13-REQ-012 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T02 Store credential windows | F13-AC-012a |
| F13-REQ-012 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T10 Count the three limits | F13-AC-012a; F13-AC-012b; F13-AC-012c; F13-AC-012d |
| F13-REQ-013 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T10 Count the three limits | F13-AC-013a; F13-AC-013b |
| F13-REQ-014 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T11 Build the context pack | F13-AC-014a; F13-AC-014b |
| F13-REQ-015 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T11 Build the context pack | F13-AC-015a; F13-AC-015b |
| F13-REQ-016 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T12 Search documents | F13-AC-016a; F13-AC-016b; F13-AC-016c |
| F13-REQ-017 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T13 List documents | F13-AC-017a |
| F13-REQ-018 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T14 Read a document | F13-AC-018a; F13-AC-018b |
| F13-REQ-019 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T15 Return a template | F13-AC-019a; F13-AC-019b |
| F13-REQ-020 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T16 Validate without writing | F13-AC-020a; F13-AC-020b |
| F13-REQ-021 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T17 Propose, update, and read a proposal | F13-AC-021a; F13-AC-021b; F13-AC-021c |
| F13-REQ-022 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T17 Propose, update, and read a proposal | F13-AC-022a; F13-AC-022b |
| F13-REQ-023 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T17 Propose, update, and read a proposal | F13-AC-023a; F13-AC-023b |
| F13-REQ-024 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T18 Return metric points | F13-AC-024a; F13-AC-024b |
| F13-REQ-025 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T19 Bind the ten tool contracts | F13-AC-025a |
| F13-REQ-026 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T19 Bind the ten tool contracts | F13-AC-026a |
| F13-REQ-027 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T03 Shape the error object | F13-AC-027a |
| F13-REQ-028 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T16 Validate without writing | F13-AC-028a; F13-AC-028b |
| F13-REQ-029 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T04 Refuse an oversized body | F13-AC-029a |
| F13-REQ-030 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T21 Show Agent keys | F13-AC-030a; F13-AC-030b |
| F13-REQ-031 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T22 Show Connect | F13-AC-031a; F13-AC-031b |
| F13-REQ-032 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T12 Search documents | F13-AC-032a |
| F13-REQ-033 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T23 Answer a tool within 2 seconds | F13-AC-033a |
| F13-REQ-034 | F13 Agent access | specs/features/F13-agent-access/tasks.md — F13-T24 Finish the log-an-experiment server path | F13-AC-034a |
| F14-REQ-001 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T01 Keep OAuth off | F14-AC-001a; F14-AC-001b |
| F14-REQ-002 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T04 Publish protected-resource metadata | F14-AC-002a; F14-AC-002b |
| F14-REQ-003 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T05 Publish authorization-server metadata | F14-AC-003a; F14-AC-003b |
| F14-REQ-004 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T06 Advertise the resource on 401 | F14-AC-004a |
| F14-REQ-005 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T02 Add OAuth tables | F14-AC-005a |
| F14-REQ-005 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T07 Register a public client | F14-AC-005a; F14-AC-005b |
| F14-REQ-006 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T07 Register a public client | F14-AC-006a; F14-AC-006b; F14-AC-006c |
| F14-REQ-007 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T03 Accept redirect URIs | F14-AC-007a; F14-AC-007b |
| F14-REQ-008 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T08 Show consent and refuse the wrong method | F14-AC-008a; F14-AC-008b; F14-AC-008c |
| F14-REQ-009 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T09 Refuse a bad authorization request | F14-AC-009a; F14-AC-009b; F14-AC-009c |
| F14-REQ-010 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T10 Offer only read and propose | F14-AC-010a; F14-AC-010b; F14-AC-010c |
| F14-REQ-011 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T02 Add OAuth tables | F14-AC-011a |
| F14-REQ-011 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T12 Store a grant and a code | F14-AC-011a; F14-AC-011b |
| F14-REQ-012 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T11 Gate approval by membership | F14-AC-012a; F14-AC-012b; F14-AC-012c; F14-AC-012d; F14-AC-012e |
| F14-REQ-013 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T13 Deny or approve with no scope | F14-AC-013a; F14-AC-013b |
| F14-REQ-014 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T14 Exchange a code | F14-AC-014a; F14-AC-014b |
| F14-REQ-015 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T02 Add OAuth tables | F14-AC-015c |
| F14-REQ-015 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T15 Expire and hash access tokens | F14-AC-015a; F14-AC-015b; F14-AC-015c |
| F14-REQ-016 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T16 Rotate refresh tokens | F14-AC-016a; F14-AC-016b; F14-AC-016c |
| F14-REQ-017 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T17 Revoke a grant when a refresh token is reused | F14-AC-017a |
| F14-REQ-018 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T14 Exchange a code | F14-AC-018a; F14-AC-018b; F14-AC-018c |
| F14-REQ-019 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T18 Call the ten tools with a grant | F14-AC-019a; F14-AC-019b; F14-AC-019c; F14-AC-019d; F14-AC-019e |
| F14-REQ-020 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T19 Keep each grant on its own counters | F14-AC-020a; F14-AC-020b; F14-AC-020c; F14-AC-020d |
| F14-REQ-021 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T21 Revoke a grant from Settings | F14-AC-021a; F14-AC-021b; F14-AC-021c; F14-AC-021d; F14-AC-021e |
| F14-REQ-022 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T22 List grants in Agents | F14-AC-022a; F14-AC-022b; F14-AC-022c; F14-AC-022d |
| F14-REQ-023 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T23 Store the grant label on a proposal | F14-AC-023a |
| F14-REQ-024 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T20 Check Origin on browser OAuth posts | F14-AC-024a; F14-AC-024b |
| F14-REQ-025 | F14 OAuth | specs/features/F14-oauth/tasks.md — F14-T24 Show the three OAuth cards | F14-AC-025a; F14-AC-025b; F14-AC-025c |
| F15-REQ-001 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T01 Leave sign-in off | F15-AC-001a |
| F15-REQ-002 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T01 Leave sign-in off | F15-AC-002a |
| F15-REQ-003 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T01 Leave sign-in off | F15-AC-003a |
| F15-REQ-004 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T02 Treat the page link as a starting mode | F15-AC-004a; F15-AC-004b |
| F15-REQ-004 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T23 Gate document read | F15-AC-004d |
| F15-REQ-004 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T25 Gate edit directly | F15-AC-004c |
| F15-REQ-005 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T04 Offer GitHub, Google, and a magic link | F15-AC-005a; F15-AC-005b |
| F15-REQ-006 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T05 Accept one magic link for 300 seconds | F15-AC-006a; F15-AC-006b; F15-AC-006c; F15-AC-006d |
| F15-REQ-007 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T03 Add sessions and invites | F15-AC-007b |
| F15-REQ-007 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T06 Set the session cookie | F15-AC-007a; F15-AC-007b |
| F15-REQ-008 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T07 Roll the session expiry | F15-AC-008a; F15-AC-008b |
| F15-REQ-009 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T08 Treat a missing session as signed out | F15-AC-009a; F15-AC-009b |
| F15-REQ-010 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T09 Sign out | F15-AC-010a |
| F15-REQ-011 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T10 Reject a foreign Origin | F15-AC-011a; F15-AC-011b |
| F15-REQ-012 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T11 Confirm the provider callback | F15-AC-012a; F15-AC-012b |
| F15-REQ-013 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T15 Read the role from the database | F15-AC-013a |
| F15-REQ-014 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T12 Write one user per email | F15-AC-014a; F15-AC-014b |
| F15-REQ-015 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T12 Write one user per email | F15-AC-015a |
| F15-REQ-016 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T03 Add sessions and invites | F15-AC-016a |
| F15-REQ-016 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T13 Store one membership | F15-AC-016a; F15-AC-016b |
| F15-REQ-017 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T14 Make the space creator the owner | F15-AC-017a |
| F15-REQ-018 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T03 Add sessions and invites | F15-AC-018a |
| F15-REQ-018 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T16 Invite by email | F15-AC-018a; F15-AC-018b; F15-AC-018c; F15-AC-018d |
| F15-REQ-019 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T17 Accept an invite | F15-AC-019a |
| F15-REQ-020 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T18 Refuse a bad invite | F15-AC-020a; F15-AC-020b; F15-AC-020c |
| F15-REQ-021 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T23 Gate document read | F15-AC-021a; F15-AC-021b; F15-AC-021c |
| F15-REQ-022 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T24 Gate human proposals | F15-AC-022a; F15-AC-022b; F15-AC-022c; F15-AC-022d |
| F15-REQ-023 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T25 Gate edit directly | F15-AC-023a; F15-AC-023b; F15-AC-023c; F15-AC-023d; F15-AC-023e; F15-AC-023f; F15-AC-023g |
| F15-REQ-024 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T26 Gate merge | F15-AC-024a; F15-AC-024b; F15-AC-024c; F15-AC-024d |
| F15-REQ-025 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T27 Gate member management | F15-AC-025a; F15-AC-025b; F15-AC-025c |
| F15-REQ-026 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T28 Gate keys and types | F15-AC-026a; F15-AC-026b; F15-AC-026c |
| F15-REQ-027 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T29 Refuse document delete | F15-AC-027a; F15-AC-027b |
| F15-REQ-028 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T30 Refuse merge and admin on a tool | F15-AC-028a; F15-AC-028b; F15-AC-028c |
| F15-REQ-029 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T31 Refuse direct edit on a tool | F15-AC-029a; F15-AC-029b |
| F15-REQ-030 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T32 Keep keys and grants out of the web app | F15-AC-030a; F15-AC-030b |
| F15-REQ-031 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T33 Set the human proposal author | F15-AC-031a; F15-AC-031b |
| F15-REQ-032 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T19 Keep one owner | F15-AC-032a; F15-AC-032b |
| F15-REQ-033 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T20 Audit membership changes | F15-AC-033a; F15-AC-033b |
| F15-REQ-034 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T21 Audit invites | F15-AC-034a; F15-AC-034b |
| F15-REQ-035 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T03 Add sessions and invites | F15-AC-035a |
| F15-REQ-035 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T22 Leave audit rows unchanged | F15-AC-035a |
| F15-REQ-036 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T34 Let an Owner read the audit log | F15-AC-036a; F15-AC-036b; F15-AC-036c |
| F15-REQ-037 | F15 Sign-in and roles | specs/features/F15-auth/tasks.md — F15-T35 Keep provider secrets on the server | F15-AC-037a |
| F16-REQ-001 | F16 Metrics | specs/features/F16-metrics/tasks.md — 1. Build point rows for a concluded merge | F16-AC-001a; F16-AC-001b |
| F16-REQ-002 | F16 Metrics | specs/features/F16-metrics/tasks.md — 1. Build point rows for a concluded merge | F16-AC-002a; F16-AC-002b |
| F16-REQ-003 | F16 Metrics | specs/features/F16-metrics/tasks.md — 1. Build point rows for a concluded merge | F16-AC-003a |
| F16-REQ-004 | F16 Metrics | specs/features/F16-metrics/tasks.md — 2. Treat the head as current | F16-AC-004a; F16-AC-004b |
| F16-REQ-005 | F16 Metrics | specs/features/F16-metrics/tasks.md — 3. Serve the Metrics route | F16-AC-005a |
| F16-REQ-006 | F16 Metrics | specs/features/F16-metrics/tasks.md — 3. Serve the Metrics route | F16-AC-006a; F16-AC-006b; F16-AC-006c |
| F16-REQ-007 | F16 Metrics | specs/features/F16-metrics/tasks.md — 4. Select eval, version, and metric | F16-AC-007a; F16-AC-007b; F16-AC-007c |
| F16-REQ-008 | F16 Metrics | specs/features/F16-metrics/tasks.md — 5. Draw the line chart | F16-AC-008a |
| F16-REQ-009 | F16 Metrics | specs/features/F16-metrics/tasks.md — 5. Draw the line chart | F16-AC-009a; F16-AC-009b |
| F16-REQ-010 | F16 Metrics | specs/features/F16-metrics/tasks.md — 5. Draw the line chart | F16-AC-010a |
| F16-REQ-011 | F16 Metrics | specs/features/F16-metrics/tasks.md — 6. Baseline, delta, and the eval's unit | F16-AC-011a; F16-AC-011b; F16-AC-011c |
| F16-REQ-012 | F16 Metrics | specs/features/F16-metrics/tasks.md — 6. Baseline, delta, and the eval's unit | F16-AC-012a; F16-AC-012b |
| F16-REQ-013 | F16 Metrics | specs/features/F16-metrics/tasks.md — 5. Draw the line chart | F16-AC-013a |
| F16-REQ-014 | F16 Metrics | specs/features/F16-metrics/tasks.md — 6. Baseline, delta, and the eval's unit | F16-AC-014a; F16-AC-014b; F16-AC-014c; F16-AC-014d |
| F16-REQ-015 | F16 Metrics | specs/features/F16-metrics/tasks.md — 7. Harness comparison table | F16-AC-015a; F16-AC-015b |
| F16-REQ-016 | F16 Metrics | specs/features/F16-metrics/tasks.md — 7. Harness comparison table | F16-AC-016a; F16-AC-016b; F16-AC-016c; F16-AC-016d |
| F16-REQ-017 | F16 Metrics | specs/features/F16-metrics/tasks.md — 8. Compare two harness versions | F16-AC-017a; F16-AC-017b |
| F16-REQ-018 | F16 Metrics | specs/features/F16-metrics/tasks.md — 9. Hover and open an experiment | F16-AC-018a; F16-AC-018b; F16-AC-018c |
| F16-REQ-019 | F16 Metrics | specs/features/F16-metrics/tasks.md — 10. Refresh an open screen after merge | F16-AC-019a |
| F16-REQ-020 | F16 Metrics | specs/features/F16-metrics/tasks.md — 7. Harness comparison table | F16-AC-020a |
| F16-REQ-021 | F16 Metrics | specs/features/F16-metrics/tasks.md — 6. Baseline, delta, and the eval's unit | F16-AC-021a |
| F17-REQ-001 | F17 Search | specs/features/F17-search/tasks.md — F17-T-001 Open page search and close it | `search button opens the page dialog` (F17-AC-001a); `control k opens search` (F17-AC-001b) |
| F17-REQ-002 | F17 Search | specs/features/F17-search/tasks.md — F17-T-001 Open page search and close it | `search field is labeled and focused` (F17-AC-002a) |
| F17-REQ-003 | F17 Search | specs/features/F17-search/tasks.md — F17-T-002 Filter the loaded pages in project order | `empty search lists every page in project order` (F17-AC-003a) |
| F17-REQ-004 | F17 Search | specs/features/F17-search/tasks.md — F17-T-002 Filter the loaded pages in project order | `search matches title path and body text` (F17-AC-004a); `type colon experiment is not a filter` (F17-AC-004b) |
| F17-REQ-005 | F17 Search | specs/features/F17-search/tasks.md — F17-T-002 Filter the loaded pages in project order | `results stay in project order` (F17-AC-005a) |
| F17-REQ-006 | F17 Search | specs/features/F17-search/tasks.md — F17-T-003 Show a plain snippet | `a query shows a plain snippet` (F17-AC-006a) |
| F17-REQ-007 | F17 Search | specs/features/F17-search/tasks.md — F17-T-004 Move and open a result | `arrow down moves the active result` (F17-AC-007a) |
| F17-REQ-008 | F17 Search | specs/features/F17-search/tasks.md — F17-T-004 Move and open a result | `enter opens the active page` (F17-AC-008a) |
| F17-REQ-009 | F17 Search | specs/features/F17-search/tasks.md — F17-T-004 Move and open a result | `unknown query says no matching pages` (F17-AC-009a) |
| F17-REQ-010 | F17 Search | specs/features/F17-search/tasks.md — F17-T-001 Open page search and close it | `escape closes search` (F17-AC-010a) |
| F17-REQ-011 | F17 Search | specs/features/F17-search/tasks.md — F17-T-005 Size the dialog | `search dialog fits the viewport` (F17-AC-011a) |
| F17-REQ-012 | F17 Search | specs/features/F17-search/tasks.md — F17-T-002 Filter the loaded pages in project order | `search filters pages already on the page` (F17-AC-012a) |
| F17-REQ-013 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `command k opens the search palette` (F17-AC-013a) |
| F17-REQ-014 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `palette field is labeled search query` (F17-AC-014a) |
| F17-REQ-015 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `palette lists four commands` (F17-AC-015a) |
| F17-REQ-016 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `go to inbox leaves the palette` (F17-AC-016a) |
| F17-REQ-017 | F17 Search | specs/features/F17-search/tasks.md — F17-T-007 Parse terms and the five filters | `a term matches title body or frontmatter` (F17-AC-017a) |
| F17-REQ-018 | F17 Search | specs/features/F17-search/tasks.md — F17-T-007 Parse terms and the five filters | `type status harness verdict and after filter together` (F17-AC-018a) |
| F17-REQ-019 | F17 Search | specs/features/F17-search/tasks.md — F17-T-008 Rank title matches, then recency | `title matches rank before recency` (F17-AC-019a) |
| F17-REQ-020 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `a document row shows a type icon and a highlighted snippet` (F17-AC-020a) |
| F17-REQ-021 | F17 Search | specs/features/F17-search/tasks.md — F17-T-006 Index documents for full-text search | `palette answers within 100 milliseconds` (F17-AC-021a) |
| F17-REQ-022 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `palette says no matches` (F17-AC-022a) |
| F17-REQ-023 | F17 Search | specs/features/F17-search/tasks.md — F17-T-008 Rank title matches, then recency | `empty palette lists commands then recent documents` (F17-AC-023a) |
| F17-REQ-024 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `arrows move and enter opens a document` (F17-AC-024a) |
| F17-REQ-025 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `palette dialog uses the search dialog size` (F17-AC-025a) |
| F17-REQ-026 | F17 Search | specs/features/F17-search/tasks.md — F17-T-009 Open one palette for commands and documents | `escape closes the palette` (F17-AC-026a) |
| F18-REQ-001 | F18 History and Timeline | specs/features/F18-history/tasks.md — 1. Keep the editor dialog | F18-AC-001a |
| F18-REQ-002 | F18 History and Timeline | specs/features/F18-history/tasks.md — 1. Keep the editor dialog | F18-AC-002a; F18-AC-002b |
| F18-REQ-003 | F18 History and Timeline | specs/features/F18-history/tasks.md — 1. Keep the editor dialog | F18-AC-003a |
| F18-REQ-004 | F18 History and Timeline | specs/features/F18-history/tasks.md — 1. Keep the editor dialog | F18-AC-004a; F18-AC-004b |
| F18-REQ-005 | F18 History and Timeline | specs/features/F18-history/tasks.md — 1. Keep the editor dialog | F18-AC-005a |
| F18-REQ-006 | F18 History and Timeline | specs/features/F18-history/tasks.md — 2. Open the history screen on the document | F18-AC-006a |
| F18-REQ-007 | F18 History and Timeline | specs/features/F18-history/tasks.md — 2. Open the history screen on the document | F18-AC-007a; F18-AC-007b |
| F18-REQ-008 | F18 History and Timeline | specs/features/F18-history/tasks.md — 3. Diff two revisions | F18-AC-008a; F18-AC-008b |
| F18-REQ-009 | F18 History and Timeline | specs/features/F18-history/tasks.md — 4. Restore by appending a revision | F18-AC-009a |
| F18-REQ-010 | F18 History and Timeline | specs/features/F18-history/tasks.md — 4. Restore by appending a revision | F18-AC-010a |
| F18-REQ-011 | F18 History and Timeline | specs/features/F18-history/tasks.md — 4. Restore by appending a revision | F18-AC-011a |
| F18-REQ-012 | F18 History and Timeline | specs/features/F18-history/tasks.md — 4. Restore by appending a revision | F18-AC-012a |
| F18-REQ-013 | F18 History and Timeline | specs/features/F18-history/tasks.md — 4. Restore by appending a revision | F18-AC-013a |
| F18-REQ-014 | F18 History and Timeline | specs/features/F18-history/tasks.md — 5. Allow restore by role | F18-AC-014a |
| F18-REQ-015 | F18 History and Timeline | specs/features/F18-history/tasks.md — 5. Allow restore by role | F18-AC-015a; F18-AC-015b; F18-AC-015c; F18-AC-015d |
| F18-REQ-016 | F18 History and Timeline | specs/features/F18-history/tasks.md — 6. Group the space on a timeline | F18-AC-016a; F18-AC-016b |
| F18-REQ-017 | F18 History and Timeline | specs/features/F18-history/tasks.md — 6. Group the space on a timeline | F18-AC-017a |
| F18-REQ-018 | F18 History and Timeline | specs/features/F18-history/tasks.md — 6. Group the space on a timeline | F18-AC-018a; F18-AC-018b |
| F18-REQ-019 | F18 History and Timeline | specs/features/F18-history/tasks.md — 6. Group the space on a timeline | F18-AC-019a |
| F18-REQ-020 | F18 History and Timeline | specs/features/F18-history/tasks.md — 5. Allow restore by role | F18-AC-020a; F18-AC-020b |
| F18-REQ-021 | F18 History and Timeline | specs/features/F18-history/tasks.md — 7. Move the list with J and K | F18-AC-021a; F18-AC-021b |
| F19-REQ-001 | F19 Import and export | specs/features/F19-import-export/tasks.md — 1. Keep the editor zip and the sidebar drop | F19-AC-001a; F19-AC-001b; F19-AC-001c |
| F19-REQ-002 | F19 Import and export | specs/features/F19-import-export/tasks.md — 1. Keep the editor zip and the sidebar drop | F19-AC-002a |
| F19-REQ-003 | F19 Import and export | specs/features/F19-import-export/tasks.md — 1. Keep the editor zip and the sidebar drop | F19-AC-003a; F19-AC-003b |
| F19-REQ-004 | F19 Import and export | specs/features/F19-import-export/tasks.md — 1. Keep the editor zip and the sidebar drop | F19-AC-004a |
| F19-REQ-005 | F19 Import and export | specs/features/F19-import-export/tasks.md — 1. Keep the editor zip and the sidebar drop | F19-AC-005a |
| F19-REQ-006 | F19 Import and export | specs/features/F19-import-export/tasks.md — 6. Offer the two import actions | F19-AC-006a |
| F19-REQ-007 | F19 Import and export | specs/features/F19-import-export/tasks.md — 4. Save each valid file and refuse each invalid file | F19-AC-007a; F19-AC-007b |
| F19-REQ-008 | F19 Import and export | specs/features/F19-import-export/tasks.md — 4. Save each valid file and refuse each invalid file | F19-AC-008a; F19-AC-008b |
| F19-REQ-009 | F19 Import and export | specs/features/F19-import-export/tasks.md — 5. Return one result and a report | F19-AC-009a |
| F19-REQ-010 | F19 Import and export | specs/features/F19-import-export/tasks.md — 5. Return one result and a report | F19-AC-010a |
| F19-REQ-011 | F19 Import and export | specs/features/F19-import-export/tasks.md — 4. Save each valid file and refuse each invalid file | F19-AC-011a; F19-AC-011b |
| F19-REQ-012 | F19 Import and export | specs/features/F19-import-export/tasks.md — 4. Save each valid file and refuse each invalid file | F19-AC-012a |
| F19-REQ-013 | F19 Import and export | specs/features/F19-import-export/tasks.md — 7. Export the space and round-trip it | F19-AC-013a |
| F19-REQ-014 | F19 Import and export | specs/features/F19-import-export/tasks.md — 7. Export the space and round-trip it | F19-AC-014a; F19-AC-014b |
| F19-REQ-015 | F19 Import and export | specs/features/F19-import-export/tasks.md — 8. Import into a space that already has the path | F19-AC-015a; F19-AC-015b |
| F19-REQ-016 | F19 Import and export | specs/features/F19-import-export/tasks.md — 7. Export the space and round-trip it | F19-AC-016a; F19-AC-016b |
| F19-REQ-017 | F19 Import and export | specs/features/F19-import-export/tasks.md — 8. Import into a space that already has the path | F19-AC-017a; F19-AC-017b |
| F19-REQ-018 | F19 Import and export | specs/features/F19-import-export/tasks.md — 2. Allow a null author while sign-in is absent | F19-AC-018a; F19-AC-018b |
| F19-REQ-019 | F19 Import and export | specs/features/F19-import-export/tasks.md — 9. Allow import and export by role | F19-AC-019a; F19-AC-019b |
| F19-REQ-020 | F19 Import and export | specs/features/F19-import-export/tasks.md — 3. Accept a folder or a zip inside the caps | F19-AC-020a; F19-AC-020b |
| F19-REQ-021 | F19 Import and export | specs/features/F19-import-export/tasks.md — 4. Save each valid file and refuse each invalid file | F19-AC-021a; F19-AC-021b |
| F19-REQ-022 | F19 Import and export | specs/features/F19-import-export/tasks.md — 3. Accept a folder or a zip inside the caps | F19-AC-022a; F19-AC-022b; F19-AC-022c |
| F19-REQ-023 | F19 Import and export | specs/features/F19-import-export/tasks.md — 10. Name the backup | F19-AC-023a; F19-AC-023b |
| F20-REQ-001 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-001 Bind the modifier chords | `control k opens page search` (F20-AC-001a) |
| F20-REQ-002 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-001 Bind the modifier chords | `control slash from viewing opens markdown source` (F20-AC-002a); `control slash from source returns to editing` (F20-AC-002b) |
| F20-REQ-003 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-001 Bind the modifier chords | `control backslash toggles the outline` (F20-AC-003a) |
| F20-REQ-004 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-001 Bind the modifier chords | `control s saves a version` (F20-AC-004a) |
| F20-REQ-005 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-001 Bind the modifier chords | `control comma opens settings` (F20-AC-005a) |
| F20-REQ-006 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-002 Open shortcut help and list the built keys | `question mark opens shortcut help` (F20-AC-006a) |
| F20-REQ-007 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-002 Open shortcut help and list the built keys | `shortcut help lists the built keys` (F20-AC-007a) |
| F20-REQ-008 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-003 Start editing or a new page from a plain key | `e starts editing and does not toggle off` (F20-AC-008a) |
| F20-REQ-009 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-003 Start editing or a new page from a plain key | `c starts a new page in the open folder` (F20-AC-009a) |
| F20-REQ-010 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-003 Start editing or a new page from a plain key | `c and e do nothing while typing or in a dialog` (F20-AC-010a) |
| F20-REQ-011 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-004 Close search, help, and the phone drawer on Escape | `escape closes search and shortcut help` (F20-AC-011a) |
| F20-REQ-012 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-005 Open the block menu and the page picker | `slash while editing opens the block menu` (F20-AC-012a) |
| F20-REQ-013 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-005 Open the block menu and the page picker | `double bracket while editing opens the page picker` (F20-AC-013a) |
| F20-REQ-014 | F20 Keyboard | specs/features/F20-keyboard/tasks.md — F20-T-006 Leave the review keys unbound | `shortcut help omits review chords` (F20-AC-014a) |
| F21-REQ-001 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-001 Paint Dark when the theme is missing | `unset theme paints dark` (F21-AC-001a) |
| F21-REQ-002 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-002 Paint solid surfaces and no column hairline | `dark shell uses the page and sidebar fills` (F21-AC-002a); `light theme paints the page surface` (F21-AC-002b) |
| F21-REQ-003 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-002 Paint solid surfaces and no column hairline | `shell columns have no border and no shadow` (F21-AC-003a) |
| F21-REQ-004 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-003 Use one accent and the warning and danger colors | `light focus ring uses the light accent` (F21-AC-004a) |
| F21-REQ-005 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-003 Use one accent and the warning and danger colors | `warning and danger colors match the theme` (F21-AC-005a) |
| F21-REQ-006 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-004 Apply the radius scale | `controls blocks and dialogs use the radius scale` (F21-AC-006a) |
| F21-REQ-007 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-004 Apply the radius scale | `inline code and marks use 8px and 6px` (F21-AC-007a) |
| F21-REQ-008 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-005 Set the type scale, the fonts, and the reading cap | `ui text is 13px and reading text is 17px` (F21-AC-008a) |
| F21-REQ-009 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-005 Set the type scale, the fonts, and the reading cap | `the shell uses geist sans and geist mono` (F21-AC-009a) |
| F21-REQ-010 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-005 Set the type scale, the fonts, and the reading cap | `reading column keeps the 760px cap` (F21-AC-010a) |
| F21-REQ-011 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-006 Animate the disclosure and honor reduced motion | `folder disclosure animates in 120ms` (F21-AC-011a) |
| F21-REQ-012 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-006 Animate the disclosure and honor reduced motion | `reduced motion disables smooth scroll` (F21-AC-012a) |
| F21-REQ-013 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-007 Draw the focus ring | `focused control has a 2px accent outline` (F21-AC-013a) |
| F21-REQ-014 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-008 Step the shell, the reading padding, and the phone dialogs | `390px uses the drawer shell` (F21-AC-014a) |
| F21-REQ-015 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-008 Step the shell, the reading padding, and the phone dialogs | `390px reading padding is 16px` (F21-AC-015a) |
| F21-REQ-016 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-008 Step the shell, the reading padding, and the phone dialogs | `phone settings and share use the 16px inset` (F21-AC-016a) |
| F21-REQ-017 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-009 Enlarge coarse-pointer controls | `coarse pointer controls are 44px tall` (F21-AC-017a) |
| F21-REQ-018 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-010 Present the four dialogs on a scrim, and keep shadows off the columns | `settings share search and help are dialogs` (F21-AC-018a) |
| F21-REQ-019 | F21 Design language | specs/features/F21-design-language/tasks.md — F21-T-010 Present the four dialogs on a scrim, and keep shadows off the columns | `menus may shadow and columns do not` (F21-AC-019a) |
| F22-REQ-001 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-001a |
| F22-REQ-002 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-002a; F22-AC-002b |
| F22-REQ-003 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-003a |
| F22-REQ-004 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-004a |
| F22-REQ-005 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-005a; F22-AC-005b |
| F22-REQ-006 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-006a |
| F22-REQ-007 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-007a |
| F22-REQ-008 | F22 Space home | specs/features/F22-space-home/tasks.md — 2. Choose redirect or the orientation screen | F22-AC-008a; F22-AC-008b |
| F22-REQ-009 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-009a |
| F22-REQ-010 | F22 Space home | specs/features/F22-space-home/tasks.md — 2. Choose redirect or the orientation screen | F22-AC-010a |
| F22-REQ-011 | F22 Space home | specs/features/F22-space-home/tasks.md — 3. Render the space file | F22-AC-011a |
| F22-REQ-012 | F22 Space home | specs/features/F22-space-home/tasks.md — 4. Fill the four regions | F22-AC-012a; F22-AC-012b; F22-AC-012c |
| F22-REQ-013 | F22 Space home | specs/features/F22-space-home/tasks.md — 4. Fill the four regions | F22-AC-013a; F22-AC-013b |
| F22-REQ-014 | F22 Space home | specs/features/F22-space-home/tasks.md — 4. Fill the four regions | F22-AC-014a; F22-AC-014b |
| F22-REQ-015 | F22 Space home | specs/features/F22-space-home/tasks.md — 4. Fill the four regions | F22-AC-015a |
| F22-REQ-016 | F22 Space home | specs/features/F22-space-home/tasks.md — 5. Seed a space that was not imported | F22-AC-016a; F22-AC-016b; F22-AC-016c |
| F22-REQ-017 | F22 Space home | specs/features/F22-space-home/tasks.md — 6. Teach the empty regions in one line | F22-AC-017a; F22-AC-017b |
| F22-REQ-018 | F22 Space home | specs/features/F22-space-home/tasks.md — 6. Teach the empty regions in one line | F22-AC-018a; F22-AC-018b |
| F22-REQ-019 | F22 Space home | specs/features/F22-space-home/tasks.md — 7. Open the home by role | F22-AC-019a; F22-AC-019b; F22-AC-019c |
| F22-REQ-020 | F22 Space home | specs/features/F22-space-home/tasks.md — 1. Keep the project cards and the editor empty pages | F22-AC-020a |
| X-REQ-001 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-001 — Serve the editor with no sign-in | `the deployed editor opens with no sign-in` (X-AC-001a) |
| X-REQ-002 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-002 — Keep the local routes off in a deploy | `files and mcp routes are 404 unless KB_LOCAL is 1` (X-AC-002a) |
| X-REQ-003 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-003 — Read secrets from the environment | `client bundle has no KB_DIR, KB_LOCAL, or key secret` (X-AC-003a) |
| X-REQ-004 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-004 — Sanitize rendered HTML | `rendered markdown drops a script and keeps details` (X-AC-004a) |
| X-REQ-005 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-005 — Initialize Mermaid at strict | `mermaid initializes at security level strict` (X-AC-005a) |
| X-REQ-006 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-006 — Refuse a remote chart URL | `an https chart url is not fetched` (X-AC-006a) |
| X-REQ-007 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-012 — Allow only listed chart sources | `a chart data source outside inline assets and metrics is refused` (X-AC-007a) |
| X-REQ-008 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-015 — Serve an uploaded asset from a signed URL | `an uploaded asset is served from a signed url` (X-AC-008a) |
| X-REQ-009 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-021 — Show a stored proposal within 2 seconds | `a stored proposal is in the inbox within 2 seconds` (X-AC-009a) |
| X-REQ-010 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-022 — Return search under 100 milliseconds | `search of 10000 documents returns in under 100 milliseconds` (X-AC-010a) |
| X-REQ-011 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-020 — Finish the agent-log flow within 10 seconds | `one sentence produces one proposal within 10 seconds` (X-AC-011a) |
| X-REQ-012 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-008 — Run the editor from the keyboard | `editor shortcuts run from the keyboard` (X-AC-012a) |
| X-REQ-012 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-023 — Complete Inbox, Timeline, and Metrics from the keyboard | `inbox timeline and metrics work from the keyboard alone` (X-AC-012b) |
| X-REQ-013 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-013 — Meet the contrast ratios | `both themes meet the WCAG 2.2 AA contrast ratios` (X-AC-013a) |
| X-REQ-014 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-014 — Order focus and trap a dialog | `focus walks files then page then outline and a dialog traps it` (X-AC-014a) |
| X-REQ-015 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-009 — Name the editor controls | `editor controls expose an accessible name` (X-AC-015a) |
| X-REQ-016 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-010 — Show the status line as a word | `the status line uses a word` (X-AC-016a) |
| X-REQ-017 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-011 — Announce Editing or Preview | `turning editing on sets the accessible state to Editing` (X-AC-017a) |
| X-REQ-018 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-007 — Keep drafts on the device | `a draft is restored from localStorage and is not posted` (X-AC-018a) |
| X-REQ-019 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-016 — Hide review data on a public read | `public read shows documents and hides proposals keys members and audit` (X-AC-019a) |
| X-REQ-020 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-017 — Show a key secret once | `an agent key secret is shown once and stored as a hash` (X-AC-020a) |
| X-REQ-021 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-018 — Write one audit event in the action's transaction | `merge reject role change and key changes write one audit event` (X-AC-021a) |
| X-REQ-022 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-019 — Record a validation attempt | `an invalid propose_change stores a validation attempt and no proposal` (X-AC-022a) |
| X-REQ-023 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-024 — Count experiments in the 720-hour window | `experiment documents in the 720 hour window are counted` (X-AC-023a) |
| X-REQ-024 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-025 — Compute the agent-proposal share | `the agent-proposal share of experiments is computed` (X-AC-024a) |
| X-REQ-025 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-026 — Compute the median review duration | `median review duration is reviewed_at minus created_at` (X-AC-025a) |
| X-REQ-026 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-027 — Compute validation failures after the guide | `invalid propose_change calls after get_context are under 10 percent at the target` (X-AC-026a) |
| X-REQ-027 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-028 — Count weekly external builders | `distinct non-owners who used a space in 168 hours are counted` (X-AC-027a) |
| X-REQ-028 | X Cross-cutting | specs/features/X-cross-cutting/tasks.md — X-T-029 — Keep the later deploy to one app | `the ledger store runs on vercel with postgres and a blob store` (X-AC-028a) |

## Requirements with no task

None. Every requirement above is named by at least one task step, and that step names at least one test. No task step lacks a requirement.

## PRD acceptance criteria

Eighteen criteria. The Test column uses the test the task file names. Where the criterion is split across features, each feature's test is listed.

| Criterion | Feature | Test |
| --- | --- | --- |
| AC-01. From Cursor, "log this experiment to Ledger" produces a valid proposal with no manual fixes, using only MCP tools. | F13 Agent access; X Cross-cutting | F13-AC-021a on F13-T17; F13-AC-002a on F13-T19; `one sentence produces one proposal within 10 seconds` (X-AC-011a) on X-T-020 |
| AC-02. An invalid proposal returns structured errors, and the agent's retry succeeds. | F06 Validation | F06-AC-001b on F06-T01; F06-AC-004a on F06-T02 |
| AC-03. The proposal appears in the Inbox within 2 seconds. | F12 Proposals and review; X Cross-cutting | F12-AC-050a on F12-T24; `a stored proposal is in the inbox within 2 seconds` (X-AC-009a) on X-T-021 |
| AC-04. Merging creates a revision, updates the document, and marks the proposal merged for get_proposal. | F12 Proposals and review; F13 Agent access | F12-AC-036a on F12-T17; F13-AC-023a on F13-T17 |
| AC-05. An agent key cannot merge, and a revoked key is refused immediately. | F13 Agent access; F12 Proposals and review | F13-AC-003a on F13-T05; F13-AC-009a on F13-T08; F12-AC-042a on F12-T19 |
| AC-06. get_context returns under 6k tokens for a space with 100 experiments. | F13 Agent access | F13-AC-014b on F13-T11 |
| AC-07. Claude and Muse connect by pasting the MCP URL, signing in, and approving scopes, with no key copied by hand. | F14 OAuth | F14-AC-025a on F14-T24; F14-AC-008a on F14-T08; F14-AC-011a on F14-T12 |
| AC-08. OAuth grants appear in Settings → Agents, and revoking one blocks its next call. | F14 OAuth | F14-AC-022a on F14-T22; F14-AC-021a on F14-T21 |
| AC-09. No OAuth scope or tool allows merging, editing directly, or deleting. | F13 Agent access; F14 OAuth; F15 Sign-in and roles | F13-AC-003a on F13-T05; F14-AC-010a on F14-T10; F15-AC-028a and F15-AC-028b on F15-T30; F15-AC-029a on F15-T31 |
| AC-10. Merging a concluded experiment adds its points to the chart without a reload. | F16 Metrics | F16-AC-001a on step 1; F16-AC-019a on step 10 |
| AC-11. Two harness versions on the same eval show as separate colored series with correct deltas. | F16 Metrics | F16-AC-008a on step 5; F16-AC-014a on step 6 |
| AC-12. Bumping an eval version splits the chart. | F16 Metrics | F16-AC-009b on step 5 |
| AC-13. Editing and saving an untouched document produces an empty diff. | F09 Editing | No task names a test for this criterion. |
| AC-14. Exporting and re-importing a space yields identical files. | F19 Import and export | F19-AC-014a on step 7 |
| AC-15. Every screen is usable with the keyboard alone. | X Cross-cutting; F20 Keyboard | `editor shortcuts run from the keyboard` (X-AC-012a) on X-T-008; `inbox timeline and metrics work from the keyboard alone` (X-AC-012b) on X-T-023; F20-AC-001a through F20-AC-014a on F20-T-001 through F20-T-006 |
| AC-16. Review of a typical experiment proposal takes under two minutes. | X Cross-cutting; F12 Proposals and review | `median review duration is reviewed_at minus created_at` (X-AC-025a) on X-T-026 |
| AC-17. A test document using every syntax in Markdown capabilities renders identically in view, editor preview, and review. | F04 Rendering | No task names a test for this criterion. |
| AC-18. A metrics-backed chart embedded in a finding updates after a new experiment merges. | F05 Charts | F05-AC-015b on step 9 |

Where a criterion is only partly named by a test:

- AC-01. F13-AC-021a stores a valid `propose_change`. F13-AC-002a lists the ten tools and no delete tool. X-AC-011a starts from the sentence "Log this run to Ledger" and expects one valid proposal. No task names a test whose words are "no manual fixes" or "log this experiment to Ledger".
- AC-02. F06-AC-001b returns the same `errors` array for an invalid proposal, and F06-AC-004a requires `code`, `message`, and `hint`. No task names a test in which the agent retries and that retry succeeds.
- AC-13. No step names an empty diff of an untouched save. F09-AC-020a checks that one frontmatter edit writes one YAML value. F06-AC-022a returns `no_change` when proposal bytes equal the head. Neither is this criterion.
- AC-16. F12's Limits table states a median under 2 minutes and says instrumentation of that median is out of scope, so F12 names no test. The measuring test is X-AC-025a.
- AC-17. F04-T-001 through F04-T-010 test each syntax on its own. F12-AC-030b renders a math span, a callout, and an embed in the review diff. No step names one document rendered the same in view, editor preview, and review.

## Success metrics

Each metric is a row under `<!-- prd:success-metrics -->`. The query is the function group in `lib/success/queries.ts` from the X design. The test is the one `tasks.md` names. The caller compares the returned number with the target. The query does not return pass or fail. A day in these windows is 24 hours, so 30 days are 720 hours and a week is 168 hours. "Under" is strict.

| Metric | Target after 30 days | Query | Test |
| --- | --- | --- | --- |
| New Memento experiments recorded in Ledger | 100% | Experiments recorded. Count of `documents` with `type` `experiment` in the space whose slug is `memento`, `created_at` inside the 720-hour window (X-REQ-023). The product returns the count. The denominator outside Ledger is open question X-Q-006. | `experiment documents in the 720 hour window are counted` (X-AC-023a) on X-T-024 |
| Experiments arriving via agent proposals | 80% or more | Agent-proposal share. Of that same set, the percentage whose creating proposal has `agent_key_id` or `oauth_grant_id` set. A human direct save stays in the denominator only (X-REQ-024). | `the agent-proposal share of experiments is computed` (X-AC-024a) on X-T-025 |
| Median time from proposal to merge or reject | Under 2 minutes of review time | Median review. Median of `reviewed_at` minus `created_at`, in minutes, for proposals whose status became `merged` or `rejected` in the window (X-REQ-025). | `median review duration is reviewed_at minus created_at` (X-AC-025a) on X-T-026 |
| Proposals failing validation after agents read the guide | Under 10% | Validation failures. Percentage of `validation_attempts` in the window with `had_get_context` true and `valid` false (X-REQ-026). Attempts with no earlier `get_context` are excluded. The attempt row is X-REQ-022, tested by X-AC-022a on X-T-019. | `invalid propose_change calls after get_context are under 10 percent at the target` (X-AC-026a) on X-T-027 |
| External builders using a space weekly (optional product signal) | 5 | External builders. Count of distinct people who are not an Owner and who opened a space or called a tool in a 168-hour window (X-REQ-027). | `distinct non-owners who used a space in 168 hours are counted` (X-AC-027a) on X-T-028 |

## Check

Every requirement has at least one task and one test. No task step lacks a requirement. AC-13 and AC-17 have no test that states them. AC-02 has no test for the retry. AC-01 and AC-16 are only partly named by the tests in the table above.
