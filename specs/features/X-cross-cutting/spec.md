# X Cross-cutting

## Summary

Cross-cutting requirements cover how fast Ledger is, who can use it without a pointer, how pages and secrets stay safe, and how the 30-day success metrics are counted. The current release is the markdown-kb editor on Vercel, with no sign-in.

## Status and scope

Partly built. The deployed editor sanitizes rendered HTML, runs Mermaid at security level `strict`, reads its server configuration from environment variables, keeps browser drafts on the device, and is hosted as one Next.js app. The Inbox budget, the 10,000-document search budget, the agent-log budget, WCAG 2.2 Level AA, audit events, and success-metric queries are not started.

This spec states those product-wide rules. Feature specs own the screens and the row shapes:

- Safe-tag list and the Mermaid draw: F04.
- Chart data sources: F05.
- Page search as it works today: F17. The 100 ms budget is here.
- Inbox appearance: F12. The 2 second budget is here.
- Tool calls in the agent-log flow: F13. The 10 second budget is here.
- Shortcuts that exist today: F20.
- Public read and the share sheet: F11.
- Agent-key storage: F13.
- Audit rows for merge, reject, roles, and keys: F07, F12, F13, and F15.
- Sign-in secrets, once sign-in exists: F15.

The current release has no human sign-in (D3, ADR-0002). "Owner" means the person at the keyboard.

## Users and stories

- **X-US-001** As the owner, I want the editor to open on Vercel without sign-in, so that reading and editing do not wait on an account.
- **X-US-002** As the owner, I want rendered pages limited to safe HTML, and secrets kept in environment variables, so that a page cannot run a script and a bundle cannot leak a key.
- **X-US-003** As the owner, I want a new proposal in the Inbox within 2 seconds, search under 100 ms, and an agent log under 10 seconds, so that review and capture stay fast.
- **X-US-004** As the owner, I want every screen usable from the keyboard at WCAG 2.2 Level AA, so that a pointer is optional and status is readable without color alone.
- **X-US-005** As the owner, I want the 30-day success metrics computed from stated queries, so that each target can be checked.

## Requirements

**X-REQ-001** The system shall serve the current release as one Next.js application on Vercel, in the project `markdown-kb-editor`, with no sign-in screen and no session. Status: built.

**X-REQ-002** While `KB_LOCAL` is not the string `1`, the system shall answer `GET` and `POST` on `/api/files`, and `GET` on `/api/mcp`, with HTTP 404 and the JSON body `{"error":"Not found"}`. Status: built.

**X-REQ-003** Where the deployment has a secret or a server path configuration value, the system shall read it from an environment variable and shall omit it from client code. Status: built for the deployed editor. The server reads `KB_DIR` and `KB_LOCAL` from the environment. The client bundle has no secret. Sign-in secrets are absent because sign-in is not started (F15).

**X-REQ-004** When the system renders Markdown to HTML, the system shall sanitize that HTML to the safe subset in F04-REQ-014. A `script` element shall not remain in the rendered page. The system shall strip any other tag outside that subset and shall show no error. Status: built.

**X-REQ-005** When the system draws a `mermaid` fence, the system shall initialize Mermaid with security level `strict`. Status: built. The draw timing and the error sentence are F04-REQ-011.

**X-REQ-006** If any string property named `url` in a parsed chart spec matches `^https?:`, then the system shall not fetch that URL and shall not call the chart embedder. Status: built. The message is F05-REQ-006.

**X-REQ-007** Where chart data sources beyond inline values are on, the system shall accept only inline values, a CSV under `assets/` on the path in F05-REQ-014, or a metrics query in F05-REQ-015. Status: not started.

**X-REQ-008** When the system serves an uploaded asset, the system shall serve it from a signed URL. Status: not started.

**X-REQ-009** When a valid proposal is stored, the system shall show that proposal's row in the Inbox within 2 seconds. Status: not started. The PRD states this limit in seconds and states no percentile and no test environment (Open questions).

**X-REQ-010** When search runs in a space of up to 10,000 documents, the system shall return results in under 100 milliseconds. Status: not started. The PRD states the document cap and states no percentile and no machine (Open questions). The editor's page-search dialog filters pages already loaded in the browser (F17). That dialog is not this budget.

