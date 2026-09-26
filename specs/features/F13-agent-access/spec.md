# F13: Agent access

## Summary

Agent access is the remote Ledger MCP and the REST mirror: ten tools that read, validate, or propose, and none of them merge, delete, or administer. API keys are a later target, and the current release has no auth.

## Status and scope

Not started. The current release has no auth. Agent keys are a later target. ADR-0002 is the decision for sign-in: there is no human sign-in yet, and the four roles are the later target. D4 leaves agent connection until later. This feature is part of the later Ledger loop.

`npm run mcp` starts a stdio server named `markdown-kb` for the editor. Its tools are `list_projects`, `create_project`, `list_files`, `read_file`, `create_file`, `update_file`, `create_folder`, `move_file`, `delete_file`, and `search`. `GET /api/mcp` returns connection snippets for that stdio server when `KB_LOCAL` is `1`. That server writes files on disk. This spec does not change it. The Ledger server is Streamable HTTP at `/api/mcp`, and its ten tools are a different set.

This spec covers those ten tools, the REST mirror under `/api/v1`, agent keys, the three limits, and the errors a caller can correct. It follows Proposed ADR-0025, ADR-0028, and ADR-0029. The product owner has not confirmed those three records. Proposal lifecycle, Inbox, and merge are F12. Validation codes and messages are F06, in `specs/contracts/errors.md`, except the codes defined here and the proposal codes F12 defines. OAuth 2.1 handshake, protected-resource metadata, dynamic client registration, the consent screen, and token lifetimes are F14. This spec states the limits a grant uses after F14 issues it. Sign-in screens are F15. Metric charts are F16. The command palette is F17. Stored revisions and metric-point rows are F07. Type schema files are F02.

F13-REQ-001 is the current release. The requirements after it are the Ledger API. They are not started.

The space comes from the credential. Tools and routes do not take a space argument. Routes have no space segment (ADR-0001). The product name in the UI is markdown-kb.

## Users and stories

- **F13-US-001** As an agent, I want ten tools that read and propose, so that I can log one experiment without merging it.
- **F13-US-002** As an agent, I want a code, a message, and a hint, so that I can fix a refusal and retry.
- **F13-US-003** As the owner, I want a key capped at 60 requests a minute, 30 proposals an hour, and 20 open proposals, so that one agent cannot flood the Inbox.
- **F13-US-004** As a script, I want the same operations under `/api/v1`, so that an eval run can submit a result without an MCP client.
- **F13-US-005** As the owner, I want the current editor to keep working with no key, so that writing stays open while agents are later.

## Requirements

