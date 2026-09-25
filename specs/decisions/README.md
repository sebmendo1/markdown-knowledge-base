# Architecture decisions

Accepted records lock a newer instruction that is already live. Proposed records are recommended resolutions of an ambiguity. The product owner has not confirmed a Proposed record.

Questions only the owner can answer are in [open-questions.md](open-questions.md). The plan proceeds with the recommended answer in each row.

| ID | Title | Status | Decision |
| --- | --- | --- | --- |
| [ADR-0001](ADR-0001-name-and-routes.md) | Product name and routes | Accepted | The UI name is markdown-kb, and pages are at `/docs/…` with no space segment. |
| [ADR-0002](ADR-0002-sign-in-and-roles.md) | Sign-in and roles | Accepted | The first release has no auth. The four roles, and direct save for Owner and Editor, are the later target. |
| [ADR-0003](ADR-0003-storage.md) | Storage | Accepted | The first release reads `content/` at build time and stores drafts in `localStorage`. |
| [ADR-0004](ADR-0004-editor-model.md) | Editor model | Accepted | Preview is the default. Editing is source beside a preview, toggled by `⌘/` and Edit. Inline live preview is a later F09 option. |
| [ADR-0005](ADR-0005-reading-type.md) | Reading type | Accepted | Reading text is 17px, line height 1.7, and a 66-character measure. |
| [ADR-0006](ADR-0006-surfaces.md) | Surfaces | Accepted | Surfaces are solid fills, and the hairline borders between them are removed. |
| [ADR-0007](ADR-0007-radius.md) | Radius | Accepted | Radii are 12px controls, 10px outline rows, 18px blocks, 20px dialogs, 8px inline code, and 6px mark. |
| [ADR-0008](ADR-0008-right-panel.md) | Right panel | Accepted | The third column is a full-height outline only, and the title row and status line use the page color. |
| [ADR-0009](ADR-0009-modals.md) | Modals | Accepted | Settings, share, search, and shortcut help are dialogs. Editing and review flows are not. |
| [ADR-0010](ADR-0010-sharing.md) | Sharing | Accepted | "Anyone with the link" sets Can view or Can edit as the starting mode and grants no rights. |
| [ADR-0011](ADR-0011-phones.md) | Phones | Accepted | Phones stay readable, editing works, the split stacks at 900px, and coarse-pointer targets are at least 44px. |
| [ADR-0012](ADR-0012-slug-derivation.md) | Slug derivation | Proposed | A title becomes an ASCII slug of at most 80 characters, with `-2`, `-3`, … on collision. |
| [ADR-0013](ADR-0013-filename-patterns.md) | Filename patterns | Proposed | Patterns allow only `{date}` and `{slug}`, and editing `date` rewrites the path in that save. |
| [ADR-0014](ADR-0014-ledger-file-types.md) | Ledger file types | Proposed | Schema files use `type: schema`. `space.md` and `agents.md` are `type: doc` at fixed paths. |
| [ADR-0015](ADR-0015-schema-file-errors.md) | Schema file errors | Proposed | A broken schema file fails `schema_invalid`, does not load, and that type then fails `type_unknown`. |
| [ADR-0016](ADR-0016-required-when.md) | required_when grammar | Proposed | `required_when` is equality on exactly one other field. Any other shape fails schema load. |
| [ADR-0017](ADR-0017-pinned-version.md) | Pinned version target | Proposed | `[[slug@7]]` returns the earliest revision with version 7, and later saves do not move the pin. |
| [ADR-0018](ADR-0018-rename.md) | Rename and existing links | Proposed | Only a human renames. Other files are not rewritten, and links to the old slug are `link_broken`. |
| [ADR-0019](ADR-0019-archived-links.md) | Links to archived documents | Proposed | A link to an archived document still resolves. `link_broken` is only a missing slug. |
| [ADR-0020](ADR-0020-embed-depth.md) | Embed depth and cycles | Proposed | Three transclusions render. A fourth level or a cycle shows a link and a fixed sentence, plus `embed_broken`. |
| [ADR-0021](ADR-0021-proposal-edits.md) | Proposal edit matches | Proposed | Each `find` must match exactly once, in order, or the submission is rejected and no proposal is created. |
| [ADR-0022](ADR-0022-frontmatter-merge.md) | Three-way merge of frontmatter | Proposed | Merge the whole file as lines. Do not reorder YAML keys or merge list items as a set. |
| [ADR-0023](ADR-0023-block-alignment.md) | Diff block alignment | Proposed | Pair same-type blocks in order when word-set Jaccard is at least 0.5. |
| [ADR-0024](ADR-0024-keymap-scopes.md) | Keymap scopes | Proposed | `C` and `E` depend on scope: dialog, editor, review, document, then global. |
| [ADR-0025](ADR-0025-oauth-rate-limits.md) | OAuth grant rate limits | Proposed | Each OAuth grant has the same 60/min, 30 proposals/hour, and 20 open-proposal limits as one API key. |
| [ADR-0026](ADR-0026-baseline-value.md) | Baseline value | Proposed | The baseline is the mean of concluded experiments on that harness, and deltas and arrows use that mean. |
| [ADR-0027](ADR-0027-repeated-experiments.md) | Repeated experiments on a chart | Proposed | Each concluded experiment is its own point, ordered by date then slug. |
| [ADR-0028](ADR-0028-context-token-budget.md) | get_context token budget | Proposed | A token is 4 UTF-8 bytes. The pack is at most 6000 tokens, and the lowest-priority blocks drop first. |
| [ADR-0029](ADR-0029-search-score.md) | Search score | Proposed | Title matches rank first, then recency, then slug. `score` is 1 or 0. |
| [ADR-0030](ADR-0030-history-restore.md) | History restore | Proposed | Restore appends a new revision with message `Restore`, checked against the schemas loaded now. |
| [ADR-0031](ADR-0031-task-ticks.md) | Task ticks in view mode | Proposed | A direct save toggles one checkbox and writes a revision with message `Tick task`. |
| [ADR-0032](ADR-0032-import-batch.md) | Import batch outcome | Proposed | Each file is all or nothing. A mixed batch saves the valid files and does not roll them back. |
| [ADR-0033](ADR-0033-export-identity.md) | Export and re-import identity | Proposed | Identical means the same UTF-8 bytes, including line endings and YAML key order. |
| [ADR-0034](ADR-0034-accessibility.md) | Accessibility | Proposed | The bar is WCAG 2.2 Level AA, with a fixed focus order and a named Editing or Preview state. |

## Gaps with no ADR

These section 2.3 gaps do not change behavior, so they have no record.

- Delta versus baseline, and the property-header arrows, use the baseline value. [ADR-0026](ADR-0026-baseline-value.md) sets that value.
- "Never hard-deleted" already has a rule: archive, do not delete. A legal-deletion path would be new scope.
- The performance numbers are already set (Inbox within 2 seconds, search under 100 ms, an agent flow under 10 seconds). Missing percentiles and a test environment do not change those limits.
- Success metrics need measurement queries. Defining a query does not change product behavior.
- Empty screens already teach in one line with one action, and loading states are already skeletons of the layout. That behavior is not limited to the Inbox.
