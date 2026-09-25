# F14: OAuth for assistants

## Summary

OAuth for assistants is how Claude, ChatGPT, and Muse reach the same ten tools as an agent key: the person pastes the MCP URL, signs in, and approves `read` or `propose` for one space. Access tokens last 1 hour, refresh tokens last 30 days and rotate on use, and no scope can merge.

## Status and scope

Not started. The current release has no auth. OAuth for assistants is the later target. ADR-0002 is the decision for sign-in: there is no human sign-in yet, and the four roles are the later target. D3 is no auth yet. D4 leaves agent connection until later. This feature is part of the later Ledger loop.

This spec covers the MCP authorization handshake: OAuth 2.1 authorization code with PKCE `S256`, protected-resource metadata, authorization-server metadata, dynamic client registration, the consent screen, token lifetimes, refresh rotation, revocation, the Agents list, and the per-grant counters. It follows Proposed ADR-0025. The product owner has not confirmed that record.

The ten tools, the REST mirror, agent keys, and the error bodies for a tool call are F13. This spec states how a grant is issued and how its counters stay separate. Human sign-in, the session cookie, and the four roles are F15. The consent screen sends the person through that sign-in. Proposal review is F12. This spec stores the grant label a proposal carries. The glyph on the review screen is F12. Metric charts are F16. The settings dialog is F10. The product name in the UI is markdown-kb (ADR-0001).

F14-REQ-001 is the current release. The requirements after it are the later OAuth server. They are not started.

Screen role names are Owner, Editor, Contributor, and Viewer. Stored role values are `owner`, `editor`, `contributor`, and `viewer`. Stored scopes are `read` and `propose`. A grant is one authorization for one user, one client, and one space.

## Users and stories

- **F14-US-001** As a person using Claude or Muse, I want to paste the MCP URL and approve a space, so that the assistant can read or propose without a key copied by hand.
- **F14-US-002** As the owner, I want only the scopes `read` and `propose`, so that an assistant cannot be granted the power to publish.
- **F14-US-003** As the owner, I want each grant on its own counters, so that one assistant cannot spend another grant's requests or an agent key's requests.
- **F14-US-004** As the owner, I want revoke to kill that grant's tokens immediately, so that the next call is refused.
- **F14-US-005** As the owner, I want the current editor to keep working with no OAuth server, so that writing stays open while assistants are later.

## Requirements