- **F13-REQ-001** While the Ledger agent API is not built, the system shall leave `npm run mcp` as the editor stdio server. `GET /api/mcp` shall return the editor connection snippets when `KB_LOCAL` is `1`, and shall return HTTP 404 when `KB_LOCAL` is not `1`. The system shall run none of the ten Ledger tools, shall serve none of the `/api/v1` operations, shall create no agent key, and shall show no Agent keys section and no Connect section in Settings.
- **F13-REQ-002** The system shall expose exactly these ten tools, in this order, and no tool that merges, deletes, archives, or administers members, keys, or types: `get_context`, `list_documents`, `read_document`, `search`, `get_template`, `validate`, `propose_change`, `get_proposal`, `update_proposal`, `get_metrics`. MCP `tools/list` shall return that list, and each input schema shall be the matching `$defs` input in `specs/contracts/mcp-tools.json`.
- **F13-REQ-003** If the tool name is outside those ten, or the HTTP method and path are outside `specs/contracts/rest.openapi.yaml`, then the system shall return `route_unknown` and shall not merge, delete, archive, or change a document or a proposal.
- **F13-REQ-004** The system shall serve the ten tools at `/api/mcp` with the official MCP TypeScript SDK Streamable HTTP transport, server name `markdown-kb`, and shall serve the same operations at `/api/v1` as in `specs/contracts/rest.openapi.yaml`. Both transports shall call one implementation of each tool.
- **F13-REQ-005** The system shall take the space from the agent key or the grant. If a tool argument, query parameter, or JSON field is named `space`, then the system shall return `space_rejected` and shall not read or write another space.
- **F13-REQ-006** The system shall require header `Authorization` with scheme `Bearer` and a non-empty token. If the header is missing, the scheme is not `Bearer`, or the token is empty, then the system shall return `auth_missing`. If the token matches no key and no grant, then the system shall return `auth_invalid`. If the token matches a revoked key, then the system shall return `auth_revoked` with the key message. If the token matches a revoked grant, then the system shall return `auth_revoked` with the grant message. The call shall change no document and no proposal.
- **F13-REQ-007** If a browser session is presented and the request has no bearer token, then the system shall return `session_refused` and shall not propose.
- **F13-REQ-008** When an Owner or an Editor creates a key, the system shall store a label of 1 to 80 Unicode code points with no CR or LF, a scope of `read` or `propose`, and the owning user, shall generate the secret `lk_<space-slug>_<32>` with 32 characters from `A-Za-z0-9` using a cryptographic random generator, shall store only the lowercase hex SHA-256 of the UTF-8 secret and the visible prefix, and shall show the secret once. The prefix is `lk_`, the space slug, `_`, the first 4 secret characters, and `…`.
- **F13-REQ-009** When a key or a grant is revoked, the system shall refuse the next call with `auth_revoked` and shall change nothing on that call. A revoked key shall stay in the Agent keys list with the word `Revoked`.
- **F13-REQ-010** While a credential's scope is `read`, the system shall allow the eight read tools and shall return `scope_read` for `propose_change` and `update_proposal`. While the scope is `propose`, the system shall allow all ten tools. The eight read tools are `get_context`, `list_documents`, `read_document`, `search`, `get_template`, `validate`, `get_proposal`, and `get_metrics`.
- **F13-REQ-011** The system shall not open a web session from an agent key or a grant. A bearer token on a page request shall leave any existing session unchanged. A page request with a bearer token and no session shall receive the page served to a person with no session.
- **F13-REQ-012** The system shall limit each agent key, and separately each OAuth grant, to 60 admitted requests in 60 seconds, 30 stored proposals in 3600 seconds, and 20 open proposals. A grant's counters shall not include a key's calls, and two grants shall not share a counter. MCP and REST for one credential shall share that credential's counters. Open proposals are those in `open` or `changes_requested` created by that credential. The 30 count only `propose_change` calls that store a new proposal. Admitted requests are calls that passed authentication and the 60-request check. The windows are `(T − 60 seconds, T]` and `(T − 3600 seconds, T]` on the API clock.
- **F13-REQ-013** If a limit in F13-REQ-012 is already full, then the system shall return HTTP 429 with `Retry-After`, shall not add the rejected call to that window, and shall create no proposal and change no document.
- **F13-REQ-014** The system shall build the `get_context` pack as specified in Pack, measure it as `ceil(UTF-8 byte length / 4)` tokens, and keep it at most 6000 tokens (24000 bytes).
- **F13-REQ-015** When `detail` is omitted, `brief`, or `full`, the system shall return the same pack and shall echo `brief` when `detail` is omitted. If `detail` is any other value, then the system shall return `detail_invalid` and shall not build a pack.
- **F13-REQ-016** When `search` runs, the system shall rank hits as specified in Search: title matches first, then `updated_at` descending, then slug ascending, with `score` 1 for a title match and 0 otherwise.
- **F13-REQ-017** When `list_documents` runs, the system shall return paths, titles, types, status, and updated dates, ordered by `updated_at` descending and then slug ascending, with `limit` default 50 and maximum 100.
- **F13-REQ-018** When `read_document` runs with a path or a slug, the system shall return the Markdown, parsed frontmatter, `revision_id`, and current backlinks. When `version` is set, the system shall return the first revision saved with that version (ADR-0017). When `version` is omitted, the system shall return the head.
- **F13-REQ-019** When `get_template` runs for a loaded type, the system shall return the template Markdown, the field schema, the writing guidance, the filename pattern, and the syntax reference.
- **F13-REQ-020** When `validate` runs, the system shall return `{ valid, errors, warnings }` from the F06 validator and shall write no document, no revision, and no proposal.
- **F13-REQ-021** When `propose_change` passes F12 and F06 with no error, the system shall store one proposal with status `open` and shall return `proposal_id`, `status`, `url`, and `warnings`. The call shall not merge.
- **F13-REQ-022** When `update_proposal` is called by the author of a proposal whose status is `changes_requested`, and the new bytes pass F12 and F06, the system shall store the update and return the proposal with status `open`. The call shall not merge.
- **F13-REQ-023** When `get_proposal` is called with an id in the credential's space, the system shall return the status, the reviewer notes, and the merged revision id.
- **F13-REQ-024** When `get_metrics` is called with an eval slug that exists, the system shall return the current metric points F07 stored for that eval, including experiment links, and shall not draw a chart.
- **F13-REQ-025** The system shall set each tool description, and each REST operation description, to the `const` in `specs/contracts/mcp-tools.json` for that tool. Each of those strings starts with `Call get_context first.` and includes `Call get_template before creating a document.`, `Call validate when unsure.`, `Submit one document per proposal.`, `Never invent metric values.`, and `This tool does not merge, delete, or administer.`
- **F13-REQ-026** The system shall accept and return the bodies in `specs/contracts/mcp-tools.json`, and shall expose the HTTP methods, paths, and status codes in `specs/contracts/rest.openapi.yaml`.
- **F13-REQ-027** The system shall give every error a `code`, a `message`, and a `hint`, using the sentences in Edge cases and errors. An F06 issue shall use the code, message, and hint in `specs/contracts/errors.md`. An F12 issue shall use the code, message, and hint in the F12 spec.
- **F13-REQ-028** If the document's UTF-8 length is greater than 204800 bytes, then the system shall return F06 `too_large` and shall store nothing. A document of 204800 bytes shall pass this check.
- **F13-REQ-029** If the raw HTTP body is larger than 262144 bytes, then the system shall return `request_too_large` and shall not run the tool.
- **F13-REQ-030** The system shall show the Agent keys section inside Settings with the copy in UI states, at a viewport of 860px or wider and at a viewport of 420px or narrower.
- **F13-REQ-031** The system shall show the Connect section inside Settings with the copy in UI states, at those same two widths.
- **F13-REQ-032** The system shall answer `search` in under 100 ms at the 95th percentile in the search environment in Limits and budgets.
- **F13-REQ-033** The system shall answer each other tool and REST call in under 2 seconds at the 95th percentile in the call environment in Limits and budgets.
- **F13-REQ-034** The system shall finish one `get_context`, one `get_template`, and one `propose_change`, excluding model time, in under 10 seconds at the 95th percentile in the call environment.
- **F13-REQ-035** When Cursor is given the sentence "log this experiment to Ledger", the system shall store a valid proposal produced with only the ten MCP tools, and that proposal shall need no manual fixes.
- **F13-REQ-036** When `propose_change` has returned a structured error for an invalid proposal, and the agent retries with a valid proposal, the system shall accept that retry and store the proposal.
- **F13-REQ-037** When a page changes on disk within 15 seconds of an editor-server `create`, `update`, or `move` event for that page, the system shall record the change as an agent change for that page in this browser. A disk change with no such event, and an edit typed in this browser, shall not be recorded as an agent change.
- **F13-REQ-038** While a page has unreviewed agent changes, the title row shall show, immediately left of the Edit toggle, a counter `+{added} −{removed}`, where `added` is the number of characters the agents inserted that are still on the page and `removed` is the number of characters the agents deleted. The counter shall persist across reloads. Typing in this browser shall not add to either number. Deleting agent-inserted text shall lower `added`.
- **F13-REQ-039** When the counter is chosen, the system shall clear the page's agent changes and hide the counter and the highlights. It shall change no page content, merge nothing, and open no dialog.
- **F13-REQ-040** While editing as blocks and the page has unreviewed agent changes, the editor shall mark agent-inserted text green and underlined and show agent-deleted text red and struck through, in place. A new or changed block that is not text, such as a list, table, or diagram, shall carry a green bar. A deleted block shall show its text red and struck through where it was. Deleted text shall not be editable or copied as page text. Color shall not be the only distinction.
- **F13-REQ-041** When a page has local edits and the agent changes it on disk, the system shall show the disk banner and record nothing. When `Load disk version` is chosen, the system shall record the change from the last disk copy to the new disk copy as an agent change.

### Pack

F13-REQ-014 builds an ordered list of text blocks, joins them with `\n---\n`, then trims. Newlines inside a block are LF. A character in a limit below is one Unicode code point.

| Group | Blocks | Text |
| --- | --- | --- |
| 0 | The syntax reference, always one block | `$defs.syntaxReference.const` in `specs/contracts/mcp-tools.json`, byte for byte |
| 1 | `.ledger/agents.md`, if that file exists | The file text |
| 2 | Each harness with `status: active`, slug ascending | `# ` + title + LF, then the original frontmatter through its closing `---` line. No body |
| 3 | Each eval with `status: active`, slug ascending | The same shape as group 2. The metrics list is the frontmatter `metrics` field |
| 4 | Each finding with `status: current`, `updated_at` descending, slug ascending on ties | The same shape as group 2 |
| 5 | Each decision with `status: accepted`, `updated_at` descending, slug ascending on ties | The same shape as group 2 |
| 6 | At most 10 experiments with the latest `updated_at`, newest first, slug ascending on ties | Frontmatter only, through its closing `---` line. No title line |

