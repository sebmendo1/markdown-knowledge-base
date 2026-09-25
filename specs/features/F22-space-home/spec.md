# F22: Space home

## Summary

Space home is the orientation screen for a space: the space file, the active harness, recent experiments, the open-proposal count, and current findings. Seeding writes the `.ledger/` files, and each empty screen teaches the next action in one line.

## Status and scope

Not started for the Ledger space home. The orientation screen, the seed files, and the Ledger empty lines are not in the product.

The editor slice is built. `/` is a project card home. An empty project, a missing page, an unknown project, and an empty sidebar already have copy. Those screens are not the Ledger space home.

This spec covers the project cards, the shipped empty pages, the space home, seeding, and the empty-state rule. Type-schema bytes are F02. Document rendering is F04. The reading column is F08. Import does not seed extra files (F19). The history and timeline screens are F18. Inbox behavior is F12. The chart is F16.

The product name in the UI is markdown-kb. A page is `/{project}/{page-path}`. There is no space segment and no `/memento` prefix. ADR-0001. Sign-in is not built. ADR-0002.

A project is not a space. The cards at `/` are projects. The Ledger home is a space, served later at `/{project}`.

## Users and stories

- **F22-US-001** As the owner, I want a home that shows the space, so that I can see the harness, the latest runs, and what is waiting.
- **F22-US-002** As the owner, I want the first session to start with space files, so that I am not looking at a blank database.
- **F22-US-003** As the owner, I want an empty screen to tell me the one next action, so that I do not need a tour.
- **F22-US-004** As the owner, I want the project cards that already shipped, so that the editor home stays a list of projects.

## Requirements

- **F22-REQ-001** The system shall serve the project card home at `/`, with the brand `markdown-kb`, the heading `Projects`, and the line `Each project is a folder of Markdown pages. Open one to read and edit it, and switch between them from the sidebar.`
- **F22-REQ-002** Each project card shall show the project name, the kind label, the description or `A folder of Markdown pages.`, up to four folder names, the page count, and the folder count. The foot joins the counts with ` · `. The count word is `page` or `folder`, plus `s` when the count is not 1. The kind label is `Repository`, `This browser`, or `On this computer`.
- **F22-REQ-003** The home shall include a `New project` card whose line is `Start with a blank page, or open a folder of .md files.`
- **F22-REQ-004** When a project has no pages, the system shall show the project slug as the line above the heading, the heading `{name} has no pages yet`, the line `Write the first page, or drop Markdown files on the sidebar to bring them in.`, the action `Write the first page`, and the link `All projects`.
- **F22-REQ-005** When a page path has no page, the system shall show the path as the line above the heading, the heading `“{title}” has no page yet`, and the line `Links can point to pages you haven’t written. Create it now and start writing, or open another page.` The action is `Create this page`. When another page exists, the link is `Open {title}`.
- **F22-REQ-006** When the project is not in this browser, the system shall show the project slug as the line above the heading, the heading `This project isn’t in this browser`, and the line `Projects you create or open from a folder live in the browser that made them. Pick a project from the list, or open the folder again.` The action is `All projects`.
- **F22-REQ-007** When the sidebar has no pages, the system shall show `No pages yet. Press + to write the first one.`
- **F22-REQ-008** While the Ledger space home is not in use, the system shall not render the orientation screen at `/{project}`. When the project has a home path, `/{project}` shall redirect to that page.
- **F22-REQ-009** The editor empty pages shall use the shipped controls above and shall not use an illustration.
- **F22-REQ-010** When the Ledger space home is in use, the system shall serve it at `/{project}` and shall not redirect that URL to a document. The URL shall not be `/memento`.
- **F22-REQ-011** The space home shall render the body of `.ledger/space.md` with the document renderer.
- **F22-REQ-012** The space home shall show one active-harness card: the harness whose status is `active` and whose `archived_at` is null. If several match, the card is the one with the newest head `created_at`, then the smaller document id.
- **F22-REQ-013** The space home shall list the latest five experiments whose `archived_at` is null, ordered by frontmatter `date` descending, then head `created_at` descending, then smaller document id. Each row shows the title, the date, and the status word.
- **F22-REQ-014** The space home shall show the count of proposals whose status is `open` or `changes_requested`, including stale proposals, with the label `Open proposals`. A public read-only view shall hide the count and the inbox link.
- **F22-REQ-015** The space home shall list up to five findings whose status is `current` and whose `archived_at` is null, newest head `created_at` first, then smaller document id.
- **F22-REQ-016** When a space is created without a zip, the system shall write `.ledger/space.md`, `.ledger/agents.md`, and the six type files from F02. It shall not create a harness, an eval, or an experiment, and it shall not read artifacts. An import shall not add these files when the batch does not contain them.
- **F22-REQ-017** While the space has no harness, no eval, or fewer than three experiments, counting documents whose `archived_at` is null, the home shall show `One eval and three experiments are enough for a first chart.` When both are met, that line is absent. The home shall still render the regions it has.
- **F22-REQ-018** Each Ledger empty region shall teach in one line and shall offer one action, with no illustration and no wizard.
- **F22-REQ-019** While sign-in is not built, the person at the keyboard shall see the project cards and, when the space home is in use, the orientation screen, including the proposal count. When sign-in is built, Owner, Editor, Contributor, and Viewer may read the home. An agent key or an OAuth grant shall receive `permission_denied` and shall not see the home.
- **F22-REQ-020** While the workspace has not hydrated, the system shall not show the empty-project line or the missing-page line.

