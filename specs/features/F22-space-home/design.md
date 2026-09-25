# F22 design: Space home

The editor home is a list of projects. The Ledger home is one space at `/{project}`. Requirements are in `spec.md` on `origin/cursor/spec-history-import-home-08e8`.

The Ledger space home is in use when the open project reads documents from Postgres. Until then, `/{project}` redirects to the project's home path and does not render the orientation screen.

## Modules

Built, and kept:

| Module | Role |
| --- | --- |
| `app/page.tsx` | `/`. Brand, heading, lead line. |
| `components/launcher.tsx` | Project cards and the `New project` card. |
| `components/missing-page.tsx` | Empty project, missing page, unknown project. |
| `components/page-tree.tsx` | Empty sidebar line. |
| `app/[project]/page.tsx` | Redirect to the home path while the Ledger home is not in use. |
| `components/workspace-store.ts` | Hydration. Empty lines stay hidden until the workspace has hydrated. |

Not started:

| Module | Role |
| --- | --- |
| `lib/space/home.ts` | Active harness, five experiments, five findings, open-proposal count, chart note. |
| `lib/space/seed.ts` | `.ledger/space.md`, `.ledger/agents.md`, and the six F02 type files. |
| `components/space-home/space-home.tsx` | Orientation screen. Renders the space body and the four regions. |
| `app/[project]/page.tsx` | Serves the orientation screen when the Ledger home is in use. No redirect. |

Empty-region actions call the F09 new-document flow: `New harness`, `New experiment`, `New finding`, `New document`. `Agent keys` opens Settings on agent keys (F15).

## Data

A project card is not a space. It shows the project name, the kind (`Repository`, `This browser`, or `On this computer`), the description or `A folder of Markdown pages.`, up to four folder names then `+{n}`, the page count, and the folder count. The foot joins the counts with ` · `. The word is `page` or `folder`, plus `s` when the count is not 1. A project that has been opened in this browser adds `Opened` and a relative time. One that has not been opened omits that phrase.

Editor empty copy uses the shipped punctuation: U+201C and U+201D around a missing title, U+2019 in `haven’t` and `isn’t`. No illustration.

The space home reads:

| Region | Query |
| --- | --- |
| Space body | Head of `.ledger/space.md`. The document renderer draws the body. The YAML block is not the body. |
| Active harness | `documents.type` harness, head frontmatter `status` `active`, `archived_at` null. Newest head `revisions.created_at`, then smaller `documents.id`. Several matches still produce one card. An archived active harness does not match. A draft does not match. |
| Experiments | `archived_at` null, type experiment. Frontmatter `date` descending, then head `created_at` descending, then smaller document id. Five rows. Each row is title, date, and the status word. |
| Open proposals | `proposals.status` in (`open`, `changes_requested`). Stale proposals stay `open`, so they count. Label `Open proposals`. |
| Findings | Head frontmatter `status` `current`, `archived_at` null, type finding. Newest head `created_at`, then smaller document id. Five rows. |

The chart note `One eval and three experiments are enough for a first chart.` is shown while non-archived evals are 0 or non-archived experiments are fewer than 3. When both are met, the line is absent. Regions that have documents still render.

Seed, only when a space is created without a zip:

`.ledger/space.md`, LF, no BOM. `{title}` is the space name trimmed, cut to 120 Unicode code points, `\` and `"` escaped, double-quoted. An empty result is `Space`.

```text
---
type: doc
title: "{title}"
---

{title} is a space in markdown-kb.

The default harness and the default eval are named here, in this file.
```

`.ledger/agents.md`:

```text
---
type: doc
title: "Agent instructions"
---

What to log, how to name files, and what not to do.
```

The six type files are the F02 seed. This feature writes them and does not restate their fields. It does not create a harness, an eval, or an experiment, and it does not read artifacts. `New space from files` (F19) does not call `seed.ts`.

Ledger empty regions, one line and one action, no illustration and no second action:

| Region | Copy | Action |
| --- | --- | --- |
| Harness card | `No harness yet. Add the setup you run.` | `New harness` |
| Experiments | `No experiments yet.` | `New experiment` |
| Findings | `No current findings.` | `New finding` |
| Inbox | `No proposals. Connect an agent in Settings → Agent keys.` | `Agent keys` |
| Timeline | `No revisions yet. Save a document to start the timeline.` | `New document` |
| Metrics | `No metric points yet. One eval and three experiments are enough for a first chart.` | `New experiment` |

The Inbox, timeline, and metrics lines are the empty states of those screens. The timeline line matches F18.

Errors:

| Code | When |
| --- | --- |
| `space_missing` | The Ledger home is in use and `.ledger/space.md` has no head, or it is archived |
| `permission_denied` | An agent key or an OAuth grant opens the home |

## State

| Surface | State | What is shown |
| --- | --- | --- |
| Project cards | Success | Heading `Projects`, one card per project, plus `New project` |
| Project cards | No projects | The heading, the lead line, and `New project`. No empty illustration |
| Empty project | Empty | F22-REQ-004 |
| Missing page | Empty | F22-REQ-005. `Open {title}` only when another page exists |
| Unknown project | Error | F22-REQ-006 |
| Sidebar | Empty | `No pages yet. Press + to write the first one.` |
| Workspace | Not hydrated | No empty-project line and no missing-page line |
| Space home | Loading | Accessible name `Loading space`. Skeleton of the regions |
| Space home | Error | `space.md is missing.` then the hint |
| Space home | Partial | Filled regions, the empty line for the others, and the chart note when it applies |
| Space home | Success | Rendered space body, harness card, experiment rows, proposal count, findings. No success banner |

Copy is the same at `860px` or wider and at `420px`. At `860px` or wider the harness, experiments, and findings sit in one row. Under `860px` they stack. Each Ledger empty-state action is at least `44px` by `44px` on a coarse pointer.

While sign-in is not built, the person at the keyboard sees the project cards and, when the space home is in use, the orientation screen, including the proposal count. No role is checked. When sign-in is built, Owner, Editor, Contributor, and Viewer may read the home. An agent key or an OAuth grant receives `permission_denied` and does not see the home. A public read-only view hides the proposal count and the inbox link.

The active harness is not parsed from the `space.md` body. The card uses `status: active`.

## Contracts

From `specs/contracts/db.sql` on `origin/cursor/spec-storage-db-f59c`:

- `documents` (`type`, `title`, `path`, `archived_at`, `head_revision_id`). Type and path identify the space file, the harness, experiments, evals, and findings.
- `revisions` (`created_at`, `frontmatter`). Status, date, and the space body come from the head revision. `revision_for_version` is not required on this screen.
- `proposals` (`space_id`, `status`). The count is `status` in (`open`, `changes_requested`). There is no `stale` status. A stale proposal remains in that set.
- `documents_path_unique` keeps `.ledger/space.md` to one row per space. Seed inserts that path through `create_document`.

The home route is `/{project}` with no `/memento` prefix (ADR-0001). F02 owns the type-file bytes. F04 renders the space body. F08 owns the reading measure. F12 owns inbox rows. This screen only counts them. F16 owns the metrics chart. This screen only sets the empty line and the chart note.
