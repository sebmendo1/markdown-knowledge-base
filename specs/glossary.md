# Glossary

One definition each. The product name in the UI is markdown-kb for now. Sign-in is not built. Knowledge lives in Markdown files plus browser localStorage. Preview is the default mode. The right column is the outline only.

A term marked **Replaced** kept its PRD meaning in `specs/source/ledger-prd.md`, and a later decision in `specs/source/decisions-and-changes.md` changed what the product uses. The definition after the mark is the one specs follow. The constitution states the seven product principles as checks a human can apply: everything is Markdown; no AI in the product; agents propose, humans merge; structure over pages; history is the product; simple beats complete; keyboard-first, Cursor-grade craft. Humans merge. Agents do not.

## Ledger nouns

### Space

A top-level knowledge base: members, agent keys, document types, and space settings. The PRD URL is `/memento` for the first space.

**Replaced** for routes. Pages are `/{project}/{page-path}` (for example `/guide/docs/layout`), not `/docs/…`. `/docs` and `/ledger` redirect into the guide project. There is no space segment. The product name stays markdown-kb. A project is the folder the editor uses today. A space is still the Ledger noun sharing and agent keys will belong to.

### Document

One Markdown file at a path, with YAML frontmatter. `type` and `title` are always required. A document is never hard-deleted; it is archived. Six document types cover the experiment lifecycle: harness, eval, experiment, finding, decision, and doc.

### Space settings

The Markdown that names a space and its defaults (`space.md` in the PRD). It is a document.

### Agent instructions

The Markdown rulebook an agent reads first (`agents.md` in the PRD). It is a document. The product does not invent it.

### Agent

A client a person brings, such as Cursor or any MCP client. It is not part of the product. It uses an agent key or a grant. This is not a tool.

### Frontmatter

The YAML block at the start of a document. It holds the document type and the fields that type requires.

### Document type

One of harness, eval, experiment, finding, decision, or doc. Each type has required fields and a default folder. A space may add a type with a type schema. The editor does not enforce these types yet.

### Type schema

A Markdown file under `.ledger/types/` whose frontmatter is the schema and whose body is writing guidance. It is Markdown, like every other document.

### Template

The Markdown an agent receives for a document type before it writes a proposal. The product does not generate the body.

### Export

A folder of the same Markdown files the space stores, including `.ledger/` and assets. Import reads that folder back.

### Revision

An immutable snapshot of a document's full content. Only a human save or a merged proposal creates one. It has an author, a message, and a parent. Change over time is a view over revisions.

**Replaced** as the shipped store. The editor keeps versions in browser localStorage (at most 50 snapshots per page) and files on disk. Those snapshots are the stand-in until server revisions exist. They are not yet Ledger revisions.

### Proposal

A suggested create or update, waiting for review, written against a base. An agent or a contributor creates it. A reviewer merges it, rejects it, or requests changes. Invalid input never creates a proposal.

Not built. The editor saves a page directly.

### Agent key

A credential an agent uses to read and propose, scoped to one space. It cannot merge, delete, or administer, and it cannot open the web app. The anti-slop policy is this missing merge tool.

Not built. No auth yet, and agent connection is later.

### Grant

An OAuth authorization for an assistant, tied to one space and one user. It reaches the same tools as an agent key. There is no merge scope. Revoking the grant blocks the next call.

Not built.

**Replaced** for the share sheet. "Can view" and "Can edit" set the starting mode of a page link. They grant no rights.

### Draft

The unsaved working copy of a document, private to its author. Leaving and returning restores it.

**Replaced.** The PRD saves a draft on the server every 2 seconds. The editor stores the working copy, and the version list, in browser localStorage.

### Head

The current revision of a document. A proposal whose base is the head merges directly. A proposal identical to the head is rejected.

Not built. The editor's page content is the working copy, not a head.

### Base

The revision a proposal was written against (`base_revision_id`). An update requires one. If it is not the head, merge runs a three-way merge of base, head, and proposal.

Not built.

The editor also stores `base` on a page: the repository file text that page was last reconciled to. That field is not a base. Do not use it as `base_revision_id`.

### Pinned link

A link `[[slug@7]]` that resolves to the first revision of that document whose version is 7. A type schema marks a link field `pinned: true` when the version is required. `[[slug]]` is not pinned; it means the latest revision.

### Metric point

One value derived when an experiment with status `concluded` merges. The fields are date, value, harness, harness version, eval, eval version, environment, sample size, verdict, and the experiment revision. Later edits of that experiment replace its points. Abandoned experiments produce none.

Not built.

### Editing

The block-editor mode (`edit`). The status line says "Editing". `E`, and the Edit button from viewing, turn it on. The Edit button treats Markdown source as on as well: from source, the button returns to viewing.

**Replaced** as the editor model. The PRD editing mode is inline live preview, with `⌘/` revealing raw source. The shipped modes are viewing, editing, and Markdown source, one at a time. A stored mode of `split` is read as editing.

### Viewing

The rendered mode (`preview`). The status line says "Viewing". It is the default. The Edit button is off. `⌘/` from viewing opens Markdown source, not editing.

**Replaced** as the screen. The PRD document view is a 16px, 1.6 line-height, 720px column with a right panel of properties, backlinks, and history. The shipped reading text is 17px with line-height 1.7. The column is capped at 760px, and the text is 696px wide. The right column is the outline only. Backlinks render under the page, not in that column.