- **F14-REQ-001** While OAuth for assistants is not built, the system shall return HTTP 404 with `oauth_unavailable` for `GET /.well-known/oauth-protected-resource`, `GET /.well-known/oauth-authorization-server`, `POST /oauth/register`, `GET /oauth/authorize`, and `POST /oauth/token`. The system shall show no consent screen, no Agents section, and no OAuth client cards. The system shall issue no client id, no authorization code, no access token, and no refresh token. `GET /api/mcp` shall stay as F13-REQ-001 states it. The person at the keyboard shall keep editing with no sign-in.
- **F14-REQ-002** The system shall serve `GET /.well-known/oauth-protected-resource` as JSON to every caller. A session is not required. A signed-out caller, a caller with no membership, an agent key, and a grant shall receive the same document. The document shall be `resource` `https://{host}/api/mcp`, `authorization_servers` a single item `https://{host}`, `scopes_supported` exactly `read` then `propose`, and `bearer_methods_supported` exactly `header`. `{host}` is the hostname of the request, plus `:` and the port when the port is not 443. The origin is `https://{host}`, with no path and no trailing slash.
- **F14-REQ-003** The system shall serve `GET /.well-known/oauth-authorization-server` as JSON to every caller. A session is not required. A signed-out caller, a caller with no membership, an agent key, and a grant shall receive the same document. `issuer` shall be `https://{host}`. `authorization_endpoint` shall be `https://{host}/oauth/authorize`. `token_endpoint` shall be `https://{host}/oauth/token`. `registration_endpoint` shall be `https://{host}/oauth/register`. `response_types_supported` shall be exactly `code`. `grant_types_supported` shall be exactly `authorization_code` and `refresh_token`. `code_challenge_methods_supported` shall be exactly `S256`. `token_endpoint_auth_methods_supported` shall be exactly `none`. `scopes_supported` shall be exactly `read` and `propose`.
- **F14-REQ-004** When the Ledger agent API is built and `/api/mcp` or `/api/v1` responds with HTTP 401, the system shall include the header `WWW-Authenticate: Bearer realm="markdown-kb", resource_metadata="https://{host}/.well-known/oauth-protected-resource"`. The body of a missing, unknown, or revoked bearer shall stay the F13 error for that case. The header shall not issue a token. While that API is not built, F14-REQ-001 and F13-REQ-001 hold, and this header is absent.
- **F14-REQ-005** When a client posts JSON to `/oauth/register` with a `client_name` of 1 to 80 Unicode code points and no CR or LF, 1 to 8 allowed `redirect_uris`, and `token_endpoint_auth_method` `none`, the system shall store one public client and shall return HTTP 201 with `client_id`, `client_id_issued_at`, `client_name`, `redirect_uris`, `token_endpoint_auth_method` `none`, `grant_types` `authorization_code` and `refresh_token`, and `response_types` `code`. The system shall return no client secret. Any caller may register, including a signed-out caller. A session is not required. The `client_id` shall be 32 bytes from a CSPRNG, encoded as base64url with no padding.
- **F14-REQ-006** If registration omits `client_name`, sends a name outside 1 to 80 code points, sends a CR or LF, sends a client secret, sends a token endpoint auth method other than `none`, sends a grant type other than `authorization_code` or `refresh_token`, sends a response type other than `code`, sends a scope other than `read` or `propose`, or sends a redirect URI that F14-REQ-007 refuses, then the system shall refuse and shall store no client. An Owner sending those values receives the same refusal as every other caller.
- **F14-REQ-007** The system shall accept a redirect URI that is an `https` URL with a host, no userinfo, and no fragment, or an `http` URL whose host is `127.0.0.1` or `localhost`, whose port is an integer from 1 to 65535, and which has no userinfo and no fragment. The system shall refuse every other URI, including an `http` URI on any other host, a loopback URI with no port, a fragment, userinfo, and a wildcard. Later comparisons shall be an exact string match to the stored URI. Owner, Editor, Contributor, Viewer, a signed-out caller, an agent key, and a grant shall all receive that same refusal.
- **F14-REQ-008** When `GET /oauth/authorize` receives `response_type` `code`, a stored `client_id`, a `redirect_uri` that exactly matches one URI stored for that client, `code_challenge_method` `S256`, a `code_challenge` of 43 base64url characters with no padding, a `state` of 1 to 512 code points with no CR or LF, and `resource` exactly `https://{host}/api/mcp`, the system shall show the consent screen to a signed-in user. `POST /oauth/authorize` shall submit approve or deny. The system shall show that screen on every valid GET. A `prompt` value shall not skip it. The system shall issue no code before the user approves. Any other method on `/.well-known/oauth-protected-resource` or `/.well-known/oauth-authorization-server` shall return `method_not_allowed`, message `Use GET.`, hint `Read this document with GET.`, and shall issue no code. A method other than GET or POST on `/oauth/authorize` shall return `method_not_allowed`, message `Use GET or POST.`, hint `Open the consent page with GET, or submit Approve or Deny with POST.`, and shall issue no code. A method other than POST on `/oauth/register` or `/oauth/token` shall return `method_not_allowed`, message `Use POST.`, hint `Post the form or the JSON body.`, and shall issue no token.
- **F14-REQ-009** If `response_type` is not `code`, `client_id` is unknown, `redirect_uri` does not exactly match a URI stored for that client, `code_challenge` is missing or not 43 base64url characters, `code_challenge_method` is not `S256`, `state` is missing, empty, longer than 512 code points, or contains CR or LF, or `resource` is not exactly `https://{host}/api/mcp`, then the system shall refuse and shall issue no code and no token. When `client_id` is unknown or `redirect_uri` does not match, the system shall respond with HTTP 400 and shall not redirect. When the client and redirect URI match and another check in this requirement fails, the system shall redirect to that URI with `error`, `error_description`, `hint`, and `state`.
- **F14-REQ-010** The system shall offer only the scopes `read` and `propose`. The `read` purpose string shall be `Read documents, templates and metrics in this space`. The `propose` purpose string shall be `Suggest new or changed documents for your review; cannot publish anything`. If the requested `scope` contains any other value, including `merge`, the system shall return `invalid_scope`, shall not show consent, and shall store no grant. Owner, Editor, Contributor, Viewer, a caller with no membership, a signed-out caller, an agent key, a grant, and an OAuth scope shall all receive that refusal. There is no scope named `merge`.
- **F14-REQ-011** When the signed-in user approves one space they belong to and at least one offered scope their role may grant, the system shall store one grant for that user, that client, and that one space, with only the scopes checked, and shall redirect to the exact `redirect_uri` with `code` and the same `state`. The code shall be 32 bytes from a CSPRNG, encoded as base64url with no padding, stored only as the lowercase hex SHA-256 of the UTF-8 code, and valid while the API clock is strictly before the issue time plus 600 seconds (10 minutes). The code shall be single use. The redirect shall not include an access token or a refresh token. Approving shall leave the existing session unchanged and shall create no agent key.
- **F14-REQ-012** The system shall allow a signed-in Owner, Editor, Contributor, or Viewer to approve `read` for a space where that user has a membership. The system shall allow a signed-in Owner, Editor, or Contributor to approve `propose` for a space where that user has a membership. A Viewer who approves `propose` shall be refused with `permission_denied`, message `Viewers can read. They cannot propose.`, hint `Ask an owner for a role that can propose.`, and no grant shall be stored. A caller with no membership in the posted space shall be refused with `permission_denied`, message `You are not a member of that space.`, hint `Pick a space you belong to.`, and no grant shall be stored. A signed-out caller shall be refused with `permission_denied`, message `Sign in to approve this assistant.`, hint `Sign in with GitHub, Google, or an email link.`, and no grant shall be stored. An agent key presented without a session, and a grant presented without a session, shall receive that same sign-in refusal, and no grant shall be stored. A bearer token shall not choose the approving user. A role sent in the form shall be ignored. The membership row is the role. Public read shall not add a space to the picker.
- **F14-REQ-013** If the user denies, or approves with no scope checked, then the system shall store no grant and, when the redirect URI matches, shall redirect with `error` `access_denied` and the same `state`.
- **F14-REQ-014** When `POST /oauth/token` receives `application/x-www-form-urlencoded` with `grant_type` `authorization_code`, the unused code, the same `client_id`, the same `redirect_uri`, and a `code_verifier` of 43 to 128 characters from `A-Za-z0-9-._~` whose base64url SHA-256 without padding equals the stored `code_challenge`, the system shall mark the code used and shall return `access_token`, `token_type` `Bearer`, `expires_in` `3600`, `refresh_token`, and `scope`. `scope` shall be `read`, `propose`, or `read propose`, with `read` before `propose` when both were approved. The token endpoint shall set no session cookie. Any caller who presents that matching code may exchange it. A session is not required.
- **F14-REQ-015** The system shall accept an access token while the API clock is strictly before its issue time plus 3600 seconds (1 hour). The system shall store only the lowercase hex SHA-256 of the UTF-8 access token and shall show the raw token only in the token response. The raw token shall be 32 bytes from a CSPRNG, encoded as base64url with no padding, and shall not start with `lk_`. If the bearer matches an access token of a grant that is not revoked and the clock is at or after that expiry, the system shall return `token_expired` and shall change no document and no proposal. If that grant is revoked, the system shall return the F13 revoked-grant error instead, whether or not the access token has also expired.
- **F14-REQ-016** The system shall accept a refresh token while the API clock is strictly before its issue time plus 720 hours (30 days, 2592000 seconds). When a client posts `grant_type` `refresh_token` with a live refresh token and the same `client_id`, the system shall return a new access token that expires 3600 seconds after that response and a new refresh token that expires 720 hours after that response, and shall reject the presented refresh token on every later call. The previous access token shall stay valid until its own 3600 seconds end. When the grant is revoked, every access token and every refresh token of that grant shall fail on the next use, including a token that still has time left. The token endpoint shall set no session cookie.
- **F14-REQ-017** If a refresh token that was already rotated is presented again, then the system shall revoke that grant, shall make every token of that grant fail, and shall return `invalid_grant`. The call shall issue no new token.
- **F14-REQ-018** If the code was already used, the code is expired, the `code_verifier` does not match, the refresh token is expired, the refresh token's client differs, `grant_type` is not `authorization_code` or `refresh_token`, or the token body is not `application/x-www-form-urlencoded`, then the system shall refuse and shall issue no token. A browser session shall not substitute for a code or a refresh token.
- **F14-REQ-019** The system shall accept a grant's access token as the bearer F13-REQ-006 defines, for that grant's one space, on `/api/mcp` and on `/api/v1`. Tool allowance shall be F13-REQ-010: `read` allows the eight read tools, and `propose` allows all ten. A grant that holds both scopes shall be treated as `propose`. The system shall open no web session from the grant. A route F13 does not list, including a merge path, shall return F13 `route_unknown` and shall not merge, delete, or archive. An OAuth scope, an endpoint, or a tool asked to administer members, keys, or types shall return `permission_denied`, message `Agents cannot merge, delete, or administer.`, hint `Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.`, including when the approving user is Owner or Editor. A delete of a document row shall return F15 `delete_refused`. Owner, Editor, Contributor, Viewer, a caller with no membership, a signed-out caller, an agent key, and a grant shall all receive that delete refusal, and the row shall remain.
- **F14-REQ-020** The system shall limit each grant to 60 admitted requests in each 60-second window, 30 stored proposals in each 3600-second window, and 20 open proposals, using the windows, the open statuses, and the HTTP 429 bodies in F13-REQ-012 and F13-REQ-013. The counter shall be that grant. Two grants shall not share a counter. A grant shall not share a counter with an agent key. MCP and REST for one grant shall share that grant's counters. `GET` of either metadata document, `POST /oauth/register`, `GET` or `POST /oauth/authorize`, and `POST /oauth/token` shall not increment those counters.
- **F14-REQ-021** When the user who approved a grant revokes it, the system shall mark that grant revoked before the response is sent. When an Owner of that grant's space revokes it, the system shall do the same, including when the Owner is not the approving user. The next call with a token of that grant shall receive the F13 revoked-grant error and shall change nothing. An Editor, a Contributor, or a Viewer who did not approve that grant shall be refused with `permission_denied`, message `Only an owner can revoke another person's grant.`, hint `Ask an owner, or revoke a grant you approved.`, and the grant shall stay active. A caller with no membership shall be refused with `permission_denied`, message `You are not a member of that space.`, hint `Ask an owner if this grant should be revoked.`, and the grant shall stay active. A signed-out caller shall be refused with `permission_denied`, message `Sign in to revoke a grant.`, hint `Sign in with GitHub, Google, or an email link.`, and the grant shall stay active. An agent key shall be refused with `permission_denied`, message `An agent key cannot open the web app.`, hint `Sign in with GitHub, Google, or an email link.`, and the grant shall stay active. A grant bearer shall be refused with `permission_denied`, message `A grant cannot open the web app.`, hint `Sign in with GitHub, Google, or an email link.`, and the grant shall stay active. An OAuth scope asked to revoke shall be refused with `permission_denied`, message `Agents cannot merge, delete, or administer.`, hint `A human revokes a grant in Settings → Agents.`, and the grant shall stay active. Revoke is a server action with the session cookie. A bearer token shall not revoke a grant.
- **F14-REQ-022** The system shall list grants in Settings → Agents, in the settings dialog. An Owner of the space shall see every grant in that space. An Editor, a Contributor, and a Viewer shall see only grants they approved. A signed-out caller shall be refused with `permission_denied`, message `Sign in to see assistants.`, hint `Sign in with GitHub, Google, or an email link.`, and shall receive no rows. A caller with no membership shall be refused with `permission_denied`, message `You are not a member of that space.`, hint `Sign in to a space you belong to.`, and shall receive no rows. An agent key shall be refused with `permission_denied`, message `An agent key cannot open the web app.`, hint `Sign in with GitHub, Google, or an email link.`, and shall receive no rows. A grant shall be refused with `permission_denied`, message `A grant cannot open the web app.`, hint `Sign in with GitHub, Google, or an email link.`, and shall receive no rows. Each visible row shall show the label `{client_name} · {user name}`, the space name, the scopes, the last used time, and the proposal count. The label shall join `client_name` and the approving user's name with ` · `. Last used shall be the API clock time of the latest admitted tool or REST call, shown in UTC to the minute, or `Never` when there has been none. The proposal count shall be the number of proposals that grant has stored. A revoked grant shall stay in the list with the word `Revoked`.
- **F14-REQ-023** When a grant stores a proposal, the system shall record that grant's label `{client_name} · {user name}` on the proposal. The review screen that shows the agent glyph and that label is F12.
- **F14-REQ-024** When the user approves, denies, or revokes, the system shall apply F15-REQ-011. If `Origin` is missing or is not the application origin, the system shall return `csrf_rejected` and shall store no grant, shall revoke no grant, and shall change no session. The token endpoint and the registration endpoint are not browser mutations and shall not require `Origin`.
- **F14-REQ-025** The system shall show three OAuth cards in Settings → Connect, titled `Claude`, `ChatGPT`, and `Meta Muse`, to a signed-in Owner, Editor, Contributor, or Viewer. Each card shall show `https://{host}/api/mcp` and the sentence `Paste this URL. Sign in and approve a space. No key to copy.` The Copy control shall copy that URL and shall copy no `lk_` secret. A signed-out caller shall be refused with `permission_denied`, message `Sign in to connect an assistant.`, hint `Sign in with GitHub, Google, or an email link.`, and shall receive no card. A caller with no membership shall be refused with `permission_denied`, message `You are not a member of that space.`, hint `Sign in to a space you belong to.`, and shall receive no card. An agent key shall be refused with the agent-key web refusal in F14-REQ-022. A grant shall be refused with the grant web refusal in F14-REQ-022. Key cards stay F13. A Contributor or a Viewer who can see these cards still cannot create an agent key.

