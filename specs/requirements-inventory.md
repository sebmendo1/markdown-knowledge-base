# Requirements inventory

Phase 1 of `specs/PLAN.md`. This file splits the Ledger PRD into atomic statements, then adds each scoping answer (D1–D8) and each change request (C1–C9). It does not decide the conflicts. Phase 2 writes those decisions.

Each row is one testable behavior, constraint, or principle. IDs start at `REQ-001` and are never reused. Source is a PRD anchor (`prd:…`) or an id in `specs/source/decisions-and-changes.md` (`decisions:D1`, `decisions:C3`). Sources are not line numbers.

Kind is `functional`, `non-functional`, `constraint`, `principle`, or `example`. Feature is `F01`–`F22` or `X`, from the feature table in PLAN section 4. Status is against the code on this branch:

| Status | When it is used |
| --- | --- |
| built | The stated behavior is in the code |
| partly built | Part of the stated behavior is in the code |
| not started | The full v1 scope (D1) includes it, and it is not in the code |
| deferred | D3, D4, or D5 postpones it. The statement stays the later target |
| replaced | A later instruction in PLAN section 2.2 superseded this value. The row named in Flags is the one that stands |

Flags name a conflict from PLAN section 2.2 or a gap from section 2.3, and the ADR that decides it. On a replaced PRD row, `stands: C4` or `stands: C2, C8` names the later instruction that wins. That instruction's own row is marked `stands`. Auth (D3) and storage (D2, D5) are conflicts, and they are not marked `replaced`: D3 keeps the four roles as a later target, and D1 still includes the Postgres model. The product name stays markdown-kb (D6, ADR-0001). A page is `/{project}/{page-path}`, for example `/guide/docs/layout`. `/docs` and `/ledger` redirect into the guide project. There is no `/memento` segment and no `/docs/…` page prefix. Preview is the default. Editing is a block editor in the reading column. Source is a full-page editor. Command-/ or Control-/ switches between those two, and the Edit button turns editing on from preview and off from either mode (ADR-0004). Inline live preview is not started. Reading text is 17px with line-height 1.7. The column is capped at 760px. At that size 66ch is 744px, so the cap binds and the text is 696px wide (ADR-0005).

A local stdio MCP, browser history, and zip import exist in the code. They are not the PRD's remote tools, revisions, or validated import. Those PRD statements stay `not started`, `deferred`, or `partly built` as the row says.

## Statements