## Acceptance scenarios

### F22-AC-001a

Given the editor home, when `/` is opened, then the brand is `markdown-kb`, the heading is `Projects`, and the lead line is `Each project is a folder of Markdown pages. Open one to read and edit it, and switch between them from the sidebar.`

### F22-AC-002a

Given a repository project named `Guide` with description empty, six top-level folders, and two pages, when the card is shown, then the kind is `Repository`, the description is `A folder of Markdown pages.`, four folder names are shown, the overflow is `+2`, and the foot is `2 pages · 6 folders`.

### F22-AC-002b

Given a project that has been opened in this browser, when the card is shown, then the foot includes `Opened` and a relative time. A project that has not been opened shows no `Opened` phrase.

### F22-AC-003a

Given the project card home, when the new card is read, then the title is `New project` and the line is `Start with a blank page, or open a folder of .md files.`

### F22-AC-004a

Given a project slug `notes` named `Notes` with no pages, when its empty screen is shown, then the line above the heading is `notes`, the heading is `Notes has no pages yet`, the line is `Write the first page, or drop Markdown files on the sidebar to bring them in.`, and the actions are `Write the first page` and `All projects`.

### F22-AC-005a

Given a missing path `docs/later.md` whose title would be `Later`, and another page titled `Start`, when the missing screen is shown, then the line above the heading is `docs/later.md`, the heading is `“Later” has no page yet`, the body contains `haven’t`, and the actions are `Create this page` and `Open Start`.

### F22-AC-005b

Given a missing path and no other page, when the missing screen is shown, then `Create this page` is shown and `Open` is absent.

### F22-AC-006a

Given a project slug `gone` that this browser does not know, when that URL is opened, then the line above the heading is `gone`, the heading is `This project isn’t in this browser`, and the action is `All projects`.

### F22-AC-007a

Given a sidebar with no pages and no folder being named, when the sidebar is shown, then the line is `No pages yet. Press + to write the first one.`

### F22-AC-008a

Given the Ledger space home is not in use and the guide project's home path is `docs/writing.md`, when `/guide` is opened, then the URL is `/guide/docs/writing` and the orientation screen is not shown.

### F22-AC-008b

Given the Ledger space home is not in use, when a project URL is opened, then the page does not show an active-harness card, a latest-experiment list, or an open-proposal count.

### F22-AC-009a

Given the empty project screen and the missing page screen, when they are shown, then neither screen contains an illustration.

### F22-AC-010a

Given the Ledger space home is in use and the project is `guide`, when `/guide` is opened, then the orientation screen is shown and the URL stays `/guide`.

### F22-AC-011a

Given `.ledger/space.md` whose body is `Hello space.`, when the home is shown, then that body is rendered and the YAML block is not shown as the body.

### F22-AC-012a

Given two harnesses with status `active`, and the newer head is `B`, when the home is shown, then the card is `B`.

### F22-AC-012b

Given two active harnesses with the same head `created_at` and ids 3 and 8, when the home is shown, then the card is the document with id 3.

### F22-AC-012c