## Acceptance scenarios

### F14-AC-001a

Given OAuth for assistants is not built, when a client requests `GET /.well-known/oauth-protected-resource`, `GET /.well-known/oauth-authorization-server`, `POST /oauth/register`, `GET /oauth/authorize`, and `POST /oauth/token`, then each response is HTTP 404, the code is `oauth_unavailable`, the message is `OAuth is not available yet.`, the hint is `This release has no auth. Assistants connect later.`, and no token is issued.

### F14-AC-001b

Given OAuth for assistants is not built, when the owner opens Settings, then no Agents section is shown and no Claude, ChatGPT, or Meta Muse card is shown, and the person can still edit.

### F14-AC-002a

Given OAuth is built and no session cookie, when a client gets `/.well-known/oauth-protected-resource`, then `resource` is `https://{host}/api/mcp`, `authorization_servers` is `https://{host}`, `scopes_supported` is `read` and `propose`, and `bearer_methods_supported` is `header`.

### F14-AC-002b

Given an agent key and a grant, when each gets `/.well-known/oauth-protected-resource`, then each receives the same document as a signed-out caller.

### F14-AC-003a

Given a signed-out caller, when they get `/.well-known/oauth-authorization-server`, then `code_challenge_methods_supported` is `S256` only, `token_endpoint_auth_methods_supported` is `none` only, `scopes_supported` is `read` and `propose` only, and `registration_endpoint` is `https://{host}/oauth/register`.