### Preview

The same mode as viewing. Specs say viewing. The mode value in the editor is `preview`.

### Outline

The full-height right column: headings in the open page. `⌘\` shows or hides it. It is hidden below the 860px shell breakpoint.

**Replaced.** The PRD right panel is properties, backlinks, history, and outline. The shipped column is the outline only.

### Dialog

A window over the page. Settings, the share sheet, search, shortcut help, and confirmations for irreversible actions may be dialogs. Editing and review may not. Simple beats complete: one way to do each thing, and a feature that needs a manual is cut.

**Replaced.** The PRD allows a dialog only to confirm an irreversible action.

### Theme

Light, dark, or system. Unset means dark. The choice is stored in browser localStorage. Surfaces are solid fills. Hairline borders from the PRD are replaced.

**Replaced.** The PRD is dark-only in the default, with light available and system-following as a token note. The shipped control is an explicit Light / Dark / System choice, dark when unset.

## Editor nouns

### Project

A named folder of pages in markdown-kb. A page lives at `/{project}/{page-path}`, for example `/guide/docs/layout`, not at `/docs/…`. `/docs` and `/ledger` redirect into the guide project. Three kinds exist: repository, this browser, and a folder on this computer. A project has a slug, a name, and a description.

A project is not a space. It is the stand-in the editor uses until spaces exist. There is no space segment in the URL. The product name stays markdown-kb.

### Page

One Markdown file in a project. The path ends in `.md`. Its URL is `/{project}/{page-path}`, for example `/guide/docs/layout`. The editor's page is the stand-in for a document: it has content, a path, and optional repository origin, and it may have no document type yet.

The page field `base` is repository file text. See base. It is not a base.

## Status values

Status is a word on a document or a proposal. These are the values. Verdict (`supported`, `refuted`, `inconclusive`) and confidence (`low`, `medium`, `high`) are not status.

The status `draft` on a harness or an eval is not a draft.

### Harness and eval

| Status | Meaning |
| --- | --- |
| `draft` | Written, not the version experiments should pin |
| `active` | The version in use |
| `retired` | Kept for history, not the current version |

### Experiment

| Status | Meaning |
| --- | --- |
| `planned` | Not run yet |
| `running` | In progress |
| `concluded` | Finished; a merge of this status yields metric points |
| `abandoned` | Stopped; a merge yields no metric points |

### Finding

| Status | Meaning |
| --- | --- |
| `current` | The conclusion to cite |
| `superseded` | Replaced by a later finding |
| `disputed` | Challenged by later evidence |

### Decision

| Status | Meaning |
| --- | --- |
| `proposed` | Not yet accepted. This is not a proposal status |
| `accepted` | The choice in force |
| `reversed` | No longer in force |

### Doc

No status field. Frontmatter is `type: doc` and `title`, with an optional tags list.

### Proposal

| Status | Meaning |
| --- | --- |
| `open` | Waiting for review |
| `changes_requested` | The reviewer asked for a note and an update |
| `merged` | A reviewer merged it; a revision exists |
| `rejected` | A reviewer rejected it |
| `withdrawn` | The author withdrew it |

Two marks are not statuses. `stale` means an `open` or `changes_requested` proposal had no update for 30 days; it stays open. `conflicted` means a three-way merge of base, head, and proposal did not apply cleanly.

## Words the constitution uses

### In-product AI

Generation, rewriting, summarization, chat, and search-by-embedding. Excluded. The product stores, validates, diffs, versions, and displays.

### Slash menu

The editor menu on `/`. It inserts structure only. It is not in-product AI.

### Page builder

A non-goal, as are a board and a database. None of them is the model for a document.

### Reading line

The shipped measure: 17px, line-height 1.7, column capped at 760px, text 696px wide. 66ch at 17px is 744px, so the 760px cap binds. Defined with viewing. The PRD 16px, 1.6 line height, and 720px column are replaced.

### Craft

Cursor-grade craft: dense, fast, quiet, and keyboard-first, with readability first. Cursor and Devin are the reference products in the standing direction. They are not tools.

### Pull request

The unit of review for a behavior change. It includes the spec change, and the spec is reviewed first.

### Spec

A Markdown file that states behavior before the code changes. Feature specs are out of scope for this file.

### Requirement

One testable behavior in a spec, with a stable ID such as `F12-REQ-014`. An acceptance scenario ID looks like `F12-AC-014a`. A superseded requirement stays, marked, with the ADR that replaced it. The SDD rules are: spec first, IDs are never reused, every task traces to a requirement, and a removed requirement stays marked.

### Task

One implementation step. It names the requirement IDs it satisfies and the test that proves it.

### ADR

An architecture decision record. It gives context, options, the decision, and what it replaces. IDs look like `ADR-0007` and are never reused.

### Endpoint

An HTTP route the product exposes, including REST and the MCP route.

### Tool

One MCP tool. A tool may read, validate, or propose. It may not merge, delete, or administer.

### OAuth scope

A permission on a grant. No scope may merge, delete, or administer.

### Shortcut

A key binding in the keymap. A core action has one. `⌘` means Ctrl on Linux and Windows.

### Keymap

The contract in `specs/contracts/keymap.md`. Scopes keep the same key from meaning two things at once.

### Sign-in

Human sessions. Not built. Roles stay the target for later.
