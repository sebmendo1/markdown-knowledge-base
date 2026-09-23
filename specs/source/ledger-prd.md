Ledger — Product Requirements
Sep 22, 2026 · @Sebastian
Summary
Ledger (working name) is a Markdown knowledge base where agents propose changes and humans merge them. It is GitHub for knowledge, with no AI inside the product. The first space is Memento: every harness version, eval, experiment, finding and decision lives here, so Memento's performance can be measured over time.
Agents in Cursor, Claude Code, Grokbot, consumer assistants like Claude, ChatGPT and Meta Muse, or any MCP client read context from Ledger and submit proposals. Nothing lands until a person reviews and merges it. That review gate, plus typed Markdown files, is what keeps the knowledge base free of slop.
Product principles
1. Everything is Markdown. Every document is a .md file with YAML frontmatter. Type schemas, templates, space settings and agent instructions are Markdown too. Export produces the exact same folder of files.
2. No AI in the product. Ledger never generates, rewrites or summarizes. It stores, validates, diffs, versions and displays. Intelligence lives in the agents people bring.
3. Agents propose, humans merge. Agents have no merge, delete or admin tools. A missing merge tool is the entire anti-slop policy.
4. Structure over pages. Six document types with required fields make knowledge queryable. Experiments feed metrics automatically.
5. History is the product. Every change is an immutable revision. Change over time is a first-class view, not an afterthought.
6. Simple beats complete. One way to do each thing. If a feature needs a manual, cut it.
7. Keyboard-first, Cursor-grade craft. Dark, dense, fast, quiet. Every core action has a shortcut.
Problem, users and goals
Memento experiments are scattered across Claude artifacts, with no single place to store them and no way to compare results across harness versions. Existing tools miss in specific ways:
Tool
Why it doesn't fit
Notion
Too many features, weak structure for experiments, paid plan doesn't justify itself
Obsidian
Personal-first; weak sharing and no review flow
GitBook, Mintlify
Built for outward-facing product docs; moving toward AI editing inside the product
OpenKnowledge
AI-native editing; the opposite of this product's thesis
Claude artifacts
No structure, no history, no cross-experiment comparison
Users
• Owner (v1: Sebastian). Runs experiments, reviews proposals, reads trends, makes decisions.
• Agents. Cursor, Claude Code, Grokbot and eval scripts. They read context and propose documents.
• Collaborators (v1.1). People invited to a space to read, propose or edit.
Goals for v1
1. One home for all Memento experiment knowledge, replacing artifacts as the source of truth.
2. Any MCP agent can log an experiment in one tool call, without GitHub or a CLI, including phone assistants connected by OAuth.
3. Reviewing a proposal takes under two minutes.
4. A chart shows each Memento metric over time, split by harness version.
5. Agents can pull a compact context pack at the start of any session.
Non-goals
• AI writing, summarizing, chat or search-by-embedding inside the product
• Real-time multiplayer editing
• Notion-style databases, kanban boards or page builders
• Public documentation sites or custom domains
• Plugins, integrations marketplace or webhooks out (v1)
• Native mobile apps; the web app is responsive and read-mostly on phones
Success metrics
Metric
Target after 30 days
New Memento experiments recorded in Ledger
100%
Experiments arriving via agent proposals
80% or more
Median time from proposal to merge or reject
Under 2 minutes of review time
Proposals failing validation after agents read the guide
Under 10%
External builders using a space weekly (optional product signal)
5
Core concepts
Ledger has five nouns: space, document, revision, proposal and agent key. Everything else is a view over them.
Concept
What it is
Rules
Space
A top-level knowledge base, e.g. "Memento"
Has members, agent keys, types and settings. URL: /memento
Document
One Markdown file at a path, e.g. experiments/2026-09-22-context-window.md
Has a type from its frontmatter. Never hard-deleted; archived instead
Revision
An immutable snapshot of a document's full content
Created only by a human save or a merged proposal. Has author, message, parent
Proposal
A suggested create or update, waiting for review
Created by agents or contributors. Merged, rejected or withdrawn
Agent key
A credential an agent uses to read and propose
Scoped to one space. Cannot merge, delete or administer
Document types
Six built-in types cover the experiment lifecycle. The first five link together; the last is free-form.
Type
Purpose
Example
harness
A versioned agent setup: model, context strategy, tools, prompts
Memento journal harness v7
eval
A repeatable test with defined metrics, units and direction
Summary faithfulness eval v2
experiment
One run of an eval against a harness version, with results
Context window 4k vs 8k, Sep 22
finding
A durable conclusion backed by linked experiments
"Summaries degrade past N turns"
decision
A choice made, and the findings behind it
Ship harness v7 for launch
doc
Anything else: architecture, notes, specs, ideas
How Memento's recording pipeline works
flowchart LR
  H[harness@v7] --> E[experiment]
  V[eval@v2] --> E
  E -->|evidence| F[finding]
  F -->|based on| D[decision]
  D -->|changes| H
The loop reads left to right: an experiment runs an eval against a harness version, findings cite experiments, decisions cite findings, and decisions produce the next harness version.
Versioned references
Harnesses and evals carry a version number in frontmatter. A link like [[memento-journal@7]] resolves to the revision where version: 7 was first saved. This lets experiments point at the exact setup they ran on, even after the harness moves on.
Custom types
A space can add types by adding a schema file (see Markdown format). v1 ships the six built-ins as editable schema files, so custom types need no code.
Markdown format
A space is a folder of Markdown files. The database stores revisions of these files, but the file format is the contract: import, export, the editor and the MCP server all speak it.
Folder layout
memento/
  .ledger/
    space.md              # name, description, default harness, conventions
    agents.md             # instructions every agent reads first
    types/
      harness.md          # schema + writing guidance per type
      eval.md
      experiment.md
      finding.md
      decision.md
      doc.md
  harnesses/memento-journal.md
  evals/summary-faithfulness.md
  experiments/2026-09-22-context-window-8k.md
  findings/summaries-degrade-long-context.md
  decisions/ship-harness-v7.md
  docs/recording-pipeline.md
  assets/2026-09-22-latency-trace.png