### F14-AC-003b

Given a grant bearer, when it gets `/.well-known/oauth-authorization-server`, then the document is the same one a signed-out caller receives.

### F14-AC-004a

Given no `Authorization` header on `POST /api/mcp`, when the response is sent, then the status is 401, the body code is `auth_missing`, and `WWW-Authenticate` is `Bearer realm="markdown-kb", resource_metadata="https://{host}/.well-known/oauth-protected-resource"`.

### F14-AC-005a

Given a signed-out client posting `client_name` `Muse`, one `https` redirect URI, and `token_endpoint_auth_method` `none`, when registration succeeds, then the status is 201, `client_id` is base64url of 32 bytes, and the body has no client secret.

### F14-AC-005b

Given an agent key posting a valid registration, when the response is sent, then a public client is stored and no session cookie is set.

### F14-AC-006a

Given a registration body with `scope` `merge`, when it is posted, then the code is `invalid_client_metadata`, the message is `Scope must be read or propose.`, the hint is `There is no merge scope. Use read, propose, or both.`, and no client is stored.

### F14-AC-006b

Given an Owner posting `token_endpoint_auth_method` `client_secret_basic` and a client secret, when it is posted, then the code is `invalid_client`, the message is `This server registers public clients only.`, the hint is `Send token_endpoint_auth_method none and no client_secret.`, and no client is stored.

### F14-AC-006c

Given `client_name` of 81 code points, when it is posted, then the code is `invalid_client_metadata`, the message is `client_name must be one line of 1 to 80 characters.`, the hint is `Send the assistant's name, from 1 to 80 characters.`, and no client is stored.

### F14-AC-007a

Given redirect URIs `https://claude.example/callback` and `http://127.0.0.1:6274/callback`, when they are registered, then both are stored.

### F14-AC-007b

Given a redirect URI `http://assistant.example/callback`, when it is registered, then the code is `invalid_redirect_uri`, the message is `That redirect URI is not allowed.`, the hint is `Use https, or http on 127.0.0.1 or localhost with a port.`, and no client is stored.

### F14-AC-008a

Given a signed-in Owner and a valid PKCE authorization request for client `Muse`, when the page is shown, then the consent screen is shown and no code is in the URL yet.

### F14-AC-008b

Given a valid authorization request with `prompt` `none`, when it is served, then the consent screen is still shown and no code is issued.

### F14-AC-008c

Given `POST /.well-known/oauth-protected-resource`, when it is served, then the code is `method_not_allowed`, the message is `Use GET.`, the hint is `Read this document with GET.`, and no token is issued. Given `GET /oauth/token`, when it is served, then the message is `Use POST.` and no token is issued.

### F14-AC-009a

Given `code_challenge_method` `plain` and a redirect URI that matches, when the user has not approved, then the redirect's `error` is `invalid_request`, the description is `PKCE method must be S256.`, the hint is `Send code_challenge_method S256. Plain is refused.`, and no code is issued.

### F14-AC-009b

Given an unknown `client_id`, when the authorization endpoint is opened, then the status is 400, the code is `invalid_client`, the message is `That client is not registered.`, the hint is `Register with dynamic client registration, then retry.`, and the browser is not redirected.

### F14-AC-009c

Given `resource` `https://{host}/somewhere-else`, when the request is served, then `error` is `invalid_target`, the description is `The resource must be this MCP server.`, the hint is `Send resource set to the /api/mcp URL from the metadata.`, and no code is issued.

### F14-AC-010a

Given an Owner requesting `scope` `merge`, when the authorization endpoint is opened, then `error` is `invalid_scope`, the description is `Scope must be read or propose.`, the hint is `There is no merge scope. Use read, propose, or both.`, consent is not shown, and no grant is stored.

### F14-AC-010b

Given an Editor, a Contributor, a Viewer, a signed-out caller, a caller with no membership, an agent key, and a grant, when each requests `scope` `merge`, then each receives the same `invalid_scope` refusal as F14-AC-010a and no grant is stored.

### F14-AC-010c

Given a request for `read` and `propose`, when consent is shown, then the screen shows `Read documents, templates and metrics in this space` and `Suggest new or changed documents for your review; cannot publish anything`, and it shows no merge choice.

### F14-AC-011a

Given a signed-in Contributor who belongs to space `Memento` and checks `propose`, when they approve, then one grant exists for that user, that client, and `Memento` only, the redirect contains `code` and the same `state`, and the redirect contains no access token.

### F14-AC-011b

Given a code issued 599 seconds ago, when it is exchanged with the matching verifier, then the token response is returned. Given that same code was already used, when it is presented again, then `error` is `invalid_grant` and no second token pair is issued.

### F14-AC-012a

Given a signed-in Viewer who belongs to the space, when they approve `read`, then the grant's scope is `read`.

### F14-AC-012b

Given a signed-in Viewer, when they approve `propose`, then the code is `permission_denied`, the message is `Viewers can read. They cannot propose.`, the hint is `Ask an owner for a role that can propose.`, and no grant is stored.

### F14-AC-012c

Given a signed-in Editor who belongs to another space only, when they post the first space, then the code is `permission_denied`, the message is `You are not a member of that space.`, the hint is `Pick a space you belong to.`, and no grant is stored.

### F14-AC-012d

Given no session, when the consent form is posted, then the code is `permission_denied`, the message is `Sign in to approve this assistant.`, the hint is `Sign in with GitHub, Google, or an email link.`, and no grant is stored.

### F14-AC-012e

