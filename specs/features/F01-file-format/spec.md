# F01: File format

## Summary

The file format is the contract for a space in markdown-kb: one UTF-8 Markdown file per document, YAML frontmatter, a slug, and a path taken from the type's folder and filename pattern. Import, export, and later agent tools all speak this folder. Storage of revisions is a separate spec.

## Status and scope

Partly built. The product already stores Markdown files and splits a leading `---` YAML map (`lib/markdown/frontmatter.ts`). The shipped slug helper matches the character rules and the `untitled` fallback, and it caps a slug at 64 characters. This spec's cap is 80 characters. The shipped tree under `content/` is `docs/*.md` and `ledger/space.md`, which is not the target layout below. Archive, type folders, and `.ledger/` are not enforced in the product yet.

This spec covers the folder, the frontmatter block, slugs, filename patterns, wiki-link strings, `assets/`, and the two fixed `.ledger` documents. It covers the page URL. It does not cover the database, the editor, or the validator's rule engine (F06). Postgres revisions remain the later storage target (F07). What shipped is files plus a draft in browser localStorage.

The product name in the UI is markdown-kb. A page is `/{project}/{page-path}`. `{page-path}` is the file path without the `.md` suffix. The URL has no space segment. ADR-0001's `/docs/…` wording is the older route. This spec uses the live route.

Sign-in is not built. The four roles are the later target.

ADR-0012, ADR-0013, and ADR-0014 are Proposed. This spec follows them.

## Users and stories

- **F01-US-001** As the owner, I want each document to be one Markdown file with frontmatter, so that a copy of the folder is the whole space.
- **F01-US-002** As an agent, I want a stable slug and a filename pattern, so that a link does not depend on a title I might rephrase.
- **F01-US-003** As the owner, I want space settings and agent instructions to be documents, so that they are edited and kept like any other file.

## Requirements

- **F01-REQ-001** The system shall store each document as one UTF-8 file, without a byte-order mark, whose path ends in `.md`.
- **F01-REQ-002** The system shall require a document to open with a frontmatter block: `---` at byte 0, a line break, a YAML map, a line break, and a closing `---`.
- **F01-REQ-003** The system shall require every document's frontmatter to include `type` and `title`. `title` is a string of 1 to 120 characters.
- **F01-REQ-004** When a title is turned into a slug, the system shall trim it, normalize NFKD, remove characters in Unicode category Mark, lowercase `A`–`Z`, replace every other character outside `a`–`z` and `0`–`9` with `-`, collapse runs of `-`, and strip a leading or trailing `-`. An empty result is `untitled`. The slug is then cut to 80 characters with a trailing `-` removed.
- **F01-REQ-005** The system shall keep each slug unique among documents in the space, including archived documents. The slug matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is 1 to 80 characters. When the base is taken, the system shall append `-2`, then `-3`, and so on, using the smallest integer `n` from 2 to 10000 whose candidate is free. The candidate is the base, a `-`, and the decimal `n`. When that string is longer than 80 characters, the system shall drop characters from the end of the base, then drop a trailing `-`, and shall use `untitled` if the base becomes empty. A character is one Unicode code point.
- **F01-REQ-006** When a document is created, the system shall set its path to `{folder}/{filename}.md`, with `{date}` and `{slug}` replaced. `{date}` is the `date` field as `YYYY-MM-DD`. `{slug}` is the document slug.
- **F01-REQ-007** When `date` changes on a document whose filename pattern contains `{date}`, the system shall write the file at the recomputed path in that same save, shall keep the slug, and shall leave no file at the previous path.
- **F01-REQ-008** If a recomputed path is already another document's path, the system shall reject the save, shall keep the current path, and shall write no new revision.
- **F01-REQ-009** The system shall accept only the placeholders `{date}` and `{slug}` in a filename pattern, written in that spelling.
- **F01-REQ-010** While the document type is `doc`, the system shall allow zero or more extra folder segments between `docs/` and the filename. Each extra segment matches the slug pattern.
- **F01-REQ-011** The system shall treat each file at `.ledger/types/<name>.md` as a type schema file, with frontmatter `type: schema`, and shall not treat it as one of the six document types.
- **F01-REQ-012** The system shall treat `.ledger/space.md` and `.ledger/agents.md` as documents with `type: doc` and a non-empty `title`, at those exact paths.
- **F01-REQ-013** The system shall treat a file under `assets/` as an asset. An asset is not a document and is not a page.
- **F01-REQ-014** The system shall accept a wiki-link string of the form `[[slug]]`, `[[slug@N]]`, `[[slug#Heading]]`, or `[[slug@N#Heading]]`. `N` is an integer from 1 to 999999999. `Heading` is 1 to 200 characters and contains no `]` and no line break. Superseded by F01-REQ-021 (ADR-0035).
- **F01-REQ-015** The system shall serve a document at `/{project}/{page-path}`, with each path segment percent-encoded, and shall not put a space slug in the URL.
- **F01-REQ-016** While sign-in is not built, the system shall accept a create, an update, and a rename from the person at the keyboard, and shall not check a role.
- **F01-REQ-017** When sign-in is built, the system shall allow a direct file write and a rename only for the Owner and Editor roles.
- **F01-REQ-018** When a human renames a document, the system shall change that document's slug and path only, in one save, and shall leave every other file unchanged. Superseded by F01-REQ-022 (ADR-0035).
- **F01-REQ-019** The system shall accept LF (`\n`) and CRLF (`\r\n`) as the line break in the frontmatter delimiters.
- **F01-REQ-020** The system shall recover a document's slug from its path by reversing the type's filename pattern. When the pattern has no `{slug}`, the filename without `.md` is the slug.
- **F01-REQ-021** The system shall accept a wiki-link string of the form `[[target]]`, followed inside the brackets by an optional `@N`, an optional `#Heading`, and an optional `|label`, in that order. `target` is a page path or a file name, resolved by F03-REQ-001; a slug is a file name. `N` is an integer from 1 to 999999999. `Heading` and `label` are 1 to 200 characters and contain no `]`, no `|`, and no line break.
- **F01-REQ-022** When a human renames or moves a document, the system shall change that document's path, and slug where the slug changes, and shall rewrite every wiki target that resolved to the old path so it resolves to the new path, keeping `#Heading` and `|label`, all in one save.