`updated_at` is the head revision time, formatted as UTC `YYYY-MM-DDTHH:MM:SSZ`. A missing title becomes an empty title. A block whose text would be empty is omitted. Group 6 never contains more than 10 blocks, including in a space of 100 experiments.

While the joined UTF-8 length is over 24000 bytes, remove the last block whose group is 4, 5, or 6, and join again. Groups 0, 1, 2, and 3 stay while any block from groups 4, 5, or 6 remains. If the join is still over 24000 bytes, keep the longest UTF-8 prefix of at most 24000 bytes that does not split a code point.

`tokens` is `ceil(byte length / 4)` of that final string. `bytes` is that length. `trimmed` is true when a block was removed or the prefix cut the string. The MCP text content is that string and nothing else. Structured content is `{ detail, tokens, bytes, trimmed, pack }` and `pack` is that string.

### Search

F13-REQ-016 splits `query` on one or more of space, tab, CR, and LF, then drops empty pieces. A piece that matches `type:`, `status:`, `harness:`, `verdict:`, or `after:` plus a value is a filter and is not a term. Filter names are lowercase and case-sensitive. `type`, `status`, `harness`, `verdict`, and `after` select the candidate set and do not affect `score`.

A document matches when every term is a substring of the title, the body, or a frontmatter scalar after both sides are lowercased with the Unicode default case conversion. Nested frontmatter scalars are included. Numbers use decimal text with no exponent. Booleans use `true` and `false`. A title match means every term is such a substring of the title. With no terms, every candidate is a title match and `score` is 1.

`type:` and the `type` argument both apply. When both are set and differ, the hit list is empty. `status:` matches one of `draft`, `active`, `retired`, `planned`, `running`, `concluded`, `abandoned`, `current`, `superseded`, `disputed`, `proposed`, `accepted`, `reversed`. `verdict:` matches `supported`, `refuted`, or `inconclusive`. `harness:` matches the `harness` field's slug, and the version when the filter contains `@` and an integer from 1 to 999999999. `after:` is a real calendar date `YYYY-MM-DD` and keeps a document whose `date` is strictly later, or, when `date` is absent, whose `updated_at` UTC date is strictly later. Any other value for those filters is `filter_invalid`. Archived documents stay in the candidate set. A type name that matches no document yields an empty hit list.

`limit` defaults to 20 and is at most 50. The response is the first `limit` hits. `snippet` is plain text of at most 240 code points: the title when the score is 1 or there are no terms; otherwise the first body line that contains a term; otherwise the first matching frontmatter scalar; otherwise the title. When that source is longer than 240 code points, the snippet is the 240-code-point window that starts at the first term, clamped inside the source.

### List, read, template, metrics

`list_documents` `limit` defaults to 50 and is at most 100. A type or status filter that matches nothing returns `documents: []` and `next_cursor: null`. An unknown status word is `filter_invalid`. `status` is null for `type: doc`. `next_cursor` is the base64url encoding, with no padding, of the UTF-8 JSON `{"u":"<updated_at>","s":"<slug>"}` for the last row, or null when no later row exists. The client sends that string back as `cursor` and does not build its own. `archived` is a boolean from F07.

`read_document` accepts `path` or `slug`. When both name the same document, the read proceeds. Backlinks are the current documents that link to the slug. The decoded path is relative, ends in `.md`, contains no `..` segment, no backslash, and no leading slash, and is at most 512 code points. On REST, `GET /documents/{path}` is the path form and each slash in the path is percent-encoded as `%2F`. `GET /documents?slug=` is the slug form. `version` on that URL is valid only together with `slug`.

`get_template` reads the loaded schema (F02). `folder` and `filename_pattern` come from the schema. `fields` is the schema field map. `guidance` is the schema file body, or `""` when the body is empty. `syntax` equals the syntax reference const. `template` is frontmatter with `type`, `title`, and each field that is required with no `required_when`, in schema order, then the guidance. Placeholders: string `""`, number the schema minimum or else `0`, date the API clock's UTC `YYYY-MM-DD`, enum the first value, boolean `false`, list `[]`, link `"[[slug]]"`, links `[]`, metrics `{}`. String placeholders are double-quoted YAML. A conditional field stays in `fields` and is absent from the template frontmatter.

`get_metrics` returns one array. It does not merge eval versions into one line. Each point includes `eval_version`. Order is `date` ascending, then experiment slug ascending, then metric key ascending. Abandoned experiments contribute no points. A concluded experiment with verdict `inconclusive` stays in the array. `metric` keeps one key. `harness` is a slug, or `slug@version`. A filter that matches nothing returns `points: []`. A missing eval document is `eval_missing`.

`propose_change` and `update_proposal` apply the F12 rules for action, summary, content, edits, base revision, and author. One call names one path. `url` is `{origin}/{project}/inbox/{proposal_id}` with no trailing slash on the origin and no space segment. `proposal_id` is an integer ≥ 1, unique in the space. A successful create returns status `open`. Warnings from F06 are included and do not block. Shape errors and validation errors store nothing.

`get_proposal` returns `notes` with at most one entry: kind `changes` or `reject`, the text, and `at` as UTC `YYYY-MM-DDTHH:MM:SSZ`. `merged_revision_id` is null unless status is `merged`. `stale` and `conflicted` follow F12. An id outside the space is `proposal_missing`.

### Credentials and screens

A key's label example is `Cursor · MacBook`. Scope on the create form starts on `Read`. The secret is shown on the create result and is absent after the owner leaves Settings or reloads it. Last used updates on each call that identified the key, including a later validation error or a later limit refusal, and does not update on `auth_missing` or `auth_invalid`. Last used is null until then. Proposal count increments only when `propose_change` stores a new row.

Owner and Editor may create and revoke keys. Contributor and Viewer receive `permission_denied` and see no prefix and no secret. Revoke asks for confirmation, then takes effect on the next call. There is no merge scope and no delete-key tool.

Connect shows three cards, `Cursor`, `Claude Code`, and `Generic`. The Cursor and Generic snippet is a JSON object whose server name is `markdown-kb`, whose `url` is `{origin}/api/mcp`, and whose `Authorization` value is `Bearer` plus the secret just created, or `Bearer lk_…` when the secret is not on screen. Each card has a `Copy` button and a link labeled `Client setup steps` whose target is an `https` URL. OAuth client cards are F14.

Check order for a call that reaches the Ledger API:

1. `request_too_large` when the raw body is over 262144 bytes.
2. `body_invalid` when POST or PATCH is not `Content-Type: application/json` (charset `utf-8` allowed) or the JSON value is not an object. GET ignores a body under that size.
3. `auth_missing`, `auth_invalid`, `auth_revoked`, or `session_refused`.
4. `rate_limited` when the 60-request window already holds 60 admitted calls.
5. `scope_read` for `propose_change` and `update_proposal`.
6. Argument codes in the table below.
7. `proposal_rate`, then `open_limit`, for `propose_change` only.
8. One F12 shape error, and the validator does not run.
9. The F06 issue list. Several issues may be returned together.
10. Store.

`Retry-After` is an integer ≥ 1. For `rate_limited` and `proposal_rate` it is the remaining time until the oldest admitted timestamp leaves the window, rounded up to a whole second, and at least 1. For `open_limit` it is 60. `{seconds}` in a hint is that integer. `{credential}` is `key` or `grant`. `{name}` is the argument name. `{token}` is the filter piece, truncated to 80 code points.

On REST, the status is the HTTP status in the table, and the body is the error object. On MCP, authentication and limit failures use that HTTP status and do not run the tool. Argument and validation failures use HTTP 200 with `isError: true` and the same object as text and as structured content. `validate` uses HTTP 200 and `isError: false` even when `valid` is false.

The error object is `{ code, message, hint, valid: false, errors, warnings? }`. `code`, `message`, and `hint` equal `errors[0]`. An issue in `errors` has `severity: error`. An issue in `warnings` has `severity: warning`. F06 issues include `field` or `line`.

## Acceptance scenarios

### F13-AC-001a

Given the current release and `KB_LOCAL` unset, when a client requests `GET /api/mcp` and `GET /api/v1/context`, then `/api/mcp` is HTTP 404, `/api/v1/context` is not the Ledger context pack, and Settings has no Agent keys section.

### F13-AC-001b

Given `KB_LOCAL=1`, when a client requests `GET /api/mcp`, then the JSON includes `cursor`, `claude`, and `codex` for the stdio editor server and does not list `propose_change`.

### F13-AC-001c

Given the editor stdio server, when a client lists its tools, then the names are `list_projects`, `create_project`, `list_files`, `read_file`, `create_file`, `update_file`, `create_folder`, `move_file`, `delete_file`, and `search`.

### F13-AC-002a

Given the Ledger API, when a client calls `tools/list`, then the names are the ten tools in F13-REQ-002, in that order, and `delete_file` is absent.

### F13-AC-003a

Given an open proposal, when a client calls `POST /api/v1/proposals/1/merge`, then the code is `route_unknown`, the message is `That operation is not available.`, the hint is `Agents propose changes. They cannot merge, delete, or administer.`, and the proposal status is unchanged.

### F13-AC-004a

Given a create whose summary is missing, when that body is submitted to `POST /api/v1/proposals` and, on a separate call, to the MCP tool `propose_change`, then both return `summary_invalid` with message `Summary is required.` and hint `Send one line, from 1 to 120 characters.`, and no proposal is stored.

### F13-AC-005a

Given a key for space `memento`, when `get_context` is called with `{ "space": "other" }`, then the code is `space_rejected`, the message is `The space comes from the credential.`, the hint is `Omit space. The key or grant already selects it.`, and no document from `other` is returned.

### F13-AC-006a

Given no `Authorization` header, when `GET /api/v1/context` is called, then the status is 401, the code is `auth_missing`, the message is `Authorization is required.`, and the hint is `Send Authorization: Bearer with an agent key.`

### F13-AC-006b

Given bearer `lk_memento_not-a-real-key`, when `GET /api/v1/context` is called, then the code is `auth_invalid`, the message is `That credential is not valid.`, and the hint is `Use an agent key from Settings → Agent keys.`

### F13-AC-006c

Given a revoked key, when the next call uses it, then the code is `auth_revoked`, the message is `That agent key was revoked.`, and the hint is `Create a new key in Settings → Agent keys.`

### F13-AC-006d

Given a revoked grant, when the next call uses it, then the code is `auth_revoked`, the message is `That grant was revoked.`, and the hint is `Connect the assistant again. Revoking a grant blocks the next call.`

### F13-AC-007a

Given a browser session and no bearer token, when `POST /api/v1/proposals` is called, then the code is `session_refused`, the message is `A browser session cannot call the agent API.`, the hint is `Use an agent key. A session cannot propose on an agent's behalf.`, and no proposal is created.

### F13-AC-008a

Given an Editor creates a key labeled `Cursor · MacBook` with scope `propose` in space `memento`, when the response is shown, then the secret matches `lk_memento_` plus 32 characters from `A-Za-z0-9`, the stored value is the SHA-256 hex of that secret, and the prefix ends with `…`.

### F13-AC-008b

Given the secret was shown, when the Editor reopens Settings, then the secret is absent and the prefix remains.

### F13-AC-008c

Given a Contributor, when they open Agent keys, then the message is `You cannot create agent keys.`, the hint is `Ask an owner or an editor.`, and no prefix is shown.

### F13-AC-009a

Given a key revoked at time T, when a call with that key arrives after T, then `auth_revoked` is returned and the document bytes are unchanged.

### F13-AC-010a

Given a key with scope `read`, when it calls `propose_change`, then the code is `scope_read`, the message is `This key can read. It cannot propose.`, the hint is `Use a key with scope propose.`, and no proposal is created.

### F13-AC-010b

Given a grant with scope `read`, when it calls `update_proposal`, then the message is `This grant can read. It cannot propose.` and the hint is `Approve the propose scope, or use a key with scope propose.`

### F13-AC-010c

Given a key with scope `propose`, when it calls `get_context`, then the pack is returned.

### F13-AC-011a

Given a bearer agent key and no session, when a document URL is opened in the browser, then no session is created and the page is the one served to a person with no session.

### F13-AC-012a

Given a key with 60 admitted requests in the last 60 seconds, when it calls `search` again, then the status is 429, the code is `rate_limited`, and the 60-request window still holds 60.

### F13-AC-012b

Given a key with 60 admitted requests and a grant with none, when the grant calls `get_context`, then the grant's call is admitted.

### F13-AC-012c

Given a key with 20 proposals in `open` or `changes_requested`, when it calls `propose_change` with a valid body, then the code is `open_limit`, the message is `This key already has 20 open proposals.`, and the proposal count is unchanged.

### F13-AC-012d

Given a key with 30 stored proposals in the last 3600 seconds, when it calls `propose_change`, then the code is `proposal_rate` and no row is stored. A failed validation on an earlier call did not increment that 30.

### F13-AC-013a

Given the 60-request window's oldest admitted call is 10.2 seconds from aging out, when the next call is refused, then `Retry-After` is `11` and the hint is `Wait 11 seconds, then retry.`

### F13-AC-013b

Given 20 open proposals, when `propose_change` is refused, then `Retry-After` is `60` and the hint is `Wait until one proposal is merged, rejected, or withdrawn. Open means status open or changes_requested.`

