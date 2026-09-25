# F01 tasks: file format

Steps are in dependency order. Size is the parts the step touches: one module, or several modules. These steps do not change a contract. Each test title is the acceptance-scenario id. Add `lib/format/*.test.ts` and `lib/issues/*.test.ts` to the `test` script in `package.json` in F01-T01.

The validator injected into `lib/format/save.ts` returns `{ valid: true, errors: [], warnings: [] }` unless the step says otherwise.

## F01-T01. UTF-8 documents without a BOM

- **Size:** several modules
- **Depends on:** none
- **Requirements:** F01-REQ-001
- **Test:** `lib/format/encoding.test.ts` › `F01-AC-001a`

Add `lib/issues/types.ts` and `lib/format/encoding.ts`. A file whose bytes are UTF-8 and whose path is `findings/summaries-degrade-long-context.md` is one document and has no byte-order mark. Bytes that start with EF BB BF fail `yaml_invalid` because `---` is not at byte 0.

## F01-T02. Frontmatter block

- **Size:** one module
- **Depends on:** F01-T01
- **Requirements:** F01-REQ-002
- **Tests:** `lib/markdown/frontmatter.test.ts` › `F01-AC-002a`, `F01-AC-002b`

A file that starts with `---\n`, a YAML map, and `\n---\n` yields that map and the bytes after the closing line. A file that starts with `# Title` yields `yaml_invalid` and the missing-block message and hint from [errors.md](../../contracts/errors.md).

## F01-T03. CRLF delimiters

- **Size:** one module
- **Depends on:** F01-T02
- **Requirements:** F01-REQ-019
- **Test:** `lib/markdown/frontmatter.test.ts` › `F01-AC-019a`

The same YAML map is read when the delimiters use CRLF.

## F01-T04. `type` and `title`

- **Size:** one module
- **Depends on:** F01-T02
- **Requirements:** F01-REQ-003
- **Tests:** `lib/format/document.test.ts` › `F01-AC-003a`, `F01-AC-003b`

`lib/format/document.ts` accepts `type: doc` and `title: Notes`. A title of 121 code points is `field_kind` on `title` with message `title must be at most 120 characters.`

## F01-T05. Slug from a title

- **Size:** one module
- **Depends on:** none
- **Requirements:** F01-REQ-004
- **Tests:** `lib/format/slug.test.ts` › `F01-AC-004a`, `F01-AC-004b`, `F01-AC-004c`, `F01-AC-004d`, `F01-AC-004e`

`slugFromTitle` in `lib/format/slug.ts` maps `Context window 8k vs 4k` to `context-window-8k-vs-4k`, `Café` to `cafe`, `  Hello!! ` to `hello`, and `---` to `untitled`. A base longer than 80 code points is cut to 80 and does not end with `-`. Leave `slugify` in `lib/workspace/paths.ts` at 64 characters.

## F01-T06. Unique slugs

- **Size:** one module
- **Depends on:** F01-T05
- **Requirements:** F01-REQ-005
- **Tests:** `lib/format/slug.test.ts` › `F01-AC-005a`, `F01-AC-005b`, `F01-AC-005c`

`allocateSlug` gives `hello-2` when `hello` is taken, including by an archived document. When `-2` through `-10000` are taken, the code is `slug_taken` and no file is written. A taken slug of 80 `a` characters yields 78 `a` characters followed by `-2`.

## F01-T07. Filename placeholders

- **Size:** one module
- **Depends on:** none
- **Requirements:** F01-REQ-009
- **Test:** `lib/format/filename.test.ts` › `F01-AC-009a`

`lib/format/filename.ts` rejects `{date}-{title}` with `schema_invalid` and the filename message and hint. The type does not load.

## F01-T08. Path on create

- **Size:** one module
- **Depends on:** F01-T05, F01-T07
- **Requirements:** F01-REQ-006
- **Test:** `lib/format/filename.test.ts` › `F01-AC-006a`

Folder `experiments`, pattern `{date}-{slug}`, title `Context window 8k vs 4k`, and date `2026-09-22` produce `experiments/2026-09-22-context-window-8k-vs-4k.md`.

## F01-T09. Extra `doc` segments

- **Size:** one module
- **Depends on:** F01-T08
- **Requirements:** F01-REQ-010
- **Tests:** `lib/format/filename.test.ts` › `F01-AC-010a`, `F01-AC-010b`

`docs/notes/recording-pipeline.md` is valid for type `doc`. `experiments/extra/2026-09-22-context-window.md` is `path_invalid`.

## F01-T10. Date change moves the file

- **Size:** several modules
- **Depends on:** F01-T08
- **Requirements:** F01-REQ-007
- **Test:** `lib/format/save.test.ts` › `F01-AC-007a`

`commitDocument` writes `experiments/2026-09-23-context-window-8k-vs-4k.md`, keeps the slug, and leaves the old path empty.

## F01-T11. Occupied path rejects the save

- **Size:** one module
- **Depends on:** F01-T10
- **Requirements:** F01-REQ-008
- **Test:** `lib/format/save.test.ts` › `F01-AC-008a`

When the recomputed path is taken, the code is `path_invalid`, the original path remains, and the revision callback is not called.

## F01-T12. Recover a slug from a path

- **Size:** several modules
- **Depends on:** F01-T07
- **Requirements:** F01-REQ-020
- **Test:** `lib/format/slug.test.ts` › `F01-AC-020a`

