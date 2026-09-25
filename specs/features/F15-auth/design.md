# F15 design: Human sign-in, roles, permissions, and audit

Design for `specs/features/F15-auth/spec.md` (branch `cursor/spec-sign-in-roles-audit-bc2e`).

Sign-in is off unless `LEDGER_AUTH=1`. With the variable unset, the app creates no session, sets no session cookie, requires no `users` row, shows no Sign in control and no Members section, and the person at the keyboard can edit and save. That is the current editor. Local disk edits stay on `lib/store/fs-store.ts` and are not role-checked.

When the flag is on, Better Auth is the only human authenticator. A page link still only picks the starting mode.

## Modules

| Module | Path | Responsibility |
| --- | --- | --- |
| Auth flag | `lib/auth/flag.ts` | `signInEnabled()` is true only when `LEDGER_AUTH=1`. |
| Better Auth | `lib/auth/better-auth.ts` | GitHub, Google, and email magic link. Password is rejected. |
| Auth route | `app/api/auth/[...all]/route.ts` | Better Auth handler. |
| Session | `lib/auth/session.ts` | Database session, cookie flags, rolling 720-hour expiry, sign-out. |
| Callbacks | `lib/auth/callbacks.ts` | OAuth `state` and the single-use magic-link token. |
| Users | `lib/auth/users.ts` | One row per lowercase email. Name rules. |
| Membership | `lib/auth/membership.ts` | One role per user per space. Creating a space inserts `owner`. |
| Invites | `lib/auth/invites.ts` | One unused invite per email per space, 168 hours. |
| Permissions | `lib/auth/permissions.ts` | Server-side gate. A role in the browser payload is ignored. |
| Page link | `lib/auth/page-link.ts` | Can view and Can edit set the editor mode and create nothing. |
| CSRF | `lib/auth/csrf.ts` | Mutation `Origin` must be the application origin. |
| Audit | `lib/auth/audit.ts` | `role_change` and `invite` rows in the same transaction. |
| Sign-in page | `app/sign-in/page.tsx` | GitHub, Google, then email. Not a dialog. |
| Members | `components/settings/members.tsx` | Settings → Members. |
| Share sheet | `components/share-host.tsx` | Existing Can view and Can edit controls. They call `page-link.ts` and no session API. |

`lib/auth/permissions.ts` is what F12 merge, F07 save, and F13 key screens call when the flag is on. The function reads the session row and the `memberships` row on the server.

## Data shapes

`users`, `memberships`, and `audit_events` are already in `specs/contracts/db.sql`.

`users.email` is lowercase. `users.name` is 1 to 120 code points, CR and LF removed, trimmed. A missing provider name uses the email local part, cut to 120 characters. An empty local part uses `Member`.

`memberships.role` is `owner`, `editor`, `contributor`, or `viewer`. Primary key is `(space_id, user_id)`.

This feature adds the session store Better Auth needs, and invites. The session token is 32 bytes from a CSPRNG. The cookie is `httpOnly`, `Secure`, and `SameSite=Lax`. Page scripts cannot read it. There is no cookie cache: each authenticated request reads the session row and sets `expires_at` to 720 hours after that request.

`invites`

| Column | Rule |
| --- | --- |
| `space_id` | |
| `email` | Lowercase, 1 to 254 characters, one line. |
| `role` | One of the four stored roles. |
| `created_at` | |
| `expires_at` | `created_at` plus 168 hours. |
| `revoked_at` | Set when a newer unused invite for the same email and space is stored, or when an Owner revokes. |
| `used_at` | Set on the first successful accept. A second accept changes nothing. |
| `created_by` | The Owner's `users.id`. |

A partial unique index allows one row per `(space_id, email)` where `revoked_at` and `used_at` are both null.

Audit `data` for a membership change is `{ from, to }`. `from` is null when the accept inserts the first membership. Audit `data` for an invite is `{ email, role, created: true }` or `{ email, role, revoked: true }`. `actor_user_id` is the session user. `agent_key_id` is null. The existing `audit_events_immutable` trigger returns `audit_immutable` on update or delete.