Given an active harness that is archived, and a draft harness, when the home is shown, then the card is the empty harness state.

### F22-AC-013a

Given six non-archived experiments with distinct dates, when the home is shown, then five rows are shown, the latest date is first, and each row includes the status word.

### F22-AC-013b

Given two experiments with the same date, when the home is shown, then the newer head `created_at` is first.

### F22-AC-014a

Given two proposals with status `open`, one `changes_requested`, one `stale` that is still `open`, and one `merged`, when a member opens the home, then the count is 4 and the label is `Open proposals`.

### F22-AC-014b

Given a public read-only view and three open proposals, when the home is shown, then the count and the inbox link are absent.

### F22-AC-015a

Given six findings with status `current` and one `superseded`, when the home is shown, then five current findings are listed and the superseded finding is absent.

### F22-AC-016a

Given a space created without a zip and named `Memento`, when its files are read, then `.ledger/space.md` and `.ledger/agents.md` exist, the six type files match F02, and there is no experiment document.

### F22-AC-016b

Given that new `.ledger/space.md`, when the bytes are read, then the frontmatter has `type: doc` and `title: "Memento"`, and the body contains `The default harness and the default eval are named here, in this file.`

### F22-AC-016c

Given a zip that does not contain `.ledger/space.md`, when import creates a space from it, then `.ledger/space.md` is not added.

### F22-AC-017a

Given one eval and two experiments, when the home is shown, then the line `One eval and three experiments are enough for a first chart.` is present and the two experiments are listed.

### F22-AC-017b

Given one eval and three experiments, none archived, when the home is shown, then that line is absent.

### F22-AC-018a

Given no harness, when the home is shown, then the harness region says `No harness yet. Add the setup you run.` and its one action is `New harness`.

### F22-AC-018b

Given the Ledger empty regions, when they are shown, then none of them contains an illustration or a second action.

### F22-AC-019a

Given sign-in is not built and the space home is in use, when the person at the keyboard opens `/{project}`, then the proposal count is shown and no role is checked.

### F22-AC-019b

Given sign-in is built and the caller is a Viewer, when they open the home, then the home is shown.

### F22-AC-019c

Given sign-in is built and the caller is an agent key, when they open the home, then the code is `permission_denied` and the home is not shown.

### F22-AC-020a

Given the workspace has not hydrated and the project has no pages, when the screen is painted, then `has no pages yet` is not shown.

## Edge cases and errors

The quotes in F22-REQ-005 and F22-REQ-006 are the shipped characters: U+201C and U+201D around the missing title, and U+2019 in `haven’t` and `isn’t`.

Before the workspace has hydrated, the empty-project and missing-page lines are not shown.

Status on an experiment row is a word. A colored dot may sit beside it. The word is not omitted.

The active harness is not parsed out of the `space.md` body. F01 leaves the default harness and the default eval in that prose. The card uses `status: active`.

Seed bytes for `.ledger/space.md`, with `{title}` double-quoted and `\` and `"` escaped, LF line endings, no byte-order mark:

```
---
type: doc
title: "{title}"
---

{title} is a space in markdown-kb.

The default harness and the default eval are named here, in this file.
```

`{title}` is the space name trimmed, then cut to 120 characters by dropping the end. A character is one Unicode code point. An empty result is `Space`.

`.ledger/agents.md` is:

```
---
type: doc
title: "Agent instructions"
---

What to log, how to name files, and what not to do.
```

The six type files are the F02 seed. This spec does not restate their fields.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Space home is in use and `.ledger/space.md` has no head, or it is archived | `space_missing` | `space.md is missing.` | `Restore .ledger/space.md. A space keeps its name and purpose there.` |
| Agent key or OAuth grant opens the home | `permission_denied` | `An agent key cannot open the web app.` | `Use the MCP tools. Agents cannot merge, delete, or administer.` |

Ledger empty copy, one action each:

| Region | Copy | Action |
| --- | --- | --- |
| Harness card | `No harness yet. Add the setup you run.` | `New harness` |
| Experiments | `No experiments yet.` | `New experiment` |
| Findings | `No current findings.` | `New finding` |
| Inbox | `No proposals. Connect an agent in Settings → Agent keys.` | `Agent keys` |
| Timeline | `No revisions yet. Save a document to start the timeline.` | `New document` |
| Metrics | `No metric points yet. One eval and three experiments are enough for a first chart.` | `New experiment` |

