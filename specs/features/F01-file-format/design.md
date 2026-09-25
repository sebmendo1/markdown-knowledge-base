# F01 design: file format

The folder is the space. One UTF-8 Markdown file is one document. This design names the modules that parse those bytes, derive slugs and paths, classify `.ledger/` and `assets/`, and decide whether a write is allowed. The validator in F06 turns the same failures into the codes in [errors.md](../../contracts/errors.md). This feature has no screen.

Shipped pieces stay where they are when they already match this spec. Document slugs and type paths are new modules. `slugify` in `lib/workspace/paths.ts` keeps its 64-character cap for project and folder names in the current workspace model.

## Modules

| Module | Role |
| --- | --- |
| `lib/issues/types.ts` | `Issue` shape shared with F02 and F06: `code`, `severity`, `field` or `line`, `message`, `hint`. |
| `lib/issues/messages.ts` | Fills the F01 rows of [errors.md](../../contracts/errors.md). `{parser}` is one line, at most 200 characters. |
| `lib/format/encoding.ts` | Accepts a UTF-8 document with no byte-order mark and a path that ends in `.md`. |
| `lib/markdown/frontmatter.ts` | Splits a leading frontmatter block. Already shipped. The format tests lock the rules below. |
| `lib/format/slug.ts` | Derives a slug from a title, allocates a unique slug, recovers a slug from a path. |
| `lib/format/filename.ts` | Checks placeholders, builds `{folder}/{filename}.md`, and applies a date change. |
| `lib/format/classify.ts` | Labels a path as a document, a type schema, a fixed ledger document, or an asset. |
| `lib/format/wiki-link.ts` | Parses the four wiki-link forms. |
| `lib/format/access.ts` | Allows a keyboard write while sign-in is absent. When sign-in is on, allows a direct write for Owner and Editor. |
| `lib/format/save.ts` | Runs access, then the path plan, then an injected validator, then the space I/O. |
| `lib/workspace/paths.ts` | `hrefOf` is the page URL. Each segment is percent-encoded. The URL has no space slug. |
| `app/[project]/[...slug]/page.tsx` | Serves `/{project}/{page-path}`. `{page-path}` is the file path without `.md`. |

F06 supplies the validator function that `lib/format/save.ts` calls. F01 tests inject a stub that returns a valid result so path and access tests stay inside this feature.

## Data shapes

A character is one Unicode code point. Length uses code points, not UTF-16 units.

```ts
type Issue = {
  code: string;
  severity: "error" | "warning";
  field?: string;
  line?: number;
  message: string;
  hint: string;
};

type FrontmatterBlock = {
  data: Record<string, unknown>;
  body: string;
  lineBreak: "lf" | "crlf";
};

type Slug = string; // ^[a-z0-9]+(-[a-z0-9]+)*$ and 1 to 80 code points

type WikiLink = {
  slug: Slug;
  version?: number; // integer 1 through 999999999, no leading zero
  heading?: string; // 1 to 200 code points, no "]" and no line break
};

type Caller =
  | { signIn: false }
  | { signIn: true; role: "owner" | "editor" | "contributor" | "viewer" }
  | { signIn: true; role: "agent"; via: "key" | "oauth" };

type SpaceFile = { path: string; bytes: Uint8Array };

type SpaceIO = {
  read(path: string): Uint8Array | null;
  write(path: string, bytes: Uint8Array): void;
  remove(path: string): void;
  list(): SpaceFile[];
};

type WritePlan =
  | { ok: true; path: string; slug: string; removePath?: string }
  | { ok: false; issue: Issue };

type SaveResult =
  | { written: true; path: string; slug: string; warnings: Issue[] }
  | { written: false; issues: Issue[] };
```

`takenSlugs` is the set of slugs of every document in the space, archived documents included. `takenPaths` is the set of document paths. Both are inputs. F07 owns how archive is stored. F01 reads the sets the caller passes.

`onRevision` is an optional callback. A rejected save does not call it. F07 will append the revision. F01 tests pass a counter.

## State

The files in the space folder are the state. These modules keep no cache and no component state.

A save holds its indexes for that call only. A date change and a rename each produce one plan: write the new path, and when the path changed, remove the previous path in that same call.