| ID | Source | Kind | Feature | Status | Statement | Flags |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-001 | `prd:summary` | principle | X | replaced | The product name is Ledger. | conflict:name; stands: D6; ADR-0001 |
| REQ-002 | `prd:summary` | principle | F12 | not started | Agents propose changes, and a person merges them before they become documents. | — |
| REQ-003 | `prd:summary` | principle | X | built | The product does not generate, rewrite, or summarize content. | — |
| REQ-004 | `prd:summary` | functional | F22 | not started | The first space holds harness versions, evals, experiments, findings, and decisions so that performance can be measured over time. | — |
| REQ-005 | `prd:product-principles` | principle | F01 | partly built | Every document is a Markdown file with YAML frontmatter. | — |
| REQ-006 | `prd:product-principles` | principle | F02 | not started | Type schemas, templates, space settings, and agent instructions are Markdown files. | — |
| REQ-007 | `prd:product-principles` | principle | F19 | partly built | Export produces the same folder of Markdown files that the space stores. | gap:export-identity; ADR-0033 |
| REQ-008 | `prd:product-principles` | principle | X | built | The product never generates, rewrites, or summarizes. Intelligence stays in the agents people bring. | — |
| REQ-009 | `prd:product-principles` | principle | X | partly built | The product stores and displays documents, and it validates, diffs, and versions them. | — |
| REQ-010 | `prd:product-principles` | principle | F13 | deferred | Agents can propose changes and have no merge tool. | — |
| REQ-011 | `prd:product-principles` | principle | F13 | deferred | Agents have no delete tool and no admin tool. | — |
| REQ-012 | `prd:product-principles` | principle | F02 | not started | Six document types with required fields make knowledge queryable. | — |
| REQ-013 | `prd:product-principles` | principle | F16 | not started | Experiments feed metrics automatically. | — |
| REQ-014 | `prd:product-principles` | principle | F07 | not started | Every change is an immutable revision. | conflict:storage; ADR-0003 |
| REQ-015 | `prd:product-principles` | principle | F18 | partly built | Change over time is a first-class view, not an afterthought. | — |
| REQ-016 | `prd:product-principles` | principle | X | partly built | There is one way to do each thing, and a feature that needs a manual is cut. | — |
| REQ-017 | `prd:product-principles` | principle | F20 | partly built | Every core action has a keyboard shortcut. | gap:a11y; ADR-0034 |
| REQ-018 | `prd:product-principles` | principle | F21 | built | The interface is dark, dense, fast, and quiet, at Cursor-grade craft. | gap:perf-percentile |
| REQ-019 | `prd:users` | constraint | F15 | deferred | v1 has one owner, who runs experiments, reviews proposals, reads trends, and makes decisions. | conflict:auth; ADR-0002 |
| REQ-020 | `prd:users` | constraint | F13 | deferred | Agents, including Cursor, Claude Code, Grokbot, and eval scripts, read context and propose documents. | — |
| REQ-021 | `prd:users` | constraint | F15 | deferred | Collaborators are a v1.1 audience: people invited to a space to read, propose, or edit. | — |
| REQ-022 | `prd:goals-for-v1` | functional | F22 | not started | v1 has one home for all Memento experiment knowledge, replacing artifacts as the source of truth. | — |
| REQ-023 | `prd:goals-for-v1` | functional | F13 | deferred | Any MCP agent can log an experiment in one tool call, without GitHub or a CLI, including a phone assistant connected by OAuth. | — |
| REQ-024 | `prd:goals-for-v1` | non-functional | F12 | not started | Reviewing a proposal takes under two minutes. | — |
| REQ-025 | `prd:goals-for-v1` | functional | F16 | not started | A chart shows each Memento metric over time, split by harness version. | gap:repeat-experiment; ADR-0027 |
| REQ-026 | `prd:goals-for-v1` | functional | F13 | deferred | An agent can pull a compact context pack at the start of a session. | gap:token-budget; ADR-0028 |
| REQ-027 | `prd:non-goals` | constraint | X | built | The product does not include AI writing, summarizing, chat, or search by embedding. | — |
| REQ-028 | `prd:non-goals` | constraint | X | built | The product does not include real-time multiplayer editing. | — |
| REQ-029 | `prd:non-goals` | constraint | X | built | The product does not include Notion-style databases, kanban boards, or page builders. | — |
| REQ-030 | `prd:non-goals` | constraint | X | built | The product does not publish public documentation sites or offer custom domains. | — |
| REQ-031 | `prd:non-goals` | constraint | X | built | v1 has no plugins, no integrations marketplace, and no outbound webhooks. | — |
| REQ-032 | `prd:non-goals` | constraint | X | built | v1 has no native mobile app. The client is the web app. | — |
| REQ-033 | `prd:non-goals` | constraint | F08 | replaced | On phones the web app is responsive and read-mostly. | conflict:phones; stands: C4; ADR-0011 |
| REQ-034 | `prd:success-metrics` | non-functional | X | not started | After 30 days, 100 percent of new Memento experiments are recorded in the product. | gap:metric-events |
| REQ-035 | `prd:success-metrics` | non-functional | F12 | not started | After 30 days, 80 percent or more of experiments arrive via agent proposals. | gap:metric-events |
| REQ-036 | `prd:success-metrics` | non-functional | F12 | not started | The median time from proposal to merge or reject is under 2 minutes of review time. | gap:metric-events |
| REQ-037 | `prd:success-metrics` | non-functional | F06 | not started | After agents read the guide, under 10 percent of proposals fail validation. | gap:metric-events |
| REQ-038 | `prd:success-metrics` | non-functional | X | not started | An optional signal is that 5 external builders use a space weekly. | gap:metric-events |
| REQ-039 | `prd:core-concepts` | constraint | F07 | not started | The product has five nouns: space, document, revision, proposal, and agent key. Every other surface is a view over them. | — |
| REQ-040 | `prd:core-concepts` | constraint | F07 | not started | A space is a top-level knowledge base with members, agent keys, types, and settings. | conflict:auth; ADR-0002 |
| REQ-041 | `prd:core-concepts` | constraint | F08 | replaced | A space is addressed at /memento. | conflict:name; stands: D6; ADR-0001 |
| REQ-042 | `prd:core-concepts` | constraint | F01 | partly built | A document is one Markdown file at a path. | — |
| REQ-043 | `prd:core-concepts` | constraint | F02 | not started | A document's type comes from its frontmatter. | — |
| REQ-044 | `prd:core-concepts` | constraint | F07 | partly built | A document is never hard-deleted. It is archived instead. | gap:legal-delete |
| REQ-045 | `prd:core-concepts` | constraint | F07 | not started | A revision is an immutable snapshot of a document's full content. | conflict:storage; ADR-0003 |
| REQ-046 | `prd:core-concepts` | constraint | F07 | not started | A revision is created only by a human save or a merged proposal, and it records author, message, and parent. | conflict:storage; ADR-0003 |
| REQ-047 | `prd:core-concepts` | constraint | F12 | not started | A proposal is a suggested create or update waiting for review, created by an agent or a contributor. | — |
| REQ-048 | `prd:core-concepts` | constraint | F12 | not started | A proposal can be merged, rejected, or withdrawn. | — |
| REQ-049 | `prd:core-concepts` | constraint | F13 | deferred | An agent key is a credential scoped to one space that can read and propose, and cannot merge, delete, or administer. | — |
| REQ-050 | `prd:document-types` | constraint | F02 | not started | The harness type is a versioned agent setup: model, context strategy, tools, and prompts. | — |
| REQ-051 | `prd:document-types` | constraint | F02 | not started | The eval type is a repeatable test with defined metrics, units, and direction. | — |
| REQ-052 | `prd:document-types` | constraint | F02 | not started | The experiment type is one run of an eval against a harness version, with results. | — |
| REQ-053 | `prd:document-types` | constraint | F02 | not started | The finding type is a durable conclusion backed by linked experiments. | — |
| REQ-054 | `prd:document-types` | constraint | F02 | not started | The decision type is a choice and the findings behind it. | — |
| REQ-055 | `prd:document-types` | constraint | F02 | not started | The doc type is free-form: architecture, notes, specs, and ideas. The other five types link together. | — |
| REQ-056 | `prd:recording-pipeline` | principle | F03 | not started | An experiment runs an eval against a harness version. | — |
| REQ-057 | `prd:recording-pipeline` | principle | F03 | not started | A finding cites experiments as evidence. | — |
| REQ-058 | `prd:recording-pipeline` | principle | F03 | not started | A decision cites findings, and a decision produces the next harness version. | — |
| REQ-059 | `prd:recording-pipeline` | example | F03 | not started | The pipeline diagram illustrates that loop and is not a separate behavior. | — |
| REQ-060 | `prd:versioned-references` | constraint | F02 | not started | Harnesses and evals carry a version number in frontmatter. | — |
| REQ-061 | `prd:versioned-references` | functional | F03 | not started | A link written [[slug@7]] resolves to the revision where version 7 was first saved, so later harness edits do not change what the experiment ran on. | gap:pinned-target; ADR-0017 |
| REQ-062 | `prd:custom-types` | functional | F02 | not started | A space adds a type by adding a schema file. No code change is required. | gap:meta-schema; ADR-0015 |
| REQ-063 | `prd:custom-types` | functional | F02 | not started | v1 ships the six built-in types as editable schema files. | gap:schema-frontmatter; ADR-0014 |
| REQ-064 | `prd:markdown-format` | principle | F01 | partly built | A space is a folder of Markdown files. | conflict:storage; ADR-0003 |
| REQ-065 | `prd:markdown-format` | constraint | F07 | not started | The database stores revisions of those files. | conflict:storage; ADR-0003 |
| REQ-066 | `prd:markdown-format` | principle | F01 | partly built | The file format is the contract shared by import, export, the editor, and the MCP server. | — |
| REQ-067 | `prd:folder-layout` | constraint | F01 | not started | A space folder contains .ledger/space.md for the name, description, default harness, and conventions. | gap:schema-frontmatter; ADR-0014 |
| REQ-068 | `prd:folder-layout` | constraint | F01 | not started | A space folder contains .ledger/agents.md, the instructions every agent reads first. | gap:schema-frontmatter; ADR-0014 |
| REQ-069 | `prd:folder-layout` | constraint | F02 | not started | .ledger/types/ holds one schema file per built-in type: harness, eval, experiment, finding, decision, and doc. | gap:schema-frontmatter; ADR-0014 |
| REQ-070 | `prd:folder-layout` | example | F01 | not started | The sample tree, with harnesses/, evals/, experiments/, findings/, decisions/, docs/, and assets/, illustrates that layout. | — |
| REQ-071 | `prd:folder-layout` | constraint | F01 | partly built | The file name is the slug: lowercase, hyphens, and unique in the space. | gap:slug; ADR-0012 |
| REQ-072 | `prd:folder-layout` | constraint | F02 | not started | Each type has a default folder, set in its schema. | gap:filename; ADR-0013 |
| REQ-073 | `prd:folder-layout` | constraint | F01 | not started | Experiment file names are prefixed with their date. | gap:filename; ADR-0013 |
| REQ-074 | `prd:folder-layout` | constraint | F01 | partly built | Folders beyond the type folders are allowed for doc files. | — |
| REQ-075 | `prd:frontmatter-per-type` | constraint | F01 | partly built | Every file starts with YAML frontmatter. | — |
| REQ-076 | `prd:frontmatter-per-type` | constraint | F02 | not started | type and title are required on every file. | — |
| REQ-077 | `prd:frontmatter-harness` | constraint | F02 | not started | A harness records version, model, a parent link, and a changes note. | — |
| REQ-078 | `prd:frontmatter-harness` | constraint | F02 | not started | A harness status is draft, active, or retired. | — |
| REQ-079 | `prd:frontmatter-harness` | constraint | F02 | not started | A harness body has the sections Context strategy, Prompts, Tools, and Known limits. | — |
| REQ-080 | `prd:frontmatter-harness` | example | F02 | not started | The harness sample, including "Memento journal harness" at version 7, illustrates the format and is not a real stored result. | — |
| REQ-081 | `prd:frontmatter-eval` | constraint | F02 | not started | An eval records version, a baseline link, and a metrics list. | gap:baseline-value; ADR-0026 |
| REQ-082 | `prd:frontmatter-eval` | constraint | F02 | not started | An eval status is draft, active, or retired. | — |
| REQ-083 | `prd:frontmatter-eval` | constraint | F02 | not started | Each eval metric has a key, a unit, a better direction of higher or lower, and an optional range. | — |
| REQ-084 | `prd:frontmatter-eval` | constraint | F02 | not started | An eval body has the sections What it measures, Dataset, Scoring method, and How to run. | — |
| REQ-085 | `prd:frontmatter-eval` | example | F02 | not started | The summary-faithfulness sample illustrates an eval and is not a real stored result. | — |
| REQ-086 | `prd:frontmatter-experiment` | constraint | F02 | not started | An experiment records date, hypothesis, a pinned harness link, a pinned eval link, environment, sample size, results, and verdict. | — |
| REQ-087 | `prd:frontmatter-experiment` | constraint | F02 | not started | An experiment status is planned, running, concluded, or abandoned. | — |
| REQ-088 | `prd:frontmatter-experiment` | constraint | F02 | not started | An experiment verdict is supported, refuted, or inconclusive. | — |
| REQ-089 | `prd:frontmatter-experiment` | constraint | F02 | not started | An experiment body has the sections Setup, Observations, Surprises, and Next. | — |
| REQ-090 | `prd:frontmatter-experiment` | example | F02 | not started | The context-window sample illustrates an experiment and is not a real stored result. | — |
| REQ-091 | `prd:frontmatter-finding` | constraint | F02 | not started | A finding records confidence, an evidence list of links, and an optional supersedes link. | — |
| REQ-092 | `prd:frontmatter-finding` | constraint | F02 | not started | A finding status is current, superseded, or disputed. | — |
| REQ-093 | `prd:frontmatter-finding` | constraint | F02 | not started | Finding confidence is low, medium, or high. | — |
| REQ-094 | `prd:frontmatter-finding` | constraint | F02 | not started | A finding body has the sections Claim, Evidence summary, and Caveats. | — |
| REQ-095 | `prd:frontmatter-finding` | example | F02 | not started | The summaries-degrade sample illustrates a finding and is not a real stored result. | — |
| REQ-096 | `prd:frontmatter-decision` | constraint | F02 | not started | A decision records date, a based_on list of finding links, and a results_in link. | — |
| REQ-097 | `prd:frontmatter-decision` | constraint | F02 | not started | A decision status is proposed, accepted, or reversed. | — |
| REQ-098 | `prd:frontmatter-decision` | constraint | F02 | not started | A decision body has the sections Decision, Why, Alternatives considered, and Revisit when. | — |
| REQ-099 | `prd:frontmatter-decision` | constraint | F02 | not started | A doc requires only type doc and title, and may include a tags list. | — |
| REQ-100 | `prd:frontmatter-decision` | example | F02 | not started | The sample values in the type frontmatter are illustrations of the format, not real Memento results. | — |
| REQ-101 | `prd:type-schemas` | constraint | F02 | not started | Each file in .ledger/types/ defines a type. Its frontmatter is the schema and its body is writing guidance sent to agents with the template. | gap:schema-frontmatter; ADR-0014 |
| REQ-102 | `prd:type-schemas` | constraint | F02 | not started | A type schema sets name, folder, and a filename pattern. The experiment pattern is {date}-{slug}. | gap:filename; ADR-0013 |
| REQ-103 | `prd:type-schemas` | constraint | F02 | not started | A type schema file uses type schema. | gap:schema-frontmatter; ADR-0014 |
| REQ-104 | `prd:type-schemas` | constraint | F02 | not started | v1 field kinds are string, number, date, enum, boolean, list, link, links, and metrics. | — |
| REQ-105 | `prd:type-schemas` | constraint | F02 | not started | A string field may set required and max. The experiment title is a required string of at most 120 characters. | — |
| REQ-106 | `prd:type-schemas` | constraint | F02 | not started | A date field stores a date. Experiment date is required. | — |
| REQ-107 | `prd:type-schemas` | constraint | F02 | not started | An enum field lists allowed values. Experiment status and verdict use the enums in the schema. | — |
| REQ-108 | `prd:type-schemas` | constraint | F02 | not started | Experiment hypothesis is a required string. Environment is an optional string. Sample size is an optional number with minimum 1. | — |
| REQ-109 | `prd:type-schemas` | constraint | F03 | not started | A link field may set to and pinned. Experiment harness and eval links are required, pinned, and limited to those types. | — |
| REQ-110 | `prd:type-schemas` | constraint | F03 | not started | pinned true requires an @version on the link. | gap:pinned-target; ADR-0017 |
| REQ-111 | `prd:type-schemas` | constraint | F02 | not started | A metrics field's keys must match the linked eval's metric keys. Experiment results use that kind, taken from the eval. | — |
| REQ-112 | `prd:type-schemas` | constraint | F02 | not started | required_when makes a field required when another field matches. Experiment verdict is required when status is concluded. | gap:required-when; ADR-0016 |
| REQ-113 | `prd:type-schemas` | constraint | F02 | not started | A schema lists required body sections. Experiment sections are Setup, Observations, Surprises, and Next. | — |
| REQ-114 | `prd:type-schemas` | example | F02 | not started | The experiment schema's writing guidance says to write one experiment per file, state the hypothesis before results, and report every metric the eval defines, even when it got worse. | — |
| REQ-115 | `prd:links` | functional | F03 | built | [[slug]] links to a document's latest revision. | — |
| REQ-116 | `prd:links` | functional | F03 | not started | [[slug@7]] links to a harness or eval at a specific version. | gap:pinned-target; ADR-0017 |
| REQ-117 | `prd:links` | functional | F03 | built | [[slug#Heading]] links to a section. | — |
| REQ-118 | `prd:links` | functional | F03 | partly built | Links work in frontmatter strings and in the body. | — |
| REQ-119 | `prd:links` | functional | F06 | partly built | A broken link renders in red, and a broken link in frontmatter fails validation. | — |
| REQ-120 | `prd:links` | functional | F03 | partly built | Backlinks are computed when links change and are shown on every document. | — |
| REQ-121 | `prd:space-and-agents` | constraint | F01 | not started | space.md holds the space name, a one-paragraph purpose, and the current default harness and eval. | gap:schema-frontmatter; ADR-0014 |
| REQ-122 | `prd:space-and-agents` | constraint | F13 | deferred | agents.md is the rulebook returned by get_context: what to log, naming, and what not to do. | — |
| REQ-123 | `prd:space-and-agents` | constraint | F01 | not started | space.md and agents.md are ordinary documents, versioned and editable like any other document. | gap:schema-frontmatter; ADR-0014 |
| REQ-124 | `prd:agent-logs-an-experiment` | non-functional | F13 | deferred | Logging an experiment takes one sentence from the user, one proposal, and under 10 seconds. | gap:perf-percentile |
| REQ-125 | `prd:agent-logs-an-experiment` | functional | F13 | deferred | The agent calls get_template for experiment, searches for the active harness, then propose_change with a create and the content. | — |
| REQ-126 | `prd:agent-logs-an-experiment` | functional | F13 | deferred | A valid propose_change returns the proposal id and a valid status, and the proposal appears in the inbox. | — |
| REQ-127 | `prd:agent-logs-an-experiment` | functional | F06 | not started | When validation fails, propose_change returns structured errors, the agent fixes and resubmits, and nothing invalid reaches the inbox. | — |
| REQ-128 | `prd:agent-logs-an-experiment` | example | F13 | deferred | The sequence diagram illustrates that tool order and is not a separate behavior. | — |
| REQ-129 | `prd:review-and-merge` | functional | F12 | not started | The Inbox badge shows the count of new proposals. G I opens the Inbox. | — |
| REQ-130 | `prd:review-and-merge` | functional | F12 | not started | Opening a proposal shows a rendered diff, a frontmatter table, validation status, and the agent name. | — |
| REQ-131 | `prd:review-and-merge` | functional | F12 | not started | In review, M merges, R rejects with a reason, and C requests changes with a note. | gap:keymap-scope; ADR-0024 |
| REQ-132 | `prd:review-and-merge` | functional | F12 | not started | On merge, a revision is created, links and metrics update, and the next proposal opens. | — |
| REQ-133 | `prd:write-or-edit` | functional | F09 | partly built | Owners and editors edit in place. | conflict:auth; ADR-0002 |
| REQ-134 | `prd:write-or-edit` | functional | F09 | partly built | Command-S saves a revision with an optional message. | conflict:storage; ADR-0003 |
| REQ-135 | `prd:write-or-edit` | functional | F06 | not started | Humans go through the same validation as agents, and a human may save a document that has warnings. | — |
| REQ-136 | `prd:session-with-context` | functional | F13 | deferred | get_context returns agents.md, the active harness, active evals, current findings, recent decisions, and the last 10 experiments. | gap:token-budget; ADR-0028 |
| REQ-137 | `prd:session-with-context` | non-functional | F13 | deferred | That pack is about 2 to 6 thousand tokens, trimmed to titles and frontmatter, so the agent does not read the whole space. | gap:token-budget; ADR-0028 |
| REQ-138 | `prd:metrics-over-time` | functional | F16 | not started | Metrics lets the reader pick an eval and a metric. | — |
| REQ-139 | `prd:metrics-over-time` | functional | F16 | not started | The chart shows every concluded experiment over time, colored by harness version, with the baseline as a dashed line. | gap:baseline-value; ADR-0026 |
| REQ-140 | `prd:metrics-over-time` | functional | F16 | not started | Choosing a point opens that experiment. | — |
| REQ-141 | `prd:distill-a-finding` | functional | F09 | not started | From an experiment, Command-Shift-F starts a new finding with that experiment pre-linked as evidence. | — |
| REQ-142 | `prd:distill-a-finding` | functional | F03 | not started | Later experiments can cite or dispute a finding, and superseding creates a visible chain. | — |
| REQ-143 | `prd:import-existing-work` | functional | F19 | partly built | Dragging a folder of Markdown files onto the space imports them as revisions. | gap:import-batch; ADR-0032 |
| REQ-144 | `prd:import-existing-work` | constraint | X | built | Ledger does not convert Claude artifacts or HTML. An agent converts them outside the product and submits proposals. | — |
| REQ-145 | `prd:capture-from-phone` | functional | F14 | deferred | From a phone, a person can tell Claude, ChatGPT, or Muse to log an observation. The assistant calls get_template, then propose_change. | — |
| REQ-146 | `prd:capture-from-phone` | functional | F12 | not started | That proposal waits in the Inbox until a person merges or expands it. | — |
| REQ-147 | `prd:ui-and-screens` | functional | F08 | replaced | The app is a three-pane layout: sidebar, main content, and an optional right panel for properties, backlinks, and history. | conflict:panel; stands: C7; ADR-0008 |
| REQ-148 | `prd:ui-and-screens` | constraint | F08 | not started | v1 has eight screens. | — |
| REQ-149 | `prd:layout` | example | F08 | replaced | The layout sketch shows a space switcher, search, Inbox, Timeline, Metrics, type groups, a document, and a properties column with backlinks and history. | conflict:panel; stands: C7; ADR-0008 |
| REQ-150 | `prd:screens` | functional | F22 | not started | Space home orients the reader with space.md, the active harness, the latest 5 experiments, the open proposal count, and current findings. | — |
| REQ-151 | `prd:screens` | constraint | F08 | replaced | Screen routes are /memento, /memento/experiments/…, /memento/inbox, /memento/inbox/42, /memento/…/history, /memento/timeline, /memento/metrics, and /memento/settings. | conflict:name; stands: D6; ADR-0001 |
| REQ-152 | `prd:screens` | functional | F08 | partly built | The document screen is for reading and editing, and shows the title, a property header, and the body. | — |
| REQ-153 | `prd:screens` | functional | F08 | replaced | On the document screen, click or E starts editing. | conflict:editor; stands: C8; ADR-0004 |
| REQ-154 | `prd:screens` | functional | F12 | not started | The Inbox is the review queue. Each row shows agent, action, document, summary, validation, and age, and filters cover open, changes requested, and closed. | — |
| REQ-155 | `prd:screens` | functional | F12 | not started | The proposal screen reviews one change: rendered diff, frontmatter diff, validation, rationale, and actions. | — |
| REQ-156 | `prd:screens` | functional | F18 | partly built | History shows change over time for one document as a revision list, and can restore a revision. | gap:history-restore; ADR-0030 |
| REQ-157 | `prd:screens` | functional | F18 | not started | History can compare any two revisions. | gap:history-restore; ADR-0030 |
| REQ-158 | `prd:screens` | functional | F18 | not started | Timeline shows what changed in the space: merged revisions grouped by day, filtered by type and author. | — |
| REQ-159 | `prd:screens` | functional | F16 | not started | The Metrics screen answers whether results are improving, with eval and metric pickers, a line chart, and a harness comparison table. | — |
| REQ-160 | `prd:screens` | functional | F10 | replaced | Settings is an admin screen for members, agent keys, types, import, and export. | conflict:modals; stands: C6; ADR-0009 |
| REQ-161 | `prd:sidebar` | functional | F08 | partly built | The sidebar leads with a space switcher, then Search, Inbox with the open count, Timeline, and Metrics. | — |
| REQ-162 | `prd:sidebar` | functional | F08 | not started | The sidebar has one collapsible group per type, sorted newest first, and experiments show a status dot. | — |
| REQ-163 | `prd:sidebar` | functional | F08 | partly built | Doc files appear as a folder tree. | — |
| REQ-164 | `prd:sidebar` | functional | F09 | not started | A plus on each type group creates a document from that type's template. | — |
| REQ-165 | `prd:document-view` | functional | F08 | partly built | The property header renders frontmatter as a compact two-column list, and links render as chips. | — |
| REQ-166 | `prd:document-view` | functional | F16 | not started | In the property header, a metric shows its value and an up or down mark against the eval baseline, colored by the metric's better direction. | gap:delta-baseline; ADR-0026 |
| REQ-167 | `prd:document-view` | functional | F04 | replaced | The body renders Markdown at a maximum width of 720 pixels. | conflict:reading; stands: C4; ADR-0005 |
| REQ-168 | `prd:document-view` | functional | F04 | partly built | Headings in the body have anchor links. | — |
| REQ-169 | `prd:document-view` | functional | F08 | replaced | Command-backslash toggles a right panel of properties, backlinks grouped by type, and the last 5 revisions with authors. | conflict:panel; stands: C7; ADR-0008 |
| REQ-170 | `prd:document-view` | functional | F08 | not started | A harness page adds a version list, and each version links to its experiments. | — |
| REQ-171 | `prd:document-view` | functional | F16 | not started | An eval page adds a small metric chart and a table of experiments that use it. | — |
| REQ-172 | `prd:document-view` | functional | F08 | not started | A finding page lists evidence with each experiment's verdict, and shows the supersedes chain. | — |
| REQ-173 | `prd:empty-states` | functional | F22 | not started | Every empty screen teaches the model in one line, offers one action, and uses no illustration. | gap:ui-states |
| REQ-174 | `prd:empty-states` | example | F12 | not started | The Inbox empty state reads: No proposals. Connect an agent in Settings, then Agent keys. | gap:ui-states |
| REQ-175 | `prd:editor` | constraint | F09 | replaced | The editor is CodeMirror 6 with live preview, in the style of Obsidian and Cursor. | conflict:editor; stands: C2, C8; ADR-0004 |
| REQ-176 | `prd:editor` | principle | F09 | partly built | The Markdown source is the truth. The editor never rewrites text the user did not touch, so diffs stay clean. | — |
| REQ-177 | `prd:editor-behavior` | functional | F09 | replaced | Live preview renders headings, bold, links, and lists inline, and the syntax shows on the line with the cursor. | conflict:editor; stands: C2; ADR-0004 |
| REQ-178 | `prd:editor-behavior` | functional | F09 | replaced | Command-slash toggles raw source. | conflict:editor; stands: C2; ADR-0004 |
| REQ-179 | `prd:editor-behavior` | functional | F09 | not started | The property header is a form generated from the type schema. Enums are dropdowns, links are pickers, and dates are date inputs. | — |
| REQ-180 | `prd:editor-behavior` | functional | F09 | not started | Editing a frontmatter field writes YAML, and raw source shows that YAML directly. | — |
| REQ-181 | `prd:editor-behavior` | functional | F03 | partly built | Typing [[ opens a picker of documents, and @ chooses a version for harnesses and evals. | — |
| REQ-182 | `prd:editor-behavior` | functional | F09 | partly built | The slash menu inserts structure only: headings, a table, a code block, a callout, a checklist, an image, and a link. It has no AI items. | — |
| REQ-183 | `prd:editor-behavior` | functional | F09 | not started | Pasting or dropping an image uploads it into assets/ and inserts a standard Markdown image link. | — |
| REQ-184 | `prd:editor-behavior` | functional | F04 | partly built | Tables are GitHub-flavored Markdown tables, and Tab moves between cells. | — |
| REQ-185 | `prd:editor-behavior` | functional | F04 | built | Fenced code blocks show syntax highlighting. | — |
| REQ-186 | `prd:saving` | functional | F07 | not started | Drafts autosave every 2 seconds to the server as an unsaved draft, private to the author. | conflict:storage; ADR-0003 |
| REQ-187 | `prd:saving` | functional | F09 | partly built | Leaving and returning restores the author's draft. | conflict:storage; ADR-0003 |
| REQ-188 | `prd:saving` | functional | F09 | not started | Command-S validates, then opens an optional one-line commit message. Enter skips the message. Saving creates a revision. | conflict:storage; ADR-0003 |
| REQ-189 | `prd:saving` | functional | F06 | not started | When validation has errors, the save is blocked and the errors show inline next to the field or line. | — |
| REQ-190 | `prd:saving` | functional | F12 | not started | A contributor, who can only propose, sees Propose instead of Save, and that action creates a proposal. | conflict:auth; ADR-0002 |
| REQ-191 | `prd:conflicts` | functional | F09 | not started | If another revision lands during editing, a banner says: This document changed. Review changes. | — |
| REQ-192 | `prd:conflicts` | functional | F09 | not started | Saving then runs a three-way merge. A clean merge saves with a note. | gap:merge-frontmatter; ADR-0022 |
| REQ-193 | `prd:conflicts` | functional | F09 | not started | A conflict opens a side-by-side resolver with your version, theirs, and the base. | gap:merge-frontmatter; ADR-0022 |
| REQ-194 | `prd:new-documents` | functional | F09 | partly built | C or the plus control opens creation of a new document. | gap:keymap-scope; ADR-0024 |
| REQ-195 | `prd:new-documents` | functional | F02 | not started | New documents start from a type picker. The type schema's template fills the body and the frontmatter form, and required fields stay highlighted until filled. | — |
| REQ-196 | `prd:new-documents` | functional | F01 | not started | The file name is generated from the schema's filename pattern and stays editable. | gap:filename; ADR-0013 |
| REQ-197 | `prd:markdown-capabilities` | functional | F04 | partly built | The renderer covers GitHub-flavored Markdown, plus math, Mermaid diagrams, live charts, and embeds. | — |
| REQ-198 | `prd:markdown-capabilities` | principle | F04 | built | Every Markdown feature uses standard or widely adopted syntax, so files stay portable and agents already know how to write them. | — |
| REQ-199 | `prd:supported-syntax` | functional | F04 | built | Core Markdown renders headings, bold, italic, lists, links, images, blockquotes, and horizontal rules, on the CommonMark baseline. | — |
| REQ-200 | `prd:supported-syntax` | functional | F04 | built | GitHub-flavored pipe tables keep column alignment and scroll horizontally on narrow screens. | — |
| REQ-201 | `prd:supported-syntax` | functional | F04 | not started | Task lists use the GitHub checkbox syntax. An editor can tick a box in view mode, and each tick saves a revision. | gap:task-tick; ADR-0031 |
| REQ-202 | `prd:supported-syntax` | functional | F04 | built | Strikethrough and autolinks follow GitHub-flavored Markdown. | — |
| REQ-203 | `prd:supported-syntax` | functional | F04 | partly built | Footnotes use the GitHub footnote syntax, with a hover preview and back-links. | — |
| REQ-204 | `prd:supported-syntax` | functional | F04 | built | Callouts use GitHub alert syntax: NOTE, TIP, IMPORTANT, WARNING, and CAUTION, so they also render on GitHub. | — |
| REQ-205 | `prd:supported-syntax` | functional | F04 | partly built | Fenced code uses Shiki highlighting, a copy button, a diff language, and line highlights such as {3-5}. | — |
| REQ-206 | `prd:supported-syntax` | functional | F04 | partly built | Math uses dollar inline math, dollar-dollar blocks, or a math fence, rendered with KaTeX on the server. | — |
| REQ-207 | `prd:supported-syntax` | functional | F04 | built | A mermaid fence renders every Mermaid diagram type the library supports, including flowchart, sequence, class, state, ER, Gantt, journey, pie, quadrant, XY, timeline, mindmap, git graph, Sankey, block, and architecture. | — |
| REQ-208 | `prd:supported-syntax` | functional | F05 | partly built | A chart fence holds a Vega-Lite spec in YAML or JSON. Data may be inline, from a space CSV, or live from metrics. | — |
| REQ-209 | `prd:supported-syntax` | functional | F04 | built | A csv or tsv fence renders as a sortable table. | — |
| REQ-210 | `prd:supported-syntax` | functional | F04 | partly built | Highlight uses ==text==. Subscript and superscript use the tilde and caret short syntax. | — |
| REQ-211 | `prd:supported-syntax` | functional | F04 | not started | Emoji shortcodes such as :rocket: render as emoji. | — |
| REQ-212 | `prd:supported-syntax` | functional | F03 | partly built | Wiki links support [[slug]], [[slug@7]], and [[slug#Heading]]. | gap:pinned-target; ADR-0017 |
| REQ-213 | `prd:supported-syntax` | functional | F03 | partly built | An embed transcludes another document or a section with ![[slug]], ![[slug#Heading]], or ![[slug@7]], and links to its source. | gap:pinned-target; ADR-0017 |
| REQ-214 | `prd:supported-syntax` | functional | F04 | partly built | Images use standard Markdown and zoom on click. Video links to .mp4 or .webm in assets/ get a player. | — |
| REQ-215 | `prd:supported-syntax` | constraint | X | built | The only HTML that renders is details, summary, kbd, sub, sup, mark, br, and img width. All other HTML is stripped. | — |
| REQ-216 | `prd:supported-syntax` | functional | F08 | built | An outline is built automatically from headings and shown beside the document. No outline syntax is required. | conflict:panel; ADR-0008 |
| REQ-217 | `prd:supported-syntax` | constraint | F04 | deferred | Graphviz dot diagrams, geojson and topojson maps, and stl 3D models are planned for v1.1, matching GitHub, and are out of v1. | — |
| REQ-218 | `prd:charts` | constraint | F05 | partly built | Charts use Vega-Lite only. A chart takes data from inline values, a CSV file in assets/, or a live metrics query against the space. | — |
| REQ-219 | `prd:charts` | example | F05 | not started | The faithfulness-by-harness sample is a line chart whose data is a metrics query on summary-faithfulness version 2. | — |
| REQ-220 | `prd:charts` | functional | F05 | not started | A metrics-backed chart updates whenever a new experiment merges. A finding or decision can embed that live chart. | — |
| REQ-221 | `prd:charts` | functional | F16 | not started | A metrics query returns date, value, harness, harness version, eval version, environment, sample size, verdict, and experiment. | — |
| REQ-222 | `prd:charts` | functional | F05 | partly built | Every Vega-Lite chart type works, including line, bar, area, scatter, stacked, grouped, histogram, heatmap, box plot, layered, and faceted charts. | — |
| REQ-223 | `prd:charts` | functional | F05 | partly built | Charts show tooltips, use the app's theme colors, and offer a menu to export PNG or SVG. | — |
| REQ-224 | `prd:charts` | constraint | F05 | partly built | External data URLs are not allowed. Chart data comes only from inline values, space assets, or metrics. | — |
| REQ-225 | `prd:editor-support` | functional | F09 | partly built | Live preview renders diagrams, charts, and math inline. Moving the cursor into a block reveals its source with a live preview underneath. | conflict:editor; ADR-0004 |
| REQ-226 | `prd:editor-support` | functional | F04 | partly built | A render error shows inline with the line number and the parser message, and the last good render stays visible above it. | — |
| REQ-227 | `prd:editor-support` | functional | F09 | partly built | The slash menu inserts starters for Mermaid diagram types, charts from metrics or a CSV or a selected table, math, callouts, footnotes, CSV blocks, embeds, and details. | — |
| REQ-228 | `prd:editor-support` | functional | F05 | not started | Chart from table converts a selected Markdown table into a chart block with the values inline. The transform is deterministic, not AI. | — |
| REQ-229 | `prd:charts-in-review` | functional | F12 | not started | A changed diagram or chart renders before and after, side by side, with the source diff underneath. | — |
| REQ-230 | `prd:charts-in-review` | functional | F12 | not started | Math, callouts, and embeds render inside the rendered diff. | — |
| REQ-231 | `prd:performance-and-safety` | non-functional | F04 | partly built | KaTeX and Shiki render on the server. Mermaid and Vega-Lite render in the browser, lazy-loaded only on pages that use them, and the rendered SVG is cached by content hash. | — |
| REQ-232 | `prd:performance-and-safety` | constraint | X | built | Mermaid runs at its strict security level. | — |
| REQ-233 | `prd:performance-and-safety` | constraint | F05 | partly built | Chart specs are validated against the Vega-Lite schema and a data-source allowlist. | — |
| REQ-234 | `prd:performance-and-safety` | constraint | F03 | built | Embeds resolve at most three levels deep and never loop. | gap:embed-limit; ADR-0020 |
| REQ-235 | `prd:portability` | constraint | F04 | built | On GitHub, tables, task lists, footnotes, callouts, math, and Mermaid use syntax that GitHub renders. Chart blocks and embeds stay readable as plain source. | — |
| REQ-236 | `prd:portability` | functional | F19 | not started | Export can optionally add a static SVG snapshot under each chart for tools that cannot render Vega-Lite. | — |
| REQ-237 | `prd:proposals-and-review` | constraint | F12 | not started | A proposal is a suggested create or update against a specific base revision. | — |
| REQ-238 | `prd:proposals-and-review` | principle | F12 | not started | Review is the product's signature experience and gets the most design care. | — |
| REQ-239 | `prd:proposal-lifecycle` | functional | F12 | not started | A valid propose_change creates a proposal with status open. An invalid submission creates no proposal and returns errors. | — |
| REQ-240 | `prd:proposal-lifecycle` | functional | F12 | not started | A reviewer can move an open proposal to changes_requested. update_proposal moves it back to open. | — |
| REQ-241 | `prd:proposal-lifecycle` | functional | F12 | not started | A reviewer can merge or reject an open proposal. The author can withdraw an open proposal. | — |
| REQ-242 | `prd:proposal-lifecycle` | functional | F12 | not started | A reviewer can reject a proposal that is in changes_requested. | — |
| REQ-243 | `prd:proposal-lifecycle` | constraint | F12 | not started | Merged, rejected, and withdrawn are terminal statuses. | — |
| REQ-244 | `prd:proposal-lifecycle` | functional | F12 | not started | A proposal left open for 30 days is marked stale and stays open. | — |
| REQ-245 | `prd:proposal-contents` | constraint | F12 | not started | A proposal action is create or update. Rename, archive, and delete are human-only. | gap:rename; ADR-0018 |
| REQ-246 | `prd:proposal-contents` | constraint | F12 | not started | A proposal has a target path. An update requires base_revision_id, the revision the agent read. | — |
| REQ-247 | `prd:proposal-contents` | constraint | F12 | not started | Proposal content is either the full new Markdown or a list of find-and-replace pairs applied to the base. | gap:edits-match; ADR-0021 |
| REQ-248 | `prd:proposal-contents` | constraint | F12 | not started | A proposal summary is one required line of at most 120 characters. Rationale is an optional paragraph. | — |
| REQ-249 | `prd:proposal-contents` | constraint | F12 | not started | The author is an agent key label plus the owning user, or a human contributor. | — |
| REQ-250 | `prd:review-screen` | functional | F12 | not started | The review header shows summary, author with an agent glyph, action, target path, age, and a validation badge. | — |
| REQ-251 | `prd:review-screen` | functional | F12 | not started | The default diff is rendered. Insertions are highlighted green, deletions are struck in red, and unchanged sections collapse to one expandable line. | — |
| REQ-252 | `prd:review-screen` | functional | F12 | not started | D toggles a line-level Markdown source diff. | — |
| REQ-253 | `prd:review-screen` | functional | F12 | not started | The frontmatter diff is a table of field, before, and after. A metric change shows the delta. | gap:delta-baseline; ADR-0026 |
| REQ-254 | `prd:review-screen` | functional | F12 | not started | A new document is shown fully rendered with a new tag, not as a diff. | — |
| REQ-255 | `prd:review-screen` | functional | F12 | not started | Rationale, when present, is shown under the header. | — |
| REQ-256 | `prd:review-screen` | functional | F12 | not started | Review actions are Merge (M), Request changes (C, which requires a note), Reject (R, with an optional reason), Next (J), Previous (K), and Edit before merge (E). | gap:keymap-scope; ADR-0024 |
| REQ-257 | `prd:review-screen` | functional | F12 | not started | Edit before merge lets the reviewer fix a typo and merge in one step. The revision records both the agent and the reviewer. | gap:keymap-scope; ADR-0024 |
| REQ-258 | `prd:diff-engine` | functional | F12 | not started | The diff parses both versions into Markdown blocks, aligns blocks by position and similarity, then runs a word-level diff inside changed blocks. | gap:diff-similarity; ADR-0023 |
| REQ-259 | `prd:diff-engine` | principle | F12 | not started | The diff is prose-readable rather than a line diff. | gap:diff-similarity; ADR-0023 |
| REQ-260 | `prd:merge-and-conflicts` | functional | F12 | not started | When base_revision_id equals the current head, the proposal merges directly. | — |
| REQ-261 | `prd:merge-and-conflicts` | functional | F12 | not started | When the base is not the head, merge runs a three-way merge of base, head, and proposal. | gap:merge-frontmatter; ADR-0022 |
| REQ-262 | `prd:merge-and-conflicts` | functional | F12 | not started | A clean rebase shows "Rebased onto latest" and merges normally. | — |
| REQ-263 | `prd:merge-and-conflicts` | functional | F12 | not started | A conflict marks the proposal conflicted. The reviewer resolves it side by side, or requests changes so the agent re-reads and resubmits. | — |
| REQ-264 | `prd:on-merge` | functional | F07 | not started | Merge runs in one database transaction: create the revision, move the document head, recompute links and backlinks, write metric points for experiments, and log an audit event. | conflict:storage; ADR-0003 |
| REQ-265 | `prd:on-merge` | functional | F13 | deferred | After merge, get_proposal shows the agent that the proposal is merged. | — |
| REQ-266 | `prd:mcp-and-api` | functional | F13 | deferred | The product hosts a remote MCP server at /api/mcp using the official MCP TypeScript SDK and Streamable HTTP. | — |
| REQ-267 | `prd:mcp-and-api` | functional | F13 | deferred | An agent connects with a URL and either an API key or an OAuth sign-in, with no CLI and no GitHub. | — |
| REQ-268 | `prd:mcp-and-api` | functional | F13 | deferred | A REST API mirrors the same operations for scripts. | — |
| REQ-269 | `prd:connecting-an-agent` | functional | F13 | deferred | Settings, then Agent keys, shows a pre-filled MCP snippet with the space's bearer key. | — |
| REQ-270 | `prd:connecting-an-agent` | functional | F13 | deferred | That screen has copy buttons for Cursor, Claude Code, and a generic client. | — |
| REQ-271 | `prd:connecting-an-agent` | example | F13 | deferred | The sample mcp.json, with a ledger URL and an Authorization bearer header, illustrates that snippet. | — |
| REQ-272 | `prd:connecting-assistants` | principle | F14 | deferred | One MCP endpoint serves every client. Developer tools send API keys. Consumer assistants use OAuth. Both paths reach the same ten tools. | — |
| REQ-273 | `prd:connecting-assistants` | functional | F13 | deferred | Cursor connects through mcp.json with a URL and a header, using an API key. | — |
| REQ-274 | `prd:connecting-assistants` | functional | F13 | deferred | Claude Code connects with claude mcp add, a URL, and a header, using an API key. | — |
| REQ-275 | `prd:connecting-assistants` | functional | F14 | deferred | Claude on the web, desktop, and mobile connects as a custom connector with the MCP URL, using OAuth. | — |
| REQ-276 | `prd:connecting-assistants` | functional | F14 | deferred | ChatGPT connects as a custom connector or developer-mode MCP, where the plan supports it, using OAuth. | — |
| REQ-277 | `prd:connecting-assistants` | functional | F14 | deferred | Meta Muse connects as a custom connector with the MCP URL, using OAuth. A directory listing comes later. | — |
| REQ-278 | `prd:connecting-assistants` | functional | F13 | deferred | Grokbot, eval scripts, and other clients use the REST API or MCP with an API key. | — |
| REQ-279 | `prd:connecting-assistants` | functional | F13 | deferred | Settings, then Connect, shows one card per client with its setup steps, a copy button, and a link to that client's current docs. | — |
| REQ-280 | `prd:oauth-for-mcp` | constraint | F14 | deferred | MCP authorization is OAuth 2.1 with PKCE, protected-resource metadata at /.well-known/oauth-protected-resource, authorization-server metadata, and dynamic client registration. | — |
| REQ-281 | `prd:oauth-for-mcp` | constraint | F14 | deferred | The only scopes are read and propose. read means "Read documents, templates and metrics in this space". propose means "Suggest new or changed documents for your review; cannot publish anything". | — |
| REQ-282 | `prd:oauth-for-mcp` | functional | F14 | deferred | The consent screen lets the user pick the space and the scopes. A grant is always tied to one space. | — |
| REQ-283 | `prd:oauth-for-mcp` | constraint | F14 | deferred | Access tokens last 1 hour. Refresh tokens last 30 days, rotate on use, and are revoked with the grant. | — |
| REQ-284 | `prd:oauth-for-mcp` | constraint | F14 | deferred | There is no merge scope, so no assistant can be granted publishing power. | — |
| REQ-285 | `prd:capture-from-anywhere` | functional | F14 | deferred | A spoken note becomes a proposal. The assistant files it as an experiment with status planned, or as a doc note, and it waits in the Inbox. | — |
| REQ-286 | `prd:capture-from-anywhere` | functional | F06 | not started | Validation still applies to a captured note. A vague note returns a structured error the assistant can resolve by asking one follow-up question. | — |
| REQ-287 | `prd:tools` | constraint | F13 | deferred | There are ten tools. All of them read, validate, or propose. None merge, delete, or administer. | — |
| REQ-288 | `prd:tools` | functional | F13 | deferred | get_context accepts an optional detail of brief or full, and returns agents.md, the active harness, active evals with metric definitions, current findings, accepted decisions, and the last 10 experiments as frontmatter only. | gap:token-budget; ADR-0028 |
| REQ-289 | `prd:tools` | functional | F13 | deferred | list_documents accepts optional type, status, limit defaulting to 50, and cursor, and returns paths, titles, types, status, and updated dates. | — |
| REQ-290 | `prd:tools` | functional | F13 | deferred | read_document accepts a path or slug and an optional version, and returns Markdown, parsed frontmatter, revision id, and backlinks. | — |
| REQ-291 | `prd:tools` | functional | F13 | deferred | search accepts a query, an optional type, and a limit defaulting to 20, and returns hits with path, title, snippet, and score. | gap:search-score; ADR-0029 |
| REQ-292 | `prd:tools` | functional | F13 | deferred | get_template accepts a type and returns template Markdown, the field schema, writing guidance, and the filename pattern. | — |
| REQ-293 | `prd:tools` | functional | F06 | not started | validate accepts a path and content and returns valid, errors, and warnings, without creating anything. | — |
| REQ-294 | `prd:tools` | functional | F12 | not started | propose_change accepts action, path, optional content, optional edits, optional base revision, summary, and optional rationale, and returns proposal id, status, and url, or validation errors. | gap:edits-match; ADR-0021 |
| REQ-295 | `prd:tools` | functional | F13 | deferred | get_proposal accepts a proposal id and returns status, reviewer notes, and the merged revision id. | — |
| REQ-296 | `prd:tools` | functional | F12 | not started | update_proposal accepts a proposal id and optional content, edits, and summary, and revises the proposal only when changes were requested. | — |
| REQ-297 | `prd:tools` | functional | F16 | not started | get_metrics accepts an eval and optional metric and harness, and returns a time series of metric points with experiment links. | — |
| REQ-298 | `prd:tools` | constraint | F13 | deferred | The space comes from the key. Tools never take a space argument. | — |
| REQ-299 | `prd:error-format` | functional | F06 | not started | Every error is structured so an agent can self-correct: valid false, and errors with field, code, message, and hint. | — |
| REQ-300 | `prd:error-format` | example | F06 | not started | The sample link_unpinned error, telling the agent to use a versioned harness link and stating the active version, illustrates that shape. | — |
| REQ-301 | `prd:tool-descriptions` | functional | F13 | deferred | Each tool description tells the agent the workflow: call get_context first, get_template before creating, validate when unsure, one document per proposal, and never invent metric values. | — |
| REQ-302 | `prd:tool-descriptions` | functional | F13 | deferred | agents.md repeats those rules in the space owner's words. get_context and get_template also return a short syntax reference for callouts, Mermaid, math, embeds, and charts, including a metrics-backed chart example. | — |
| REQ-303 | `prd:rest-api` | constraint | F13 | deferred | The REST API uses the same auth header, JSON in and out, under /api/v1. | — |
| REQ-304 | `prd:rest-api` | functional | F13 | deferred | GET /context maps to get_context. | — |
| REQ-305 | `prd:rest-api` | functional | F13 | deferred | GET /documents, with optional type and status, maps to list_documents. | — |
| REQ-306 | `prd:rest-api` | functional | F13 | deferred | GET /documents/{path} maps to read_document. | — |
| REQ-307 | `prd:rest-api` | functional | F13 | deferred | GET /search maps to search. | gap:search-score; ADR-0029 |
| REQ-308 | `prd:rest-api` | functional | F13 | deferred | GET /templates/{type} maps to get_template. | — |
| REQ-309 | `prd:rest-api` | functional | F06 | not started | POST /validate maps to validate. | — |
| REQ-310 | `prd:rest-api` | functional | F12 | not started | POST /proposals maps to propose_change. GET /proposals/{id} maps to get_proposal. PATCH /proposals/{id} maps to update_proposal. | — |
| REQ-311 | `prd:rest-api` | functional | F16 | not started | GET /metrics maps to get_metrics. | — |
| REQ-312 | `prd:rest-api` | functional | F13 | deferred | Eval scripts can post experiment results through the REST API with no agent in the loop. | — |
| REQ-313 | `prd:limits` | constraint | F13 | deferred | Each key allows 60 requests per minute and 30 proposals per hour. Beyond that the server returns 429 with retry-after. | gap:rate-limit-oauth; ADR-0025 |
| REQ-314 | `prd:limits` | constraint | F01 | not started | A document may be at most 200 KB. | — |
| REQ-315 | `prd:limits` | constraint | F12 | not started | A key may have at most 20 open proposals. | — |
| REQ-316 | `prd:limits` | constraint | F06 | not started | A proposal identical to the current head is rejected as no_change. | — |
| REQ-317 | `prd:validation` | principle | F06 | not started | Validation is fully deterministic. The same validator runs on agent proposals, human saves, imports, and the validate tool. | — |
| REQ-318 | `prd:validation-rules` | constraint | F06 | not started | yaml_invalid is an error when frontmatter does not parse as YAML. | — |
| REQ-319 | `prd:validation-rules` | constraint | F06 | not started | type_unknown is an error when type does not match a schema in .ledger/types/. | gap:schema-frontmatter; ADR-0014 |
| REQ-320 | `prd:validation-rules` | constraint | F06 | not started | field_missing is an error when a required field is absent, including a required_when condition. | gap:required-when; ADR-0016 |
| REQ-321 | `prd:validation-rules` | constraint | F06 | not started | field_kind is an error when a value does not match its kind: a date must be ISO, a number must be numeric, and an enum must be an allowed value. | — |
| REQ-322 | `prd:validation-rules` | constraint | F06 | not started | field_unknown is a warning when a frontmatter key is not in the schema. | — |
| REQ-323 | `prd:validation-rules` | constraint | F06 | not started | link_broken is an error in frontmatter and a warning in the body when the linked slug does not exist. | gap:archived-link; ADR-0019 |
| REQ-324 | `prd:validation-rules` | constraint | F06 | not started | link_unpinned is an error when a pinned link field has no @version. | gap:pinned-target; ADR-0017 |
| REQ-325 | `prd:validation-rules` | constraint | F06 | not started | version_missing is an error when the pinned version does not exist. | gap:pinned-target; ADR-0017 |
| REQ-326 | `prd:validation-rules` | constraint | F06 | not started | metric_unknown is an error when a results key is not defined on the linked eval. | — |
| REQ-327 | `prd:validation-rules` | constraint | F06 | not started | metric_missing is a warning when a concluded experiment omits an eval metric. | — |
| REQ-328 | `prd:validation-rules` | constraint | F06 | not started | metric_range is an error when a value falls outside the metric's declared range. | — |
| REQ-329 | `prd:validation-rules` | constraint | F06 | not started | path_invalid is an error when the path does not match the type's folder and filename pattern. | gap:filename; ADR-0013 |
| REQ-330 | `prd:validation-rules` | constraint | F06 | not started | slug_taken is an error when a create collides with an existing slug. | gap:slug; ADR-0012 |
| REQ-331 | `prd:validation-rules` | constraint | F06 | not started | base_missing is an error when an update has no real base revision. | — |
| REQ-332 | `prd:validation-rules` | constraint | F06 | not started | version_not_bumped is a warning when harness or eval content changes without a version increase. | gap:pinned-target; ADR-0017 |
| REQ-333 | `prd:validation-rules` | constraint | F06 | not started | section_missing is a warning when a schema section is not present as a heading. | — |
| REQ-334 | `prd:validation-rules` | constraint | F06 | not started | no_change is an error when content does not differ from the head. | — |
| REQ-335 | `prd:validation-rules` | constraint | F06 | not started | too_large is an error when content is not under 200 KB. | — |
| REQ-336 | `prd:validation-behavior` | functional | F06 | not started | Errors block proposals and saves. Warnings show on the review screen and in the editor, and they do not block. | — |
| REQ-337 | `prd:validation-behavior` | functional | F06 | not started | Every error carries a field or a line, a code, a plain message, and a hint with the likely fix. | — |
| REQ-338 | `prd:validation-behavior` | constraint | F06 | not started | Validation is a pure function of the content, the type schemas, and the space's current documents, and it is unit-tested heavily. | — |
| REQ-339 | `prd:validation-behavior` | functional | F06 | not started | Editing a type schema does not re-validate existing documents. They stay as written and are checked on their next change. | — |
| REQ-340 | `prd:validation-behavior` | functional | F06 | not started | Rendering checks are body warnings, so a broken diagram never blocks a finding: chart_invalid, math_invalid, embed_broken, and mermaid_invalid. | — |
| REQ-341 | `prd:validation-behavior` | functional | F04 | partly built | Chart and math checks run on the server. Mermaid checks run in the editor and on the review screen. | — |
| REQ-342 | `prd:measurement-layer` | principle | F16 | not started | Metrics come from merged experiment frontmatter. Nothing is entered twice. | — |
| REQ-343 | `prd:measurement-layer` | functional | F16 | not started | When an experiment with status concluded merges, each results value becomes a metric point. | — |
| REQ-344 | `prd:metric-point` | constraint | F16 | not started | A metric point takes eval and eval version from the experiment's pinned eval link. | gap:pinned-target; ADR-0017 |
| REQ-345 | `prd:metric-point` | constraint | F16 | not started | A metric point takes the metric key, unit, and better direction from the eval's metrics definition, and the value from the experiment's results. | — |
| REQ-346 | `prd:metric-point` | constraint | F16 | not started | A metric point takes harness and harness version from the experiment's pinned harness link, and the date from the experiment. | — |
| REQ-347 | `prd:metric-point` | constraint | F16 | not started | A metric point copies environment and sample size from the experiment, and records the experiment and the merged revision. | — |
| REQ-348 | `prd:metric-point` | functional | F16 | not started | When a concluded experiment is later edited, its points are replaced by the new revision's values, and history keeps the old values. | — |
| REQ-349 | `prd:metrics-screen` | functional | F16 | not started | The eval picker defaults to the space's default eval, and a metric picker follows it. | — |
| REQ-350 | `prd:metrics-screen` | functional | F16 | not started | The over-time chart uses experiment date on x and the metric on y. Points are colored by harness version and connected per version. The eval baseline is a dashed line. | gap:baseline-value; gap:repeat-experiment; ADR-0026; ADR-0027 |
| REQ-351 | `prd:metrics-screen` | functional | F16 | not started | Hover shows the experiment title, value, and sample size. Click opens the experiment. | — |
| REQ-352 | `prd:metrics-screen` | functional | F16 | not started | The harness comparison table has one row per harness version, with n, mean, median, best, latest, and delta versus baseline. Deltas are green or red according to the metric's better direction. | gap:delta-baseline; ADR-0026 |
| REQ-353 | `prd:metrics-screen` | functional | F16 | not started | Compare two versions: pick A and B and see every metric side by side with deltas. | gap:delta-baseline; ADR-0026 |
| REQ-354 | `prd:comparability-rules` | constraint | F16 | not started | Results from different eval versions never share a chart line. Changing an eval's method means bumping its version, and the chart splits. | — |
| REQ-355 | `prd:comparability-rules` | functional | F16 | not started | Experiments with verdict inconclusive still plot, drawn hollow. Abandoned experiments produce no points. | — |
| REQ-356 | `prd:comparability-rules` | constraint | F16 | not started | v1 shows descriptive numbers only: n, mean, median, min, and max. It runs no significance tests, and the sample size is always visible. | — |
| REQ-357 | `prd:setting-up-memento` | functional | F22 | deferred | The first session seeds one harness per distinct setup found in existing artifacts, one eval per repeatable test, and one experiment per recorded run. | — |
| REQ-358 | `prd:setting-up-memento` | functional | F22 | not started | The metrics each eval tracks are defined by the owner when writing the eval files. | — |
| REQ-359 | `prd:setting-up-memento` | functional | F22 | not started | The screens stay useful before seeding is complete. One eval and three experiments are enough for a first chart. | — |
| REQ-360 | `prd:auth-permissions-and-sharing` | constraint | F15 | deferred | Humans sign in with sessions. Agents use scoped API keys or OAuth grants. The two never mix. | conflict:auth; ADR-0002 |
| REQ-361 | `prd:auth-permissions-and-sharing` | constraint | F13 | deferred | An agent key cannot open the web app, and a browser session cannot propose on an agent's behalf. | conflict:auth; ADR-0002 |
| REQ-362 | `prd:human-sign-in` | constraint | F15 | deferred | Human sign-in uses Better Auth or Auth.js, with GitHub OAuth, Google OAuth, and email magic link. There are no passwords. | conflict:auth; ADR-0002 |
| REQ-363 | `prd:human-sign-in` | constraint | F15 | deferred | Sessions are stored in the database and sent as httpOnly, Secure, SameSite=Lax cookies, with a 30-day rolling expiry. | conflict:auth; ADR-0002 |
| REQ-364 | `prd:human-sign-in` | constraint | F15 | deferred | Every mutation has CSRF protection, and every server action checks membership and role on the server. | conflict:auth; ADR-0002 |
| REQ-365 | `prd:roles` | constraint | F15 | deferred | An owner can read, propose, edit directly, merge, and manage members, keys, and types. | conflict:auth; ADR-0002 |
| REQ-366 | `prd:roles` | constraint | F15 | deferred | An editor can read, propose, edit directly, and merge, and cannot manage members, keys, or types. | conflict:auth; ADR-0002 |
| REQ-367 | `prd:roles` | constraint | F15 | deferred | A contributor can read and propose, and cannot edit directly, merge, or manage members, keys, or types. | conflict:auth; ADR-0002 |
| REQ-368 | `prd:roles` | constraint | F15 | deferred | A viewer can read, and cannot propose, edit, merge, or manage. | conflict:auth; ADR-0002 |
| REQ-369 | `prd:agent-keys` | functional | F13 | deferred | Owners and editors create keys in Settings, then Agent keys. Each key has a label, a scope of read or propose, and an owning user. | — |
| REQ-370 | `prd:agent-keys` | constraint | F13 | deferred | A key has the form lk_, the space, and 32 random characters. It is shown once and stored as a SHA-256 hash plus a visible prefix. | — |
| REQ-371 | `prd:agent-keys` | functional | F13 | deferred | A key shows last used time and proposal count. Revoking takes effect immediately. | — |
| REQ-372 | `prd:agent-keys` | constraint | F13 | deferred | A key can never merge, edit directly, archive, manage members, or read another space. | — |
| REQ-373 | `prd:oauth-grants` | functional | F14 | deferred | Every OAuth connection appears in Settings, then Agents, beside API keys, labeled by client and user. | — |
| REQ-374 | `prd:oauth-grants` | functional | F14 | deferred | Each grant shows its space, scopes, last used time, and proposal count. Revoking kills its tokens immediately. | — |
| REQ-375 | `prd:oauth-grants` | functional | F12 | not started | Proposals from OAuth grants carry the same agent glyph and label as key-based agents. | — |
| REQ-376 | `prd:sharing` | functional | F11 | replaced | A person invites by email with a role, and the invite expires after 7 days. | conflict:sharing; stands: C8; ADR-0010 |
| REQ-377 | `prd:sharing` | functional | F11 | replaced | A space has an optional public read-only link, off by default. A public view never shows proposals, keys, or members. | conflict:sharing; stands: C8; ADR-0010 |
| REQ-378 | `prd:sharing` | functional | F15 | deferred | Every privileged action writes an audit event: merges, rejects, role changes, key creation, and key revocation. | conflict:auth; ADR-0002 |
| REQ-379 | `prd:security-basics` | constraint | X | built | Rendered Markdown is sanitized, and HTML is limited to the safe subset in Markdown capabilities. | — |
| REQ-380 | `prd:security-basics` | constraint | F19 | not started | Uploaded assets are served from signed URLs. | — |
| REQ-381 | `prd:security-basics` | constraint | X | partly built | All secrets live in environment variables. No keys are shipped in client code. | — |
| REQ-382 | `prd:architecture-and-data-model` | constraint | X | partly built | v1 is one Next.js app on Vercel, one Postgres database, and one blob store. | conflict:storage; ADR-0003 |
| REQ-383 | `prd:architecture-and-data-model` | constraint | X | built | v1 has no queues, no workers, and no separate MCP service. | — |
| REQ-384 | `prd:stack` | constraint | X | partly built | The app is Next.js App Router, TypeScript, and React. Mutations go through server actions. | — |
| REQ-385 | `prd:stack` | constraint | X | built | Hosting is Vercel, for deploys and preview URLs. | — |
| REQ-386 | `prd:stack` | constraint | F07 | not started | The database is Postgres on Neon with Drizzle ORM. | conflict:storage; ADR-0003 |
| REQ-387 | `prd:stack` | constraint | F15 | deferred | Auth is Better Auth, including its OAuth provider for MCP clients. | conflict:auth; ADR-0002 |
| REQ-388 | `prd:stack` | constraint | F13 | deferred | MCP uses the official TypeScript SDK as Streamable HTTP at /api/mcp. | — |
| REQ-389 | `prd:stack` | constraint | F04 | partly built | Markdown uses one parser for render, diff, links, and validation: unified, remark-parse, remark-gfm, remark-frontmatter, a wiki-link plugin, remark-math, rehype-katex, Shiki, Mermaid, and rehype-sanitize. | — |
| REQ-390 | `prd:stack` | constraint | F09 | replaced | The editor stack is CodeMirror 6 with a live-preview extension. | conflict:editor; stands: C2, C8; ADR-0004 |
| REQ-391 | `prd:stack` | constraint | F12 | not started | Word diffs use jsdiff. Three-way merges use node-diff3. | gap:merge-frontmatter; ADR-0022 |
| REQ-392 | `prd:stack` | constraint | F06 | not started | Validation uses Zod schemas generated from the type schema files, and the same validator runs on server and client. | — |
| REQ-393 | `prd:stack` | constraint | F17 | not started | Search is Postgres full-text search plus pg_trgm, with no embeddings and no extra service. | gap:search-score; ADR-0029 |
| REQ-394 | `prd:stack` | constraint | F05 | partly built | Charts use Vega-Lite through vega-embed, one engine for document charts and the Metrics screen. | — |
| REQ-395 | `prd:stack` | constraint | F08 | partly built | The UI uses Tailwind CSS, Radix primitives, and cmdk for the command palette. | conflict:modals; ADR-0009 |
| REQ-396 | `prd:stack` | constraint | F19 | not started | Assets use Vercel Blob or Cloudflare R2, with signed URLs. | — |
| REQ-397 | `prd:data-model` | constraint | F15 | deferred | users stores id, email, name, avatar url, and created time. spaces stores id, slug, name, a public-read flag, and created time. memberships stores space, user, role, and created time. | conflict:auth; ADR-0002 |
| REQ-398 | `prd:data-model` | constraint | F07 | not started | documents stores id, space, path, slug, type, title, head revision, archived time, and created and updated times. | conflict:storage; gap:legal-delete; ADR-0003 |
| REQ-399 | `prd:data-model` | constraint | F07 | not started | revisions stores id, document, parent revision, full content, frontmatter, content hash, optional version, message, author user, optional agent key, optional proposal, and created time. | conflict:storage; ADR-0003 |
| REQ-400 | `prd:data-model` | constraint | F12 | not started | proposals stores the action, path, optional base revision, content, optional edits, summary, rationale, status, validation, author, reviewer, review note, and merged revision. | gap:edits-match; ADR-0021 |
| REQ-401 | `prd:data-model` | constraint | F07 | not started | drafts stores document, user, content, and updated time. | conflict:storage; ADR-0003 |
| REQ-402 | `prd:data-model` | constraint | F13 | deferred | agent_keys stores space, owner, label, scope, key prefix, key hash, last used time, revoked time, and created time. | — |
| REQ-403 | `prd:data-model` | constraint | F03 | not started | links stores the source document, target slug, optional target version, whether the link is in frontmatter, and the field. | gap:pinned-target; ADR-0017 |
| REQ-404 | `prd:data-model` | constraint | F16 | not started | metric_points stores the experiment document, revision, eval slug and version, metric key, value, harness slug and version, date, environment, sample size, and verdict. | — |
| REQ-405 | `prd:data-model` | constraint | F19 | not started | assets stores space, path, blob url, mime type, size, and created time. | — |
| REQ-406 | `prd:data-model` | constraint | F15 | deferred | audit_events stores space, actor user, agent key, action, target, data, and created time. | conflict:auth; ADR-0002 |
| REQ-407 | `prd:invariants` | constraint | F07 | not started | Revisions are immutable and store full content. | conflict:storage; ADR-0003 |
| REQ-408 | `prd:invariants` | constraint | F07 | not started | Only two paths create revisions: a human save and a merge. Both run the validator. | conflict:storage; ADR-0003 |
| REQ-409 | `prd:invariants` | constraint | F07 | not started | documents.head_revision_id moves inside the same transaction that creates the revision. | conflict:storage; ADR-0003 |
| REQ-410 | `prd:invariants` | constraint | F07 | not started | links and metric_points are derived data and can be rebuilt from revisions with one script. | — |
| REQ-411 | `prd:invariants` | constraint | F07 | partly built | Documents are archived, never deleted. | gap:legal-delete |
| REQ-412 | `prd:invariants` | functional | F03 | not started | A version lookup for [[slug@7]] finds the first revision of that document whose version column equals 7. | gap:pinned-target; ADR-0017 |
| REQ-413 | `prd:code-structure` | constraint | X | not started | Screens live under app/(app)/[space]. The MCP server is app/api/mcp/route.ts. REST lives under app/api/v1. Shared code is split into markdown, schema, validate, proposals, metrics, auth, and db. | conflict:name; ADR-0001 |
| REQ-414 | `prd:code-structure` | principle | X | partly built | The MCP route, REST routes, and server actions call the same functions. There is one implementation of every operation. | — |
| REQ-415 | `prd:search-import-and-export` | principle | F19 | partly built | The reader's data is always a folder of Markdown away. | — |
| REQ-416 | `prd:search-import-and-export` | functional | F17 | partly built | Search is keyword-based and fast. | gap:search-score; gap:perf-percentile; ADR-0029 |
| REQ-417 | `prd:search-import-and-export` | principle | F19 | partly built | Import and export use the exact file format. | gap:export-identity; ADR-0033 |
| REQ-418 | `prd:search` | functional | F17 | partly built | Command-K opens one palette for documents, commands, and filters. | conflict:modals; ADR-0009 |
| REQ-419 | `prd:search` | functional | F17 | partly built | Search is full-text over title, body, and frontmatter values, ranked by title match, then recency. | gap:search-score; ADR-0029 |
| REQ-420 | `prd:search` | functional | F17 | not started | Filters can be typed inline, including type, status, harness, verdict, and after a date. | — |
| REQ-421 | `prd:search` | non-functional | F17 | partly built | A result shows a type icon, title, path, and a snippet with matches highlighted, in under 100 milliseconds for a space of up to 10,000 documents. | gap:perf-percentile; gap:search-score; ADR-0029 |
| REQ-422 | `prd:import` | functional | F19 | partly built | A person can drag a folder or a zip of Markdown files onto Settings, then Import, or onto the sidebar. | — |
| REQ-423 | `prd:import` | functional | F19 | not started | Each imported file is validated. Valid files become documents with one initial revision each, authored Import. | — |
| REQ-424 | `prd:import` | functional | F19 | not started | Invalid files are listed with their errors and a Download report button. Nothing partial is saved for a file. | gap:import-batch; ADR-0032 |
| REQ-425 | `prd:import` | functional | F19 | partly built | A file without frontmatter imports as type doc, with the file name as the title. | — |
| REQ-426 | `prd:import` | constraint | X | built | Converting Claude artifacts or HTML is an agent's job. The product does not interpret them. | — |
| REQ-427 | `prd:export` | functional | F19 | partly built | Settings, then Export, downloads a zip of the whole space as its folder of Markdown files, including .ledger/ and assets/. Re-importing that zip recreates the space. | gap:export-identity; ADR-0033 |
| REQ-428 | `prd:export` | functional | F19 | not started | An optional per-document history export writes one file per revision under .history/. | — |
| REQ-429 | `prd:backup` | functional | F07 | not started | Neon point-in-time restore covers the database. | conflict:storage; ADR-0003 |
| REQ-430 | `prd:backup` | constraint | F19 | deferred | v1.1 adds a nightly job that pushes the space as Markdown to a private GitHub repo, one commit per night. That repo is a backup mirror, never an input. | — |
| REQ-431 | `prd:design-language` | principle | F21 | built | The feel is Cursor: dark-first, dense, quiet, and fast. The content is the interface, and chrome gets out of the way. | — |
| REQ-432 | `prd:foundations` | constraint | F10 | built | The theme defaults to dark, light is available, and the theme can follow the system. | — |
| REQ-433 | `prd:foundations` | constraint | F21 | replaced | Surfaces are a near-black base, one step lighter for panels, with hairline 1 pixel borders and no shadows. | conflict:surfaces; stands: C2; ADR-0006 |
| REQ-434 | `prd:foundations` | constraint | F21 | built | One accent color is used for focus, selection, and primary actions. | — |
| REQ-435 | `prd:foundations` | constraint | F21 | partly built | Green means improvement and insertions. Red means regression and deletions. Amber means warnings. | — |
| REQ-436 | `prd:foundations` | constraint | F21 | partly built | UI type is Geist or Inter, at 13 pixels, with meta at 12 pixels. | — |
| REQ-437 | `prd:foundations` | constraint | F21 | replaced | Reading type is 16 pixels, with 1.6 line height and a 720 pixel maximum width. | conflict:reading; stands: C4; ADR-0005 |
| REQ-438 | `prd:foundations` | constraint | F21 | partly built | Paths, keys, frontmatter, and code use Geist Mono or JetBrains Mono. | — |
| REQ-439 | `prd:foundations` | constraint | F21 | replaced | Controls use a 6 pixel radius and panels use an 8 pixel radius. | conflict:radius; stands: C5; ADR-0007 |
| REQ-440 | `prd:foundations` | constraint | F21 | partly built | Motion is 120 to 160 milliseconds, ease-out, and content does not animate. | — |
| REQ-441 | `prd:interaction-rules` | non-functional | F20 | partly built | Everything is reachable by keyboard, and every list is navigable with J and K. | gap:a11y; ADR-0034 |
| REQ-442 | `prd:interaction-rules` | constraint | F20 | replaced | Prefer inline editing and side panels over modals. The only modals are confirmations for irreversible actions. | conflict:modals; stands: C6, C8; ADR-0009 |
| REQ-443 | `prd:interaction-rules` | functional | F12 | not started | Agent authorship is always visible: a small agent glyph plus the key label on proposals, revisions, and timeline rows. | — |
| REQ-444 | `prd:interaction-rules` | constraint | F21 | not started | Status is a colored dot plus a word, never color alone. | — |
| REQ-445 | `prd:interaction-rules` | functional | F08 | not started | Loading states are skeletons of the real layout. Merge and reject update optimistically. | gap:ui-states |
| REQ-446 | `prd:keyboard-shortcuts` | functional | F17 | partly built | Command-K opens search and commands. | conflict:modals; ADR-0009 |
| REQ-447 | `prd:keyboard-shortcuts` | functional | F09 | partly built | C creates a new document. | gap:keymap-scope; ADR-0024 |
| REQ-448 | `prd:keyboard-shortcuts` | functional | F09 | partly built | E edits the current document. | conflict:editor; gap:keymap-scope; ADR-0004; ADR-0024 |
| REQ-449 | `prd:keyboard-shortcuts` | functional | F09 | partly built | Command-S saves a revision. | conflict:storage; ADR-0003 |
| REQ-450 | `prd:keyboard-shortcuts` | functional | F12 | not started | G then I opens the Inbox, G then T opens Timeline, and G then M opens Metrics. | — |
| REQ-451 | `prd:keyboard-shortcuts` | functional | F12 | not started | In review, M merges, R rejects, and C requests changes. | gap:keymap-scope; ADR-0024 |
| REQ-452 | `prd:keyboard-shortcuts` | functional | F12 | not started | D toggles the rendered diff and the source diff. | — |
| REQ-453 | `prd:keyboard-shortcuts` | functional | F20 | not started | J and K move to the next and previous item. | gap:a11y; ADR-0034 |
| REQ-454 | `prd:keyboard-shortcuts` | functional | F08 | built | Command-backslash toggles the right-hand column. | conflict:panel; ADR-0008 |
| REQ-455 | `prd:keyboard-shortcuts` | functional | F09 | replaced | Command-slash toggles raw Markdown. | conflict:editor; stands: C2; ADR-0004 |
| REQ-456 | `prd:keyboard-shortcuts` | functional | F20 | built | ? shows all shortcuts. | conflict:modals; ADR-0009 |
| REQ-457 | `prd:build-plan` | constraint | X | partly built | The minimum useful loop is milestones 1 through 4. Everything after that can wait. | — |
| REQ-458 | `prd:build-plan` | constraint | X | partly built | Milestone 1, Foundation, is the Next.js app, Neon, the Drizzle schema, Better Auth, one space, and seeded .ledger/ files. | conflict:storage; conflict:auth; ADR-0003; ADR-0002 |
| REQ-459 | `prd:build-plan` | constraint | F04 | partly built | Milestone 2, Read path, is the Markdown parser with full rendering, the type schema loader, the validator with tests, the document view, and the sidebar. | — |
| REQ-460 | `prd:build-plan` | constraint | F13 | deferred | Milestone 3, Agent path, is agent keys, OAuth 2.1, the MCP route with all read tools plus validate and propose_change, and the REST mirror. | — |
| REQ-461 | `prd:build-plan` | constraint | F12 | not started | Milestone 4, Review, is the Inbox, a rendered word diff, merge and reject, revisions, and get_proposal. | — |
| REQ-462 | `prd:build-plan` | constraint | F16 | not started | Milestone 5, Metrics, is metric-point derivation on merge, the Metrics screen, and harness comparison. | — |
| REQ-463 | `prd:build-plan` | constraint | F09 | partly built | Milestone 6, Human editing, is CodeMirror live preview, the frontmatter form, drafts, Command-S revisions, and conflicts. | conflict:editor; ADR-0004 |
| REQ-464 | `prd:build-plan` | constraint | F18 | partly built | Milestone 7, Polish, is history and compare, Timeline, the search palette, import and export, and invites. | conflict:sharing; ADR-0010 |
| REQ-465 | `prd:acceptance-milestones-1-4` | functional | F13 | deferred | AC-01. From Cursor, the sentence "log this experiment to Ledger" produces a valid proposal with no manual fixes, using only MCP tools. | conflict:name; ADR-0001 |
| REQ-466 | `prd:acceptance-milestones-1-4` | functional | F06 | not started | AC-02. An invalid proposal returns structured errors, and the agent's retry succeeds. | — |
| REQ-467 | `prd:acceptance-milestones-1-4` | non-functional | F12 | not started | AC-03. The proposal appears in the Inbox within 2 seconds. | gap:perf-percentile |
| REQ-468 | `prd:acceptance-milestones-1-4` | functional | F12 | not started | AC-04. Merging creates a revision, updates the document, and marks the proposal merged for get_proposal. | — |
| REQ-469 | `prd:acceptance-milestones-1-4` | functional | F13 | deferred | AC-05. An agent key cannot merge, and a revoked key is refused immediately. | — |
| REQ-470 | `prd:acceptance-milestones-1-4` | non-functional | F13 | deferred | AC-06. get_context returns under 6 thousand tokens for a space with 100 experiments. | gap:token-budget; ADR-0028 |
| REQ-471 | `prd:acceptance-milestones-1-4` | functional | F14 | deferred | AC-07. Claude and Muse connect by pasting the MCP URL, signing in, and approving scopes, with no key copied by hand. | — |
| REQ-472 | `prd:acceptance-milestones-1-4` | functional | F14 | deferred | AC-08. OAuth grants appear in Settings, then Agents, and revoking one blocks its next call. | — |
| REQ-473 | `prd:acceptance-milestones-1-4` | constraint | F13 | deferred | AC-09. No OAuth scope or tool allows merging, editing directly, or deleting. | — |
| REQ-474 | `prd:acceptance-milestone-5` | functional | F16 | not started | AC-10. Merging a concluded experiment adds its points to the chart without a reload. | — |
| REQ-475 | `prd:acceptance-milestone-5` | functional | F16 | not started | AC-11. Two harness versions on the same eval show as separate colored series with correct deltas. | gap:delta-baseline; ADR-0026 |
| REQ-476 | `prd:acceptance-milestone-5` | functional | F16 | not started | AC-12. Bumping an eval version splits the chart. | — |
| REQ-477 | `prd:acceptance-milestones-6-7` | functional | F09 | partly built | AC-13. Editing and saving an untouched document produces an empty diff. | — |
| REQ-478 | `prd:acceptance-milestones-6-7` | functional | F19 | partly built | AC-14. Exporting and re-importing a space yields identical files. | gap:export-identity; ADR-0033 |
| REQ-479 | `prd:acceptance-milestones-6-7` | non-functional | F20 | partly built | AC-15. Every screen is usable with the keyboard alone. | gap:a11y; ADR-0034 |
| REQ-480 | `prd:acceptance-milestones-6-7` | non-functional | F12 | not started | AC-16. Review of a typical experiment proposal takes under two minutes. | — |
| REQ-481 | `prd:acceptance-milestones-6-7` | functional | F04 | partly built | AC-17. A test document that uses every syntax in Markdown capabilities renders the same in the view, in the editor preview, and in review. | — |
| REQ-482 | `prd:acceptance-milestones-6-7` | functional | F05 | not started | AC-18. A metrics-backed chart embedded in a finding updates after a new experiment merges. | — |
| REQ-483 | `prd:risks` | constraint | X | partly built | If building the product delays the Memento launch, stop after milestone 4 until Memento ships, and use a GitHub-style review until then. | — |
| REQ-484 | `prd:risks` | constraint | F12 | not started | Inbox flooding is limited by validation, rate limits, a cap of 20 open proposals per key, and keyboard triage. | gap:rate-limit-oauth; ADR-0025 |
| REQ-485 | `prd:risks` | constraint | F06 | not started | Invented or misreported metrics are limited by agents.md, the metric_unknown and range checks, and human review of every result. | — |
| REQ-486 | `prd:risks` | constraint | F02 | not started | Schemas that do not fit real experiments are handled by seeding from real artifacts first and by keeping schemas as editable Markdown. | — |
| REQ-487 | `prd:risks` | constraint | F09 | partly built | The editor must not rewrite Markdown and pollute diffs. Source-first editing is checked by an acceptance test for an empty diff. | — |
| REQ-488 | `prd:risks` | constraint | F14 | deferred | Assistant connector flows differ and change often. Follow the MCP authorization spec exactly, and test each client end to end before claiming support. | — |
| REQ-489 | `prd:risks` | constraint | F16 | not started | Small samples must not read as real trends. Always show n, and draw inconclusive runs as hollow points. | — |
| REQ-490 | `decisions:D1` | constraint | X | partly built | The first implementation scope is full v1, milestones 1 through 7. | — |
| REQ-491 | `decisions:D2` | constraint | X | built | The product is hosted on Vercel from the start, using the Vercel connection through Cursor. | conflict:storage; ADR-0003 |
| REQ-492 | `decisions:D3` | constraint | F15 | built | There is no human sign-in yet. | conflict:auth; ADR-0002 |
| REQ-493 | `decisions:D4` | constraint | F13 | built | How agents connect, whether by API keys only or also by MCP OAuth 2.1, is later work. | — |
| REQ-494 | `decisions:D5` | constraint | F09 | built | The first thing to run and show is the Markdown editor, before seeding Memento's sample documents. | conflict:storage; ADR-0003 |
| REQ-495 | `decisions:D6` | constraint | X | built | The product name in the UI is markdown-kb. A page is /{project}/{page-path}, for example /guide/docs/layout. /docs and /ledger redirect into the guide project. There is no /memento segment and no /docs/… page prefix. | conflict:name; stands; ADR-0001 |
| REQ-496 | `decisions:D7` | constraint | F15 | deferred | Owner and Editor may save directly, Contributors propose, and agents never merge, as in the PRD. | conflict:auth; ADR-0002 |
| REQ-497 | `decisions:D8` | constraint | X | partly built | The current scope is a Markdown editor with charts, Mermaid, and similar capabilities. Experiment run-log attachments are not in scope. | — |
| REQ-498 | `decisions:D` | principle | F21 | built | Readability and the Markdown experience come first, using reference layouts from Cursor, Devin, and similar agentic tools. | — |
| REQ-499 | `decisions:C1` | constraint | X | built | Hosting is a new Vercel project named markdown-kb-editor. | — |
| REQ-500 | `decisions:C2` | functional | F09 | built | Preview is the default. Editing is a block editor in the reading column, not a split pane. Source is a full-page editor. Command-/ or Control-/ switches between block editing and source. Inline live preview is not started. Hairline borders are removed in favor of solid fills. | conflict:editor; conflict:surfaces; stands; ADR-0004; ADR-0006 |
| REQ-501 | `decisions:C3` | functional | F08 | built | The left sidebar expands and retracts. When it retracts it is invisible, and a top-left icon brings it back. The choice persists. | — |
| REQ-502 | `decisions:C4` | constraint | F21 | built | Reading text is 17px with line-height 1.7. The column is capped at 760px. At that size 66ch is 744px, so the cap binds and the text is 696px wide. The split stacks on narrow screens, coarse pointers get 44px targets, and editing works on phones. | conflict:reading; conflict:phones; stands; ADR-0005; ADR-0011 |
| REQ-503 | `decisions:C5` | constraint | F21 | built | Radii are 12 pixels on controls, 10 pixels on outline rows, 18 pixels on content blocks, 20 pixels on dialogs, 8 pixels on inline code, and 6 pixels on marks. | conflict:radius; stands; ADR-0007 |
| REQ-504 | `decisions:C6` | functional | F10 | built | Settings is a window with a section list and a content pane, structured like Cursor and Devin. Theme choices are Light, Dark, and System. Dark is used when the choice is unset. | conflict:modals; stands; ADR-0009 |
| REQ-505 | `decisions:C7` | functional | F08 | built | Files, the page, and the outline are three full-height columns. The title row and the status line share the page color. | conflict:panel; stands; ADR-0008 |
| REQ-506 | `decisions:C8` | functional | X | built | The Edit button turns editing on from preview and off from either editing or source. A share sheet offers Anyone with the link, Can view or Can edit, and Copy link. The link sets the starting mode and grants no rights. | conflict:editor; conflict:sharing; stands; ADR-0004; ADR-0010 |
| REQ-507 | `decisions:C9` | constraint | X | built | The original product specs are reviewed and turned into detailed specs for spec-driven development, which is this plan. | — |

## Narrative

These passages state no testable behavior. They have no requirement ID. A section can appear here and also have requirements, when only part of it is narrative.

| Source | Passage |
| --- | --- |
| `prd:product-requirements` | The title, the date 22 Sep 2026, and the author line. They name the document and state no behavior. |
| `prd:summary` | The metaphor that this is GitHub for knowledge, and the list of example clients. The testable claims in this section have requirement IDs. |
| `prd:problem-users-and-goals` | The problem, that Memento experiments are scattered with no way to compare harness versions, and the comparison of Notion, Obsidian, GitBook, Mintlify, OpenKnowledge, and Claude artifacts. This is motivation. It states no behavior the product must perform. |
| `prd:usage-patterns` | The framing that eight flows define v1, and that the product works if those flows feel effortless. Each flow is inventoried in the section that follows. |
| `prd:agent-logs-an-experiment` | The sequence diagram illustrates the tool order inventoried above. It adds no further rule. |
| `prd:layout` | The box drawing is the sketch inventoried as an example. It adds no further rule. |
| `prd:connecting-an-agent` | The sample mcp.json illustrates the snippet inventoried above. |
| `prd:proposal-lifecycle` | The state diagram pictures the transitions inventoried above. |
| `prd:error-format` | The JSON sample illustrates the error shape inventoried above. |
| `prd:build-plan` | The day estimates, including about four and a half days for milestones 1 through 4 and each milestone's day count, are a schedule. They are not product behavior. The milestone scope is inventoried above. D1 keeps that scope. |
| `prd:acceptance-criteria` | The heading only. The 18 criteria are inventoried in the three milestone sections. |
| `prd:first-week-of-use` | An operating plan for the owner: seed the space, have an agent convert existing artifacts into proposals, then log every run and check Metrics before a harness decision. It is not a system behavior. |
| `prd:risks-and-open-questions` | The framing that time is the biggest risk, because the work competes with shipping Memento, and that the build plan front-loads the loop. Mitigations are inventoried under prd:risks. |
| `prd:open-questions` | Six questions stay open until answered. Two have partial answers: the name is markdown-kb for now (D6), and editors save directly (D7). Run-log attachments are out of the current scope (D8). Still open, with no owner decision beyond the PRD: whether get_context is configurable per space, which evals define the launch bar and their metrics and baselines, and confirming no overlap with day-job agreements before a public share. PLAN section 2.4 keeps the unanswered ones as tracked questions. |

## Coverage check

The Phase 1 check has two parts: every PRD section maps to at least one statement or is marked narrative, and each of the 18 acceptance criteria maps to a feature.

Requirements: 507.

Status counts: built 49, partly built 89, not started 260, deferred 88, replaced 21.

### PRD sections

| Section | Covered by |
| --- | --- |
| `prd:product-requirements` | narrative only |
| `prd:summary` | 4 statements, REQ-001–REQ-004; also listed as narrative |
| `prd:product-principles` | 14 statements, REQ-005–REQ-018 |
| `prd:problem-users-and-goals` | narrative only |
| `prd:users` | 3 statements, REQ-019–REQ-021 |
| `prd:goals-for-v1` | 5 statements, REQ-022–REQ-026 |
| `prd:non-goals` | 7 statements, REQ-027–REQ-033 |
| `prd:success-metrics` | 5 statements, REQ-034–REQ-038 |
| `prd:core-concepts` | 11 statements, REQ-039–REQ-049 |
| `prd:document-types` | 6 statements, REQ-050–REQ-055 |
| `prd:recording-pipeline` | 4 statements, REQ-056–REQ-059 |
| `prd:versioned-references` | 2 statements, REQ-060–REQ-061 |
| `prd:custom-types` | 2 statements, REQ-062–REQ-063 |
| `prd:markdown-format` | 3 statements, REQ-064–REQ-066 |
| `prd:folder-layout` | 8 statements, REQ-067–REQ-074 |
| `prd:frontmatter-per-type` | 2 statements, REQ-075–REQ-076 |
| `prd:frontmatter-harness` | 4 statements, REQ-077–REQ-080 |
| `prd:frontmatter-eval` | 5 statements, REQ-081–REQ-085 |
| `prd:frontmatter-experiment` | 5 statements, REQ-086–REQ-090 |
| `prd:frontmatter-finding` | 5 statements, REQ-091–REQ-095 |
| `prd:frontmatter-decision` | 5 statements, REQ-096–REQ-100 |
| `prd:type-schemas` | 14 statements, REQ-101–REQ-114 |
| `prd:links` | 6 statements, REQ-115–REQ-120 |
| `prd:space-and-agents` | 3 statements, REQ-121–REQ-123 |
| `prd:usage-patterns` | narrative only |
| `prd:agent-logs-an-experiment` | 5 statements, REQ-124–REQ-128; also listed as narrative |
| `prd:review-and-merge` | 4 statements, REQ-129–REQ-132 |
| `prd:write-or-edit` | 3 statements, REQ-133–REQ-135 |
| `prd:session-with-context` | 2 statements, REQ-136–REQ-137 |
| `prd:metrics-over-time` | 3 statements, REQ-138–REQ-140 |
| `prd:distill-a-finding` | 2 statements, REQ-141–REQ-142 |
| `prd:import-existing-work` | 2 statements, REQ-143–REQ-144 |
| `prd:capture-from-phone` | 2 statements, REQ-145–REQ-146 |
| `prd:ui-and-screens` | 2 statements, REQ-147–REQ-148 |
| `prd:layout` | 1 statement, REQ-149; also listed as narrative |
| `prd:screens` | 11 statements, REQ-150–REQ-160 |
| `prd:sidebar` | 4 statements, REQ-161–REQ-164 |
| `prd:document-view` | 8 statements, REQ-165–REQ-172 |
| `prd:empty-states` | 2 statements, REQ-173–REQ-174 |
| `prd:editor` | 2 statements, REQ-175–REQ-176 |
| `prd:editor-behavior` | 9 statements, REQ-177–REQ-185 |
| `prd:saving` | 5 statements, REQ-186–REQ-190 |
| `prd:conflicts` | 3 statements, REQ-191–REQ-193 |
| `prd:new-documents` | 3 statements, REQ-194–REQ-196 |
| `prd:markdown-capabilities` | 2 statements, REQ-197–REQ-198 |
| `prd:supported-syntax` | 19 statements, REQ-199–REQ-217 |
| `prd:charts` | 7 statements, REQ-218–REQ-224 |
| `prd:editor-support` | 4 statements, REQ-225–REQ-228 |
| `prd:charts-in-review` | 2 statements, REQ-229–REQ-230 |
| `prd:performance-and-safety` | 4 statements, REQ-231–REQ-234 |
| `prd:portability` | 2 statements, REQ-235–REQ-236 |
| `prd:proposals-and-review` | 2 statements, REQ-237–REQ-238 |
| `prd:proposal-lifecycle` | 6 statements, REQ-239–REQ-244; also listed as narrative |
| `prd:proposal-contents` | 5 statements, REQ-245–REQ-249 |
| `prd:review-screen` | 8 statements, REQ-250–REQ-257 |
| `prd:diff-engine` | 2 statements, REQ-258–REQ-259 |
| `prd:merge-and-conflicts` | 4 statements, REQ-260–REQ-263 |
| `prd:on-merge` | 2 statements, REQ-264–REQ-265 |
| `prd:mcp-and-api` | 3 statements, REQ-266–REQ-268 |
| `prd:connecting-an-agent` | 3 statements, REQ-269–REQ-271; also listed as narrative |
| `prd:connecting-assistants` | 8 statements, REQ-272–REQ-279 |
| `prd:oauth-for-mcp` | 5 statements, REQ-280–REQ-284 |
| `prd:capture-from-anywhere` | 2 statements, REQ-285–REQ-286 |
| `prd:tools` | 12 statements, REQ-287–REQ-298 |
| `prd:error-format` | 2 statements, REQ-299–REQ-300; also listed as narrative |
| `prd:tool-descriptions` | 2 statements, REQ-301–REQ-302 |
| `prd:rest-api` | 10 statements, REQ-303–REQ-312 |
| `prd:limits` | 4 statements, REQ-313–REQ-316 |
| `prd:validation` | 1 statement, REQ-317 |
| `prd:validation-rules` | 18 statements, REQ-318–REQ-335 |
| `prd:validation-behavior` | 6 statements, REQ-336–REQ-341 |
| `prd:measurement-layer` | 2 statements, REQ-342–REQ-343 |
| `prd:metric-point` | 5 statements, REQ-344–REQ-348 |
| `prd:metrics-screen` | 5 statements, REQ-349–REQ-353 |
| `prd:comparability-rules` | 3 statements, REQ-354–REQ-356 |
| `prd:setting-up-memento` | 3 statements, REQ-357–REQ-359 |
| `prd:auth-permissions-and-sharing` | 2 statements, REQ-360–REQ-361 |
| `prd:human-sign-in` | 3 statements, REQ-362–REQ-364 |
| `prd:roles` | 4 statements, REQ-365–REQ-368 |
| `prd:agent-keys` | 4 statements, REQ-369–REQ-372 |
| `prd:oauth-grants` | 3 statements, REQ-373–REQ-375 |
| `prd:sharing` | 3 statements, REQ-376–REQ-378 |
| `prd:security-basics` | 3 statements, REQ-379–REQ-381 |
| `prd:architecture-and-data-model` | 2 statements, REQ-382–REQ-383 |
| `prd:stack` | 13 statements, REQ-384–REQ-396 |
| `prd:data-model` | 10 statements, REQ-397–REQ-406 |
| `prd:invariants` | 6 statements, REQ-407–REQ-412 |
| `prd:code-structure` | 2 statements, REQ-413–REQ-414 |
| `prd:search-import-and-export` | 3 statements, REQ-415–REQ-417 |
| `prd:search` | 4 statements, REQ-418–REQ-421 |
| `prd:import` | 5 statements, REQ-422–REQ-426 |
| `prd:export` | 2 statements, REQ-427–REQ-428 |
| `prd:backup` | 2 statements, REQ-429–REQ-430 |
| `prd:design-language` | 1 statement, REQ-431 |
| `prd:foundations` | 9 statements, REQ-432–REQ-440 |
| `prd:interaction-rules` | 5 statements, REQ-441–REQ-445 |
| `prd:keyboard-shortcuts` | 11 statements, REQ-446–REQ-456 |
| `prd:build-plan` | 8 statements, REQ-457–REQ-464; also listed as narrative |
| `prd:acceptance-criteria` | narrative only |
| `prd:acceptance-milestones-1-4` | 9 statements, REQ-465–REQ-473 |
| `prd:acceptance-milestone-5` | 3 statements, REQ-474–REQ-476 |
| `prd:acceptance-milestones-6-7` | 6 statements, REQ-477–REQ-482 |
| `prd:first-week-of-use` | narrative only |
| `prd:risks-and-open-questions` | narrative only |
| `prd:risks` | 7 statements, REQ-483–REQ-489 |
| `prd:open-questions` | narrative only |

Section check: passed. 106 PRD sections, 99 with statements, 7 narrative only.

### Acceptance criteria

| Criterion | Requirement | Feature |
| --- | --- | --- |
| AC-01 | REQ-465 | F13 |
| AC-02 | REQ-466 | F06 |
| AC-03 | REQ-467 | F12 |
| AC-04 | REQ-468 | F12 |
| AC-05 | REQ-469 | F13 |
| AC-06 | REQ-470 | F13 |
| AC-07 | REQ-471 | F14 |
| AC-08 | REQ-472 | F14 |
| AC-09 | REQ-473 | F13 |
| AC-10 | REQ-474 | F16 |
| AC-11 | REQ-475 | F16 |
| AC-12 | REQ-476 | F16 |
| AC-13 | REQ-477 | F09 |
| AC-14 | REQ-478 | F19 |
| AC-15 | REQ-479 | F20 |
| AC-16 | REQ-480 | F12 |
| AC-17 | REQ-481 | F04 |
| AC-18 | REQ-482 | F05 |

Acceptance-criteria check: passed. All 18 criteria have a feature.

Phase 1 check: **passed**.

### Conflicts (PLAN section 2.2)

| Topic | Requirements |
| --- | --- |
| name | REQ-001, REQ-041, REQ-151, REQ-413, REQ-465, REQ-495 |
| auth | REQ-019, REQ-040, REQ-133, REQ-190, REQ-360, REQ-361, REQ-362, REQ-363, REQ-364, REQ-365, REQ-366, REQ-367, REQ-368, REQ-378, REQ-387, REQ-397, REQ-406, REQ-458, REQ-492, REQ-496 |
| storage | REQ-014, REQ-045, REQ-046, REQ-064, REQ-065, REQ-134, REQ-186, REQ-187, REQ-188, REQ-264, REQ-382, REQ-386, REQ-398, REQ-399, REQ-401, REQ-407, REQ-408, REQ-409, REQ-429, REQ-449, REQ-458, REQ-491, REQ-494 |
| editor | REQ-153, REQ-175, REQ-177, REQ-178, REQ-225, REQ-390, REQ-448, REQ-455, REQ-463, REQ-500, REQ-506 |
| reading | REQ-167, REQ-437, REQ-502 |
| surfaces | REQ-433, REQ-500 |
| radius | REQ-439, REQ-503 |
| panel | REQ-147, REQ-149, REQ-169, REQ-216, REQ-454, REQ-505 |
| modals | REQ-160, REQ-395, REQ-418, REQ-442, REQ-446, REQ-456, REQ-504 |
| sharing | REQ-376, REQ-377, REQ-464, REQ-506 |
| phones | REQ-033, REQ-502 |

### Gaps (PLAN section 2.3)

| Topic | Requirements |
| --- | --- |
| slug | REQ-071, REQ-330 |
| filename | REQ-072, REQ-073, REQ-102, REQ-196, REQ-329 |
| schema-frontmatter | REQ-063, REQ-067, REQ-068, REQ-069, REQ-101, REQ-103, REQ-121, REQ-123, REQ-319 |
| meta-schema | REQ-062 |
| required-when | REQ-112, REQ-320 |
| pinned-target | REQ-061, REQ-110, REQ-116, REQ-212, REQ-213, REQ-324, REQ-325, REQ-332, REQ-344, REQ-403, REQ-412 |
| rename | REQ-245 |
| archived-link | REQ-323 |
| embed-limit | REQ-234 |
| edits-match | REQ-247, REQ-294, REQ-400 |
| merge-frontmatter | REQ-192, REQ-193, REQ-261, REQ-391 |
| diff-similarity | REQ-258, REQ-259 |
| keymap-scope | REQ-131, REQ-194, REQ-256, REQ-257, REQ-447, REQ-448, REQ-451 |
| rate-limit-oauth | REQ-313, REQ-484 |
| baseline-value | REQ-081, REQ-139, REQ-350 |
| delta-baseline | REQ-166, REQ-253, REQ-352, REQ-353, REQ-475 |
| repeat-experiment | REQ-025, REQ-350 |
| token-budget | REQ-026, REQ-136, REQ-137, REQ-288, REQ-470 |
| search-score | REQ-291, REQ-307, REQ-393, REQ-416, REQ-419, REQ-421 |
| history-restore | REQ-156, REQ-157 |
| task-tick | REQ-201 |
| import-batch | REQ-143, REQ-424 |
| export-identity | REQ-007, REQ-417, REQ-427, REQ-478 |
| legal-delete | REQ-044, REQ-398, REQ-411 |
| perf-percentile | REQ-018, REQ-124, REQ-416, REQ-421, REQ-467 |
| a11y | REQ-017, REQ-441, REQ-453, REQ-479 |
| metric-events | REQ-034, REQ-035, REQ-036, REQ-037, REQ-038 |
| ui-states | REQ-173, REQ-174, REQ-445 |

## Phase 2 check

Every inventory row flagged as a PLAN section 2.2 conflict, or as a section 2.3 gap that changes behavior, cites an ADR from branch `cursor/record-architecture-decisions-4859` (ADR-0001 through ADR-0034). `gap:delta-baseline` cites ADR-0026, which sets the baseline value those deltas and arrows use.

Phase 2 check: **passed**.

These section 2.3 flags do not change behavior, so the decisions index gives them no ADR:

| Flag | Why it does not change behavior | Requirements |
| --- | --- | --- |
| gap:legal-delete | Archive, do not delete, is already the rule. A legal-deletion path would be new scope. | REQ-044, REQ-398, REQ-411 |
| gap:perf-percentile | The limits stay as written: Inbox within 2 seconds, search under 100 ms, an agent flow under 10 seconds. Missing percentiles and a test environment do not change those limits. | REQ-018, REQ-124, REQ-416, REQ-421, REQ-467 |
| gap:metric-events | Success metrics need measurement queries. Defining a query does not change product behavior. | REQ-034, REQ-035, REQ-036, REQ-037, REQ-038 |
| gap:ui-states | Empty screens already teach in one line with one action, and loading states are already skeletons of the layout. That behavior is not limited to the Inbox. | REQ-173, REQ-174, REQ-445 |