### F13-AC-014a

Given groups 4, 5, and 6 make the pack longer than 24000 bytes, and groups 0 through 3 fit, when `get_context` returns, then every remaining removable block was dropped from the end of groups 4, 5, and 6 first, and `tokens` is at most 6000.

### F13-AC-014b

Given a space with 100 experiments and a short `agents.md`, when `get_context` returns, then group 6 contributed at most 10 blocks and `tokens` is at most 6000.

### F13-AC-015a

Given the same space, when `get_context` is called with `detail: brief` and with `detail: full`, then the two `pack` strings are equal.

### F13-AC-015b

Given `detail: "verbose"`, when `get_context` is called, then the code is `detail_invalid`, the message is `detail must be brief or full.`, and the hint is `Omit detail, or send brief or full. Both return the same pack.`

### F13-AC-016a

Given a title match updated yesterday and a body-only match updated today, when `search` runs, then the title match is first, its `score` is 1, and the body match's `score` is 0.

### F13-AC-016b

Given two body matches with the same `updated_at` and slugs `b` then `a`, when `search` runs, then `a` comes before `b`.

### F13-AC-016c

Given query `type:experiment status:concluded`, when `search` runs, then those pieces are filters, a concluded experiment whose title contains neither word can still be returned, and its `score` is 1.

### F13-AC-017a

Given 60 documents, when `list_documents` is called with no `limit`, then 50 rows are returned and `next_cursor` is the base64url of the 50th row's `updated_at` and slug.

### F13-AC-018a

Given a document whose first revision with `version: 7` is not the head, when `read_document` is called with `version: 7`, then `revision_id` is that first revision and `markdown` is its text.

### F13-AC-018b

Given path `experiments/note.md` and a slug for a different document, when both are sent, then the code is `document_identity`, the message is `path and slug name different documents.`, and the hint is `Send one path or one slug.`

### F13-AC-019a

Given the experiment schema, when `get_template` is called with `type: experiment`, then `filename_pattern` is the schema filename, `guidance` is the schema body, `syntax` equals the syntax reference const, and the template frontmatter includes `type: experiment`.

### F13-AC-019b

Given type `no-such-type`, when `get_template` is called, then the code is `type_unknown`, the message is `Unknown type "no-such-type".`, and the hint is `Use a name that matches a loaded file in .ledger/types/.`

### F13-AC-020a

Given content that fails `link_unpinned`, when `validate` is called, then `valid` is false, the issue has that code, a message, and a hint, HTTP is 200, and no proposal row exists.

### F13-AC-020b

Given content with only warnings, when `validate` is called, then `valid` is true and `warnings` contains those issues.

### F13-AC-021a

Given a valid create, when `propose_change` returns, then `status` is `open`, `url` ends with `/{project}/inbox/{proposal_id}`, and the document head is unchanged.

### F13-AC-021b

Given content byte-identical to the head, when `propose_change` updates that path, then the code is `no_change`, the message is `Content is identical to the current head.`, the hint is `Change the document, or skip this save.`, and no proposal is created.

### F13-AC-021c

Given action `archive`, when `propose_change` is called, then the code is `action_refused`, the message is `Rename, archive, and delete are human actions.`, and the hint is `Send create or update.`

### F13-AC-022a

Given the author's proposal in `changes_requested`, when `update_proposal` sends new valid content, then status becomes `open` and no revision is inserted.

### F13-AC-022b

Given a proposal in `open`, when its author calls `update_proposal`, then the code is `update_closed`, the message is `Updates are only accepted after changes were requested.`, and the hint is `Wait for a reviewer to request changes, or submit a new proposal.`

### F13-AC-023a

Given a merged proposal, when `get_proposal` is called, then `status` is `merged`, `merged_revision_id` is the new revision, and `notes` is an array.

### F13-AC-023b

Given a proposal id from another space, when `get_proposal` is called, then the code is `proposal_missing`, the message is `No proposal has that id.`, and the hint is `Open a proposal from the Inbox.`

### F13-AC-024a

Given two concluded experiments on eval versions 1 and 2, when `get_metrics` is called with that eval slug, then both points are in `points`, each `eval_version` is kept, and the body contains no chart spec.

### F13-AC-024b

Given an unknown eval slug, when `get_metrics` is called, then the code is `eval_missing`, the message is `No eval has that slug.`, and the hint is `Use a slug from list_documents with type eval.`

### F13-AC-025a

Given `tools/list`, when each description is read, then it equals that tool's `const` in `specs/contracts/mcp-tools.json` and contains the five workflow sentences in F13-REQ-025.

### F13-AC-026a

Given a `propose_change` success body, when it is checked against `$defs/proposalCreated` and against `ProposalCreated` in the OpenAPI document, then both schemas accept it.

### F13-AC-027a

Given a `scope_read` refusal, when the body is read, then `code`, `message`, and `hint` are non-empty and equal `errors[0]`, and `valid` is false.

### F13-AC-028a

Given `content` of 204800 UTF-8 bytes that otherwise passes, when `validate` runs, then `too_large` is absent.

### F13-AC-028b

Given `content` of 204801 UTF-8 bytes, when `propose_change` runs, then the code is `too_large`, the message names `{bytes}` and `204800 bytes (200 KB)`, the hint is `Shorten the file to 204800 bytes or less, UTF-8.`, and no proposal is created.

### F13-AC-029a

Given a POST body of 262145 bytes, when it is sent to `/api/v1/validate`, then the status is 413, the code is `request_too_large`, the message is `The request body must be at most 262144 bytes.`, and the hint is `Send one document of at most 204800 bytes.`

### F13-AC-030a

Given no keys, when an Owner opens Agent keys at 860px and at 420px, then both show `No agent keys. Create one to connect Cursor or a script.`

### F13-AC-030b

Given a key was just created, when the secret panel is shown, then it shows `Copy this key now. It will not be shown again.`

### F13-AC-031a

Given no keys, when an Owner opens Connect, then the copy is `Create an agent key first.`

### F13-AC-031b

Given a secret on screen, when the Owner reads the Cursor card, then the snippet URL is `{origin}/api/mcp` and the server name is `markdown-kb`.

### F13-AC-032a

Given the search environment, when the 95th percentile of `search` is measured, then it is under 100 ms.

### F13-AC-033a

Given the call environment, when the 95th percentile of `read_document` is measured, then it is under 2 seconds.

### F13-AC-034a

Given the call environment, when the 95th percentile of the server time for one `get_context`, one `get_template`, and one `propose_change` is measured, excluding model time, then it is under 10 seconds.

### F13-AC-035a

Given Cursor and the sentence "log this experiment to Ledger", when the agent uses only the ten MCP tools, then the stored proposal is valid and needs no manual fixes.