Path `experiments/2026-09-22-context-window-8k-vs-4k.md` and pattern `{date}-{slug}` recover `context-window-8k-vs-4k`.

## F01-T13. Type schema files

- **Size:** one module
- **Depends on:** none
- **Requirements:** F01-REQ-011
- **Test:** `lib/format/classify.test.ts` › `F01-AC-011a`

`.ledger/types/experiment.md` with `type: schema` is a type schema. Classification does not attach `type_unknown`.

## F01-T14. `space.md` and `agents.md`

- **Size:** one module
- **Depends on:** F01-T04, F01-T13
- **Requirements:** F01-REQ-012
- **Tests:** `lib/format/classify.test.ts` › `F01-AC-012a`, `F01-AC-012b`

`.ledger/space.md` with `type: doc` and `title: Memento` does not report `path_invalid`. `.ledger/agents.md` with `type: harness` is `field_kind`, message `type must be doc.`, hint `Use type: doc for space.md and agents.md.`

## F01-T15. Assets

- **Size:** one module
- **Depends on:** F01-T13
- **Requirements:** F01-REQ-013
- **Test:** `lib/format/classify.test.ts` › `F01-AC-013a`

`assets/2026-09-22-latency-trace.png` is an asset and has no document slug.

## F01-T16. Wiki-link strings

- **Size:** one module
- **Depends on:** none
- **Requirements:** F01-REQ-014, F01-REQ-021
- **Tests:** `lib/format/wiki-link.test.ts` › `F01-AC-014a`, `F01-AC-021a`

`[[summary-faithfulness@2]]` and `[[slug#Heading]]` match. The parser also accepts a path target and `|label`, as in `[[docs/writing#Links|how links work]]`, with `N` from 1 to 999999999. Target resolution reuses `resolveDoc` in `lib/markdown/links.ts` (ADR-0035).

## F01-T17. Page URL

- **Size:** one module
- **Depends on:** none
- **Requirements:** F01-REQ-015
- **Test:** `lib/workspace/paths.test.ts` › `F01-AC-015a`

Project `guide` and file `docs/writing.md` produce `/guide/docs/writing` through `hrefOf`. The path has no space segment.

## F01-T18. Keyboard writes

- **Size:** several modules
- **Depends on:** F01-T02
- **Requirements:** F01-REQ-016
- **Test:** `lib/format/save.test.ts` › `F01-AC-016a`

With `{ signIn: false }`, `commitDocument` writes the file. The access function has no role argument to consult, and the result code is not `permission_denied`.

## F01-T19. Roles after sign-in

- **Size:** one module
- **Depends on:** F01-T18
- **Requirements:** F01-REQ-017
- **Tests:** `lib/format/access.test.ts` › `F01-AC-017a`, `F01-AC-017b`, `F01-AC-017c`, `F01-AC-017d`

A Viewer leaves the file unchanged and receives `permission_denied`. An Owner writes a valid document. A Contributor receives message `Contributors propose changes. They do not save directly.` An agent key receives hint `Call propose_change. Agents cannot merge, delete, or administer.`

## F01-T20. Human rename

- **Size:** several modules
- **Depends on:** F01-T06, F01-T08, F01-T19
- **Requirements:** F01-REQ-018, F01-REQ-022
- **Tests:** `lib/format/save.test.ts` › `F01-AC-018a`, `F01-AC-022a`

F01-REQ-018 is superseded (ADR-0035). A rename from `notes/hello.md` to `notes/hello-notes.md` moves the file and rewrites `[[notes/hello#Intro|hi]]` to `[[notes/hello-notes#Intro|hi]]` in the same save. The rewrite reuses `lib/workspace/relink.ts`.

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F01-REQ-001 | F01-T01 | F01-AC-001a |
| F01-REQ-002 | F01-T02 | F01-AC-002a, F01-AC-002b |
| F01-REQ-003 | F01-T04 | F01-AC-003a, F01-AC-003b |
| F01-REQ-004 | F01-T05 | F01-AC-004a, F01-AC-004b, F01-AC-004c, F01-AC-004d, F01-AC-004e |
| F01-REQ-005 | F01-T06 | F01-AC-005a, F01-AC-005b, F01-AC-005c |
| F01-REQ-006 | F01-T08 | F01-AC-006a |
| F01-REQ-007 | F01-T10 | F01-AC-007a |
| F01-REQ-008 | F01-T11 | F01-AC-008a |
| F01-REQ-009 | F01-T07 | F01-AC-009a |
| F01-REQ-010 | F01-T09 | F01-AC-010a, F01-AC-010b |
| F01-REQ-011 | F01-T13 | F01-AC-011a |
| F01-REQ-012 | F01-T14 | F01-AC-012a, F01-AC-012b |
| F01-REQ-013 | F01-T15 | F01-AC-013a |
| F01-REQ-014 | F01-T16 | F01-AC-014a (superseded) |
| F01-REQ-015 | F01-T17 | F01-AC-015a |
| F01-REQ-016 | F01-T18 | F01-AC-016a |
| F01-REQ-017 | F01-T19 | F01-AC-017a, F01-AC-017b, F01-AC-017c, F01-AC-017d |
| F01-REQ-018 | F01-T20 | F01-AC-018a (superseded) |
| F01-REQ-019 | F01-T03 | F01-AC-019a |
| F01-REQ-020 | F01-T12 | F01-AC-020a |
| F01-REQ-021 | F01-T16 | F01-AC-021a |
| F01-REQ-022 | F01-T20 | F01-AC-022a |