While sign-in is absent, every caller is `{ signIn: false }`. `permission_denied` is unused. The three refusal sentences live in `lib/format/access.ts` because they are access refusals and are absent from [errors.md](../../contracts/errors.md).

| Caller, once sign-in is on | Message | Hint |
| --- | --- | --- |
| Contributor | `Contributors propose changes. They do not save directly.` | `Submit a proposal instead of saving.` |
| Viewer | `You do not have permission to change this document.` | `Ask an owner for a role that can edit.` |
| Agent key or OAuth grant | `Agents propose changes. They do not save directly.` | `Call propose_change. Agents cannot merge, delete, or administer.` |

The report copy for a format failure is the F06 report. This feature adds no view.

## Save pipeline

`commitDocument` in `lib/format/save.ts` does the following, in order:

1. `access` refuses a caller who cannot write. The file is unchanged. The validator is not called.
2. `planWrite` computes the slug and path. A collision returns `slug_taken` or `path_invalid` and writes nothing.
3. The injected `validate` function runs. Any error blocks the write. Warnings are returned with a successful write.
4. `SpaceIO.write` stores the bytes. When the plan includes `removePath`, that path is removed in the same call, after the new path is written. `onRevision` runs only after both succeed.

A rename plans a new slug and a new path for that one document. Every other path keeps its bytes.

## Contracts

- [specs/contracts/frontmatter/](../../contracts/frontmatter/) — `type` and `title` on every document. Title length is 1 to 120 code points. `x-ledger.folder`, `x-ledger.filename`, and `x-ledger.nested` are the seed path rules. `x-ledger` is an annotation on those JSON Schemas. It is not a key in document frontmatter. A compiler registers the keyword `x-ledger` before compiling them (F02).
- [specs/contracts/type-schema.schema.json](../../contracts/type-schema.schema.json) — `filename` may contain only the placeholders `{date}` and `{slug}`.
- [specs/contracts/errors.md](../../contracts/errors.md) — `yaml_invalid`, `field_kind`, `slug_taken`, `path_invalid`, and the filename row of `schema_invalid`.

The effective title maximum is the smaller of 120 and the schema `max` when a schema defines `title`. A schema that omits `title` still requires it, at 1 to 120 code points (F02).

## Rules

### Bytes and frontmatter

`readDocument` decodes UTF-8. A leading EF BB BF is a missing frontmatter block: the bytes do not open with `---` at byte 0, and the code is `yaml_invalid`. A path that does not end in `.md` is not a document.

The block is `---` at byte 0, a line break, a YAML map, a line break, and a closing `---`. The line break is LF (`\n`) or CRLF (`\r\n`). The line break that ends the closing line belongs to the delimiter. The body is the bytes after that. A YAML array, scalar, null, or a thrown parser is `yaml_invalid` with the messages in [errors.md](../../contracts/errors.md). Field codes wait for F06, which suppresses them after `yaml_invalid`.

`lib/markdown/frontmatter.ts` already accepts both line breaks. Keep that function as the parser. `lib/workspace/title.ts` keeps its own splitter for the editor (F09).

### Slug

`slugFromTitle`:

1. Trim the title.
2. Normalize NFKD.
3. Remove characters in Unicode category Mark (`\p{M}`).
4. Lowercase `A`–`Z`.
5. Replace every other character outside `a`–`z` and `0`–`9` with `-`.
6. Collapse runs of `-`.
7. Strip a leading or trailing `-`.
8. An empty result is `untitled`.
9. Cut to 80 code points, then strip a trailing `-`.

`allocateSlug(base, takenSlugs)`:

- The slug matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is 1 to 80 code points.
- A free base is used as-is.
- Otherwise try `n` from 2 through 10000. The candidate is the base, `-`, and the decimal `n`.
- When the candidate is longer than 80 code points, drop code points from the end of the base, then drop a trailing `-`. An empty base becomes `untitled`.
- Use the smallest `n` whose candidate is free.
- When every candidate is taken, return `slug_taken`, message `Slug "{slug}" is already used.`, hint `Use a free slug. The next suffix is -{n}.` `{slug}` is the base. `{n}` is `10000` when the range is exhausted. Write no file.

An archived document's slug counts as taken.

