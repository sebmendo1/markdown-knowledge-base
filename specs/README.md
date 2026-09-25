# Specs

This folder is the spec-driven development source for markdown-kb. Behavior is specified here before the code changes. A requirement ID is stable and is never reused. The forms are `F12-REQ-014`, `F12-AC-014a`, and `ADR-0007`. Each `spec.md` uses the sections in `specs/PLAN.md` section 5. Requirements are EARS. Each requirement has at least one Given, When, Then scenario.

The principles and the nouns live in `specs/constitution.md` and `specs/glossary.md`. Those two files are on `origin/cursor/foundations-specs-839b`. They are not in this branch. Architecture decisions live in `specs/decisions/`. That directory is on `origin/cursor/record-architecture-decisions-4859`. It is not in this branch. The rebuilt PRD tables are on `origin/cursor/rebuild-prd-tables-f4c0`, in `specs/source/ledger-prd.md`. This branch still has the earlier source file at that path.

## This branch

This branch contains:

- `specs/README.md` (this index)
- `specs/PLAN.md`
- `specs/source/ledger-prd.md`
- `specs/source/decisions-and-changes.md`
- `specs/features/X-cross-cutting/spec.md`
- `specs/features/X-cross-cutting/design.md`
- `specs/features/X-cross-cutting/tasks.md`

No other `spec.md` is in this branch. `design.md` and `tasks.md` now exist for every feature, including X. On this branch, that pair is present only for X. The pairs for F01 through F22 exist on their own branches, not in this one:

- F01, F02, and F06 on `origin/cursor/design-tasks-format-types-validation-279e`
- F07 on `origin/cursor/storage-design-tasks-5c9d`
- F03, F04, F08, F09, F10, F11, F17, F20, and F21 on `origin/cursor/design-tasks-editor-shell-bbc1`
- F05, F16, F18, F19, and F22 on `origin/cursor/design-charts-metrics-history-import-home-4ba1`
- F12, F13, F14, and F15 on `origin/cursor/design-review-agents-auth-9270`

## Feature index

Status is against the product today: the markdown editor on Vercel, with no sign-in. Paths are the spec location. A path other than X is not a file in this branch.

| ID | Feature | Status | Spec |
| --- | --- | --- | --- |
| F01 | File format: folder layout, frontmatter, slugs, filename patterns, `.ledger/` | Partly built | `specs/features/F01-file-format/spec.md` |
| F02 | Type schemas, field kinds, the six built-in types | Not started | `specs/features/F02-type-schemas/spec.md` |
| F03 | Links, versioned links, backlinks, embeds | Partly built | `specs/features/F03-links/spec.md` |
| F04 | Rendering and Markdown capabilities | Partly built | `specs/features/F04-rendering/spec.md` |
| F05 | Charts: Vega-Lite, inline and CSV data, metrics data, export | Partly built | `specs/features/F05-charts/spec.md` |
| F06 | Validation engine and rule catalog | Not started | `specs/features/F06-validation/spec.md` |
| F07 | Storage: documents, revisions, drafts, invariants | Not started | `specs/features/F07-storage/spec.md` |
| F08 | Reading shell: three columns, file sidebar, outline, document view, readability | Built | `specs/features/F08-reading-shell/spec.md` |
| F09 | Editing: on and off, source editor, frontmatter form, slash menu, saving, conflicts | Partly built | `specs/features/F09-editing/spec.md` |
| F10 | Settings and theme | Built | `specs/features/F10-settings/spec.md` |
| F11 | Sharing and access: page link, invites, public space link | Partly built | `specs/features/F11-sharing/spec.md` |
| F12 | Proposals and review: Inbox, diff engine, merge, conflicts | Not started | `specs/features/F12-proposals/spec.md` |
| F13 | Agent access: MCP server, ten tools, REST, keys, limits, errors | Not started | `specs/features/F13-agent-access/spec.md` |
| F14 | OAuth 2.1 for assistants | Not started | `specs/features/F14-oauth/spec.md` |
| F15 | Human sign-in, roles, permissions, audit | Not started | `specs/features/F15-auth/spec.md` |
| F16 | Metrics: points on merge, Metrics screen, comparison | Not started | `specs/features/F16-metrics/spec.md` |
| F17 | Search and command palette | Partly built | `specs/features/F17-search/spec.md` |
| F18 | History and Timeline | Not started | `specs/features/F18-history/spec.md` |
| F19 | Import, export, backup | Not started | `specs/features/F19-import-export/spec.md` |
| F20 | Keyboard and interaction rules | Partly built | `specs/features/F20-keyboard/spec.md` |
| F21 | Design language and tokens | Built | `specs/features/F21-design-language/spec.md` |
| F22 | Space home, seeding Memento, empty states, onboarding | Not started | `specs/features/F22-space-home/spec.md` |
| X | Cross-cutting: performance, accessibility, security, privacy, observability, success-metric instrumentation, deployment | Partly built | `specs/features/X-cross-cutting/spec.md` |

F04's own spec describes rendering as mostly built. This index uses partly built, because emoji shortcodes, task ticks that save a revision, and several other Markdown capabilities are not started.

`design.md` and `tasks.md` sit next to `spec.md` in that feature's folder. They now exist for every feature, including X. On this branch, that pair is present only for X. The pairs for F01 through F22 are on the branches named above, not in this one.
