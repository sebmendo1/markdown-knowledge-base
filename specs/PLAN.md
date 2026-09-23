# Plan: turn the product specs into SDD specs

This plan turns the Ledger PRD, the scoping answers, and the change requests into specs precise enough to drive spec-driven development (SDD). In SDD, the spec is written and reviewed first, the design and task list are derived from it, and code and tests trace back to numbered requirements. When behavior changes, the spec changes first.

## 1. Sources

Three inputs, all now in `specs/source/`:

| Source | File | What it holds |
| --- | --- | --- |
| Ledger PRD, Sep 22, 2026 | `source/ledger-prd.md` | The full product: principles, five nouns, six types, the file format, eight flows, eight screens, editor, Markdown syntax, review, MCP and REST, validation, metrics, auth, data model, design language, build plan, acceptance criteria, risks, open questions |
| Scoping answers | `source/decisions-and-changes.md`, section D | Full v1 scope, hosted on Vercel, no auth yet, agents later, the name markdown-kb, PRD roles kept, editor first |
| Change requests C1–C8 | `source/decisions-and-changes.md`, section C | What was built and deployed after the PRD, including values that replace PRD values |

The fourth input is the running product: the code on branch `cursor/markdown-kb-editor-ecf3` and the deploy at [markdown-kb-editor.vercel.app](https://markdown-kb-editor.vercel.app). Specs for built features are written from the code and checked against the deploy.

## 2. What the review found

The PRD is strong on intent, flows, and the data model. The work to make it SDD-ready falls into four groups.

### 2.1 The PRD lost its tables when it was pasted

Every table in the source arrived as one cell per line: the comparison of tools, success metrics, concepts, types, syntax, tools, REST routes, validation rules, roles, stack, design tokens, shortcuts, build plan, and risks. Phase 0 rebuilds them as Markdown tables and checks each cell against the original.

### 2.2 Later instructions replace some PRD values

Each row becomes an architecture decision record (ADR). The recommended outcome is the newer instruction, since it was given later and is already live.

| Topic | PRD says | Now | Source |
| --- | --- | --- | --- |
| Name and routes | Ledger, space Memento at `/memento` | markdown-kb, pages at `/docs/…` with no space segment | D6 |
| Sign-in and roles | Better Auth, four roles, sessions | No auth. Roles kept as the target for later | D3, D7 |
| Storage | Postgres revisions, server drafts every 2 s | Files in `content/`, read at build time. Drafts in browser `localStorage` | D2, D5 |
| Editor model | CodeMirror live preview inline. ⌘/ shows raw source. E edits | Source beside a preview, called editing. ⌘/ and the Edit button turn editing on and off. Preview is the default | C2, C8 |
| Reading type | 16px, 1.6 line height, 720px | 17px, 1.7 line height, about 66 characters | C4 |
| Surfaces | Hairline 1px borders, no shadows | Solid fills, borders removed | C2 |
| Radius | 6px controls, 8px panels | 12px controls, 18px blocks, 20px dialogs | C5 |
| Right panel | Properties, backlinks, history, outline | Outline only, full-height third column | C7 |
| Modals | Confirmations for irreversible actions only | Settings window, share sheet, search palette, and shortcut help are dialogs | C6, C8 |
| Sharing | Email invites with a role, public read link per space, off by default | "Anyone with the link" share sheet. Can view and Can edit set the starting mode and grant no rights | C8 |
| Phones | Responsive, read-mostly | Readable, and editing works on phones | C4 |

### 2.3 Gaps and ambiguities an implementer would hit

Each item becomes a requirement with a stated rule. The spec for its feature owns the answer.

**File format and types**
- Slug derivation from a title: character set, transliteration, collisions, and the upper length limit.
- Filename patterns: the placeholders allowed besides `{date}` and `{slug}`, and what an edit to `date` does to the path.
- `space.md`, `agents.md`, and schema files have no frontmatter spec. `type: schema` is outside the six types, and `type_unknown` would reject it.
- There is no meta-schema for type schema files, so a broken schema file has no defined error.
- `required_when` grammar: only equality on one field is shown.

**Links and versions**
- `[[slug@7]]` resolves to the first revision saved with `version: 7`. Later saves that keep version 7 only raise the `version_not_bumped` warning, so the pinned target silently differs from the current v7 text.
- Rename is human-only, with no flow and no rule for the links pointing at the old slug.
- Links to an archived document: broken, or still valid.
- Embeds stop at three levels. What the reader sees at the limit, and when a cycle is found, is unstated.

**Proposals and merge**
- `edits: [{find, replace}]` with zero matches or several matches.
- Three-way merge of frontmatter: YAML key order, lists, and whether a merge works on text lines or on fields.
- "Align blocks by position and similarity" needs a similarity measure and a threshold.
- `C` means New document globally and Request changes in review. `E` means Edit and Edit before merge. The keymap needs scopes.
- Rate limits are per key. Grants from OAuth need the same limits stated.

**Metrics**
- An eval's `baseline` is a harness link, while the chart draws the baseline as a line with a value. The value's source is undefined: the mean of the baseline harness's concluded experiments, or the latest one.
- "Delta vs baseline" and the ▲▼ in the property header depend on that same value.
- Repeated experiments on the same date and harness: plotted separately or combined.

**Agents**
- "Under 6k tokens" for `get_context` has no tokenizer and no trimming order.
- `search` score has no ranking formula beyond "title match, then recency".

**Everything else**
- History restore: a new revision, validated against today's schema or the one at the time.
- Ticking a task in view mode saves a revision. The commit message and the roles allowed are unstated.
- Import is all-or-nothing per file, while the batch outcome is unstated.
- "Export and re-import yields identical files": byte-identical, including line endings and key order.
- "Never hard-deleted" has no path for a legal deletion request.
- Performance targets lack percentiles and a test environment: 2 s to the Inbox, under 100 ms search, under 10 s per agent flow.
- Accessibility says keyboard-only. The WCAG level, contrast, focus order, and screen reader behavior are unstated.
- The success metrics need an event or query definition for each, so they can be measured.
- Errors, loading, and empty states are defined for the Inbox only.

### 2.4 PRD open questions

The six open questions stay open until answered. Two now have partial answers: the name is markdown-kb for now (D6), and editors save directly (D7). The rest stay as tracked questions, each with an owner and the specs it blocks.

## 3. Target structure

Specs live in `specs/`, outside `content/`, so they are versioned with the code and never published on the site.

```text
specs/
  PLAN.md                     this plan
  README.md                   index, status of every feature, how to use the specs
  constitution.md             principles as testable rules
  glossary.md                 every noun, one definition each
  source/                     the fixed inputs (PRD, decisions, change log)
  decisions/                  ADR-0001-name.md … one per resolved conflict or gap
  requirements-inventory.md   every atomic requirement, with source and status
  traceability.md             requirement → spec → task → test
  contracts/
    frontmatter/*.schema.json one JSON Schema per built-in type
    type-schema.schema.json   the meta-schema for .ledger/types files
    mcp-tools.json            input and output schema for the ten tools
    rest.openapi.yaml         /api/v1
    errors.md                 the validation code catalog
    keymap.md                 every shortcut, with its scope
    tokens.md                 color, type, radius, spacing, motion, breakpoints
    db.sql                    tables, keys, indexes, invariants as constraints
  features/
    F01-file-format/
      spec.md                 what and why: stories, requirements, acceptance
      design.md               how: data, state, components, contracts used
      tasks.md                ordered, testable steps traced to requirement IDs
    F02-…/
```

## 4. Feature breakdown

Twenty-two feature specs, plus cross-cutting requirements. Status is against the code today. Order follows the scoping answers: editor and reading first, then storage, then agents and review.

| ID | Feature | PRD sections | Status | Depends on |
| --- | --- | --- | --- | --- |
| F01 | File format: folder layout, frontmatter, slugs, filename patterns, `.ledger/` | Markdown format | Partly built: files in `content/`, frontmatter parsing | none |
| F02 | Type schemas, field kinds, the six built-in types | Document types, Custom types | Not started | F01 |
| F03 | Links, versioned links, backlinks, embeds | Links, Versioned references | Partly built: `[[slug]]`, `#Heading`, `![[embed]]` | F01, F07 |
| F04 | Rendering and Markdown capabilities | Markdown capabilities | Mostly built: GFM, callouts, Shiki, KaTeX, Mermaid, CSV, footnotes, highlight, safe HTML | F01 |
| F05 | Charts: Vega-Lite, inline and CSV data, metrics data, export | Charts | Partly built: inline data | F04, F16 |
| F06 | Validation engine and rule catalog | Validation | Not started | F02, F03 |
| F07 | Storage: documents, revisions, drafts, invariants | Architecture and data model | Not started: files and `localStorage` only | F01 |
| F08 | Reading shell: three columns, file sidebar, outline, document view, readability | UI and screens, Document view | Built | F04 |
| F09 | Editing: on and off, source editor, frontmatter form, slash menu, saving, conflicts | Editor | Partly built: editing mode, local drafts | F07, F06 |
| F10 | Settings and theme | Design language | Built | F08 |
| F11 | Sharing and access: page link, invites, public space link | Sharing | Partly built: page link | F15 |
| F12 | Proposals and review: Inbox, diff engine, merge, conflicts | Proposals and review | Not started | F06, F07 |
| F13 | Agent access: MCP server, ten tools, REST, keys, limits, errors | MCP server and API | Not started | F06, F12 |
| F14 | OAuth 2.1 for assistants | OAuth for MCP | Not started | F13, F15 |
| F15 | Human sign-in, roles, permissions, audit | Auth, permissions and sharing | Not started | F07 |
| F16 | Metrics: points on merge, Metrics screen, comparison | Measurement layer | Not started | F07, F12 |
| F17 | Search and command palette | Search | Partly built: page search on ⌘K | F07 |
| F18 | History and Timeline | Screens, History | Not started | F07 |
| F19 | Import, export, backup | Import, Export, Backup | Not started | F06, F07 |
| F20 | Keyboard and interaction rules | Interaction rules, Keyboard shortcuts | Partly built: ⌘K, ⌘/, ⌘\, ⌘S, ⌘, and ? | all screens |
| F21 | Design language and tokens | Design language | Built, with values from C2–C7 | none |
| F22 | Space home, seeding Memento, empty states, onboarding | Setting up Memento, Empty states | Not started | F02, F07 |
| X | Cross-cutting: performance, accessibility, security, privacy, observability, success-metric instrumentation, deployment | Spread across the PRD | Partly built: deploy, sanitizing, Mermaid strict | all |

## 5. Spec format

Every `spec.md` uses the same sections, so a reviewer and an agent can find things in the same place.

1. **Summary.** Two sentences on what the feature is for.
2. **Status and scope.** Built, partly built, or not started. What this spec covers and what it leaves to another spec.
3. **Users and stories.** "As the owner, I want… so that…", each with an ID.
4. **Requirements.** Numbered, one behavior each, written in EARS form so each has a trigger and a response:
   - Always: "The system shall…"
   - Event: "When [trigger], the system shall…"
   - State: "While [state], the system shall…"
   - Unwanted: "If [condition], then the system shall…"
   - Optional: "Where [feature is on], the system shall…"
5. **Acceptance scenarios.** Given, When, Then, one or more per requirement. These become test names.
6. **Edge cases and errors.** Every input outside the happy path, with the exact error code and message.
7. **Limits and budgets.** Numbers with units, percentiles, and the environment they are measured in.
8. **UI states.** Empty, loading, error, partial, success, and each breakpoint, with the copy for each.
9. **Out of scope.** What this feature leaves alone.
10. **Open questions.** Each with an owner and what it blocks.
11. **Trace.** PRD section and line, decision IDs, change IDs, and ADRs.

IDs are stable and never reused: `F12-REQ-014`, `F12-AC-014a`, `ADR-0007`. A removed requirement is marked removed, with the ADR that removed it.

`design.md` names the modules, data shapes, state, and contracts a feature uses, and links to files in `contracts/`. `tasks.md` lists small steps in dependency order. Each step names the requirement IDs it satisfies and the test that proves it. Tasks carry a size by the parts they touch (one module, several modules, schema change), without calendar estimates.

### Example: one PRD sentence, rewritten

PRD: "Proposals left open for 30 days are marked stale but stay open."

- `F12-REQ-031` While a proposal's status is `open` or `changes_requested` and 30 days (720 hours) have passed since its last update, the system shall show it as stale in the Inbox and on the proposal screen.
- `F12-REQ-032` When a stale proposal is updated through `update_proposal`, the system shall clear the stale mark and restart the 30-day count.
- `F12-REQ-033` The system shall keep stale proposals in the open count and let reviewers merge, reject, or request changes on them like any open proposal.
- `F12-AC-031a` Given a proposal last updated 30 days and 1 minute ago, when the owner opens the Inbox, then its row shows "Stale" beside the status dot.
- Open question: whether "last update" counts reviewer notes. Recommended answer: it counts only changes by the author.

## 6. Phases

Each phase ends with a check that decides whether the next phase starts.

### Phase 0: Fix the sources

- Rebuild every flattened PRD table in `source/ledger-prd.md` and add line anchors.
- Keep the original text beside it, so every change to the source is visible in a diff.
- Update the README, which still says "Split beside the source with ⌘/" and "a reading measure near 720px".

Check: every PRD table renders, and a side-by-side read shows no cell lost.

### Phase 1: Requirements inventory

- Split the PRD into atomic statements, each one testable behavior, constraint, or principle. The PRD holds several hundred.
- Give each statement an ID, its source line, a kind (functional, non-functional, constraint, principle, example), a feature (F01–F22 or X), and its status in the code: built, partly built, not started, deferred, or replaced.
- Add each change request and scoping answer as its own statement.
- Flag conflicts from section 2.2 and gaps from section 2.3 on the statements they touch.

Check: every PRD sentence maps to at least one statement or is marked as narrative. Each of the 18 PRD acceptance criteria maps to a feature.

### Phase 2: Decisions

- Write one ADR per conflict in section 2.2 and per gap in section 2.3 that changes behavior. Each ADR gives context, options, the decision, and what it replaces.
- Collect the questions only the owner can answer (section 7) into one list with a recommended answer for each.

Check: no statement in the inventory is both in conflict and without an ADR.

### Phase 3: Foundations

- `constitution.md`: the seven PRD principles, the SDD rules (spec first, IDs are stable, every task traces to a requirement), and the standing direction from D: readability first, Cursor-grade craft. Each principle gets a check a reviewer can apply, such as "no endpoint, tool, or OAuth scope can merge, delete, or administer".
- `glossary.md`: space, document, revision, proposal, agent key, grant, draft, head, base, pinned link, metric point, editing, viewing, and each status value.
- `contracts/tokens.md` from the built CSS: colors for both themes, type scale, radii, spacing, column widths (248px files, 220px outline), breakpoints (860px shell, 900px split, 640px and 420px column), motion.
- `contracts/keymap.md` with scopes: global, document, editor, review, dialog.

Check: every noun used in a spec is in the glossary, and every token in the CSS is in `tokens.md`.

### Phase 4: As-built specs

Write F04, F08, F10, F20, F21, and the built parts of F03, F09, F11, F17 from the code. Record current behavior exactly, including the numbers in section 2.2. Check each requirement against the production deploy on desktop and on a 390px phone.

Check: every requirement in these specs passes in the browser, and every acceptance scenario has a test name, automated or listed for a manual check.

### Phase 5: Specs for what comes next

Write the remaining specs in dependency order:

1. F01, F02, F06, then `contracts/frontmatter`, `type-schema.schema.json`, and `errors.md`. The validator is pure and the PRD asks for heavy unit tests, so its rule catalog is exact: code, condition, severity, field or line, message, and hint for all 18 rules and the 4 rendering checks.
2. F07 and `contracts/db.sql`, with the six invariants as constraints or tests.
3. F09 (the rest), F17, F18, F19, F05, F16, F22.
4. F15, F11 (the rest), F12, F13, `mcp-tools.json`, `rest.openapi.yaml`, F14.

The scoping answers put the editor and reading first, and sign-in and agents later. This order writes the storage and validation specs before the editor needs them, and writes auth before sharing and agents depend on it.

Check: each spec passes the review checklist in section 8.

### Phase 6: Design and tasks

For each feature spec, write `design.md` and `tasks.md`. Build `traceability.md`, from requirement to task to test. Map the PRD acceptance criteria and success metrics to tests and measurement queries.

Check: every requirement has at least one task and one test. No task lacks a requirement.

### Phase 7: Keep the specs true

- A spec check script in `npm test`: IDs unique, every requirement traced, no dangling ADR or source link, every contract parses (JSON Schema, OpenAPI).
- A pull request that changes behavior also changes its spec. The spec change is reviewed first.
- Superseded requirements stay in place, marked, with the ADR that replaced them.

## 7. Questions for the owner

The plan proceeds with the recommended answer unless the owner picks another.

| # | Question | Recommended answer |
| --- | --- | --- |
| Q1 | Where are the specs going: the full Ledger loop (agents propose, humans merge), or markdown-kb as an editor with Ledger later? | Spec the full Ledger loop. Mark the editor features as the first release |
| Q2 | Which values win where the PRD and the change requests differ (section 2.2)? | The change requests, since they are newer and live |
| Q3 | What does "Can edit" mean once sign-in exists? | Link access stays a starting mode. Edit rights come only from a role, through invites (F11, F15) |
| Q4 | Editor model: source beside a preview, as built, or live preview inline, as in the PRD? | Keep the built editing mode. Spec inline live preview as a later option inside F09 |
| Q5 | Dialogs: keep settings, share, search, and help as dialogs? | Yes. Narrow the PRD rule to "no dialogs for editing or review flows" |
| Q6 | SDD tooling: GitHub Spec Kit commands, Kiro-style requirements, design, and tasks, or plain Markdown in the layout above? | Plain Markdown in the layout above. It maps onto Spec Kit's specify, plan, and tasks steps, and any agent in Cursor can read it |
| Q7 | The six PRD open questions | Keep them open with owners. The name and the save rule are answered by D6 and D7 |

## 8. Review checklist for every spec

- Each requirement is one behavior, in EARS form, with a stable ID.
- Each requirement has at least one Given, When, Then scenario.
- Every number has a unit. Every performance number has a percentile and an environment.
- Every error has a code, a message, and a hint.
- Every screen lists its empty, loading, error, and success states, with copy, at desktop and phone widths.
- Every permission states the roles and credentials allowed, and the response for the others.
- No TBD in a requirement marked for the next release. Unknowns sit in Open questions with an owner.
- The trace lists the PRD lines, decisions, change requests, and ADRs behind the spec.
- Words match the glossary.

## 9. Deliverables

1. `specs/source/` with the PRD tables rebuilt, and the decisions and change log.
2. `requirements-inventory.md` and `traceability.md`.
3. ADRs for every conflict and behavior-changing gap.
4. `constitution.md`, `glossary.md`, and the `contracts/` files.
5. Twenty-two feature folders, each with `spec.md`, `design.md`, and `tasks.md`.
6. The spec check script in the test run.