```ts
type Role = "owner" | "editor" | "contributor" | "viewer";

type Caller =
  | { kind: "signed-out" }
  | { kind: "session"; userId: number; role: Role | null }
  | { kind: "key" }
  | { kind: "grant" }
  | { kind: "tool" };
```

`role: null` is a session with no membership in the space. An agent key and a grant are not sessions and do not receive a session cookie.

Permission responses are the table in the spec: one code, one message, and one hint per action and caller. `lib/auth/permissions.ts` returns that triple and writes nothing.

| Action | Allowed |
| --- | --- |
| Read documents | Any of the four roles. No membership is refused when `spaces.public_read` is false. A page link does not satisfy the check. |
| Propose | Owner, Editor, Contributor. `agent_key_id` stays null on a human proposal. |
| Edit directly | Owner, Editor, through a human session server action. Save, restore, view-mode task tick, and archive. |
| Merge | Owner, Editor, server action with the session cookie. |
| Manage members | Owner. |
| Manage keys and types | Owner, in this module. |
| Delete a document row | No caller. Code `delete_refused`. |
| Read audit | Owner. Newest `created_at` first. |

F13-REQ-008 lets an Editor create a key. This module's manage-keys check is Owner only, which is F15-REQ-026 and F15-Q-001. The two functions stay separate until the product owner picks one. F15 tests call `lib/auth/permissions.ts`. F13 tests call `lib/agent/keys.ts`.

An endpoint, a tool, or an OAuth scope cannot merge, delete, administer, or edit directly, including when the human behind it is Owner or Editor. Delete of a document row is `delete_refused` for every caller. The editor stdio `delete_file` in `lib/mcp/tools.ts` removes a file on disk in the current release. It is not the Ledger document-row delete this gate refuses.

A membership change that would leave zero owners returns `last_owner` and writes nothing.

## State

Sign-in page states, at 860px and at 420px: empty actions `Continue with GitHub`, `Continue with Google`, and `Email me a sign-in link`; loading `Signing in…` or `Sending link…`; partial `Check your email for a sign-in link. It expires in 5 minutes.`; success `Signed in.`; expired cookie with a missing or past row shows `Your session has expired.` then `Sign in again.` A request with no cookie uses the signed-out sentence for the action, not `session_expired`.

Members section: an Owner sees the invite form and pending invites. Editor, Contributor, and Viewer see name, email, and role, and no invite form. Success copy is `Invite sent. It expires in 7 days.`, `Role updated.`, and `Member removed.`

The share sheet's Can view opens viewing. Can edit opens editing. Neither creates a session, a membership, or a role, and neither grants a save. If read is refused, the document body is not shown.

GitHub and Google callbacks are excluded from the mutation origin check. They require the `state` stored at the start of that sign-in. A magic-link callback requires the unexpired single-use token. A mismatch creates no session.

Secrets `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_SECRET`, and `GOOGLE_CLIENT_SECRET` are read from the environment. The client bundle does not contain them.

## Contracts

- `specs/contracts/db.sql` — `users`, `memberships`, `audit_events`, `spaces.public_read`, and `audit_events_immutable`. This feature adds `invites` and the Better Auth session tables.
- F07 `assert_writer` — the edit-directly sentences in F15-REQ-023 match F07-REQ-029.
- F11 — public read, off by default. That path still hides proposals, keys, members, and audit events.
- F12 `lib/review/permissions.ts` — calls this gate for human review when the flag is on.
- F13 and F14 — key and grant credentials. This feature does not open the web app for either.
- `components/share-host.tsx` — the built Can view and Can edit controls.

## Boundaries

Agent key format and the Agent keys screen are F13. OAuth handshake is F14. Proposal rows are F12. The merge audit action `merge` is inserted by F07. This feature writes `role_change` and `invite` only.