Given a grant bearer and no session, when it requests `/oauth/authorize`, then the message is `Sign in to approve this assistant.`, the hint is `Sign in with GitHub, Google, or an email link.`, no grant is stored, and the bearer does not become the approving user.

### F14-AC-013a

Given a signed-in Owner on the consent screen, when they choose Deny, then the redirect `error` is `access_denied`, the description is `The request was denied.`, the hint is `Approve a space and at least one scope to connect.`, and no grant is stored.

### F14-AC-013b

Given a signed-in Contributor who checks no scope, when they choose Approve, then no grant is stored and the redirect `error` is `access_denied`.

### F14-AC-014a

Given a live code and a matching `code_verifier`, when the client posts `grant_type` `authorization_code`, then `expires_in` is `3600`, `token_type` is `Bearer`, `scope` is the approved scopes, and the response sets no session cookie.

### F14-AC-014b

Given a used code, when a second exchange is posted, then `error` is `invalid_grant`, the description is `That code was already used.`, the hint is `Start authorization again.`, and no token is issued.

### F14-AC-015a

Given an access token issued 3599 seconds ago, when it calls `get_context`, then the call is authenticated. Given that token at 3600 seconds and a grant that is not revoked, when it calls again, then the code is `token_expired`, the message is `That access token has expired.`, the hint is `Use the refresh token. Access tokens last 1 hour.`, and no document changes.

### F14-AC-015b

Given a revoked grant whose access token has 10 minutes left, when that token is presented, then the code is `auth_revoked`, the message is `That grant was revoked.`, the hint is `Connect the assistant again. Revoking a grant blocks the next call.`, and `token_expired` is not returned.

### F14-AC-015c

Given a new access token, when it is stored, then the database holds the SHA-256 hex of the token, the raw token does not start with `lk_`, and the raw token is not stored.

### F14-AC-016a

Given a refresh token issued 719 hours ago, when it is used, then the response contains a new access token and a new refresh token, and the presented refresh token fails on the next post.

### F14-AC-016b

Given a refresh token rotated 1 second ago, and the previous access token with 30 minutes left, when that previous access token calls `get_context`, then the call is authenticated.

### F14-AC-016c

Given a grant revoked while its refresh token has 10 days left, when that refresh token is posted, then `error` is `invalid_grant`, the description is `That grant was revoked.`, the hint is `Connect the assistant again. Revoking a grant blocks the next call.`, and no new token is issued.

### F14-AC-017a

Given a refresh token that already issued a replacement, when the old refresh token is posted again, then the grant is revoked, `error` is `invalid_grant`, the description is `That refresh token was already used.`, the hint is `The grant was revoked. Connect the assistant again.`, and a later call with the replacement access token returns `auth_revoked`.

### F14-AC-018a

Given a code whose verifier does not match, when it is exchanged, then `error` is `invalid_grant`, the description is `PKCE verification failed.`, the hint is `Send the code_verifier that matches the code_challenge.`, and no token is issued.

### F14-AC-018b

Given `grant_type` `client_credentials`, when it is posted, then `error` is `unsupported_grant_type`, the description is `Only authorization_code and refresh_token are accepted.`, the hint is `Do not use implicit, password, or client_credentials.`, and no token is issued.

### F14-AC-018c

Given a browser session and no code, when `POST /oauth/token` is called, then no access token is issued.

### F14-AC-019a

Given a grant with scope `read` for space `Memento`, when it calls `propose_change`, then the code is `scope_read`, the message is `This grant can read. It cannot propose.`, the hint is `Approve the propose scope, or use a key with scope propose.`, and no proposal is stored.

### F14-AC-019b

Given a grant with scope `propose`, when it calls `POST /api/v1/proposals/1/merge`, then the code is `route_unknown`, the message is `That operation is not available.`, the hint is `Agents propose changes. They cannot merge, delete, or administer.`, and the proposal is unchanged.

### F14-AC-019c

Given an Owner and an OAuth scope whose call asks to change a member's role, when it runs, then the code is `permission_denied`, the message is `Agents cannot merge, delete, or administer.`, the hint is `Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.`, and the membership stays.

### F14-AC-019e

Given a grant, when it deletes a document row, then the code is `delete_refused`, the message is `Documents are archived, not deleted.`, the hint is `Archive the document. The row and its revisions stay.`, and the row remains.

### F14-AC-019d

Given a grant bearer and no session, when a document URL is opened, then no session cookie is set.

### F14-AC-020a

Given grant A with 60 admitted requests in the last 60 seconds and grant B with none, when grant B calls `get_context`, then grant B's call is admitted and grant A's window still holds 60.

### F14-AC-020b

Given an agent key with 60 admitted requests and a grant with none, when the grant calls `search`, then the grant's call is admitted.

### F14-AC-020c

Given a grant with 20 proposals in `open` or `changes_requested`, when it calls `propose_change` with a valid body, then the code is `open_limit` and the proposal count is unchanged.

### F14-AC-020d

Given a client posting `/oauth/token` while that grant has 60 admitted requests, when the refresh succeeds, then a new access token is issued and the 60-request window is unchanged.

### F14-AC-021a

Given a Contributor who approved a grant, when they revoke it, then the grant is revoked before the response returns and the next tool call returns `auth_revoked`.

### F14-AC-021b

Given an Owner who did not approve a grant, when they revoke it, then the grant is revoked.

### F14-AC-021c

Given an Editor, a Contributor, and a Viewer who did not approve the grant, when each revokes, then each receives `permission_denied`, the message is `Only an owner can revoke another person's grant.`, the hint is `Ask an owner, or revoke a grant you approved.`, and the grant stays active.

### F14-AC-021d

Given a grant bearer and no session, when it posts the revoke action, then the message is `A grant cannot open the web app.`, the hint is `Sign in with GitHub, Google, or an email link.`, the grant stays active, and no session cookie is set.

### F14-AC-021e

Given a signed-out caller, when they revoke, then the message is `Sign in to revoke a grant.` and the grant stays active. Given a caller with no membership, when they revoke, then the message is `You are not a member of that space.` and the grant stays active. Given an agent key, when it revokes, then the message is `An agent key cannot open the web app.` and the grant stays active. Given an OAuth scope asked to revoke, when it runs, then the message is `Agents cannot merge, delete, or administer.` and the grant stays active.

### F14-AC-022a