**X-REQ-011** When the agent-logs-an-experiment flow runs, the system shall take one user sentence and return one valid proposal within 10 seconds, through `get_template`, `search`, and `propose_change`. Status: not started. Agents are later (D4). The PRD states this limit in seconds and states no percentile and no test environment (Open questions).

**X-REQ-012** The system shall let the owner complete every screen with the keyboard alone. A pointer shall not be required. Status: partly built. The deployed editor runs the shortcuts in F20 without a pointer. Inbox, Timeline, Metrics, review keys, and `J` / `K` list movement are not started.

**X-REQ-013** The system shall meet WCAG 2.2 Level AA for contrast. Text shall be at least 4.5:1 against its background. Text that is at least 24px, or at least 18.5px and bold, shall be at least 3:1. A user-interface component and the focus indicator shall be at least 3:1 against the adjacent color. Both themes shall meet these ratios. Status: not started. ADR-0034 is Proposed. The product owner has not confirmed it.

**X-REQ-014** The system shall move focus through the files column, then the page, then the outline column, top to bottom inside each column. While a column is not shown, the system shall skip it. While a dialog is open, the system shall keep focus inside that dialog until it closes, and shall then return focus to the control that opened it. Status: not started as a checked rule. ADR-0034 is Proposed.

**X-REQ-015** The system shall give every control an accessible name. Status: partly built. Controls in the deployed editor that F08, F10, F11, F17, and F20 specify have accessible names. Screens that are not started have no controls yet.

**X-REQ-016** The system shall show each status as a word. Color may accompany the word. Status: partly built. The editor status line uses the words in F08. Proposal and document status words are not started.

**X-REQ-017** When editing turns on, the system shall set the page's accessible state to `Editing`. When editing turns off, the system shall set that state to `Preview`. Status: not started. The visible status line remains the F08 words "Viewing", "Editing", and "Markdown source". ADR-0034 names the accessible state `Editing` or `Preview`. `Preview` is the same mode as viewing.

**X-REQ-018** While the current release is the editor, the system shall keep drafts, version history, and browser-only pages in `localStorage` on that device, and shall not upload them as a server draft. Status: built. ADR-0003.

**X-REQ-019** Where `public_read` is true, the system shall show documents to a caller with no membership and shall show that caller no proposals, agent keys, members, or audit events. Status: not started. The refusal codes and the Settings copy are F11-REQ-030. The deployed share sheet grants no rights (ADR-0010) and offers no public space link (F11-REQ-015).

**X-REQ-020** When an agent key is created, the system shall show the secret once and shall store only a SHA-256 hash of the secret plus a visible prefix. Status: not started. The character format is F13-REQ-008.

**X-REQ-021** When a merge, a reject, a role change, a key creation, or a key revocation commits, the system shall write one audit event in that same transaction. Status: not started. The row fields are F07, F12, F13, and F15.

**X-REQ-022** When `propose_change` returns, the system shall store one validation-attempt record with the credential, the time, whether the result was valid, and whether that credential had called `get_context` earlier. Status: not started. Invalid input creates no proposal.

**X-REQ-023** When a caller queries a window of 720 hours, the system shall return the count of documents with `type: experiment` created in the Memento space during that window. The success target is 100% of new Memento experiments recorded in Ledger. Status: not started. The denominator outside Ledger is an open question.

**X-REQ-024** When a caller queries that same window, the system shall return the share of those experiment documents whose creating proposal carries an agent key or a grant. The success target is 80% or more. A human direct save counts in the denominator and not in the numerator. Status: not started.

**X-REQ-025** When a caller queries that same window, the system shall return the median of `reviewed_at` minus `created_at`, in minutes, for proposals whose status became `merged` or `rejected` in the window. The success target is under 2 minutes. A proposal still `open` or `changes_requested` is outside the median. Status: not started.

**X-REQ-026** When a caller queries that same window, the system shall return the share of validation-attempt records that are invalid among records whose credential had already called `get_context`. The success target is under 10%. Status: not started.