## Acceptance scenarios

### F01-AC-001a

Given a document whose bytes are UTF-8 and whose path is `findings/summaries-degrade-long-context.md`, when the space is read, then that file is one document and it has no byte-order mark.

### F01-AC-002a

Given a file that starts with `---\n` and a YAML map and closes with `\n---\n`, when the file is parsed, then the map is the frontmatter and the bytes after the closing delimiter are the body.

### F01-AC-002b

Given a file that starts with `# Title` and has no `---` block, when the file is validated, then the code is `yaml_invalid`.

### F01-AC-003a

Given frontmatter with `type: doc` and `title: Notes`, when the file is validated, then `type` and `title` are accepted.

### F01-AC-003b

Given a title of 121 characters, when the file is validated, then the code is `field_kind` on `title`.

### F01-AC-004a

Given the title `Context window 8k vs 4k`, when a slug is derived, then the slug is `context-window-8k-vs-4k`.

### F01-AC-004b

Given the title `Café`, when a slug is derived, then the slug is `cafe`.

### F01-AC-004c

Given the title `  Hello!! `, when a slug is derived, then the slug is `hello`.

### F01-AC-004d

Given the title `---`, when a slug is derived, then the slug is `untitled`.

### F01-AC-004e

Given a title whose base is longer than 80 characters, when a slug is derived, then the slug is 80 characters and does not end with `-`.

### F01-AC-005a

Given a document already slugged `hello`, including one that is archived, when a second document titled `Hello` is created, then its slug is `hello-2`.

### F01-AC-005b

Given every suffix from `-2` through `-10000` is taken, when another document needs that base, then the code is `slug_taken` and no file is written.

### F01-AC-005c

Given a taken slug of 80 characters `a`, when the next document needs that base, then the slug is 78 characters `a` followed by `-2`.

### F01-AC-006a

Given an experiment type with folder `experiments` and filename `{date}-{slug}`, title `Context window 8k vs 4k`, and date `2026-09-22`, when the document is created, then the path is `experiments/2026-09-22-context-window-8k-vs-4k.md`.

### F01-AC-007a

Given that experiment file, when `date` changes to `2026-09-23` and the save succeeds, then the file is at `experiments/2026-09-23-context-window-8k-vs-4k.md`, the slug is unchanged, and the old path has no file.

### F01-AC-008a

Given another document already at the recomputed path, when `date` changes, then the code is `path_invalid`, the original path remains, and no revision is written.

### F01-AC-009a

Given a schema filename `{date}-{title}`, when the schema file is loaded, then the code is `schema_invalid` and the type does not load.