Given client name `Muse` and user name `Sebastian` with a grant on space `Memento`, when the Owner opens Agents, then the row label is `Muse · Sebastian` and the row shows `Memento`, the scopes, last used, and the proposal count.

### F14-AC-022b

Given an Editor who approved no grants, and another user's grant in the same space, when the Editor opens Agents, then that other grant is not listed.

### F14-AC-022c

Given a signed-out caller, when they open Agents, then the code is `permission_denied`, the message is `Sign in to see assistants.`, the hint is `Sign in with GitHub, Google, or an email link.`, and no rows are returned.

### F14-AC-022d

Given a grant with no admitted call, when its row is shown, then last used is `Never` and the proposal count is `0`.

### F14-AC-023a

Given a grant labeled `Muse · Sebastian`, when `propose_change` stores a proposal, then the proposal record carries the label `Muse · Sebastian`.

### F14-AC-024a

Given a signed-in Owner and an approve post whose `Origin` is `https://evil.example`, when it is served, then the code is `csrf_rejected`, the message is `This request was rejected.`, the hint is `Reload the page and try again.`, and no grant is stored.

### F14-AC-024b

Given a signed-in Owner and a revoke post with no `Origin`, when it is served, then the code is `csrf_rejected` and the grant stays active.

### F14-AC-025a

Given a signed-in Viewer, when they open the Claude card, then the card shows the MCP URL, the copy is `Paste this URL. Sign in and approve a space. No key to copy.`, and Copy places that URL on the clipboard with no `lk_` secret.

### F14-AC-025b

Given a signed-out caller, when they request the three OAuth cards, then the message is `Sign in to connect an assistant.` and no card is returned.

### F14-AC-025c

Given an agent key, when it requests the OAuth cards, then the message is `An agent key cannot open the web app.` and no card is returned. Given a grant, when it requests the OAuth cards, then the message is `A grant cannot open the web app.` and no card is returned.

## Edge cases and errors

Metadata and registration errors are JSON. The token endpoint returns JSON. An authorization error that must not redirect returns JSON with HTTP 400. An authorization error that redirects puts `error`, `error_description`, and `hint` on the query, with the same `state`. In the table, code is `error`, message is `error_description`, and hint is `hint`. Tool-call bodies stay F13.

| Case | Code | HTTP | Message | Hint |
| --- | --- | --- | --- | --- |
| OAuth routes while OAuth is not built | `oauth_unavailable` | 404 | `OAuth is not available yet.` | `This release has no auth. Assistants connect later.` |
| Metadata called with a method other than GET | `method_not_allowed` | 405 | `Use GET.` | `Read this document with GET.` |
| Authorize called with a method other than GET or POST | `method_not_allowed` | 405 | `Use GET or POST.` | `Open the consent page with GET, or submit Approve or Deny with POST.` |
| Registration or token called with a method other than POST | `method_not_allowed` | 405 | `Use POST.` | `Post the form or the JSON body.` |
| `client_name` missing, empty, over 80 code points, or containing CR or LF | `invalid_client_metadata` | 400 | `client_name must be one line of 1 to 80 characters.` | `Send the assistant's name, from 1 to 80 characters.` |
| Client secret, or a token auth method other than `none` | `invalid_client` | 400 on registration, 401 on the token endpoint | `This server registers public clients only.` | `Send token_endpoint_auth_method none and no client_secret.` |
| Grant type or response type outside the allowed pair | `invalid_client_metadata` | 400 | `Only authorization_code, refresh_token, and response type code are accepted.` | `Omit other grant types and response types.` |
| Scope other than `read` or `propose`, including `merge`, on registration | `invalid_client_metadata` | 400 | `Scope must be read or propose.` | `There is no merge scope. Use read, propose, or both.` |
| Redirect URI not allowed, or a count outside 1 to 8 | `invalid_redirect_uri` | 400 | `That redirect URI is not allowed.` | `Use https, or http on 127.0.0.1 or localhost with a port.` |
| Unknown `client_id` | `invalid_client` | 400 on authorize, 401 on token | `That client is not registered.` | `Register with dynamic client registration, then retry.` |
| `redirect_uri` does not exactly match | `invalid_request` | 400, no redirect | `That redirect URI is not registered.` | `Send the exact redirect URI you registered.` |
| `code_challenge` missing or not 43 base64url characters | `invalid_request` | 302 when the redirect URI matches | `PKCE code_challenge is required.` | `Send a 43-character S256 code_challenge.` |
| `code_challenge_method` not `S256` | `invalid_request` | 302 when the redirect URI matches | `PKCE method must be S256.` | `Send code_challenge_method S256. Plain is refused.` |
| `state` missing, empty, over 512 code points, or containing CR or LF | `invalid_request` | 302 when the redirect URI matches | `state is required.` | `Send a state value of 1 to 512 characters and check it on the redirect.` |
| `resource` missing or not `https://{host}/api/mcp` | `invalid_target` | 302 when the redirect URI matches | `The resource must be this MCP server.` | `Send resource set to the /api/mcp URL from the metadata.` |
| `response_type` not `code` | `unsupported_response_type` | 302 when the redirect URI matches | `Only response type code is accepted.` | `Send response_type code. Implicit is refused.` |
| Requested scope outside `read` and `propose` | `invalid_scope` | 302 when the redirect URI matches | `Scope must be read or propose.` | `There is no merge scope. Use read, propose, or both.` |
| User denies, or approves with no scope | `access_denied` | 302 | `The request was denied.` | `Approve a space and at least one scope to connect.` |
| Signed-out approve | `permission_denied` | 401 | `Sign in to approve this assistant.` | `Sign in with GitHub, Google, or an email link.` |
| Viewer approves `propose` | `permission_denied` | 403 | `Viewers can read. They cannot propose.` | `Ask an owner for a role that can propose.` |
| Posted space is not one of the user's memberships | `permission_denied` | 403 | `You are not a member of that space.` | `Pick a space you belong to.` |
| Code already used | `invalid_grant` | 400 | `That code was already used.` | `Start authorization again.` |
| Code at or after 600 seconds | `invalid_grant` | 400 | `That code has expired.` | `Start authorization again. Codes last 600 seconds.` |
| `code_verifier` does not match | `invalid_grant` | 400 | `PKCE verification failed.` | `Send the code_verifier that matches the code_challenge.` |
| Token body is not form-urlencoded | `invalid_request` | 400 | `The token request must be a form.` | `Send application/x-www-form-urlencoded.` |
| `grant_type` outside `authorization_code` and `refresh_token` | `unsupported_grant_type` | 400 | `Only authorization_code and refresh_token are accepted.` | `Do not use implicit, password, or client_credentials.` |
| Refresh token at or after 720 hours | `invalid_grant` | 400 | `That refresh token has expired.` | `Connect the assistant again. Refresh tokens last 30 days.` |
| Refresh token belongs to another client | `invalid_grant` | 400 | `That refresh token belongs to another client.` | `Use the client that approved the grant.` |
| Refresh token already rotated | `invalid_grant` | 400 | `That refresh token was already used.` | `The grant was revoked. Connect the assistant again.` |
| Refresh token of a revoked grant | `invalid_grant` | 400 | `That grant was revoked.` | `Connect the assistant again. Revoking a grant blocks the next call.` |
| Access token at or after 3600 seconds, grant still active | `token_expired` | 401 | `That access token has expired.` | `Use the refresh token. Access tokens last 1 hour.` |
| Revoked grant's access token | `auth_revoked` | 401 | `That grant was revoked.` | `Connect the assistant again. Revoking a grant blocks the next call.` |
| `Origin` missing or wrong on approve, deny, or revoke | `csrf_rejected` | 403 | `This request was rejected.` | `Reload the page and try again.` |
| Editor, Contributor, or Viewer revokes a grant they did not approve | `permission_denied` | 403 | `Only an owner can revoke another person's grant.` | `Ask an owner, or revoke a grant you approved.` |
| Caller with no membership revokes | `permission_denied` | 403 | `You are not a member of that space.` | `Ask an owner if this grant should be revoked.` |
| Signed-out caller revokes | `permission_denied` | 401 | `Sign in to revoke a grant.` | `Sign in with GitHub, Google, or an email link.` |
| Agent key revokes, or opens Agents or the OAuth cards | `permission_denied` | 403 | `An agent key cannot open the web app.` | `Sign in with GitHub, Google, or an email link.` |
| Grant revokes, or opens Agents or the OAuth cards | `permission_denied` | 403 | `A grant cannot open the web app.` | `Sign in with GitHub, Google, or an email link.` |
| OAuth scope revokes a grant | `permission_denied` | 403 | `Agents cannot merge, delete, or administer.` | `A human revokes a grant in Settings → Agents.` |
| Signed-out caller opens Agents | `permission_denied` | 401 | `Sign in to see assistants.` | `Sign in with GitHub, Google, or an email link.` |
| Caller with no membership opens Agents or the OAuth cards | `permission_denied` | 403 | `You are not a member of that space.` | `Sign in to a space you belong to.` |
| Signed-out caller requests the OAuth cards | `permission_denied` | 401 | `Sign in to connect an assistant.` | `Sign in with GitHub, Google, or an email link.` |
| Delete a document row | `delete_refused` | 403 | `Documents are archived, not deleted.` | `Archive the document. The row and its revisions stay.` |
| Endpoint, tool, or OAuth scope asked to merge, delete, archive, or administer | `permission_denied` | 403 | `Agents cannot merge, delete, or administer.` | `Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.` |