### F13-AC-036a

Given `propose_change` returned a structured error for an invalid proposal, when the agent retries with a valid proposal, then the retry succeeds and the proposal is stored.

### F13-AC-037a

Given a page an agent updated through the editor server, when the browser loads the disk copy, then the change is recorded as an agent change. Given the same file changed on disk with no agent event, then nothing is recorded.

### F13-AC-038a

Given an agent replaced `The cat sat` with `The dog sat`, then the counter left of Edit reads `+3 −3`, and it still reads `+3 −3` after a reload.

### F13-AC-038b

Given the counter reads `+3 −3`, when the person types elsewhere on the page, then it still reads `+3 −3`. When the person deletes the agent's `dog`, then it reads `+0 −3`.

### F13-AC-039a

Given the counter is shown, when it is chosen, then the counter and the highlights disappear, and the page content is unchanged.

### F13-AC-040a

Given an agent replaced `The cat sat` with `The dog sat`, when the page is edited as blocks, then `dog` is marked inserted and `cat` is shown struck as deleted, in that paragraph.

### F13-AC-040b

Given an agent added a paragraph and removed another, when the page is edited as blocks, then the new paragraph's text is marked inserted and the removed paragraph's text is shown struck where it was.

### F13-AC-041a

Given local edits on a page, when an agent changes the page on disk and `Load disk version` is chosen, then the agent's change from the last disk copy is highlighted and counted.

## Edge cases and errors

F06 codes keep the message and hint in `specs/contracts/errors.md`. F12 codes keep the message and hint in the F12 spec. The rows below are the codes this feature adds, plus the F06 and F12 codes the tools return most directly. `{find}`, `{count}`, and the summary variants are the F12 sentences.

| Case | Code | HTTP | Message | Hint |
| --- | --- | --- | --- | --- |
| No bearer token | `auth_missing` | 401 | `Authorization is required.` | `Send Authorization: Bearer with an agent key.` |
| Unknown token | `auth_invalid` | 401 | `That credential is not valid.` | `Use an agent key from Settings → Agent keys.` |
| Revoked key | `auth_revoked` | 401 | `That agent key was revoked.` | `Create a new key in Settings → Agent keys.` |
| Revoked grant | `auth_revoked` | 401 | `That grant was revoked.` | `Connect the assistant again. Revoking a grant blocks the next call.` |
| Session without a bearer token | `session_refused` | 403 | `A browser session cannot call the agent API.` | `Use an agent key. A session cannot propose on an agent's behalf.` |
| Read key proposes | `scope_read` | 403 | `This key can read. It cannot propose.` | `Use a key with scope propose.` |
| Read grant proposes | `scope_read` | 403 | `This grant can read. It cannot propose.` | `Approve the propose scope, or use a key with scope propose.` |
| Contributor or Viewer creates or revokes a key | `permission_denied` | 403 | `You cannot create agent keys.` | `Ask an owner or an editor.` |
| Unknown tool or route, including merge, delete, and archive | `route_unknown` | 404 | `That operation is not available.` | `Agents propose changes. They cannot merge, delete, or administer.` |
| A `space` argument | `space_rejected` | 400 | `The space comes from the credential.` | `Omit space. The key or grant already selects it.` |
| `detail` not `brief` or `full` | `detail_invalid` | 400 | `detail must be brief or full.` | `Omit detail, or send brief or full. Both return the same pack.` |
| Query empty or only whitespace | `query_invalid` | 400 | `Query is required.` | `Send terms, or a filter such as type:experiment.` |
| Query over 500 code points | `query_invalid` | 400 | `Query must be at most 500 characters.` | `Shorten the query. A character is one Unicode code point.` |
| `limit` out of range | `limit_invalid` | 400 | `limit is outside the allowed range.` | `Use an integer from {min} to {max}.` |
| Cursor does not decode to `u` and `s` | `cursor_invalid` | 400 | `That cursor is not valid.` | `Omit cursor to start from the first page.` |
| Neither path nor slug | `document_identity` | 400 | `Send a path or a slug.` | `Use the path from list_documents, or the document slug.` |
| Path and slug name different documents | `document_identity` | 400 | `path and slug name different documents.` | `Send one path or one slug.` |
| `slug` combined with `type`, `status`, `limit`, or `cursor` | `filter_conflict` | 400 | `slug cannot be combined with a list filter.` | `Read one document by slug, or list with type, status, limit, and cursor.` |
| `version` on `GET /documents` without `slug` | `filter_conflict` | 400 | `version needs a slug.` | `Send slug and version, or read by path.` |
| Path is absolute, has `..`, a backslash, or does not end in `.md` | `path_rejected` | 400 | `That path is not allowed.` | `Send a relative .md path inside the space, with no .. segment.` |
| Filter value empty or not in the allowed set | `filter_invalid` | 400 | `Filter {token} is not valid.` | `Use type, status, harness, verdict, or after, each with a value.` |
| `version` not an integer from 1 to 999999999 | `version_invalid` | 400 | `version must be an integer from 1 to 999999999.` | `Use a version from read_document, or omit it for the head.` |
| Unknown argument | `argument_unknown` | 400 | `Unknown argument {name}.` | `Send only the arguments in specs/contracts/mcp-tools.json.` |
| Wrong JSON type | `argument_type` | 400 | `{name} has the wrong type.` | `Use the type in specs/contracts/mcp-tools.json.` |
| Missing required argument other than `action` and `summary` | `argument_missing` | 400 | `{name} is required.` | `Send {name}.` |
| POST or PATCH body is not a JSON object | `body_invalid` | 400 | `The body must be a JSON object.` | `Send Content-Type: application/json and a JSON object.` |
| Raw body over 262144 bytes | `request_too_large` | 413 | `The request body must be at most 262144 bytes.` | `Send one document of at most 204800 bytes.` |
| 60 requests in 60 seconds | `rate_limited` | 429 | `Too many requests.` | `Wait {seconds} seconds, then retry.` |
| 30 stored proposals in 3600 seconds | `proposal_rate` | 429 | `Too many proposals this hour.` | `Wait {seconds} seconds, then retry. This {credential} may store 30 proposals per 3600 seconds.` |
| 20 open proposals | `open_limit` | 429 | `This {credential} already has 20 open proposals.` | `Wait until one proposal is merged, rejected, or withdrawn. Open means status open or changes_requested.` |
| Label empty, over 80 code points, or containing CR or LF | `label_invalid` | 400 | `Label must be one line of 1 to 80 characters.` | `Use a label such as Cursor · MacBook.` |
| Scope other than `read` or `propose` | `scope_invalid` | 400 | `Scope must be read or propose.` | `Use read to look, or propose to submit proposals.` |
| Eval slug matches no document | `eval_missing` | 404 | `No eval has that slug.` | `Use a slug from list_documents with type eval.` |
| Type name matches no schema | `type_unknown` | 404 | `Unknown type "{type}".` | `Use a name that matches a loaded file in .ledger/types/.` |
| Update path or read path is absent | `document_missing` | 404 | `No document at that path.` | `Use create for a new file, or send the path you read.` |
| Slug matches no document | `document_missing` | 404 | `No document has that slug.` | `Use a slug from list_documents.` |
| Pinned version was never saved | `version_missing` | 404 | `{slug} has no version {version}.` | `Use a version saved on that document.` |
| Proposal id absent in this space | `proposal_missing` | 404 | `No proposal has that id.` | `Open a proposal from the Inbox.` |
| Action missing or not `create` or `update` | `action_refused` | 422 | `Rename, archive, and delete are human actions.` | `Send create or update.` |
| Summary missing or empty | `summary_invalid` | 422 | `Summary is required.` | `Send one line, from 1 to 120 characters.` |
| Summary longer than 120 code points, or CR or LF | `summary_invalid` | 422 | `Summary must be one line of at most 120 characters.` | `Send one line, from 1 to 120 characters.` |
| Both `content` and `edits` | `proposal_body` | 422 | `Send content or edits, not both.` | `Use full Markdown in content, or a list of find and replace pairs.` |
| Neither `content` nor `edits` on create | `proposal_body` | 422 | `Send content or edits.` | `Use full Markdown in content, or a list of find and replace pairs.` |
| `find` empty, zero matches, or several matches | `edit_not_unique` | 422 | `Find is empty: "".` or `Find matched 0 times: "{find}".` or `Find matched {count} times: "{find}".` | `Each find must match exactly once.` |
| `edits` is `[]` | `edits_empty` | 422 | `Edits needs at least one pair.` | `Send a find and replace, or send the full content.` |
| Create sends `edits` | `edits_need_update` | 422 | `Edits apply to an update, not a create.` | `Send content for a create, or send action update with a base revision.` |
| Update without a base revision of that document | `base_missing` | 422 | `Update needs a base revision.` | `Send the revision id you read, as base_revision_id.` |
| Bytes identical to the head | `no_change` | 422 | `Content is identical to the current head.` | `Change the document, or skip this save.` |
| Document over 204800 bytes | `too_large` | 422 | `Document is {bytes} bytes. The limit is 204800 bytes (200 KB).` | `Shorten the file to 204800 bytes or less, UTF-8.` |
| `update_proposal` when status is not `changes_requested` | `update_closed` | 422 | `Updates are only accepted after changes were requested.` | `Wait for a reviewer to request changes, or submit a new proposal.` |
| `update_proposal` with no content, edits, or summary | `update_empty` | 422 | `Update needs content, edits, or a summary.` | `Send the revised Markdown, or a new summary.` |
| `update_proposal` from another credential | `proposal_author` | 422 | `Only the author can update this proposal.` | `Use the same agent key or user that created it.` |