`New harness`, `New experiment`, `New finding`, and `New document` open the new-document flow for that type (F09). `Agent keys` opens Settings on agent keys (F15). The Inbox, timeline, and metrics lines are the empty states of those screens. Timeline matches F18.

## Limits and budgets

| Limit | Value |
| --- | --- |
| Folder names on a card | 4, then `+{n}` for the rest |
| Experiments on the home | 5 |
| Current findings on the home | 5 |
| Chart note | Shown when non-archived evals are 0, or non-archived experiments are fewer than 3 |
| Space title | 1 to 120 characters |
| Viewport, desktop | 860px wide or wider: harness, experiments, and findings sit in one row |
| Viewport, phone | Under 860px, including 420px wide: those regions stack in one column |
| Coarse pointer | Each Ledger empty-state action is at least 44px by 44px |
| Illustrations | None on the editor empty pages or the Ledger empty regions |

No response-time budget is set for the home. The numbers above are counts and layout widths.

## UI states

Editor copy is the same at 860px wide or wider and at 420px wide. Ledger layout follows Limits. There is no illustration.

| Surface | State | Copy |
| --- | --- | --- |
| Project cards | Success | The heading `Projects` and one card per project, plus `New project` |
| Project cards | Empty of projects | The heading `Projects`, the lead line, and the `New project` card. No separate empty illustration |
| Empty project | Empty | F22-REQ-004 |
| Missing page | Empty | F22-REQ-005 |
| Unknown project | Error | F22-REQ-006 |
| Sidebar | Empty | F22-REQ-007 |
| Workspace | Loading, not hydrated | No empty-project and no missing-page line |
| Space home | Loading | Accessible name `Loading space`. The skeleton matches the regions |
| Space home | Error | `space.md is missing.` then the hint |
| Space home | Partial | The regions that have documents, the empty line for the regions that do not, and the chart note when F22-REQ-017 applies |
| Space home | Success | The rendered space body, the harness card, the experiment rows, the proposal count, and the findings. No success banner |

## Out of scope

- Type-schema field lists (F02). Seeding writes those files. It does not redefine them.
- Rendering rules (F04) and the reading measure (F08).
- The project card menu, rename, and delete (the editor). The delete warning that mentions export is F19.
- Inbox filters, merge, and proposal rows (F12). This spec sets the home count and the Inbox empty line.
- The metrics chart (F16). This spec sets the empty line and the "enough for a first chart" note.
- History and timeline behavior (F18). The timeline empty line matches F18.
- Sign-in screens (F15). The role check on the home is in this spec for when sign-in exists.
- A wizard, a tour, or a tooltip sequence.

## Open questions

None. The active harness is the document with status `active`, not a parse of the `space.md` body. That is F22-REQ-012. F01-Q-002 still owns whether `space.md` gains frontmatter fields. This spec does not add those fields.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:goals-for-v1 -->` (line 34) — one home for Memento experiment knowledge.
- `<!-- prd:screens -->` (line 311) — space home contents. This spec serves them at `/{project}`, not `/memento`.
- `<!-- prd:empty-states -->` (line 339) — one line, one action, no illustrations. The Inbox example is the Inbox row above.
- `<!-- prd:space-and-agents -->` (line 247) — `space.md` holds the name, the purpose, and the default harness and eval. `agents.md` is the rulebook.
- `<!-- prd:setting-up-memento -->` (line 637) — seed harnesses, evals, and experiments from real work. The screens stay useful before that is done. One eval and three experiments are enough for a first chart.
- `<!-- prd:first-week-of-use -->` (line 860) — seed `space.md`, `agents.md`, the harness versions, and the evals.
- `<!-- prd:import-existing-work -->` (line 286) — the product does not convert artifacts.
- `<!-- prd:roles -->` (line 648) — who may read.
- `<!-- prd:non-goals -->` (line 41) — no native phone app.

Decisions in `specs/source/decisions-and-changes.md`: D3, D5, D6, C4.

ADRs: ADR-0001, ADR-0002, ADR-0003, ADR-0011.

Shipped code this spec records as the editor slice: `app/page.tsx`, `components/launcher.tsx`, `components/missing-page.tsx`, `components/page-tree.tsx`, `app/[project]/page.tsx`.
