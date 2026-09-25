# F13 design: Agent access

Design for `specs/features/F13-agent-access/spec.md` (branch `cursor/spec-mcp-rest-069c`). The tool bodies are `specs/contracts/mcp-tools.json` and the HTTP surface is `specs/contracts/rest.openapi.yaml` on that same branch.

The Ledger API is off unless `LEDGER_API=1`. With the variable unset, `GET /api/mcp` stays the editor snippet route in `app/api/mcp/route.ts`, `npm run mcp` stays `mcp/server.ts`, and Settings has no Agent keys section and no Connect section. The ten Ledger tools are a different set from `lib/mcp/tools.ts`. That file is not edited by this feature.

## Modules

| Module | Path | Responsibility |
| --- | --- | --- |
| API flag | `lib/agent/flag.ts` | `ledgerApiEnabled()` is true only when `LEDGER_API=1`. |
| Admit | `lib/agent/admit.ts` | The check order in the spec, from body size through store. |
| Errors | `lib/agent/errors.ts` | `{ code, message, hint, valid: false, errors, warnings? }`. |
| Credential | `lib/agent/credential.ts` | Bearer parse, key or grant lookup, `session_refused`, no web session from a bearer. |
| Keys | `lib/agent/keys.ts` | Create and revoke. Hash only. Secret shown once. |
| Limits | `lib/agent/limits.ts` | 60 requests, 30 stored proposals, 20 open proposals, per credential. |
| Pack | `lib/agent/pack.ts` | `get_context` blocks, trim, token count. |
| Search | `lib/agent/search.ts` | Terms, filters, rank, snippet. |
| Documents | `lib/agent/documents.ts` | `list_documents` and `read_document`. |
| Template | `lib/agent/template.ts` | `get_template` from the F02 schema. |
| Validate | `lib/agent/validate.ts` | F06 result, no write. |
| Proposals | `lib/agent/proposals.ts` | `propose_change`, `update_proposal`, `get_proposal` call F12. |
| Metrics | `lib/agent/metrics.ts` | Points F07 stored. No chart. |
| Tools | `lib/agent/tools.ts` | The ten functions, one implementation each. |
| Descriptions | `lib/agent/descriptions.ts` | Copies each `const` description from `mcp-tools.json`. |
| MCP route | `app/api/mcp/route.ts` | Editor GET while the API is off. Streamable HTTP when it is on. |
| REST route | `app/api/v1/[[...path]]/route.ts` | The paths in `rest.openapi.yaml`. Calls `tools.ts`. |
| Agent keys screen | `components/settings/agent-keys.tsx` | Settings section. |
| Connect screen | `components/settings/connect.tsx` | Cursor, Claude Code, and Generic cards. |
| Settings host | `components/settings-host.tsx` | Adds the two sections when the API flag is on. |

`lib/agent/tools.ts` is the only implementation. The MCP handler and the REST handler both call it after `admit`.

## Data shapes

`agent_keys` is the F07 table: `space_id`, `owner_user_id`, `label`, `scope` (`read` or `propose`), `key_prefix`, `key_hash` (lowercase hex SHA-256), `last_used_at`, `revoked_at`.

The secret is `lk_<space-slug>_<32>` with 32 characters from `A-Za-z0-9`, from a CSPRNG. The prefix is `lk_`, the space slug, `_`, the first 4 secret characters, and `…`. The raw secret is returned on the create response and is not stored.

This feature adds `credential_calls` for the two windows:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | `bigint` identity | |
| `kind` | `text` | `key` or `grant` |
| `credential_id` | `bigint` | Key id or grant id |
| `call_kind` | `text` | `request` or `proposal` |
| `at` | `timestamptz` | API clock |

A rejected call is not inserted. Open proposals are counted from `proposals` where status is `open` or `changes_requested` and the row's `agent_key_id` or `oauth_grant_id` is that credential. MCP and REST for one credential share these rows. A grant's rows are not a key's rows.

```ts
type Credential =
  | { kind: "key"; id: number; spaceId: number; ownerUserId: number; scope: "read" | "propose"; label: string }
  | { kind: "grant"; id: number; spaceId: number; userId: number; scope: "read" | "propose"; label: string };

type ToolError = {
  code: string;
  message: string;
  hint: string;
  valid: false;
  errors: { severity: "error"; code: string; message: string; hint: string; field?: string; line?: number }[];
  warnings?: { severity: "warning"; code: string; message: string; hint: string }[];
};
```