`validate` reports `too_large` inside `{ valid: false, errors }` with HTTP 200. `propose_change` and `update_proposal` report it as the error object with HTTP 422.

`{min}` and `{max}` are 1 and 100 for `list_documents`, and 1 and 50 for `search`. A missing `action` is `action_refused`. A missing `summary` on `propose_change` is `summary_invalid`. Those two are not `argument_missing`.

## Limits and budgets

A character is one Unicode code point. The API clock is UTC and tests may inject it. `Retry-After` is whole seconds, minimum 1.

| Limit | Value |
| --- | --- |
| Requests | 60 admitted requests per key, and 60 per grant, in each 60-second window `(T − 60 seconds, T]` |
| Stored proposals | 30 per key, and 30 per grant, in each 3600-second window `(T − 3600 seconds, T]` |
| Open proposals | 20 per key, and 20 per grant. The 20th open proposal makes the next `propose_change` return `open_limit` |
| Open statuses | `open` and `changes_requested` created by that credential |
| Document size | 204800 bytes (200 KB, 200 × 1024) UTF-8. 204800 passes. 204801 is `too_large` |
| Request body | 262144 bytes. 262145 is `request_too_large` |
| `get_context` | At most 6000 tokens, where one token is 4 UTF-8 bytes rounded up once, so at most 24000 bytes of `pack` |
| Search `limit` | Default 20, minimum 1, maximum 50 |
| List `limit` | Default 50, minimum 1, maximum 100 |
| Query | 1 to 500 code points after the empty check |
| Path | At most 512 code points |
| Summary | 1 to 120 code points, no CR and no LF (F12) |
| Label | 1 to 80 code points, no CR and no LF |
| Secret | 32 characters from `A-Za-z0-9` after `lk_<space-slug>_` |
| Snippet | At most 240 code points |
| `open_limit` `Retry-After` | 60 seconds |
| Coarse-pointer targets | At least 44px on `Create key`, `Revoke`, `Copy`, and the revoke dialog buttons |
| Search latency | Under 100 ms at the 95th percentile. Clock starts at the first request byte on the route handler and stops at the first response byte. Environment: Next.js on Vercel, Postgres, one space, 10,000 documents, a 3-term query, warm instance, no other traffic |
| Other calls | Under 2 seconds at the 95th percentile, same clock. Environment: that stack, one space, 100 experiments, a document of at most 204800 bytes, warm instance, no other traffic |
| Log-an-experiment server time | Under 10 seconds at the 95th percentile for one `get_context`, one `get_template`, and one `propose_change` added together, model time excluded, in the call environment |

Exactly 60 admitted requests in the window refuses the next one. Exactly 30 stored proposals refuses the next store. Exactly 20 open proposals refuses the next create.

## UI states

Copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower. There is no illustration. Settings is the settings dialog (F10). Agent keys and Connect are sections in it. Loading is a skeleton with the accessible name below. At 860px and wider, a key row is one line. At 420px and narrower, the row stacks Label, Scope, Prefix, Last used, Proposals, Owner, and the action. Connect cards stack at both widths.

Revoke opens a confirmation dialog, which is allowed because revoke is irreversible. The title is `Revoke this key?` The body is `Agents using it will be refused on the next call.` The buttons are `Revoke` and `Cancel`. Create does not open a dialog.

Scope words on the row are `Read` and `Propose`. The create control starts on `Read`. Last used is `Never` when null. Otherwise it uses the F12 age words: `just now` under 60 seconds, `{n}m` from 60 seconds up to 3600 seconds, `{n}h` from 3600 seconds up to 48 hours, and `{n}d` from 48 hours upward.

### Agent keys

