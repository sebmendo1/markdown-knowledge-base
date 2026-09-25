# F14 design: OAuth for assistants

Design for `specs/features/F14-oauth/spec.md` (branch `cursor/spec-oauth-assistants-f1dd`).

OAuth is off unless `LEDGER_OAUTH=1`. With the variable unset, the five OAuth routes return HTTP 404 and `oauth_unavailable`, Settings shows no Agents section and no Claude, ChatGPT, or Meta Muse card, and the person at the keyboard still edits. `GET /api/mcp` stays as F13-REQ-001 describes it. No client id, code, access token, or refresh token is issued.

When the flag is on, the Ledger API flag is also on, and human sign-in is F15. Consent sends a signed-out person through `/sign-in` and returns them to the same authorization request.

## Modules

| Module | Path | Responsibility |
| --- | --- | --- |
| OAuth flag | `lib/oauth/flag.ts` | `oauthEnabled()` is true only when `LEDGER_OAUTH=1`. |
| Metadata | `lib/oauth/metadata.ts` | Protected-resource and authorization-server documents. |
| Redirects | `lib/oauth/redirects.ts` | Allowed redirect URIs and exact string match. |
| Register | `lib/oauth/register.ts` | Public dynamic client registration. No client secret. |
| Authorize | `lib/oauth/authorize.ts` | PKCE `S256` checks, consent decision, code issue, deny. |
| PKCE | `lib/oauth/pkce.ts` | `code_verifier` length and base64url SHA-256 challenge. |
| Tokens | `lib/oauth/tokens.ts` | Code exchange, refresh rotation, reuse detection, expiry. |
| Grants | `lib/oauth/grants.ts` | One grant per user, client, and space. Revoke and list. |
| Bearer | `lib/oauth/bearer.ts` | Presents a live access token to F13 as `kind: "grant"`. |
| CSRF | `lib/oauth/csrf.ts` | Calls the F15 origin check on approve, deny, and revoke. |
| Protected resource | `app/.well-known/oauth-protected-resource/route.ts` | `GET` JSON. Other methods return `method_not_allowed`. |
| Authorization server | `app/.well-known/oauth-authorization-server/route.ts` | `GET` JSON. |
| Registration route | `app/oauth/register/route.ts` | `POST` JSON. |
| Consent page | `app/oauth/authorize/page.tsx` | Consent at `/oauth/authorize`. Not a dialog. |
| Consent action | `app/oauth/authorize/route.ts` | `POST` approve or deny. |
| Token route | `app/oauth/token/route.ts` | `POST` form body. Sets no session cookie. |
| Consent view | `components/oauth/consent.tsx` | Space list, Read, Propose, Approve, Deny. |
| Agents section | `components/settings/agents.tsx` | Settings → Agents. |
| OAuth cards | `components/settings/oauth-cards.tsx` | Claude, ChatGPT, and Meta Muse in Connect. |

F13 `app/api/mcp/route.ts` adds `WWW-Authenticate` on HTTP 401 when this flag is on. The header names `resource_metadata` and does not issue a token.

## Data shapes

Tables this feature adds. Token and code columns store lowercase hex SHA-256 of the UTF-8 value. Raw secrets are returned once and are not stored. None of them start with `lk_`.

`oauth_clients`

| Column | Rule |
| --- | --- |
| `client_id` | 32 CSPRNG bytes, base64url, no padding. Public. |
| `client_name` | 1 to 80 code points, no CR or LF. |
| `redirect_uris` | 1 to 8 stored strings. |
| `token_endpoint_auth_method` | Always `none`. No secret column. |

`oauth_codes`

| Column | Rule |
| --- | --- |
| `code_hash` | SHA-256 hex of the code. |
| `client_id`, `user_id`, `space_id` | The approval. |
| `redirect_uri` | Exact stored URI. |
| `scopes` | `read`, `propose`, or both, with `read` first. |
| `code_challenge` | 43 base64url characters. |
| `expires_at` | Issue time plus 600 seconds. Single use. |

`oauth_grants`

| Column | Rule |
| --- | --- |
| `user_id`, `client_id`, `space_id` | One space. |
| `scopes` | The checked scopes only. |
| `label` | `{client_name} · {user name}`. |
| `revoked_at` | Null until revoke or refresh reuse. |
| `last_used_at` | API clock of the latest admitted tool or REST call. |
| `proposal_count` | Proposals this grant has stored. |

`oauth_tokens`

| Column | Rule |
| --- | --- |
| `grant_id` | |
| `kind` | `access` or `refresh`. |
| `token_hash` | SHA-256 hex. |
| `expires_at` | Access: issue plus 3600 seconds. Refresh: issue plus 720 hours. |
| `rotated_at` | Set when a refresh token is replaced. A second use revokes the grant. |

`proposals.oauth_grant_id` gains a foreign key to `oauth_grants`. F12 added the nullable column.

```ts
type GrantCredential = {
  kind: "grant";
  id: number;
  spaceId: number;
  userId: number;
  scope: "read" | "propose";
  label: string;
};
```

A grant that holds both scopes is `propose` for F13-REQ-010. Counters are the F13 `credential_calls` rows with `kind: "grant"`. Metadata, registration, authorize, and token requests do not insert those rows.

Host is the request hostname, plus `:` and the port when the port is not 443. Origin is `https://{host}` with no path and no trailing slash. `resource` is exactly `https://{host}/api/mcp`.

## State

Consent is one column at 860px and at 420px. At 860px, Approve and Deny sit on one row. At 420px they stack, full width. Focus order is the space list, Read, Propose, Approve, Deny. A Viewer offered only `read` has no Propose control. A Viewer asked only for `propose` sees the refusal and no Approve button.

The space picker lists memberships. Public read does not add a space. A role in the form is ignored. The membership row is the role. A bearer does not choose the approving user.

Agents rows: an Owner sees every grant in the space. An Editor, Contributor, or Viewer sees grants they approved. A revoked row stays, shows `Revoked`, and has no Revoke control. Revoke confirms in a dialog titled `Revoke this grant?` because revoke is irreversible. Approve does not open a dialog.

OAuth cards show `https://{host}/api/mcp` and `Paste this URL. Sign in and approve a space. No key to copy.` Copy copies that URL and copies no `lk_` secret. Key cards stay F13.

While the flag is off, the consent page, the Agents section, and the three cards are absent.

## Contracts

- F13 `lib/agent/credential.ts` and `lib/agent/limits.ts` — the grant bearer and the three limits. Tool errors stay the F13 bodies.
- F13 `specs/contracts/mcp-tools.json` and `specs/contracts/rest.openapi.yaml` — the ten tools a grant may call. This feature adds no eleventh tool and no merge path.
- F15 `lib/auth/session.ts` and `lib/auth/csrf.ts` — the session cookie and the origin check. Token and registration endpoints are not browser mutations and do not require `Origin`.
- F12 `lib/review/author.ts` — stores `label` on the proposal.
- F15 `delete_refused` — a grant that deletes a document row receives that code. The row remains.
- `specs/contracts/db.sql` — this feature adds the four OAuth tables and the grant foreign key. `users` and `memberships` stay F07 and F15.

## Boundaries

Scopes are `read` and `propose`. There is no `merge` scope. An endpoint, a tool, or an OAuth scope that merges, deletes, or administers receives `permission_denied` with `Agents cannot merge, delete, or administer.` Revoke is a server action with the session cookie. A bearer cannot revoke.

The approving user may revoke their own grant. An Owner of the space may revoke any grant in it. An Editor, Contributor, or Viewer who did not approve that grant is refused. That split is F14-Q-001.