An agent key that opens Agents or the OAuth cards receives the same message as a grant. F13 already refuses a key that tries to open a session.

Rate-limit codes `rate_limited`, `proposal_rate`, and `open_limit` stay F13, including `Retry-After`. A read grant that proposes stays F13 `scope_read` with the grant message.

## Limits and budgets

A character is one Unicode code point. The API clock is UTC. Tests may inject it. A token is valid while the clock is strictly before the expiry instant.

| Limit | Value |
| --- | --- |
| Access token lifetime | 3600 seconds (1 hour) from the issue time. At 3600 seconds it is `token_expired` |
| Refresh token lifetime | 720 hours (30 days, 2592000 seconds) from that refresh token's issue time. Rotation starts a new 720-hour token |
| Authorization code lifetime | 600 seconds (10 minutes) from issue, single use |
| Scopes | 2: `read` and `propose`. The merge scope count is 0 |
| Spaces per grant | 1 |
| `client_name` | 1 to 80 code points, no CR and no LF |
| `state` | 1 to 512 code points, no CR and no LF |
| Redirect URIs per client | 1 to 8 |
| `code_verifier` | 43 to 128 characters from `A-Za-z0-9-._~` |
| `code_challenge` | 43 base64url characters, no padding, SHA-256 of the verifier |
| Token entropy | 32 bytes (256 bits) from a CSPRNG for `client_id`, the code, the access token, and the refresh token |
| Requests | 60 admitted requests per grant in each 60-second window `(T − 60 seconds, T]`, not shared with another grant or a key |
| Stored proposals | 30 per grant in each 3600-second window `(T − 3600 seconds, T]` |
| Open proposals | 20 per grant in `open` or `changes_requested` created by that grant |
| Discovery and token calls | 0 increments of the grant's request counter |
| Coarse-pointer targets | At least 44px on `Approve`, `Deny`, `Revoke`, `Cancel`, and `Copy` |
| OAuth response time | No percentile and no latency budget are set |
| Environment, later target | The hosted HTTPS app and Postgres. Not started |
| Environment, current release | The deployed editor. No OAuth server. No session store |

The 3600-second access token, the 720-hour refresh token, and the 600-second code are not started. The current release has no grant to expire.

## UI states

Consent is a page at `/oauth/authorize`. It is not a dialog. Agents is a section in the Settings dialog. The three OAuth cards are a section of Connect in that same dialog. Revoke opens a confirmation dialog because revoke is irreversible. The title is `Revoke this grant?` The body is `This assistant will be refused on the next call.` The buttons are `Revoke` and `Cancel`. Approve does not open a dialog.

Copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower. There is no illustration. Consent is one column at both widths. At 860px the Approve and Deny buttons sit on one row. At 420px they stack, full width. At 860px a grant row is one line. At 420px the row stacks Label, Space, Scopes, Last used, Proposals, and Revoke. Connect cards stack at both widths.

The consent focus order is the space list, Read, Propose, Approve, Deny. A Viewer who was offered only `read` has no Propose control. Agents focus moves through each visible row's Revoke control. Revoked rows have no Revoke control. These screens are not core editor actions. The PRD gives them no shortcut.

While OAuth is not built, the consent page, the Agents section, and the three OAuth cards are absent. The copy below is the later target. It is not on the live editor.