Rules: file name = slug (lowercase, hyphens, unique in the space). Each type has a default folder, set in its schema. Experiments are prefixed with their date. Folders beyond the type folders are allowed for doc files.
Frontmatter per type
Every file starts with YAML frontmatter. type and title are always required.
Harness
---
type: harness
title: Memento journal harness
version: 7
status: active            # draft | active | retired
model: Apple Foundation Model (on-device)
parent: "[[memento-journal@6]]"
changes: Moved summaries to rolling 8k context window
---
## Context strategy
## Prompts
## Tools
## Known limits
Eval
---
type: eval
title: Summary faithfulness
version: 2
status: active            # draft | active | retired
baseline: "[[memento-journal@5]]"
metrics:
  - key: faithfulness
    unit: score
    range: [0, 1]
    better: higher
  - key: latency_ms
    unit: ms
    better: lower
---
## What it measures
## Dataset
## Scoring method
## How to run
Experiment
---
type: experiment
title: Context window 8k vs 4k
date: 2026-09-22
status: concluded         # planned | running | concluded | abandoned
hypothesis: An 8k rolling window improves faithfulness without doubling latency
harness: "[[memento-journal@7]]"
eval: "[[summary-faithfulness@2]]"
environment: iPhone 16 Pro, iOS 27.0
sample_size: 40
results:
  faithfulness: 0.82
  latency_ms: 420
verdict: supported        # supported | refuted | inconclusive
---
## Setup
## Observations
## Surprises
## Next
Finding
---
type: finding
title: Summaries degrade past 30 journal turns
status: current           # current | superseded | disputed
confidence: medium        # low | medium | high
evidence:
  - "[[2026-09-22-context-window-8k]]"
  - "[[2026-09-18-long-session-stress]]"
supersedes: null
---
## Claim
## Evidence summary
## Caveats
Decision
---
type: decision
title: Ship harness v7 for App Store launch
date: 2026-09-24
status: accepted          # proposed | accepted | reversed
based_on:
  - "[[summaries-degrade-long-context]]"
results_in: "[[memento-journal@7]]"
---
## Decision
## Why
## Alternatives considered
## Revisit when
Doc: only type: doc and title. Optional tags list.
The example values above are illustrations of the format, not real Memento results.
Type schemas are Markdown too
Each file in .ledger/types/ defines a type. Its frontmatter is the schema; its body is writing guidance that agents receive with the template.
---
type: schema
name: experiment
folder: experiments
filename: "{date}-{slug}"
fields:
  title:       { kind: string, required: true, max: 120 }
  date:        { kind: date, required: true }
  status:      { kind: enum, values: [planned, running, concluded, abandoned], required: true }
  hypothesis:  { kind: string, required: true }
  harness:     { kind: link, to: harness, pinned: true, required: true }
  eval:        { kind: link, to: eval, pinned: true, required: true }
  environment: { kind: string }
  sample_size: { kind: number, min: 1 }
  results:     { kind: metrics, from: eval }
  verdict:     { kind: enum, values: [supported, refuted, inconclusive], required_when: { status: concluded } }