### F01-AC-010a

Given type `doc` and slug `recording-pipeline`, when the file is stored at `docs/notes/recording-pipeline.md`, then the path is valid.

### F01-AC-010b

Given type `experiment`, when the file is stored at `experiments/extra/2026-09-22-context-window.md`, then the code is `path_invalid`.

### F01-AC-011a

Given `.ledger/types/experiment.md` with `type: schema`, when the space is loaded, then the file is a type schema and `type_unknown` is not reported for it.

### F01-AC-012a

Given `.ledger/space.md` with `type: doc` and `title: Memento`, when the file is validated, then `path_invalid` is not reported for the `.ledger/` path.

### F01-AC-012b

Given `.ledger/agents.md` with `type: harness`, when the file is validated, then the code is `field_kind`, the message is `type must be doc.`, and the hint is `Use type: doc for space.md and agents.md.`

### F01-AC-013a

Given `assets/2026-09-22-latency-trace.png`, when the space is listed, then the file is an asset and it has no document slug.

### F01-AC-014a

Given the strings `[[summary-faithfulness@2]]` and `[[slug#Heading]]`, when they appear as frontmatter link values, then both match the wiki-link grammar.

### F01-AC-015a

Given project `guide` and file `docs/writing.md`, when the page is opened, then the URL path is `/guide/docs/writing`.

### F01-AC-016a

Given sign-in is not built, when the person at the keyboard saves a Markdown file in the project, then the file is written and no role is checked.

### F01-AC-017a

Given sign-in is built and the caller is a Viewer, when they save, then the file is unchanged and the code is `permission_denied`.

### F01-AC-017b

Given sign-in is built and the caller is an Owner, when they save a valid document, then the file is written.

### F01-AC-017c

Given sign-in is built and the caller is a Contributor, when they save, then the file is unchanged, the code is `permission_denied`, and the message is `Contributors propose changes. They do not save directly.`

### F01-AC-017d

Given sign-in is built and the caller is an agent key, when they save, then the file is unchanged, the code is `permission_denied`, and the hint is `Call propose_change. Agents cannot merge, delete, or administer.`

### F01-AC-018a

Given a human Owner renames slug `hello` to `hello-notes`, when the save succeeds, then that document's path uses `hello-notes` and every other file is byte-identical.

### F01-AC-019a

Given frontmatter delimited with CRLF, when the file is parsed, then the YAML map is read the same way as with LF.

### F01-AC-020a

Given path `experiments/2026-09-22-context-window-8k-vs-4k.md` and pattern `{date}-{slug}`, when the slug is recovered, then the slug is `context-window-8k-vs-4k`.

### F01-AC-021a

Given the strings `[[summary-faithfulness@2]]`, `[[docs/writing#Links|how links work]]`, and `[[slug@N#Heading|label]]` with `N` of 3, when they are parsed, then all three match the wiki-link grammar, and `[[a|b|c]]` does not.

### F01-AC-022a

Given page `notes/hello.md` and page `index.md` containing `[[notes/hello#Intro|hi]]`, when a human renames `notes/hello.md` to `notes/hello-notes.md`, then the file is at the new path and `index.md` contains `[[notes/hello-notes#Intro|hi]]`.

## Edge cases and errors

Format failures use the F06 codes. The message and hint are the templates in `specs/contracts/errors.md`.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| No frontmatter block | `yaml_invalid` | `Frontmatter is missing or is not a YAML map.` | `Start the file with ---, then a YAML map that includes type and title, then a closing ---.` |
| Title longer than 120 characters | `field_kind` | `title must be at most 120 characters.` | `Shorten title to 120 characters or fewer.` |
| Slug already used | `slug_taken` | `Slug "{slug}" is already used.` | `Use a free slug. The next suffix is -{n}.` |
| Path does not match the pattern | `path_invalid` | `Path does not match {folder}/{pattern}.` | `Save the file at {expected}.` |
| New path already taken | `path_invalid` | `Path "{path}" is already used.` | `Keep the current path, or pick a date and slug that are free.` |
| `space.md` type is not `doc` | `field_kind` | `type must be doc.` | `Use type: doc for space.md and agents.md.` |
| Unknown filename placeholder | `schema_invalid` | `filename may only use the placeholders {date} and {slug}.` | `Remove any other {token} from filename.` |

`permission_denied` is an access refusal. It is not a validation code and it is not listed in `errors.md`. The file stays unchanged.