`code`, `message`, and `hint` equal `errors[0]`. A grant that holds both `read` and `propose` is `scope: "propose"`.

Tool inputs and outputs are the `$defs` in `specs/contracts/mcp-tools.json`. REST methods, paths, and status codes are `specs/contracts/rest.openapi.yaml`. `GET /search` uses query `q` for `query`. `proposal_id` is an MCP argument and a REST path `{id}`.

`get_context` joins the pack blocks with `\n---\n`. `tokens` is `ceil(UTF-8 bytes / 4)`. The cap is 24000 bytes. Groups 4, 5, and 6 drop from the end first. `detail` omitted echoes `brief`. `brief` and `full` return the same pack.

## State

There is no browser session for a key or a grant. A bearer on a page request does not set or clear a session cookie.

Settings state, when the flag is on:

| Field | Values |
| --- | --- |
| Key list | Empty, loading, error, rows. A revoked row keeps the word `Revoked`. |
| Create form | Label, scope default `Read`. |
| Secret | Present only on the create result. Absent after leaving Settings or reloading. |
| Connect cards | `Cursor`, `Claude Code`, `Generic`. Bearer is the secret just created, or `Bearer lk_…`. |

`last_used_at` updates on each call that identified the key, including a later validation error or limit refusal. It does not update on `auth_missing` or `auth_invalid`. Proposal count increments only when `propose_change` stores a row.

Owner and Editor may create and revoke keys in this feature. Contributor and Viewer receive `permission_denied` and see no prefix and no secret. F15-REQ-026 names Owner only for the same action. F13-Q-001 and F15-Q-001 record that split. `lib/agent/keys.ts` enforces the F13 rule. `lib/auth/permissions.ts` enforces the F15 rule. The product owner picks which function Settings calls. Until then the two checks stay separate, and each test calls its own module.

Check order inside `admit`:

1. `request_too_large` when the raw body is over 262144 bytes.
2. `body_invalid` when POST or PATCH is not a JSON object.
3. `auth_missing`, `auth_invalid`, `auth_revoked`, or `session_refused`.
4. `rate_limited` when the 60-request window already holds 60 admitted calls.
5. `scope_read` for `propose_change` and `update_proposal`.
6. Argument codes (`space_rejected`, `detail_invalid`, `query_invalid`, `limit_invalid`, `cursor_invalid`, `document_identity`, `filter_conflict`, `path_rejected`, `filter_invalid`, `version_invalid`, `argument_unknown`, `argument_type`, `argument_missing`).
7. `proposal_rate`, then `open_limit`, for `propose_change` only.
8. One F12 shape error. The validator does not run.
9. The F06 issue list.
10. Store.

`Retry-After` is an integer of at least 1. For `open_limit` it is 60. On MCP, authentication and limit failures use the HTTP status and do not run the tool. Argument and validation failures use HTTP 200 with `isError: true`. `validate` uses HTTP 200 and `isError: false` even when `valid` is false. On REST, the status is the HTTP status in the spec table.

## Contracts

- `specs/contracts/mcp-tools.json` — ten tool names, order, descriptions, and `$defs`.
- `specs/contracts/rest.openapi.yaml` — `/api/v1` operations.
- `specs/contracts/errors.md` — F06 issues, including `too_large` at 204800 bytes.
- `specs/contracts/db.sql` — `agent_keys`, `documents`, `revisions`, `proposals`, `metric_points`. This feature adds `credential_calls`.
- F12 `lib/review/submit.ts`, `update.ts`, and `read.ts` — proposal lifecycle.
- F02 — loaded type schema for `get_template`.
- F07 — stored metric points and revisions.
- F14 — a grant, once issued, is the `kind: "grant"` credential. Handshake is not this feature.
- F15 — human sign-in screens. This feature's key permission is the F13 Owner-or-Editor rule above.

## Boundaries

The editor stdio tools stay `list_projects`, `create_project`, `list_files`, `read_file`, `create_file`, `update_file`, `create_folder`, `move_file`, `delete_file`, and `search`. No Ledger tool merges, deletes, archives, or administers members, keys, or types. Unknown names return `route_unknown`.