sections: [Setup, Observations, Surprises, Next]
---
Write one experiment per file. State the hypothesis before results.
Report every metric the eval defines, even when it got worse.
Field kinds in v1: string, number, date, enum, boolean, list, link, links, metrics. pinned: true requires a @version on the link. metrics means keys must match the linked eval's metric keys.
Links
• [[slug]] links to a document's latest revision.
• [[slug@7]] links to a harness or eval at a specific version.
• [[slug#Heading]] links to a section.
• Links work in frontmatter strings and in the body. Broken links render red and fail validation in frontmatter.
• Backlinks are computed on merge and shown on every document.
space.md and agents.md
space.md holds the space's name, one-paragraph purpose and the current default harness and eval. agents.md is the rulebook agents receive through get_context: what to log, naming, what not to do. Both are ordinary documents, versioned and editable like anything else.
Usage patterns
Eight flows define v1. If these feel effortless, the product works.
1. An agent logs an experiment
The most frequent flow. Target: one sentence from the user, one proposal, under 10 seconds.
sequenceDiagram
  participant U as You (in Cursor)
  participant A as Agent
  participant L as Ledger MCP
  participant R as Ledger inbox
  U->>A: Log this run to Ledger
  A->>L: get_template(experiment)
  A->>L: search(harness active)
  A->>L: propose_change(create, content)
  L-->>A: proposal #42, valid
  L->>R: New proposal appears
If validation fails, propose_change returns structured errors and the agent fixes and resubmits. Nothing invalid ever reaches the inbox.
2. You review and merge
1. Inbox badge shows 1 new proposal. Press G I.
2. Open it: rendered diff, frontmatter table, validation status, agent name.
3. Press M to merge, R to reject with a reason, or C to request changes with a note.
4. On merge, a revision is created, links and metrics update, and the next proposal opens.
3. You write or edit directly
Owners and editors edit in place, like a doc. ⌘S saves a revision with an optional message. Humans go through the same validation, but may save a doc with warnings.
4. An agent starts a session with context
An agent calls get_context once. It receives agents.md, the active harness, active evals, current findings, recent decisions and the last 10 experiments. This is roughly 2–6k tokens, trimmed to titles and frontmatter. The agent starts informed without reading the whole space.
5. You check whether Memento is getting better
Open Metrics, pick an eval and a metric. The chart shows every concluded experiment over time, colored by harness version, with the baseline as a dashed line. Click a point to open that experiment.
6. You distill a finding
From an experiment, press ⌘⇧F for New finding from this. The editor opens with the experiment pre-linked as evidence. Later experiments can cite or dispute it; superseding creates a visible chain.
7. You bring in existing work
Drag a folder of .md files onto the space to import them as revisions. For Claude artifacts or HTML, an agent converts them outside Ledger and submits proposals. Ledger never converts content itself.
8. You capture an idea from your phone
While away from your desk, you tell Claude, ChatGPT or Muse to log an observation to Memento. The assistant calls get_template, then propose_change. The proposal waits in the Inbox, and you merge or expand it later. Observations get recorded when they happen instead of being reconstructed from memory.
UI and screens
The app is a three-pane layout: sidebar, main content, and an optional right panel for properties, backlinks and history. There are eight screens in v1.
Layout
┌──────────────┬──────────────────────────────────┬───────────────┐
│ Space ▾      │  experiments / context-window-8k │ Properties    │
│ ⌘K Search    │                                  │ status  ●conc │
│ Inbox    3   │  Context window 8k vs 4k         │ harness v7 →  │
│ Timeline     │  ─────────────────────────────   │ eval v2 →     │
│ Metrics      │  ## Setup                        │ faith  0.82 ▲ │
│              │  …                               │ latency 420 ▼ │
│ HARNESSES    │                                  │ ───────────── │
│ EVALS        │                                  │ Backlinks (2) │
│ EXPERIMENTS  │                                  │ History (4)   │
│ FINDINGS     │                                  │               │
│ DECISIONS    │                                  │               │
│ DOCS         │                                  │               │
└──────────────┴──────────────────────────────────┴───────────────┘
Screens
Screen
Route
Purpose
Key contents
Space home
/memento
Orientation
space.md rendered, active harness card, latest 5 experiments, open proposals count, current findings
Document
/memento/experiments/…
Read and edit
Title, property header, body, right panel. Click or E to edit
Inbox
/memento/inbox
Review queue
Proposals: agent, action, document, summary, validation, age. Filters: open, changes requested, closed
Proposal
/memento/inbox/42
Review one change
Rendered diff, frontmatter diff, validation, rationale, actions
History
/memento/…/history
Change over time for one doc
Revision list; compare any two; restore
Timeline
/memento/timeline
What changed in the space
Merged revisions grouped by day, filter by type and author
Metrics
/memento/metrics
Is it getting better?
Eval and metric pickers, line chart, harness comparison table
Settings
/memento/settings
Admin
Members, agent keys, types, import and export
Sidebar
• Space switcher at top, then Search, Inbox (with open count), Timeline, Metrics.
• One collapsible group per type, sorted newest first. Experiments show a status dot.
• doc files appear as a folder tree under Docs.
• A + on each group creates a document from that type's template.
Document view
• Property header: frontmatter rendered as a compact two-column list. Links render as chips; metrics show value and a ▲ or ▼ against the eval's baseline, colored by the metric's better direction.
• Body: rendered Markdown, max width 720px, headings with anchor links.
• Right panel (toggle ⌘\): properties, backlinks grouped by type, last 5 revisions with authors.
• Harness page extras: version list, each version linking to its experiments.
• Eval page extras: small metric chart and a table of experiments using it.
• Finding page extras: evidence list with each experiment's verdict; supersedes chain.
Empty states
Every empty screen teaches the model in one line and gives one action. Example for Inbox: "No proposals. Connect an agent in Settings → Agent keys." No illustrations.
Editor
The editor is CodeMirror 6 with live preview, in the style of Obsidian and Cursor. The Markdown source is always the truth; the editor never rewrites text the user didn't touch. This keeps diffs clean.
Behavior
• Live preview: headings, bold, links and lists render inline; syntax reveals on the line with the cursor. Toggle raw source with ⌘/.
• Frontmatter as a form: the property header becomes editable fields generated from the type schema. Enums are dropdowns, links are pickers, dates are date inputs. Editing a field writes YAML; toggling raw source shows the YAML directly.
• Links: typing [[ opens a picker of documents, with @ to choose a version for harnesses and evals.
• Slash menu: / inserts structure only: headings, table, code block, callout, checklist, image, link. No AI items.
• Images: paste or drop to upload into assets/; inserts a standard Markdown image link.
• Tables: GitHub-flavored Markdown tables with tab navigation between cells.
• Code: fenced blocks with syntax highlighting.
Saving
• Drafts autosave every 2 seconds to the server as an unsaved draft, private to the author. Leaving and returning restores the draft.
• ⌘S validates, then opens a one-line commit message field (optional; Enter to skip). Saving creates a revision.
• If validation has errors, the save is blocked and errors show inline next to the field or line.
• Contributors (propose-only humans) see Propose instead of Save; it creates a proposal.
Conflicts
If another revision lands while you are editing, a banner appears: "This document changed. Review changes." Saving then runs a three-way merge. Clean merges save with a note; conflicts open a side-by-side resolver with your version, theirs and the base.
New documents
C or + opens a type picker. The template from the type schema fills the body and the frontmatter form. Required fields are highlighted until filled. The file name is generated from the schema's filename pattern and editable.
Markdown capabilities
Ledger renders everything GitHub-flavored Markdown renders, plus math, Mermaid diagrams, live charts and embeds. Every feature uses standard or widely adopted syntax, so files stay portable and agents already know how to write them.
Supported syntax
Capability
Syntax
Notes
Core Markdown
Headings, bold, italic, lists, links, images, blockquotes, rules
CommonMark baseline
Tables
GFM pipe tables with column alignment
Horizontally scrollable on narrow screens
Task lists
- [ ] and - [x]
Editors can tick them in view mode; each tick saves a revision
Strikethrough, autolinks
~~text~~, bare URLs
GFM
Footnotes
text[^1] and [^1]: note
Hover preview, back-links
Callouts
> [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
GitHub alert syntax, so they render on GitHub too
Code
Fenced blocks with a language
Shiki highlighting, copy button, diff language, line highlights like {3-5}
Math
$inline$, $$ blocks, or a math fence
KaTeX, rendered on the server
Diagrams
mermaid fence
Every Mermaid diagram type: flowchart, sequence, class, state, ER, Gantt, journey, pie, quadrant, XY chart, timeline, mindmap, gitgraph, Sankey, block, architecture
Charts
chart fence with a Vega-Lite spec in YAML or JSON
Any Vega-Lite chart; data inline, from a space CSV, or live from metrics
Data tables
csv or tsv fence
Rendered as a sortable table
Highlight, sub, sup
==text==, ~sub~, ^sup^

Emoji
:rocket: shortcodes

Wiki links
[[slug]], [[slug@7]], [[slug#Heading]]
See Markdown format
Embeds
![[slug]], ![[slug#Heading]], ![[slug@7]]
Live transclusion of another document or section, with a link to its source
Media
![alt](assets/file.png); links to .mp4 or .webm in assets/
Images zoom on click; video gets a player
Safe HTML
<details>, <summary>, <kbd>, <sub>, <sup>, <mark>, <br>, <img width>
All other HTML is stripped
Outline
Automatic from headings
Shown in the right panel; no syntax needed
Planned for v1.1: Graphviz dot diagrams, geojson and topojson maps, and stl 3D models, matching what GitHub renders.
Charts
Charts use one standard: Vega-Lite, a declarative spec that is portable and well known to agents. A chart can take data from three sources: inline values, a CSV file in assets/, or a live metrics query against the space.
title: Faithfulness by harness version
data:
  metrics: { eval: summary-faithfulness@2, metric: faithfulness }
mark: { type: line, point: true }
encoding:
  x: { field: date, type: temporal }
  y: { field: value, type: quantitative }
  color: { field: harness_version, type: nominal }
• Metrics-backed charts update whenever a new experiment merges. Any finding or decision can embed the live evidence chart behind it.
• Metrics queries return the metric point fields: date, value, harness, harness_version, eval_version, environment, sample_size, verdict, experiment.
• Every chart type Vega-Lite supports works: line, bar, area, scatter, stacked, grouped, histogram, heatmap, box plot, layered and faceted charts.
• Charts get tooltips, theme colors from the app's tokens, and a menu to export PNG or SVG.
• External data URLs are not allowed. Data comes only from inline values, space assets or metrics.
Editor support
• Live preview renders diagrams, charts and math inline. Moving the cursor into a block reveals its source with a live preview underneath.
• Render errors show inline with the line number and the parser's message; the last good render stays visible above.
• The slash menu inserts starters for each Mermaid diagram type, charts (from metrics, from a CSV, or from a selected table), math, callouts, footnotes, CSV blocks, embeds and <details>.
• Chart from table converts a selected Markdown table into a chart block with the values inline. It is a deterministic transform, not AI.
In review
• A changed diagram or chart renders before and after side by side, with the source diff underneath.
• Math, callouts and embeds render inside the rendered diff.
Performance and safety
• KaTeX and Shiki render on the server. Mermaid and Vega-Lite render in the browser, lazy-loaded only on pages that use them, with the rendered SVG cached by content hash.
• Mermaid runs with its strict security level. Chart specs are validated against the Vega-Lite schema and a data-source allowlist.
• Embeds resolve at most three levels deep and never loop.
Portability
On GitHub, tables, task lists, footnotes, callouts, math and Mermaid render natively. chart blocks and embeds show as plain source, which stays readable. Export can optionally add a static SVG snapshot under each chart for tools that can't render them.
Proposals and review
A proposal is a suggested create or update against a specific base revision. Review is the product's signature experience, so it gets the most design care.
Proposal lifecycle
stateDiagram-v2
  [*] --> open: propose_change (valid)
  open --> changes_requested: reviewer requests changes
  changes_requested --> open: update_proposal
  open --> merged: reviewer merges
  open --> rejected: reviewer rejects
  open --> withdrawn: author withdraws
  changes_requested --> rejected
  merged --> [*]
  rejected --> [*]
  withdrawn --> [*]
Invalid submissions never create a proposal; the caller gets errors instead. Proposals left open for 30 days are marked stale but stay open.
What a proposal contains
Field
Notes
action
create or update in v1. Rename, archive and delete are human-only
path
Target file path
base_revision_id
Required for updates: the revision the agent read
content
Full new Markdown, or
edits
A list of {find, replace} pairs applied to the base (for small changes)
summary
One line, required, max 120 characters
rationale
Optional paragraph: why this change
Author
Agent key label and owning user, or a human contributor
Review screen
• Header: summary, author with agent glyph, action, target path, age, validation badge.
• Rendered diff (default): the document rendered as it will look, with word-level insertions highlighted green and deletions struck red. Unchanged sections collapse to one line, expandable.
• Source diff (D to toggle): line-level Markdown diff for precise checking.
• Frontmatter diff: a table of changed fields: field, before, after. Metric changes show the delta.
• New documents: shown fully rendered with a "new" tag, not as a diff.
• Rationale: shown under the header when present.
• Actions: Merge (M), Request changes (C, requires a note), Reject (R, optional reason), Next (J), Previous (K), Edit before merge (E).
Edit before merge lets the reviewer fix a typo in the proposal and merge in one step. The revision records both the agent and the reviewer.
Diff engine
Parse both versions into Markdown blocks with remark, align blocks by position and similarity, then run a word-level diff within changed blocks. This gives prose-readable diffs instead of GitHub-style line diffs.
Merge and conflicts
1. If base_revision_id equals the current head, merge directly.
2. If not, run a three-way merge of base, head and proposal.
3. A clean merge shows a notice "Rebased onto latest" and merges normally.
4. A conflict marks the proposal conflicted. The reviewer resolves side by side, or requests changes so the agent re-reads and resubmits.
On merge
In one database transaction: create the revision, move the document head, recompute links and backlinks, write metric points for experiments, and log an audit event. The agent sees merged through get_proposal.
MCP server and API
Ledger hosts a remote MCP server at /api/mcp using the official MCP TypeScript SDK with Streamable HTTP transport. Agents connect with a URL and either an API key or an OAuth sign-in; no CLI, no GitHub. A REST API mirrors the same operations for scripts.
Connecting an agent
{
  "mcpServers": {
    "ledger": {
      "url": "https://ledger.example.com/api/mcp",
      "headers": { "Authorization": "Bearer lk_memento_…" }
    }
  }
}
Settings → Agent keys shows this snippet pre-filled, with copy buttons for Cursor, Claude Code and a generic client.
Connecting assistants
One endpoint serves every client. Developer tools use API keys in headers; consumer assistants use OAuth, where the user pastes the URL, signs in to Ledger and approves scopes. Both paths reach the same ten tools.
Client
How it connects
Auth
Cursor
mcp.json with URL and header
API key
Claude Code
claude mcp add with URL and header
API key
Claude (web, desktop, mobile)
Custom connector with the MCP URL
OAuth
ChatGPT
Custom connector or developer-mode MCP, where the plan supports it
OAuth
Meta Muse
Custom connector with the MCP URL; directory listing later
OAuth
Grokbot, eval scripts, anything else
REST API or MCP
API key
Settings → Connect shows one card per client with its exact setup steps and a copy button. Client setup flows change often, so each card links to that client's current docs.
OAuth for MCP
• Implements the MCP authorization spec: OAuth 2.1 with PKCE, protected resource metadata at /.well-known/oauth-protected-resource, authorization server metadata, and dynamic client registration.
• Two scopes only, each with a plain-language purpose string for approval screens: read ("Read documents, templates and metrics in this space") and propose ("Suggest new or changed documents for your review; cannot publish anything").
• The consent screen lets the user pick the space and scopes. A grant is always tied to one space.
• Access tokens last 1 hour; refresh tokens last 30 days, rotate on use and are revoked with the grant.
• There is no merge scope, so no assistant can ever be granted publishing power, even by mistake.
Capture from anywhere
Phone assistants turn Ledger into a capture surface. A spoken note becomes a proposal: "Log to Memento that v7 summaries felt repetitive on long entries." The assistant files it as an experiment with status planned or as a doc note, and it waits in the Inbox. Validation still applies, so a vague note gets a structured error the assistant can resolve by asking one follow-up question.
Tools
Ten tools. All of them read, validate or propose; none merge, delete or administer.
Tool
Input
Returns
get_context
{ detail?: "brief" | "full" }
agents.md, active harness, active evals with metric definitions, current findings, accepted decisions, last 10 experiments (frontmatter only)
list_documents
{ type?, status?, limit?: 50, cursor? }
Paths, titles, types, status, updated dates
read_document
{ path | slug, version? }
Markdown, parsed frontmatter, revision_id, backlinks
search
{ query, type?, limit?: 20 }
Hits with path, title, snippet, score
get_template
{ type }
Template Markdown, field schema, writing guidance, filename pattern
validate
{ path, content }
{ valid, errors[], warnings[] } without creating anything
propose_change
{ action, path, content? , edits?, base_revision_id?, summary, rationale? }
{ proposal_id, status, url } or validation errors
get_proposal
{ proposal_id }
Status, reviewer notes, merged revision id
update_proposal
{ proposal_id, content? , edits?, summary? }
Revised proposal; only when changes were requested
get_metrics
{ eval, metric?, harness? }
Time series of metric points with experiment links
The space comes from the key, so tools never take a space argument.
Error format
Every error is structured so agents can self-correct without a human:
{
  "valid": false,
  "errors": [
    { "field": "harness", "code": "link_unpinned",
      "message": "harness link needs a version",
      "hint": "Use [[memento-journal@7]]. Active version is 7." }
  ]
}
Tool descriptions matter
Each tool's description tells agents the workflow: call get_context first, get_template before creating, validate when unsure, one document per proposal, never invent metric values. agents.md repeats these rules in the space owner's own words.
get_context and get_template also return a short syntax reference for callouts, Mermaid, math, embeds and charts, including a metrics-backed chart example. Agents then produce diagrams and charts that render on the first try.
REST API
Same auth header, JSON in and out, under /api/v1.
Method
Path
Maps to
GET
/context
get_context
GET
/documents?type=&status=
list_documents
GET
/documents/{path}
read_document
GET
/search?q=
search
GET
/templates/{type}
get_template
POST
/validate
validate
POST
/proposals
propose_change
GET
/proposals/{id}
get_proposal
PATCH
/proposals/{id}
update_proposal
GET
/metrics?eval=&metric=
get_metrics
This lets Memento's own eval scripts post experiment results directly after a run, with no agent in the loop.
Limits
• 60 requests per minute and 30 proposals per hour per key; 429 with retry-after beyond that.
• Max document size 200 KB. Max 20 open proposals per key.
• A proposal identical to the current head is rejected as no_change.
Validation
Validation is Ledger's quality gate, and it is fully deterministic. The same validator runs on agent proposals, human saves, imports and the validate tool.
Rules
Code
Check
Severity
yaml_invalid
Frontmatter parses as YAML
Error
type_unknown
type matches a schema in .ledger/types/
Error
field_missing
Required fields present, including required_when
Error
field_kind
Value matches kind: date is ISO, number is numeric, enum is allowed
Error
field_unknown
Frontmatter key not in schema
Warning
link_broken
Linked slug exists
Error in frontmatter, warning in body
link_unpinned
Pinned link fields include @version
Error
version_missing
The pinned version exists
Error
metric_unknown
Every results key is defined on the linked eval
Error
metric_missing
Every eval metric is reported when status is concluded
Warning
metric_range
Value falls inside the metric's declared range
Error
path_invalid
Path matches the type's folder and filename pattern
Error
slug_taken
Create doesn't collide with an existing slug
Error
base_missing
Updates include a real base revision
Error
version_not_bumped
Harness or eval content changed without a version increase
Warning
section_missing
Schema sections present as headings
Warning
no_change
Content differs from head
Error
too_large
Under 200 KB
Error
Behavior
• Errors block proposals and saves. Warnings show on the review screen and in the editor, but don't block.
• Every error carries field or line, a code, a plain message and a hint with the likely fix.
• Validation is pure: a function of the content, the type schemas and the space's current documents. Unit-test it heavily.
• Editing a type schema re-validates nothing retroactively. Existing documents stay valid as written; they are checked on their next change.
Rendering checks are warnings in the body, so a broken diagram never blocks a finding: chart_invalid (fails the Vega-Lite schema or uses a disallowed data source), math_invalid, embed_broken, and mermaid_invalid. Chart and math checks run on the server; Mermaid checks run in the editor and on the review screen.
Measurement layer
Metrics come straight from merged experiment frontmatter; nothing is entered twice. When an experiment with status: concluded merges, each results value becomes a metric point.
Metric point
Field
Source
eval, eval version
Experiment's pinned eval link
metric key, unit, better
Eval's metrics definition
value
Experiment's results
harness, harness version
Experiment's pinned harness link
date
Experiment's date
environment, sample size
Experiment frontmatter
experiment, revision
The merged revision
If a concluded experiment is later edited, its points are replaced by the new revision's values. History keeps the old values.
Metrics screen
1. Pickers: eval (defaults to the space's default eval), then metric.
2. Over time chart: x is experiment date, y is the metric. Points are colored by harness version and connected per version. The eval's baseline is a dashed line. Hover shows the experiment title, value and sample size; click opens it.
3. Harness comparison table: one row per harness version with n, mean, median, best, latest, and delta vs baseline. Deltas are green or red according to the metric's better direction.
4. Compare two versions: pick A and B; see every metric side by side with deltas.
Comparability rules
• Results from different eval versions never share a chart line. Changing an eval's method means bumping its version, and the chart splits.
• Experiments with verdict inconclusive still plot, drawn hollow. Abandoned experiments produce no points.
• v1 shows descriptive numbers only: n, mean, median, min, max. No significance tests; the sample size is always visible so small-n results read as weak.
Setting up Memento
The first session seeds the space with one harness document per distinct setup found in existing artifacts, one eval per repeatable test, and one experiment per recorded run. The metrics each eval tracks are defined by you when writing the eval files. The screens stay useful before seeding is complete: one eval and three experiments are enough for a first chart.
Auth, permissions and sharing
Humans sign in with sessions; agents use scoped API keys or OAuth grants. The two never mix: an agent key can't open the web app, and a browser session can't propose on an agent's behalf.
Human sign-in
• Better Auth (or Auth.js) with GitHub OAuth, Google OAuth and email magic link. No passwords.
• Database sessions in httpOnly, Secure, SameSite=Lax cookies. 30-day rolling expiry.
• CSRF protection on all mutations; every server action checks membership and role server-side.
Roles per space
Role
Read
Propose
Edit directly
Merge
Manage members, keys, types
Owner
Yes
Yes
Yes
Yes
Yes
Editor
Yes
Yes
Yes
Yes
No
Contributor
Yes
Yes
No
No
No
Viewer
Yes
No
No
No
No
Agent keys
• Created in Settings → Agent keys by owners and editors. Each key has a label ("Cursor · MacBook"), a scope (read or propose) and an owning user.
• Format lk_<space>_<32 random chars>. Shown once; stored as a SHA-256 hash plus a visible prefix.
• Keys show last used time and proposal count. Revoking takes effect immediately.
• A key can never merge, edit directly, archive, manage members or read another space.
OAuth grants
• Every OAuth connection appears in Settings → Agents next to API keys, labeled by client and user, e.g. "Muse · Sebastian".
• Each shows its space, scopes, last used time and proposal count. Revoking kills its tokens immediately.
• Proposals from OAuth grants carry the same agent glyph and label as key-based agents, so the review screen never hides where a change came from.
Sharing
• Invite by email with a role; invites expire after 7 days.
• Optional public read-only link per space, off by default. Public views never show proposals, keys or members.
• Every privileged action writes an audit event: merges, rejects, role changes, key creation and revocation.
Security basics
• Rendered Markdown is sanitized; HTML is limited to the safe subset listed in Markdown capabilities.
• Uploaded assets are served from signed URLs.
• All secrets live in environment variables; no keys in client code.
Architecture and data model
One Next.js app on Vercel, one Postgres database, one blob store. No queues, no workers, no separate MCP service in v1.
Stack
Layer
Choice
Why
App
Next.js App Router, TypeScript, React Server Components
Your stack; server actions for mutations
Hosting
Vercel
Zero-ops deploys and preview URLs
Database
Postgres on Neon, Drizzle ORM
Branching, point-in-time restore, typed queries
Auth
Better Auth, including its OAuth provider for MCP clients
Sessions, OAuth, magic links in your own database
MCP
@modelcontextprotocol/sdk, Streamable HTTP at /api/mcp
Official SDK, runs as a route handler
Markdown
unified, remark-parse, remark-gfm, remark-frontmatter, a wiki-link plugin, remark-math, rehype-katex, Shiki, Mermaid, rehype-sanitize
One parser for render, diff, links and validation
Editor
CodeMirror 6 with a live-preview extension
Source-faithful; clean diffs
Diff and merge
jsdiff for word diffs, node-diff3 for three-way merges
Small, proven
Validation
Zod schemas generated from type schema files
Same validator on server and client
Search
Postgres full-text search plus pg_trgm
No extra service, no embeddings
Charts
Vega-Lite via vega-embed
One chart engine for document charts and the Metrics screen
UI
Tailwind CSS, Radix primitives, cmdk for the palette
Accessible, unstyled building blocks
Assets
Vercel Blob or Cloudflare R2
Signed URLs for images
Data model
users        (id, email, name, avatar_url, created_at)
spaces       (id, slug, name, public_read bool, created_at)
memberships  (space_id, user_id, role, created_at)

documents    (id, space_id, path, slug, type, title,
              head_revision_id, archived_at, created_at, updated_at)
revisions    (id, document_id, parent_revision_id, content text,
              frontmatter jsonb, content_hash, version int null,
              message, author_user_id, agent_key_id null,
              proposal_id null, created_at)
proposals    (id, space_id, document_id null, action, path,
              base_revision_id null, content text, edits jsonb null,
              summary, rationale, status, validation jsonb,
              agent_key_id null, author_user_id,
              reviewer_user_id null, review_note, reviewed_at,
              merged_revision_id null, created_at, updated_at)
drafts       (document_id, user_id, content, updated_at)

agent_keys   (id, space_id, owner_user_id, label, scope,
              key_prefix, key_hash, last_used_at, revoked_at, created_at)
links        (from_document_id, to_slug, to_version null,
              in_frontmatter bool, field null)
metric_points(id, space_id, experiment_document_id, revision_id,
              eval_slug, eval_version, metric_key, value numeric,
              harness_slug, harness_version, date, environment,
              sample_size, verdict)
assets       (id, space_id, path, blob_url, mime, bytes, created_at)
audit_events (id, space_id, actor_user_id, agent_key_id,
              action, target, data jsonb, created_at)
Invariants
1. Revisions are immutable and store full content. Text is small; full snapshots keep reads and diffs simple.
2. Only two paths create revisions: a human save and a merge. Both run the validator.
3. documents.head_revision_id moves inside the same transaction that creates the revision.
4. links and metric_points are derived data. They can be rebuilt from revisions at any time with one script.
5. Documents are archived, never deleted.
6. Version lookups ([[slug@7]]) find the first revision of that document whose version column equals 7.
Code structure
app/
  (app)/[space]/…           # screens
  api/mcp/route.ts          # MCP server
  api/v1/…                  # REST mirror
lib/
  markdown/                 # parse, render, links, diff
  schema/                   # load type files → Zod
  validate/                 # pure validator + rule tests
  proposals/                # create, merge, rebase
  metrics/                  # derive points, queries
  auth/                     # sessions, roles, key checks
  db/                       # Drizzle schema, queries
The MCP route, REST routes and server actions all call the same functions in lib/. There is one implementation of every operation.
Search, import and export
Your data is always a folder of Markdown away. Search is keyword-based and fast; import and export use the exact file format.
Search
• ⌘K opens one palette for documents, commands and filters.
• Full-text over title, body and frontmatter values, ranked by title match, then recency.
• Filters typed inline: type:experiment status:concluded harness:memento-journal@7 verdict:refuted after:2026-09-01.
• Results show type icon, title, path and a snippet with matches highlighted. Under 100 ms for spaces up to 10,000 documents.
Import
• Drag a folder or a .zip of Markdown files onto Settings → Import, or onto the sidebar.
• Each file is validated. Valid files become documents with one initial revision each, authored "Import". Invalid files are listed with errors and a Download report button; nothing partial is saved per file.
• Files without frontmatter import as type: doc with the file name as title.
• Converting Claude artifacts or HTML is an agent's job: it reads them, writes typed Markdown and submits proposals. This keeps interpretation out of the product.
Export
• Settings → Export downloads a .zip of the whole space as its folder of Markdown files, including .ledger/ and assets/. Re-importing it recreates the space.
• Optional per-document history export: one file per revision under .history/.
Backup
• Neon point-in-time restore covers the database.
• v1.1: a nightly job pushes the space as Markdown to a private GitHub repo, one commit per night. This is a backup mirror, never an input.
Design language
The feel is Cursor: dark-first, dense, quiet, fast. The content is the interface; chrome gets out of the way.
Foundations
Token
Value
Theme
Dark default, light available, follows system
Surfaces
Near-black base, one step lighter for panels, hairline 1px borders, no shadows
Accent
One accent color for focus, selection and primary actions
Semantic
Green for improvement and insertions, red for regression and deletions, amber for warnings
UI type
Geist or Inter, 13px UI, 12px meta
Reading type
16px body, 1.6 line height, 720px max width
Mono
Geist Mono or JetBrains Mono for paths, keys, frontmatter, code
Radius
6px controls, 8px panels
Motion
120–160ms ease-out; no motion on content
Interaction rules
• Everything reachable by keyboard; every list navigable with J and K.
• Prefer inline editing and side panels over modals. The only modals are confirmations for irreversible actions.
• Agent authorship is always visible: a small agent glyph plus key label on proposals, revisions and timeline rows.
• Status is a colored dot plus a word, never color alone.
• Loading states are skeletons of the real layout; optimistic updates for merge and reject.
Keyboard shortcuts
Keys
Action
⌘K
Search and commands
C
New document
E
Edit current document
⌘S
Save revision
G I / G T / G M
Go to Inbox / Timeline / Metrics
M / R / C
Merge / Reject / Request changes (in review)
D
Toggle rendered and source diff
J / K
Next / previous item
⌘\
Toggle right panel
⌘/
Toggle raw Markdown
?
Show all shortcuts
Build plan
The minimum useful loop is milestones 1–4: about four and a half focused days, and enough to start logging Memento experiments. Everything after can wait until Memento is in the App Store.
#
Milestone
Scope
Estimate
1
Foundation
Next.js app, Neon, Drizzle schema, Better Auth, one space, seeded .ledger/ files
0.5 day
2
Read path
Markdown parser with full rendering (GFM, callouts, math, Mermaid, charts, embeds), type schema loader, validator with tests, document view, sidebar
1.5 days
3
Agent path
Agent keys, OAuth 2.1 for assistants, MCP route with all read tools plus validate and propose_change, REST mirror
1.5 days
4
Review
Inbox, rendered word diff, merge and reject, revisions, get_proposal
1 day
5
Metrics
Metric point derivation on merge, Metrics screen, harness comparison
1 day
6
Human editing
CodeMirror live preview, frontmatter form, drafts, ⌘S revisions, conflicts
1.5 days
7
Polish
History and compare, Timeline, search palette, import and export, invites
1.5 days
Acceptance criteria
Milestones 1–4 (the loop)
[ ] From Cursor, "log this experiment to Ledger" produces a valid proposal with no manual fixes, using only MCP tools.
[ ] An invalid proposal returns structured errors, and the agent's retry succeeds.
[ ] The proposal appears in the Inbox within 2 seconds.
[ ] Merging creates a revision, updates the document and marks the proposal merged for get_proposal.
[ ] An agent key cannot merge, and a revoked key is refused immediately.
[ ] get_context returns under 6k tokens for a space with 100 experiments.
[ ] Claude and Muse connect by pasting the MCP URL, signing in and approving scopes, with no key copied by hand.
[ ] OAuth grants appear in Settings → Agents, and revoking one blocks its next call.
[ ] No OAuth scope or tool allows merging, editing directly or deleting.
Milestone 5 (metrics)
[ ] Merging a concluded experiment adds its points to the chart without a reload.
[ ] Two harness versions on the same eval show as separate colored series with correct deltas.
[ ] Bumping an eval version splits the chart.
Milestones 6–7 (the product)
[ ] Editing and saving an untouched document produces an empty diff.
[ ] Exporting and re-importing a space yields identical files.
[ ] Every screen is usable with the keyboard alone.
[ ] Review of a typical experiment proposal takes under two minutes.
[ ] A test document using every syntax in Markdown capabilities renders identically in view, editor preview and review.
[ ] A metrics-backed chart embedded in a finding updates after a new experiment merges.
First week of use
1. Seed the Memento space: space.md, agents.md, the current harness and its prior versions, and the evals you run.
2. Have an agent convert existing Memento artifacts into experiments, submitted as proposals, and review them in batches.
3. From then on, log every run through Ledger and check Metrics before each harness decision.
Risks and open questions
The biggest risk is time: this project competes with shipping Memento. The build plan front-loads the loop so everything after milestone 4 can pause without loss.
Risks
Risk
Mitigation
Building Ledger delays the Memento launch
Stop after milestone 4 until Memento ships; use GitHub-style review until then
Agents flood the inbox
Validation, rate limits, 20 open proposals per key, quick keyboard triage
Agents invent or misreport metric values
agents.md rules, metric_unknown and range checks, human review of every result
Schemas are wrong for real experiments
Seed from real artifacts first; schemas are editable Markdown
Editor rewrites Markdown and pollutes diffs
CodeMirror source-first editing; acceptance test for empty diffs
Each assistant's connector flow differs slightly and changes often
Follow the MCP authorization spec exactly; test each client end to end before claiming support
Small sample sizes read as real trends
Always show n; hollow points for inconclusive runs
Open questions
[ ] Final product name. "Ledger" is a placeholder.
[ ] Should humans with editor role also go through proposals, for a stricter record? v1 says no.
[ ] Do experiments need a run log attachment (raw outputs, traces) in v1, or are assets enough?
[ ] Which evals define Memento's launch bar, and what are their metrics and baselines?
[ ] Should get_context be configurable per space, e.g. which sections to include?
[ ] Confirm this side project has no overlap with day-job agreements before sharing it publicly.