| Caller, once sign-in exists | Message | Hint |
| --- | --- | --- |
| Contributor | `Contributors propose changes. They do not save directly.` | `Submit a proposal instead of saving.` |
| Viewer | `You do not have permission to change this document.` | `Ask an owner for a role that can edit.` |
| Agent key or OAuth grant | `Agents propose changes. They do not save directly.` | `Call propose_change. Agents cannot merge, delete, or administer.` |

While sign-in is absent, `permission_denied` is not returned.

A link to the slug from before a rename does not resolve. The next validation of the linking document reports `link_broken`. The old slug may be used again. Agents cannot rename. `propose_change` accepts `create` and `update`.

## Limits and budgets

| Limit | Value |
| --- | --- |
| Slug length | 1 to 80 characters. A character is one Unicode code point |
| Title length | 1 to 120 characters |
| Collision suffix | Integers 2 through 10000 |
| Version in a wiki link | Integers 1 through 999999999 |
| Heading inside a wiki link | 1 to 200 characters |
| Document size | 204800 bytes (200 KB), enforced by F06 `too_large` |
| Line breaks in frontmatter delimiters | LF or CRLF |

No latency budget is set for reading the folder. The open question below holds a recommended figure.

## UI states

This feature has no screen. The page URL is the address of a document. Failures appear in the F06 report, inline beside the field or the line, on the save and review surfaces (F09, F12). The copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower.

| State | Copy |
| --- | --- |
| Empty | `Nothing to check.` |
| Loading | `Checking…` |
| Error | `Fix these errors before saving.` followed by each issue's message and hint |
| Partial | `Valid, with warnings.` followed by each warning's message and hint |
| Success | `Valid.` |

There is no illustration and no dialog for these states.

## Out of scope

- The editor, drafts in `localStorage`, and source versus viewing (F09).
- Postgres revisions, the document row, and `archived_at` (F07). The format still counts archived documents when it checks slug uniqueness.
- Which revision a pinned link returns, and how a link renders (F03).
- Running the rule catalog (F06). This spec defines the bytes those rules look at.
- Seeding the first space (F22).
- Import of a file that has no frontmatter as `type: doc` (F19).

## Open questions

The rules below are the ones this spec uses. The product owner has not confirmed them. ADR-0012, ADR-0013, and ADR-0014 already cover slug derivation, placeholders, and the `.ledger` files, so those are not repeated here.

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F01-Q-001 | Is 120 characters the title max on every type, or only on experiment? | 120 characters on every document title, including custom types that omit `title` from `fields`. | Product owner | F01-REQ-003, the frontmatter JSON Schemas |
| F01-Q-002 | Do `space.md` and `agents.md` grow frontmatter fields for the default harness and eval? | No. `type` and `title` only. The name, the purpose, and the defaults stay in the body. | Product owner | F01-REQ-012 |
| F01-Q-003 | What is the read budget for one space folder? | Opening a folder of 10000 documents of 204800 bytes each finishes in under 2 seconds at the 95th percentile on one Node.js 22 process, disk on the same machine, no network. | Product owner | A later performance test. Not a requirement until the owner confirms it |

## Trace

- PRD anchors in the rebuilt source (`cursor/rebuild-prd-tables-f4c0`, `specs/source/ledger-prd.md`): `<!-- prd:product-principles -->` (line 8), `<!-- prd:core-concepts -->` (lines 60–70), `<!-- prd:markdown-format -->` through `<!-- prd:space-and-agents -->` (lines 100–249), `<!-- prd:links -->` (lines 240–246), `<!-- prd:limits -->` (lines 570–573).
- Decisions in `specs/source/decisions-and-changes.md`: D2, D3, D5, D6, D7, D8.
- Change requests: none of C1–C9 change this format. C2 and C8 change the editor, which this spec leaves alone.
- ADRs: ADR-0001 (name markdown-kb; the `/docs/…` route is overridden by the live `/{project}/{page-path}` pages), ADR-0002, ADR-0003, ADR-0012, ADR-0013, ADR-0014, ADR-0018 (superseded by ADR-0035), ADR-0035.
- Contracts: `specs/contracts/frontmatter/`, `specs/contracts/type-schema.schema.json`, `specs/contracts/errors.md`.
- Shipped code this spec does not treat as the target layout: `lib/markdown/frontmatter.ts`, `lib/workspace/paths.ts`, `app/[project]/[...slug]/page.tsx`, `content/`.