**X-REQ-027** When a caller queries a window of 168 hours, the system shall return the count of distinct people who are not an Owner and who opened a space or called a tool in that window. The success target is 5. The PRD marks this signal optional. Status: not started.

**X-REQ-028** Where the Ledger database is in use, the system shall run as one Next.js app on Vercel, with one Postgres database and one blob store, and shall add no queue, no worker, and no separate MCP service. Status: not started. The current release stores files and `localStorage` (ADR-0003), which is X-REQ-001 and X-REQ-018.

## Acceptance scenarios

### X-AC-001a The editor is hosted without sign-in

Test name: `the deployed editor opens with no sign-in`.

Given the Vercel project `markdown-kb-editor`, when a person opens the site, then the Next.js editor is shown and no sign-in screen is shown.

Status: built. Source: C1, D3, ADR-0002. The deploy named in `specs/PLAN.md` is [markdown-kb-editor.vercel.app](https://markdown-kb-editor.vercel.app).

### X-AC-002a Local write routes stay off in a deploy

Test name: `files and mcp routes are 404 unless KB_LOCAL is 1`.

Given `KB_LOCAL` is unset, when a client sends `GET` or `POST` to `/api/files`, or `GET` to `/api/mcp`, then the status is 404 and the JSON error is `Not found`.

Status: built.

### X-AC-003a Secrets stay in the environment

Test name: `client bundle has no KB_DIR, KB_LOCAL, or key secret`.

Given the client JavaScript of the deployed editor, when it is searched, then `KB_DIR`, `KB_LOCAL`, and an agent-key secret are absent. Given the server process, when it resolves the content directory, then it reads `KB_DIR` from the environment.

Status: built for `KB_DIR` and `KB_LOCAL`. No agent-key secret exists in this release.

### X-AC-004a Script tags are stripped

Test name: `rendered markdown drops a script and keeps details`.

Given a page whose body contains a `script` element and a `details` element, when the page is rendered, then the rendered page has no `script` element and the `details` element remains.

Status: built. The same check is F04, test name `script tags are stripped without an error`.

### X-AC-005a Mermaid stays strict

Test name: `mermaid initializes at security level strict`.

Given a `mermaid` fence that has reached the draw, when Mermaid is initialized, then `securityLevel` is `strict`.

Status: built. F04-REQ-011.

### X-AC-006a Charts do not fetch a remote URL

Test name: `an https chart url is not fetched`.

Given a chart spec whose `data.url` is `https://example.com/data.json`, when the fence renders, then the embedder is not called and the message is `Charts can only use inline data.`

Status: built. F05-REQ-006.

### X-AC-007a Only listed chart sources

Test name: `a chart data source outside inline assets and metrics is refused`.

Given chart data sources beyond inline values are on, and the spec's `data.url` is `../secret.csv`, when the fence renders, then the code is `chart_source`, the message is `Chart uses a data source that is not allowed.`, and the hint is `Use inline data, a CSV in assets/, or a metrics query.`

Status: not started. F05-REQ-014.

### X-AC-008a Assets use a signed URL

Test name: `an uploaded asset is served from a signed url`.

Given an uploaded image in a space, when a page renders that image, then the image address is a signed URL for that asset.

Status: not started.

### X-AC-009a Inbox within 2 seconds

Test name: `a stored proposal is in the inbox within 2 seconds`.

Given a valid proposal that has just been stored, when the owner has the Inbox open, then that proposal's row is shown within 2 seconds.

Status: not started. No percentile and no test environment are stated.

### X-AC-010a Search under 100 milliseconds

Test name: `search of 10000 documents returns in under 100 milliseconds`.

Given a space of 10,000 documents, when the owner searches, then results are returned in under 100 milliseconds.

Status: not started. No percentile and no machine are stated.

### X-AC-011a Agent log within 10 seconds

Test name: `one sentence produces one proposal within 10 seconds`.

Given the sentence "Log this run to Ledger" and a valid experiment body, when the flow calls `get_template`, `search`, and `propose_change`, then one valid proposal exists and the flow finished within 10 seconds.

Status: not started. No percentile and no test environment are stated.

### X-AC-012a Editor shortcuts need no pointer

Test name: `editor shortcuts run from the keyboard`.

Given the guide page in the deployed editor and no pointer, when the owner uses the shortcuts listed in F20, then search, settings, shortcut help, editing, Markdown source, the outline, save, and a new page run.

Status: built for those shortcuts. F20 holds each key's scenario.

### X-AC-012b Unbuilt screens are keyboard-only

Test name: `inbox timeline and metrics work from the keyboard alone`.

Given the Inbox, Timeline, and Metrics screens, when the owner has only a keyboard, then each screen's primary action can be completed.

Status: not started.

### X-AC-013a Contrast meets the AA ratios

Test name: `both themes meet the WCAG 2.2 AA contrast ratios`.

Given the light theme and the dark theme, when text, components, and the focus indicator are measured, then body text is at least 4.5:1, text of at least 24px or at least 18.5px bold is at least 3:1, and components and the focus indicator are at least 3:1 against the adjacent color.

Status: not started. ADR-0034 is Proposed.

### X-AC-014a Focus order and dialog trap

Test name: `focus walks files then page then outline and a dialog traps it`.

Given the three columns are shown and no dialog is open, when the owner tabs from the start of the screen, then focus moves through the files column, then the page, then the outline, top to bottom in each. Given a dialog opened from a control, when the owner tabs, then focus stays inside the dialog. When the dialog closes, focus returns to that control.

Status: not started as a checked rule.

### X-AC-015a Controls have names

Test name: `editor controls expose an accessible name`.

Given the deployed editor with a page open, when search, share, settings, and the outline are shown, then each of those controls has an accessible name.

Status: built for those controls. F08, F10, F11, and F17 name them.

### X-AC-016a Status includes a word

Test name: `the status line uses a word`.

Given a page in the deployed editor, when the status line is read, then it includes one of "Viewing", "Editing", or "Markdown source".

Status: built. F08. Proposal status words are not started.

### X-AC-017a Editing state is announced

Test name: `turning editing on sets the accessible state to Editing`.

Given a page in viewing, when the owner turns editing on, then the page's accessible state is `Editing`. When the owner turns editing off, then the accessible state is `Preview`.

Status: not started.

### X-AC-018a Drafts stay on the device

Test name: `a draft is restored from localStorage and is not posted`.

Given a draft written in the editor, when the owner leaves the page and returns in the same browser, then the draft is restored from `localStorage` and the editor has sent no server-draft request.

Status: built. ADR-0003.

### X-AC-019a Public read hides review data

Test name: `public read shows documents and hides proposals keys members and audit`.

Given `public_read` is true and the caller has no membership, when they open a document, then the document is shown. When they request proposals, agent keys, members, or audit events, then no such rows are returned.

Status: not started. Codes and hints are F11-REQ-030.

### X-AC-020a A key secret is shown once

Test name: `an agent key secret is shown once and stored as a hash`.

Given an Owner creates an agent key, when the create result is shown, then the secret is visible. When the Owner leaves that result, then the stored record has the SHA-256 hash and the visible prefix, and the secret is not shown again.

Status: not started. F13-REQ-008.

### X-AC-021a Privileged actions write an audit event

Test name: `merge reject role change and key changes write one audit event`.

Given a merge, a reject, a role change, a key creation, or a key revocation, when that action commits, then exactly one new audit event exists for it, written in the same transaction.

Status: not started.

### X-AC-022a A failed proposal is recorded

Test name: `an invalid propose_change stores a validation attempt and no proposal`.

Given a credential that has called `get_context`, when `propose_change` returns invalid, then one validation-attempt record stores that credential, the time, `valid` false, and that `get_context` had been called, and no proposal row exists.

Status: not started.

### X-AC-023a Experiments recorded in the window

Test name: `experiment documents in the 720 hour window are counted`.

Given the Memento space has three `experiment` documents created inside a 720-hour window and one created before it, when the query runs for that window, then the count is 3.

Status: not started.

### X-AC-024a Share that arrived from an agent

Test name: `the agent-proposal share of experiments is computed`.

Given ten `experiment` documents created in the window, eight of whose creating proposals carry an agent key or a grant, and two of which were human direct saves, when the query runs, then the share is 80%.

Status: not started.

### X-AC-025a Median time to a decision

Test name: `median review duration is reviewed_at minus created_at`.

Given two proposals decided in the window, one with `reviewed_at` minus `created_at` equal to 60 seconds and one equal to 180 seconds, when the query runs, then the median is 2 minutes. The success target is under 2 minutes, so this sample misses the target.

Status: not started.

### X-AC-026a Validation failures after the guide

Test name: `invalid propose_change calls after get_context are under 10 percent at the target`.

Given ten validation-attempt records in the window whose credential had called `get_context`, one of them invalid, and further invalid calls from a credential that had not called `get_context`, when the query runs, then the share is 10%, and the calls with no earlier `get_context` are excluded.

Status: not started. The target is under 10%, so a share of exactly 10% misses it.

### X-AC-027a Weekly external builders

Test name: `distinct non-owners who used a space in 168 hours are counted`.

Given five people who are not an Owner and who each opened a space during a 168-hour window, and the Owner also opened a space, when the query runs, then the count is 5.

Status: not started.

### X-AC-028a Later hosting stays one app

Test name: `the ledger store runs on vercel with postgres and a blob store`.

Given the Ledger database is in use, when the deployment is inspected, then it is one Next.js app on Vercel, one Postgres database, and one blob store, with no queue, no worker, and no separate MCP service.

Status: not started.

## Edge cases and errors

X adds no new error code. Codes below are owned by the feature spec named in the row. A strip or a refusal that the deployed editor already performs has no product code.

| Case | Code | Message | Hint | Status |
| --- | --- | --- | --- | --- |
| `GET` or `POST` `/api/files`, or `GET` `/api/mcp`, while `KB_LOCAL` is not `1` | none | `Not found` | none. HTTP 404 | Built |
| HTML tag outside the safe subset, including `script` | none | none. The tag is removed | none. F04-REQ-014 | Built |
| Chart `url` matching `^https?:` | `chart_remote` | `Charts can only use inline data.` | `Put the values in data.values.` | Built. F05 |
| Chart source other than inline values, an `assets/` CSV, or a metrics query, once X-REQ-007 is on | `chart_source` | `Chart uses a data source that is not allowed.` | `Use inline data, a CSV in assets/, or a metrics query.` | Not started. F05 |
| A caller with no membership reads proposals, keys, or members on a public space | `permission_denied` | `You are not a member of this space.` | `Ask an owner for an invite.` | Not started. F11-REQ-030 |
| That caller reads audit events | `permission_denied` | `Only an owner can read the audit log.` | `Ask an owner if you need a membership record.` | Not started. F11 and F15 |
| A caller updates or deletes an audit row | `audit_immutable` | `Audit events cannot be changed.` | `Record a new audit event.` | Not started. F15 |
| Inbox, search, or the agent-log flow exceeds its time limit | none | The PRD states no user-facing error for a slow response | none | Not started |

A validation failure on `propose_change` uses the F06 catalog. X-REQ-022 records the attempt and creates no proposal.

## Limits and budgets

A day in the success-metric windows is 24 hours. 30 days are 720 hours. A week is 168 hours. "Under" is strict: a value equal to the limit misses the target.

| Limit | Value | Percentile | Environment the PRD states | Status |
| --- | --- | --- | --- | --- |
| Inbox appearance | within 2 seconds | The PRD states none. Open question X-Q-001 | The PRD states none. The acceptance line is "The proposal appears in the Inbox within 2 seconds." | Not started |
| Search | under 100 milliseconds | The PRD states none. Open question X-Q-002 | A space of up to 10,000 documents. The PRD states no machine, network, or viewport | Not started |
| Agent log | within 10 seconds | The PRD states none. Open question X-Q-003 | One user sentence and one valid proposal, through `get_template`, `search`, and `propose_change`. The PRD states no machine | Not started |
| Review | median under 2 minutes | The statistic is the median. A latency percentile is not used | Proposals that became `merged` or `rejected` in the queried 720-hour window. Clock: `reviewed_at` minus `created_at` | Not started |
| Contrast, body text | at least 4.5:1 | Not a latency | Light theme and dark theme. ADR-0034 | Not started |
| Contrast, large text | at least 3:1 for text at least 24px, or at least 18.5px and bold | Not a latency | Both themes. ADR-0034 | Not started |
| Contrast, component and focus | at least 3:1 against the adjacent color | Not a latency | Both themes. ADR-0034 | Not started |
| Experiments recorded | 100% | Not a latency | Memento space, a 720-hour window | Not started |
| Experiments via agent proposals | 80% or more | Not a latency | That same window | Not started |
| Validation failures after `get_context` | under 10% | Not a latency | That same window | Not started |
| External builders | 5 | Not a latency | A 168-hour window. Optional | Not started |
| Editor page search | F17. No 100-millisecond claim | F17 recorded no percentile | F17 checked 5 pages on the local dev server | Built as a filter of loaded pages, not as X-REQ-010 |

The decisions index on `origin/cursor/record-architecture-decisions-4859` lists the missing percentiles and the missing test environment under "Gaps with no ADR". This spec does not fill them in.

## UI states

X adds no screen. Empty, loading, error, and success copy for a screen lives in that feature's spec. The same copy is used at a desktop width of 1280px and at a phone width of 390px unless that feature spec says otherwise.

These rules apply on top of those screens:

- Loading is a skeleton of that screen's layout. The Inbox skeleton copy is F12. The editor's Markdown loading region uses `aria-busy="true"` and no sentence.
- An empty screen teaches in one line and offers one action, with no illustration. The Inbox sentence is `No proposals. Connect an agent in Settings → Agent keys.`
- A status is a word (X-REQ-016).
- Below the 860px shell breakpoint the outline is off screen and the file column is a drawer (F08). Focus order skips a column that is not shown (X-REQ-014).

| Surface | Empty | Loading | Error | Success |
| --- | --- | --- | --- | --- |
| Deployed editor | Feature specs F08, F10, F11, F17, F20 | Markdown region is busy, with no sentence | Stripped HTML has no message. A refused chart uses the F05 message | The page renders |
| Inbox | F12 | F12 skeleton | F12. A slow Inbox has no extra message | The new row is visible within 2 seconds |
| Search of 10,000 documents | F17 for the palette that exists today | Not started. No loading sentence is stated for the budget | No error is stated when the 100-millisecond budget is missed | Results returned in under 100 milliseconds |
| Success-metric queries | No screen in this spec. The Metrics screen is F16 | Not started | Not started. No error code is stated for a query | The count, share, or median for the window |

## Out of scope

- Tag-level sanitizer schema, KaTeX and Shiki placement, and Mermaid lazy draw (F04).
- Vega-Lite mark types, theme, and export (F05).
- The page-search dialog's keys and empty sentence (F17).
- Inbox filters, diff, and merge mechanics (F12).
- Tool schemas, rate limits, and the `get_context` token budget (F13, ADR-0028).
- The shortcut list (F20, `specs/contracts/keymap.md`).
- Invite expiry, role checks, and public-link Settings copy (F11, F15).
- A legal-deletion path. Documents are archived, not hard-deleted. The decisions index treats a legal-deletion path as new scope.
- Product logs, traces, and an error-reporting service. The PRD does not define them. Observability here is the audit event and the success-metric queries.
- Percentiles and machines for the three time limits. Those are open questions, not requirements.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| X-Q-001 | Which percentile must be within 2 seconds for the Inbox? | Leave it unset. No ADR sets one. F12-REQ-050 uses the 95th percentile; this spec does not adopt that fill-in. | Product owner | A percentile pass/fail for X-REQ-009 |
| X-Q-002 | Which percentile must be under 100 milliseconds for search? | Leave it unset. No ADR sets one. F13-REQ-032 uses the 95th percentile; this spec does not adopt that fill-in. | Product owner | A percentile pass/fail for X-REQ-010 |
| X-Q-003 | Which percentile must be within 10 seconds for the agent-log flow? | Leave it unset. No ADR sets one. F13-REQ-034 uses the 95th percentile and excludes model time; this spec does not adopt that fill-in. | Product owner | A percentile pass/fail for X-REQ-011 |
| X-Q-004 | What machine, network, instance warmth, and viewport are the test environment for those three limits? | Leave them unset. The PRD states a space of up to 10,000 documents for search, and one sentence to one proposal for the flow. It states no machine. | Product owner | Measuring X-REQ-009, X-REQ-010, and X-REQ-011 |
| X-Q-005 | Does the 10 seconds include the model's time, or only Ledger's handling of the three tool calls? | Leave it unset until the owner chooses. The PRD describes the whole flow from the sentence to the proposal. | Product owner | The clock for X-REQ-011 |
| X-Q-006 | How is the 100% experiments-recorded denominator known for runs that never reached Ledger? | The system reports the count of `experiment` documents in the window (X-REQ-023). The owner compares that count with runs they know happened outside Ledger. | Product owner | Calling the 100% target measured inside the product |
| X-Q-007 | Confirm ADR-0034 (WCAG 2.2 Level AA, the contrast ratios, the focus order, and the `Editing` / `Preview` state). | Confirm it. The record is Proposed. | Product owner | Treating X-REQ-013, X-REQ-014, and X-REQ-017 as accepted |

## Trace

PRD file: `origin/cursor/rebuild-prd-tables-f4c0:specs/source/ledger-prd.md`. Line numbers are that file.

- `<!-- prd:product-principles -->` line 16. Keyboard-first. X-REQ-012.
- `<!-- prd:goals-for-v1 -->` line 38. Review under two minutes. X-REQ-025.
- `<!-- prd:success-metrics -->` lines 49–58. X-REQ-023 through X-REQ-027.
- `<!-- prd:agent-logs-an-experiment -->` lines 253–266. Under 10 seconds. X-REQ-011.
- `<!-- prd:supported-syntax -->` line 390. Safe HTML. X-REQ-004.
- `<!-- prd:performance-and-safety -->` lines 420–423. Mermaid strict, chart validation, data-source allowlist. X-REQ-005, X-REQ-006, X-REQ-007.
- `<!-- prd:sharing -->` lines 669–673. Public views hide proposals, keys, and members. Privileged actions write an audit event. X-REQ-019, X-REQ-021.
- `<!-- prd:security-basics -->` lines 674–678. Sanitized Markdown, signed asset URLs, secrets in environment variables. X-REQ-003, X-REQ-004, X-REQ-008.
- `<!-- prd:architecture-and-data-model -->` lines 680–681, and the Hosting row at line 688. X-REQ-001, X-REQ-028.
- `<!-- prd:search -->` lines 758–763. Under 100 ms for 10,000 documents. X-REQ-010.
- `<!-- prd:interaction-rules -->` lines 796–802. Keyboard, status as a word, loading skeletons. X-REQ-012, X-REQ-016.
- `<!-- prd:acceptance-milestones-1-4 -->` line 840. Inbox within 2 seconds. X-REQ-009.
- `<!-- prd:acceptance-milestones-6-7 -->` line 856. Keyboard alone. Line 857. Review under two minutes. X-REQ-012, X-REQ-025.

Decisions and changes: D2 (hosted on Vercel), D3 (no auth yet), D4 (agents later), C1 (Vercel project `markdown-kb-editor`).

ADRs, from `origin/cursor/record-architecture-decisions-4859`, not merged into this branch:

- ADR-0002. No sign-in in the first release. X-REQ-001.
- ADR-0003. Files and `localStorage`. X-REQ-018. Supersedes server drafts for this release.
- ADR-0010. The page link grants no rights. X-REQ-019's current-release note.
- ADR-0034. Proposed. WCAG 2.2 Level AA. X-REQ-013, X-REQ-014, X-REQ-017.

`specs/decisions/README.md` on that branch, section "Gaps with no ADR": the three time limits keep their PRD numbers; percentiles and a test environment are unset. Success metrics need queries, which this spec defines. Empty and loading behavior is not limited to the Inbox; this spec does not add a screen for it.