| State | Consent page | Agents section | OAuth cards |
| --- | --- | --- | --- |
| Empty | `You have no space to connect.` Then the hint `Create a space, then approve the assistant.` | `No assistants connected.` An Owner also sees `Paste the MCP URL into Claude or Muse and approve access.` | The three cards, each with the MCP URL |
| Loading | `Loading spaces…` | `Loading assistants…` | `Loading connect cards…` |
| Error | `Consent could not load.` Then the hint `Reload the page.` | `Assistants did not load.` Then the hint `Reload the page.` | `Connect cards did not load.` Then the hint `Reload the page.` |
| Partial | The space list and the purpose strings, with nothing approved yet | A revoked row shows `Revoked`. Other rows stay | The URL is shown and has not been copied |
| Success | `Approved. You can return to {client_name}.` Deny shows `Not approved. {client_name} was not connected.` | No extra sentence. Each row shows the label, the space name, the scopes, last used, and the proposal count | `Copied.` after Copy |

Signed-out consent shows `Sign in to approve this assistant.` and then the F15 sign-in page for that same authorization request. A Viewer who was asked only for `propose` sees `Viewers can read. They cannot propose.` and then `Ask an owner for a role that can propose.` Approve is absent in that case.

The consent title is `Connect {client_name}`. The body is `Pick a space and what {client_name} may do. It cannot publish.` The space label is `Space`. The scope labels are `Read` and `Propose`, each followed by its purpose string. The buttons are `Approve` and `Deny`.

Scope words on a grant row are `Read`, `Propose`, and `Read, Propose`.

## Out of scope

- The ten tools, REST paths, agent-key format, the Agent keys section, and tool error bodies (F13). A grant uses those tools after this spec issues it.
- Human sign-in methods, the session cookie, magic-link lifetime, and membership audit rows (F15). Consent sends a signed-out person through that sign-in.
- Inbox, diff, merge, reject, and the agent glyph on the review screen (F12). This spec stores the label F12 shows.
- Drawing charts (F16).
- A directory listing for Meta Muse. The card only copies the MCP URL.
- An RFC 7009 revocation endpoint. Revoke is the Agents action.
- Client-id metadata documents that use a URL as `client_id`. Registration is the dynamic client registration in F14-REQ-005.
- API-key cards for Cursor, Claude Code, and a generic client (F13).
- Changing a grant's space after approval. A second space is a second grant.
- `design.md` and `tasks.md` for this feature.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F14-Q-001 | F13 lets an Editor manage keys. F15's role table gives manage-keys to the Owner only. Who may revoke a grant they did not approve? | The approving user revokes their own grant. Only an Owner revokes someone else's. | Product owner | A change to F14-REQ-021 if an Editor should revoke any grant in the space |
| F14-Q-002 | Does a refresh extend the grant? | Yes. Each new refresh token lasts 720 hours from its own issue. Use keeps a grant alive. | Product owner | A hard stop 30 days after consent, if the owner wants rotation to stop extending the grant |
| F14-Q-003 | Should approval and revoke write an audit event? | Yes. Use the same audit row as key revocation, with the approving user as the actor. | Product owner | An audit requirement. It does not block the handshake |
| F14-Q-004 | Should dynamic client registration have a rate limit? | No cap in this spec. | Product owner | A registration cap. It does not block F14-REQ-005 |

ADR-0025 is Proposed. This spec follows it. It is not an open question here. ADR-0002 is Accepted: there is no auth yet, and the four roles are the later target. OAuth grants are a later target.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:goals-for-v1 -->` — a phone assistant connects by OAuth and logs an experiment in one tool call.
- `<!-- prd:mcp-and-api -->` — agents connect with a URL and either an API key or an OAuth sign-in.
- `<!-- prd:connecting-assistants -->` — Claude, ChatGPT, and Meta Muse use OAuth. The person pastes the URL, signs in, and approves scopes. Both paths reach the same ten tools.
- `<!-- prd:oauth-for-mcp -->` — OAuth 2.1 with PKCE, protected-resource metadata at `/.well-known/oauth-protected-resource`, authorization-server metadata, dynamic client registration, the two scopes and their purpose strings, the consent screen, one space per grant, a 1-hour access token, a 30-day refresh token that rotates on use and is revoked with the grant, and no merge scope.
- `<!-- prd:limits -->` — 60 requests per minute, 30 proposals per hour, and 20 open proposals. The PRD states those numbers per key.
- `<!-- prd:auth-permissions-and-sharing -->` — humans use sessions. Agents use keys or grants. The two do not mix.
- `<!-- prd:roles -->` — Owner and Editor merge. A Viewer does not propose. An agent still cannot merge.
- `<!-- prd:oauth-grants -->` — Settings → Agents lists each grant by client and user, with space, scopes, last used, and proposal count. Revoke kills tokens immediately. Proposals carry that label.
- `<!-- prd:stack -->` — the app's auth provider also serves OAuth for MCP clients.
- `<!-- prd:acceptance-milestones-1-4 -->` — Claude and Muse connect by pasting the URL, with no key copied by hand. Grants appear in Settings → Agents. Revoke blocks the next call. No OAuth scope or tool merges, edits directly, or deletes.
- `<!-- prd:build-plan -->` — milestone 3 includes OAuth 2.1 for assistants. ADR-0002 moves that milestone out of the current release.

Decisions in `specs/source/decisions-and-changes.md`: D3 (no auth yet), D4 (agents later), D6 (markdown-kb, no space segment), D7 (agents never merge).

Change requests: none of C1 through C9 replace OAuth for assistants.

ADRs: ADR-0001, ADR-0002, ADR-0009, ADR-0025. ADR-0001 keeps the UI name markdown-kb and keeps space out of page URLs. ADR-0002 keeps OAuth out of the current release. ADR-0009 allows the revoke confirmation dialog. ADR-0025 gives each grant the key limits on its own counters. Plan section 2.3 is the gap ADR-0025 closes.

Constitution, principle 3: no endpoint, tool, or OAuth scope can merge, delete, or administer. This spec adds no scope that can.

Glossary: a grant is an OAuth authorization for an assistant, tied to one space and one user. An OAuth scope cannot merge, delete, or administer. An agent key is a different credential. Sign-in is a human session and is not built.

Depends on F13 and F15. F13 admits the bearer this spec issues. F15 is the sign-in the consent screen uses.