`recoverSlug(filenameStem, pattern)` reverses the pattern. `{date}` matches a `YYYY-MM-DD` token. `{slug}` matches the slug pattern. Literal characters match themselves. When the pattern has no `{slug}`, the stem is the slug.

### Path

`filenamePlaceholders` accepts a pattern of 1 to 200 characters whose `{…}` tokens are only `{date}` and `{slug}`. Any other token is `schema_invalid` with the filename row of [errors.md](../../contracts/errors.md). The type does not load. F02 calls this function.

`documentPath(folder, pattern, fields)` replaces `{date}` with the `date` field and `{slug}` with the slug, then joins `{folder}/{filename}.md`.

For type `doc` only, zero or more extra segments may sit between `docs/` and the filename. Each extra segment matches the slug pattern. `x-ledger.nested` is true only on [doc.schema.json](../../contracts/frontmatter/doc.schema.json). Any other type, including a custom type, rejects an extra segment with `path_invalid`.

When `date` changes and the pattern contains `{date}`, the plan writes the recomputed path, keeps the slug, and sets `removePath` to the previous path. When the recomputed path is already another document's path, the plan is `path_invalid` (`Path "{path}" is already used.`), `removePath` is absent, and `onRevision` is not called.

### Classify

| Path | Result |
| --- | --- |
| `.ledger/types/<name>.md` | Schema file. Frontmatter `type` is `schema`. It is not one of the six document types, so a valid schema does not produce `type_unknown`. |
| `.ledger/space.md` and `.ledger/agents.md` | Documents. `type` is `doc` and `title` is a non-empty string. Another `type` is `field_kind`: message `type must be doc.`, hint `Use type: doc for space.md and agents.md.` These paths skip the folder pattern, so `path_invalid` is not reported for `.ledger/`. |
| `assets/…` | Asset. No document slug and no page. |
| Any other `*.md` | Document, then checked against its type folder and filename pattern. |

### Wiki link

One grammar covers `[[slug]]`, `[[slug@N]]`, `[[slug#Heading]]`, and `[[slug@N#Heading]]`:

```text
\[\[([a-z0-9]+(?:-[a-z0-9]+)*)(?:@([1-9][0-9]{0,8}))?(?:#([^\]\r\n]{1,200}))?\]\]
```

`N` has no leading zero and is at most 999999999. The same grammar is what the pinned patterns in the frontmatter JSON Schemas accept. F06 decides whether a missing version is `link_unpinned`. F01 only accepts or rejects the string.

### Page URL

`hrefOf(project, path)` returns `/${encodeURIComponent(project)}/` plus the path without `.md`, each segment percent-encoded. Project `guide` and file `docs/writing.md` open at `/guide/docs/writing`.

### Access

`{ signIn: false }` may create, update, and rename. No role is read.

`{ signIn: true }` with `owner` or `editor` may write and rename. `contributor`, `viewer`, and `agent` receive `permission_denied` and the file stays byte-identical. Agents have no rename path around this gate.

A human rename changes that document's slug and path only. Other files stay byte-identical. Links that used the old slug are left as they are. The next validation of a linking document reports `link_broken` (F06). The old slug may be used again.

## Shipped code

| Piece | What this design does with it |
| --- | --- |
| `lib/markdown/frontmatter.ts` | Remains the parser. Tests cover LF, CRLF, a map, and a missing block. |
| `lib/workspace/paths.ts` `slugify` | Unchanged 64-character helper for projects and folders. Document slugs use `lib/format/slug.ts`. |
| `lib/workspace/paths.ts` `hrefOf` | Remains the page URL. |
| `lib/store/fs-store.ts` | Later wiring calls `commitDocument`. F01 tests use an in-memory `SpaceIO`. |
| `content/` | The live tree `docs/*.md` and `ledger/space.md` is not the target layout. |

## Tests

Node's test runner, as the rest of `lib/`, with `node:test` and `node:assert/strict`. Each acceptance scenario is a test whose title is its id (`F01-AC-004a`). The first task adds `lib/format/*.test.ts` and `lib/issues/*.test.ts` to the `test` script in `package.json`.

Steps, sizes, and the requirement each test proves are in [tasks.md](tasks.md).