| State | Copy |
| --- | --- |
| Empty | `No agent keys. Create one to connect Cursor or a script.` |
| Loading | `Loading agent keys…` |
| Error | `Agent keys did not load.` Then the hint `Reload the page.` |
| Partial, live and revoked rows | No extra sentence. A revoked row shows `Revoked` |
| Success, one or more keys | No extra sentence. Each row shows label, scope, prefix, last used, proposal count, and owner |
| Success, secret just created | `Copy this key now. It will not be shown again.` |
| Permission, Contributor or Viewer | `You cannot create agent keys.` Then the hint `Ask an owner or an editor.` |

The form labels are `Label` and `Scope`. The scope options are `Read` and `Propose`. The button is `Create key`. A field error shows its message and then its hint.

### Connect

| State | Copy |
| --- | --- |
| Empty, no key | `Create an agent key first.` |
| Loading | `Loading connect options…` |
| Error | `Connect options did not load.` Then the hint `Reload the page.` |
| Success, secret not on screen | `Paste the key you copied. It is shown only once.` The bearer in the snippet is `lk_…` |
| Success, secret on screen | The snippet includes that secret. No extra sentence |
| Permission, Contributor or Viewer | `You cannot create agent keys.` Then the hint `Ask an owner or an editor.` |

Card titles are `Cursor`, `Claude Code`, and `Generic`. The link label is `Client setup steps`. The button label is `Copy`.

## Out of scope

- The OAuth 2.1 handshake, protected-resource metadata, dynamic client registration, the consent screen, token lifetimes, and OAuth client cards (F14). A grant that F14 has issued uses the tools, scopes `read` and `propose`, and the limits in F13-REQ-012.
- Inbox, diff, merge, reject, request changes, and withdraw (F12). This spec calls those rules and does not define them again.
- The 18 validation rules, the 4 rendering checks, and `schema_invalid` (F06, `specs/contracts/errors.md`).
- The `proposals` table, revision rows, and metric-point rows (F07). `get_metrics` returns the points F07 stored.
- Type schema files (F02). `get_template` reads the schema F02 loaded.
- Human sign-in screens and session cookies (F15). Role checks for who may create a key are in this spec.
- Charts, baselines, and the Metrics screen (F16).
- The command palette and its highlight rendering (F17). Search hits here are plain text.
- The editor stdio tools and `GET /api/mcp` snippets. This spec does not change them.
- `design.md` and `tasks.md` for this feature.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F13-Q-001 | The role table says only the Owner manages keys. The agent-keys section says owners and editors create them. | Owners and editors create and revoke keys. Members and types stay with the Owner. This spec follows that split. | Product owner | A change to F13-REQ-008 and F13-REQ-030 if only the Owner may create a key |
| F13-Q-002 | Should `get_context` be configurable per space? | No. The pack in F13-REQ-014 is fixed. | Product owner | A settings control for pack sections. It does not block the tool |

ADR-0025, ADR-0028, and ADR-0029 are Proposed. This spec follows them. They are not open questions here. ADR-0002 is Accepted: there is no auth yet, and the four roles are the later target. API keys are a later target.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:summary -->` — agents read and propose; a person merges.
- `<!-- prd:goals-for-v1 -->` — one tool call logs an experiment, including assistants that connect later by OAuth.
- `<!-- prd:core-concepts -->` — an agent key cannot merge, delete, or administer.
- `<!-- prd:space-and-agents -->` — `agents.md` is the rulebook `get_context` returns.
- `<!-- prd:agent-logs-an-experiment -->` — one proposal, under 10 seconds of the flow.
- `<!-- prd:mcp-and-api -->` through `<!-- prd:tool-descriptions -->` — `/api/mcp`, the ten tools, the error object, and the workflow sentences.
- `<!-- prd:rest-api -->` — the same operations under `/api/v1`.
- `<!-- prd:limits -->` — 60 requests per minute, 30 proposals per hour, 200 KB, 20 open proposals, and `no_change`.
- `<!-- prd:validation -->` and `<!-- prd:validation-behavior -->` — the same validator, errors block, warnings do not.
- `<!-- prd:metric-point -->` — the fields `get_metrics` returns.
- `<!-- prd:search -->` — title match, then recency, and the inline filters.
- `<!-- prd:agent-keys -->` — label, scope, hash, prefix, last used, revoke.
- `<!-- prd:oauth-grants -->` — a grant reaches the same tools. The handshake is F14.
- `<!-- prd:acceptance-milestones-1-4 -->` — a key cannot merge, a revoked key is refused, `get_context` stays under 6k tokens for 100 experiments.
- `<!-- prd:acceptance-criteria -->` — "log this experiment to Ledger" needs no manual fixes (F13-REQ-035). After a structured error, the agent's retry succeeds (F13-REQ-036).

Decisions in `specs/source/decisions-and-changes.md`: D3 (no auth yet), D4 (agents later), D6 (markdown-kb, no space segment), D7 (agents never merge).

Change requests: none of C1 through C9 replace agent access.

ADRs: ADR-0001, ADR-0002, ADR-0009, ADR-0014, ADR-0017, ADR-0025, ADR-0028, ADR-0029. ADR-0021 is the find-once rule F12 applies and this spec calls.

Contracts: `specs/contracts/mcp-tools.json` and `specs/contracts/rest.openapi.yaml`.

| Tool | Schema | REST |
| --- | --- | --- |
| `get_context` | `getContextInput`, `getContextOutput` | `getContext` `GET /context` |
| `list_documents` | `listDocumentsInput`, `listDocumentsOutput` | `getDocuments` `GET /documents` |
| `read_document` | `readDocumentInput`, `readDocumentOutput` | `readDocument` `GET /documents/{path}`, and `GET /documents?slug=` |
| `search` | `searchInput`, `searchOutput` | `searchDocuments` `GET /search` |
| `get_template` | `getTemplateInput`, `getTemplateOutput` | `getTemplate` `GET /templates/{type}` |
| `validate` | `validateInput`, `validateOutput` | `validateDocument` `POST /validate` |
| `propose_change` | `proposeChangeInput`, `proposeChangeOutput` | `createProposal` `POST /proposals` |
| `get_proposal` | `getProposalInput`, `getProposalOutput` | `getProposal` `GET /proposals/{id}` |
| `update_proposal` | `updateProposalInput`, `updateProposalOutput` | `updateProposal` `PATCH /proposals/{id}` |
| `get_metrics` | `getMetricsInput`, `getMetricsOutput` | `getMetrics` `GET /metrics` |

On REST, `proposal_id` for `get_proposal` and `update_proposal` is the path parameter `{id}`. The PATCH body is `content`, `edits`, and `summary`. On MCP, `proposal_id` is an argument. `GET /search` uses query `q` for the tool's `query`.

Depends on F02, F06, F07, and F12. F14 uses the grant limits. F15 stores the roles that may create a key.
