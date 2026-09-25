# F15: Human sign-in, roles, permissions, and audit

## Summary

Human sign-in attaches a person to a space through a session and one of four roles. Edit rights come from that role. A page link only chooses the starting mode.

## Status and scope

Not started. The live product has no human sign-in, no sessions, and no roles. The person at the keyboard can edit. ADR-0002 stands until the product owner says otherwise: no auth in the current release; the four roles are the later target.

This spec is that later target: Better Auth, database sessions, the four roles, the permission checks, invites that grant a role, and the audit rows for those membership changes. It also states the current release, so a later sign-in does not turn today's page link into a credential.

Agent keys are F13. OAuth grants for assistants are F14. The share sheet and the public read link are F11. Document writes, the merge transaction, and the `merge` audit row are F07. Proposal lifecycle is F12. This spec checks the human session and the role before those features run. Agents are not specified here. Human sessions are.

The product name in the UI is markdown-kb. A page is `/{project}/{page-path}`. A project is not a space. Membership belongs to a space.

## Users and stories

- **F15-US-001** As the owner, I want the current release to keep working without sign-in, so that the person at the keyboard can still edit.
- **F15-US-002** As the owner, I want to sign in with GitHub, Google, or an email link, so that a later role belongs to a person.
- **F15-US-003** As the owner, I want four roles in a space, so that an editor saves, a contributor proposes, and a viewer reads.
- **F15-US-004** As the owner, I want a page link to set only the starting mode, so that edit rights come from a role granted by an invite.
- **F15-US-005** As the owner, I want membership changes written to the audit log, so that role history is a record.

## Requirements

Role names on screen are Owner, Editor, Contributor, and Viewer. Stored values are `owner`, `editor`, `contributor`, and `viewer`, matching `memberships_role` in `specs/contracts/db.sql`.

| Action | Owner | Editor | Contributor | Viewer | No membership | Agent key or grant | Endpoint, tool, or OAuth scope |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Read documents | Yes | Yes | Yes | Yes | No, unless F11 public read is on | No web app. MCP read is F13 | MCP read is F13 |
| Propose | Yes | Yes | Yes | No | No | No web app. Propose is F13 | Propose on MCP is F13 |
| Edit directly | Yes | Yes | No | No | No | No | No |
| Merge | Yes | Yes | No | No | No | No | No |
| Manage members | Yes | No | No | No | No | No | No |
| Manage keys and types | Yes | No | No | No | No | No | No |
| Delete a document | No | No | No | No | No | No | No |

Edit directly means a human save, a restore, a view-mode task tick, and an archive. Delete means removing a document row. Archive is the edit-directly action in F07. Manage members means invite, change a role, revoke an invite, and remove a member. Manage keys and types is the permission only; the key screens are F13 and the type screens are F02.

- **F15-REQ-001** While sign-in is not built, the system shall create no session, shall set no session cookie, and shall require no `users` row.
- **F15-REQ-002** While sign-in is not built, the system shall let the person at the keyboard edit and save with no role check.
- **F15-REQ-003** While sign-in is not built, the system shall show no Sign in control and no Members section.
- **F15-REQ-004** The system shall treat Can view and Can edit on a page link as a starting mode for a caller who is allowed to read the document. Can view shall open viewing. Can edit shall open editing. The link shall create no session, no membership, and no role, and it shall grant no permission to save. If read is refused, the system shall not show the document body.
- **F15-REQ-005** When sign-in is built, the system shall authenticate a human only with Better Auth, through GitHub OAuth, Google OAuth, or one email magic link, and shall reject a password.
- **F15-REQ-006** When a magic link is sent, the system shall accept that link for one sign-in within 300 seconds (5 minutes) of the send, and shall return the same response whether or not a `users` row already exists for that email.
- **F15-REQ-007** When sign-in succeeds, the system shall insert one database session and shall set one session cookie with `httpOnly`, `Secure`, and `SameSite=Lax`. The cookie value shall be 32 bytes (256 bits) from a CSPRNG. Page scripts shall have no access to the cookie.
- **F15-REQ-008** When a request presents a session row that has not expired, the system shall set that row's expiry to 720 hours (30 days) after the request time. The database row shall be read on that request. A cookie cache shall not authorize the request.
- **F15-REQ-009** If the session cookie is absent, the session row is absent, or the expiry is in the past, then the system shall treat the caller as signed out and shall apply no role.
- **F15-REQ-010** When the signed-in user signs out, the system shall delete that session row and clear the session cookie before the response is sent.
- **F15-REQ-011** When sign-in is built, if a mutation's `Origin` header is missing or is not the application origin, then the system shall return `csrf_rejected` and shall change no session, membership, document, or role. The GitHub callback, the Google callback, and the magic-link callback are excluded; F15-REQ-012 covers them.
- **F15-REQ-012** When a GitHub or Google callback arrives, the system shall require the state value stored at the start of that sign-in. A magic-link callback shall require the unexpired single-use token from F15-REQ-006. If the state or token does not match, then the system shall create no session.
- **F15-REQ-013** When sign-in is built, the system shall decide every mutation from the database session and the `memberships` row on the server. A role sent by the browser shall be ignored.
- **F15-REQ-014** When a human completes sign-in for an email with no `users` row, the system shall insert one row with that email in lowercase and a name of 1 to 120 characters. The name shall be the provider name with CR and LF removed, trimmed, and cut to 120 characters. A missing or empty result shall use the email's local part, cut to 120 characters. An empty local part shall use `Member`.
- **F15-REQ-015** The system shall keep one `users` row per lowercase email. A second provider that returns the same email shall use the existing row and shall insert no second user.
- **F15-REQ-016** The system shall store at most one membership per user per space. The role shall be `owner`, `editor`, `contributor`, or `viewer`.
- **F15-REQ-017** When a signed-in user creates a space, the system shall insert a membership with role `owner` for that user in the same transaction as the space.
- **F15-REQ-018** When an Owner invites one email with one of the four roles, the system shall store one invite for that lowercase email and space that expires 168 hours (7 days) after it is created, and shall revoke any older unused invite for that pair. If the email is empty, longer than 254 characters, or not one line, then the system shall return `email_invalid` and shall store no invite. An Editor, a Contributor, a Viewer, a caller with no membership, an agent key, and a grant shall be refused, and no invite shall be stored.
- **F15-REQ-019** When the person signs in with the invited email and accepts before the expiry, the system shall set that user's membership in that space to the invited role. A second accept of the same invite shall change nothing. F15-REQ-032 still refuses an accept that would leave the space with zero owners.
- **F15-REQ-020** If an invite is past 168 hours, already used, revoked, or the signed-in email differs, then the system shall refuse it and shall insert or change no membership.
- **F15-REQ-021** When sign-in is built, the system shall allow read of a space's documents to a member of any of the four roles. A caller with no membership shall be refused when `spaces.public_read` is false. A page link shall not satisfy this check. Public read, off by default, is F11, and that path still hides proposals, keys, members, and audit events.
- **F15-REQ-022** When sign-in is built, the system shall allow a human proposal to Owner, Editor, and Contributor. A Viewer, a caller with no membership, and a signed-out caller shall be refused. The proposal row is F12. This check is the role gate. The human session shall leave `agent_key_id` null.
- **F15-REQ-023** When sign-in is built, the system shall allow a human save, a restore, a view-mode task tick, and an archive only to Owner and Editor. A Contributor, a Viewer, a caller with no membership, a signed-out caller, an agent key, and a grant shall be refused, and no revision shall be inserted. A caller with no membership receives the Viewer refusal. These are the same codes and sentences as F07-REQ-029 and `assert_writer`.
- **F15-REQ-024** When sign-in is built, the system shall allow merge only to Owner and Editor, and only as a server action that has the session cookie. A Contributor, a Viewer, a caller with no membership, a signed-out caller, an agent key, and a grant shall be refused, and the merge transaction shall not start.
- **F15-REQ-025** When sign-in is built, the system shall allow invite, role change, invite revoke, and member removal only to Owner, as a server action that has the session cookie. An Editor, a Contributor, a Viewer, a caller with no membership, a signed-out caller, an agent key, and a grant shall be refused, and no membership or invite shall change.
- **F15-REQ-026** When sign-in is built, the system shall allow managing keys and managing types only to Owner, as a server action that has the session cookie. An Editor, a Contributor, a Viewer, a caller with no membership, a signed-out caller, an agent key, and a grant shall be refused. Key records are F13. Type schemas are F02.
- **F15-REQ-027** The system shall allow no role and no credential to delete a document. Owner, Editor, Contributor, Viewer, a caller with no membership, a signed-out caller, an agent key, and a grant shall all be refused. The document row shall remain. Archive stays the removal in F07.
- **F15-REQ-028** If the caller is an endpoint, a tool, or an OAuth scope, then the system shall not merge, delete, or administer, including when the caller is Owner or Editor. The system shall return `permission_denied` and shall not change the document, the membership, or the keys.
- **F15-REQ-029** If the caller is an endpoint, a tool, or an OAuth scope, then the system shall not edit directly. The system shall return `permission_denied` and shall insert no revision. Owner and Editor edit directly only through a human session server action.
- **F15-REQ-030** The system shall not open the web app for an agent key or a grant, and shall not set a session cookie for either credential.
- **F15-REQ-031** When a human session creates a proposal, the system shall set `author_user_id` from that session and shall leave `agent_key_id` null.
- **F15-REQ-032** If a membership change would leave a space with zero owners, then the system shall refuse it and shall leave every membership in that space unchanged.
- **F15-REQ-033** When a membership is inserted, a role is changed, or a member is removed, the system shall insert one `audit_events` row in that same transaction, with action `role_change`, `actor_user_id` set to the session user, `agent_key_id` null, and `data` holding `from` and `to`.
- **F15-REQ-034** When an invite is stored or revoked, the system shall insert one `audit_events` row in that same transaction, with action `invite`, `actor_user_id` set to the Owner, `agent_key_id` null, and `data` holding the email, the role, and either `created` or `revoked`.
- **F15-REQ-035** If a caller updates or deletes an `audit_events` row, then the system shall return `audit_immutable` and shall leave the row unchanged.
- **F15-REQ-036** When an Owner reads audit events for a space, the system shall return those rows newest first. An Editor, a Contributor, a Viewer, a caller with no membership, a signed-out caller, an agent key, and a grant shall be refused and shall receive no rows.
- **F15-REQ-037** The system shall read the Better Auth secret and the GitHub and Google client secrets from environment variables, and shall ship none of those values in client code.

### Permission responses

Each refusal uses one code, one message, and one hint. Allowed roles are in the requirement above. Everyone else receives the row for their credential.

| Action and caller | Code | Message | Hint |
| --- | --- | --- | --- |
| Read, no membership, `public_read` false | `permission_denied` | `You do not have permission to read this space.` | `Sign in, or ask an owner for an invite.` |
| Propose, Viewer | `permission_denied` | `Viewers can read. They cannot propose.` | `Ask an owner for a role that can propose.` |
| Propose, signed out | `permission_denied` | `You do not have permission to propose.` | `Sign in as an owner, an editor, or a contributor.` |
| Propose, no membership | `permission_denied` | `You are not a member of this space.` | `Ask an owner for an invite.` |
| Edit directly, signed out | `permission_denied` | `You do not have permission to change this document.` | `Sign in as an owner or an editor.` |
| Edit directly, Contributor | `permission_denied` | `Contributors propose changes. They do not save directly.` | `Submit a proposal instead of saving.` |
| Edit directly, Viewer or no membership | `permission_denied` | `You do not have permission to change this document.` | `Ask an owner for a role that can edit.` |
| Edit directly, agent key or grant | `permission_denied` | `Agents propose changes. They do not save directly.` | `Call propose_change. Agents cannot merge, delete, or administer.` |
| Merge, Contributor | `permission_denied` | `Contributors cannot merge.` | `Ask an owner or an editor to merge.` |
| Merge, Viewer | `permission_denied` | `Viewers cannot merge.` | `Ask an owner or an editor to merge.` |
| Merge, signed out | `permission_denied` | `You do not have permission to merge.` | `Sign in as an owner or an editor.` |
| Merge, no membership | `permission_denied` | `You are not a member of this space.` | `Ask an owner for an invite.` |
| Merge, agent key or grant | `permission_denied` | `Agents cannot merge, delete, or administer.` | `A human owner or editor merges in the web app.` |
| Manage members, Editor, Contributor, or Viewer | `permission_denied` | `Only an owner can manage members.` | `Ask an owner to invite or change roles.` |
| Manage members, signed out or no membership | `permission_denied` | `You are not a member of this space.` | `Ask an owner for an invite.` |
| Manage members, agent key or grant | `permission_denied` | `Agents cannot merge, delete, or administer.` | `A human owner manages members in the web app.` |
| Manage keys or types, Editor, Contributor, or Viewer | `permission_denied` | `Only an owner can manage keys and types.` | `Ask an owner to change keys or types.` |
| Manage keys or types, signed out or no membership | `permission_denied` | `You are not a member of this space.` | `Ask an owner for an invite.` |
| Manage keys or types, agent key or grant | `permission_denied` | `Agents cannot merge, delete, or administer.` | `A human owner manages keys and types in the web app.` |
| Delete, any role or credential | `delete_refused` | `Documents are archived, not deleted.` | `Archive the document. The row and its revisions stay.` |
| Endpoint, tool, or OAuth scope merges, deletes, or administers | `permission_denied` | `Agents cannot merge, delete, or administer.` | `Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.` |
| Endpoint, tool, or OAuth scope edits directly | `permission_denied` | `You do not have permission to change this document.` | `Edit directly is a human session action for an owner or an editor.` |
| Read audit, anyone except Owner | `permission_denied` | `Only an owner can read the audit log.` | `Ask an owner if you need a membership record.` |

## Acceptance scenarios

### F15-AC-001a

Given sign-in is not built, when a page is opened, then no session row is created, no session cookie is set, and no `users` row is required.

### F15-AC-002a

Given sign-in is not built, when the person at the keyboard turns on editing and saves, then the save is not refused for lack of a role.

### F15-AC-003a

Given sign-in is not built, when the shell is shown at 860px or wider and at 420px or narrower, then there is no Sign in control and no Members section.

### F15-AC-004a

Given a page link set to Can edit, when the page is opened, then it starts in editing, and no session, membership, or role is created.

### F15-AC-004b

Given a page link set to Can view, when the page is opened, then it starts in viewing, and no session, membership, or role is created.

### F15-AC-004c

Given sign-in is built, a Viewer membership, and a page link set to Can edit, when that Viewer saves, then the code is `permission_denied`, the message is `You do not have permission to change this document.`, the hint is `Ask an owner for a role that can edit.`, and no revision is inserted.

### F15-AC-004d

Given sign-in is built, no membership, `public_read` false, and a page link set to Can edit, when the page is opened, then the code is `permission_denied`, the document body is not shown, and no membership is created.

### F15-AC-005a

Given sign-in is built, when the sign-in page is shown, then the actions are GitHub, Google, and an email magic link, and there is no password field.

### F15-AC-005b

Given a request that submits a password, when it is served, then the code is `password_disabled`, the message is `Password sign-in is not available.`, the hint is `Use GitHub, Google, or an email sign-in link.`, and no session is created.

### F15-AC-006a

Given a magic link sent at time T, when it is opened once at T plus 299 seconds with that email, then one session is created.

### F15-AC-006b

Given a magic link already used once, when it is opened again, then the code is `magic_link_invalid`, the message is `This sign-in link is no longer valid.`, the hint is `Request a new sign-in link.`, and no second session is created.

### F15-AC-006c

Given a magic link sent at time T, when it is opened at T plus 301 seconds, then the code is `magic_link_invalid` and no session is created.

### F15-AC-006d

Given an email with no `users` row and an email that already has one, when a magic link is requested for each, then both responses are `Check your email for a sign-in link. It expires in 5 minutes.`

### F15-AC-007a

Given a successful GitHub sign-in on an HTTPS origin, when the response is stored, then one session row exists and the session cookie is `httpOnly`, `Secure`, and `SameSite=Lax`, and script on the page cannot read the cookie value.

### F15-AC-007b

Given a new session, when the cookie value is decoded, then it is 32 bytes.

### F15-AC-008a

Given a session that expires in 1 hour, when an authenticated request arrives, then the stored expiry is 720 hours after that request, and the check read the session row.

### F15-AC-008b

Given a session row deleted on the server and a cookie cache still in the browser, when the next request arrives, then the caller is signed out.

### F15-AC-009a

Given a session whose expiry is 1 second in the past, when a page is requested, then the caller is signed out, no role is applied, and the sign-in page shows `Your session has expired.`

### F15-AC-009b

Given no session cookie, when a mutation is requested, then the caller is signed out and the mutation does not run.

### F15-AC-010a

Given a signed-in user, when they sign out, then that session row is gone and the session cookie is cleared before the response is sent.

### F15-AC-011a

Given a signed-in Owner and a mutation whose `Origin` is `https://evil.example`, when it is served, then the code is `csrf_rejected`, the message is `This request was rejected.`, the hint is `Reload the page and try again.`, and no membership or document changes.

### F15-AC-011b

Given a signed-in Owner and a mutation with no `Origin` header, when it is served, then the code is `csrf_rejected` and no membership changes.

### F15-AC-012a

Given a GitHub callback whose state does not match the value stored at the start of sign-in, when it is served, then the code is `oauth_state`, the message is `Sign-in could not be confirmed.`, the hint is `Start sign-in again from the sign-in page.`, and no session is created.

### F15-AC-012b

Given a magic-link callback with an unknown token, when it is served, then the code is `magic_link_invalid` and no session is created.

### F15-AC-013a

Given a Viewer session and a browser payload that claims `owner`, when that caller saves, then the server reads `viewer` from `memberships` and the save is refused with the Viewer edit message.

### F15-AC-014a

Given a first Google sign-in for `Owner@Example.com` with no display name, when the user row is read, then `email` is `owner@example.com` and `name` is `owner`.

### F15-AC-014b

Given a provider name of 121 characters and no line break, when the user row is written, then `name` is the first 120 characters of that name and the row is inserted.

### F15-AC-015a

Given a user row for `ada@example.com` from GitHub, when Google returns `Ada@Example.com`, then the same `users.id` is used and no second row is inserted.

### F15-AC-016a

Given a user who is already a Viewer in a space, when a second membership row is inserted for that pair, then the code is `membership_exists`, the message is `This person already has a role in the space.`, the hint is `Change the existing role.`, and the second row is not committed.

### F15-AC-016b

Given a role value `admin`, when a membership is written, then the code is `role_invalid`, the message is `The role must be owner, editor, contributor, or viewer.`, the hint is `Choose Owner, Editor, Contributor, or Viewer.`, and no membership is written.

### F15-AC-017a

Given a signed-in user with no memberships, when they create a space, then that space has one membership and its role is `owner` for that user.

### F15-AC-018a

Given an Owner and a new invite for `Ada@Example.com` as Editor, when it is stored, then the email is `ada@example.com`, its expiry is 168 hours after `created_at`, and any older unused invite for that email and space is revoked.

### F15-AC-018d

Given an Owner and an email of 255 characters, when they invite, then the code is `email_invalid`, the message is `Enter one email address of at most 254 characters.`, the hint is `Use the address the invite should reach.`, and no invite is stored.

### F15-AC-018b

Given an Editor session, when they invite `ada@example.com` as Contributor, then the code is `permission_denied`, the message is `Only an owner can manage members.`, the hint is `Ask an owner to invite or change roles.`, and no invite is stored.

### F15-AC-018c

Given a Contributor, a Viewer, a signed-out caller, a caller with no membership, an agent key, and a grant, when each invites, then each receives the manage-members refusal for that credential and no invite is stored.

### F15-AC-019a

Given an unused Editor invite for `ada@example.com` with 1 hour left, when Ada signs in with that email and accepts, then her membership role is `editor` and a second accept does not insert another membership.

### F15-AC-020a

Given an invite created 169 hours ago, when the invited email accepts, then the code is `invite_expired`, the message is `This invite has expired.`, the hint is `Ask an owner to send a new invite.`, and no membership is inserted.

### F15-AC-020b

Given an invite for `ada@example.com`, when `bob@example.com` accepts it, then the code is `invite_email`, the message is `This invite was sent to a different email.`, the hint is `Sign in with the invited email.`, and no membership is inserted.

### F15-AC-020c

Given a revoked invite, when the invited email accepts, then the code is `invite_revoked`, the message is `This invite was revoked.`, the hint is `Ask an owner to send a new invite.`, and no membership changes.

### F15-AC-021a

Given a Viewer membership and `public_read` false, when that Viewer opens a document, then the document is returned.

### F15-AC-021b

Given no membership and `public_read` false, when the caller reads a document, then the code is `permission_denied`, the message is `You do not have permission to read this space.`, the hint is `Sign in, or ask an owner for an invite.`, and the body is not returned.

### F15-AC-021c

Given `public_read` true and no membership, when the caller reads the member list or the audit events, then the code is `permission_denied` and no member rows and no audit rows are returned.

### F15-AC-022a

Given a Contributor session, when they propose, then the role gate allows the proposal and `agent_key_id` is null.

### F15-AC-022b

Given a Viewer session, when they propose, then the code is `permission_denied`, the message is `Viewers can read. They cannot propose.`, the hint is `Ask an owner for a role that can propose.`, and no proposal is inserted.

### F15-AC-022c

Given a signed-out caller, when they propose, then the message is `You do not have permission to propose.` and the hint is `Sign in as an owner, an editor, or a contributor.`

### F15-AC-022d

Given a session with no membership in the space, when they propose, then the message is `You are not a member of this space.` and the hint is `Ask an owner for an invite.`

### F15-AC-023a

Given an Editor session and a valid document, when they save, then the role gate allows the save.

### F15-AC-023b

Given a Contributor session, when they save, then the code is `permission_denied`, the message is `Contributors propose changes. They do not save directly.`, the hint is `Submit a proposal instead of saving.`, and no revision is inserted.

### F15-AC-023c

Given a Viewer session, when they archive, then the message is `You do not have permission to change this document.`, the hint is `Ask an owner for a role that can edit.`, and `archived_at` is unchanged.

### F15-AC-023d

Given a signed-out caller, when they save, then the hint is `Sign in as an owner or an editor.` and no revision is inserted.

### F15-AC-023e

Given an agent key, when it saves, then the message is `Agents propose changes. They do not save directly.`, the hint is `Call propose_change. Agents cannot merge, delete, or administer.`, and no revision is inserted.

### F15-AC-023f

Given a grant, when it ticks a task, then the same agent refusal as F15-AC-023e is returned and no revision is inserted.

### F15-AC-023g

Given a signed-in user with no membership, when they restore, then they receive the Viewer edit refusal and no revision is inserted.

### F15-AC-024a

Given an Owner session cookie, when they merge through the server action, then the role gate allows the merge transaction to start.

### F15-AC-024b

Given a Contributor session, when they merge, then the message is `Contributors cannot merge.`, the hint is `Ask an owner or an editor to merge.`, and the merge transaction does not start.

### F15-AC-024c

Given a Viewer session, when they merge, then the message is `Viewers cannot merge.` and the hint is `Ask an owner or an editor to merge.`

### F15-AC-024d

Given an agent key, when it merges, then the message is `Agents cannot merge, delete, or administer.`, the hint is `A human owner or editor merges in the web app.`, and no revision is inserted.

### F15-AC-025a

Given an Owner, when they change a Contributor to Viewer, then that membership role is `viewer` and no other membership in the space changes.

### F15-AC-025b

Given an Editor, when they remove a member, then the message is `Only an owner can manage members.` and the membership remains.

### F15-AC-025c

Given an agent key, when it changes a role, then the message is `Agents cannot merge, delete, or administer.` and the hint is `A human owner manages members in the web app.`

### F15-AC-026a

Given an Owner session cookie, when they open key management, then the role gate allows the F13 action to run.

### F15-AC-026b

Given an Editor, when they create a key or edit a type, then the message is `Only an owner can manage keys and types.`, the hint is `Ask an owner to change keys or types.`, and no key or type changes.

### F15-AC-026c

Given a grant, when it administers types, then the message is `Agents cannot merge, delete, or administer.` and the hint is `A human owner manages keys and types in the web app.`

### F15-AC-027a

Given an Owner and a stored document, when they delete the document row, then the code is `delete_refused`, the message is `Documents are archived, not deleted.`, the hint is `Archive the document. The row and its revisions stay.`, and the row remains.

### F15-AC-027b

Given a Viewer, a Contributor, an Editor, an agent key, and a grant, when each deletes a document, then each receives `delete_refused` and the row remains.

### F15-AC-028a

Given an Owner and `POST /api/v1` asked to merge, when it is served, then the code is `permission_denied`, the message is `Agents cannot merge, delete, or administer.`, the hint is `Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.`, and no revision is inserted.

### F15-AC-028b

Given a tool whose arguments ask to delete a document, when it runs, then the same refusal as F15-AC-028a is returned and the document remains.

### F15-AC-028c

Given an OAuth scope whose call asks to change a member's role, when it runs, then the same refusal as F15-AC-028a is returned and the membership remains.

### F15-AC-029a

Given an Editor and a REST route asked to save, when it is served, then the message is `You do not have permission to change this document.`, the hint is `Edit directly is a human session action for an owner or an editor.`, and no revision is inserted.

### F15-AC-029b

Given an OAuth scope asked to archive, when it runs, then no revision is inserted and `archived_at` is unchanged.

### F15-AC-030a

Given a valid agent key, when it requests the web app, then the code is `permission_denied`, the message is `An agent key cannot open the web app.`, the hint is `Sign in with GitHub, Google, or an email link.`, and no session cookie is set.

### F15-AC-030b

Given a grant, when it requests the web app, then the message is `A grant cannot open the web app.`, the hint is `Sign in with GitHub, Google, or an email link.`, and no session cookie is set.

### F15-AC-031a

Given an Editor session, when a proposal is created, then `author_user_id` is that user and `agent_key_id` is null.

### F15-AC-031b

Given an Editor session and a payload that names an agent key, when the proposal is created, then `agent_key_id` is still null.

### F15-AC-032a

Given a space whose only Owner is user 4, when user 4 changes their role to Editor, then the code is `last_owner`, the message is `A space must keep one owner.`, the hint is `Add another owner before changing this role.`, and the membership stays `owner`.

### F15-AC-032b

Given two Owners, when one removes the other, then the removed membership is gone and one Owner remains.

### F15-AC-033a

Given an Owner changing Ada from Viewer to Editor, when the transaction commits, then one `audit_events` row exists with action `role_change`, that Owner as `actor_user_id`, `agent_key_id` null, and `data.from` `viewer` and `data.to` `editor`.

### F15-AC-033b

Given an invite acceptance that inserts a Contributor membership, when it commits, then the audit row has `data.from` null and `data.to` `contributor`, and the membership and the audit row commit or roll back together.

### F15-AC-034a

Given an Owner storing an invite for `ada@example.com` as Editor, when it commits, then one audit row has action `invite`, `data.email` `ada@example.com`, `data.role` `editor`, and `data.created` true.

### F15-AC-034b

Given an Owner revoking that invite, when it commits, then a new audit row has action `invite` and `data.revoked` true, and the earlier row is unchanged.

### F15-AC-035a

Given a stored audit row, when a caller updates `data` or deletes the row, then the code is `audit_immutable`, the message is `Audit events cannot be changed.`, the hint is `Record a new audit event.`, and the row is unchanged.

### F15-AC-036a

Given three audit rows in a space, when the Owner reads them, then the newest `created_at` is first.

### F15-AC-036b

Given an Editor, when they read audit events, then the code is `permission_denied`, the message is `Only an owner can read the audit log.`, the hint is `Ask an owner if you need a membership record.`, and no rows are returned.

### F15-AC-036c

Given a Viewer, a Contributor, a caller with no membership, an agent key, and a grant, when each reads audit events, then each is refused and no rows are returned.

### F15-AC-037a

Given the client bundle, when it is searched, then the Better Auth secret and the GitHub and Google client secrets are absent from it.

## Edge cases and errors

Validation of document content uses the F06 codes. This spec does not redefine them. Storage refusals for a revision or a document use the F07 sentences. Where a row below repeats an F07 sentence, the text matches F07 so the two specs name one refusal.

The database returns the code in `DETAIL` and in the constraint name. The message and the hint are the sentences below.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Password submitted | `password_disabled` | `Password sign-in is not available.` | `Use GitHub, Google, or an email sign-in link.` |
| Magic link expired, used, or unknown | `magic_link_invalid` | `This sign-in link is no longer valid.` | `Request a new sign-in link.` |
| OAuth state missing or unknown | `oauth_state` | `Sign-in could not be confirmed.` | `Start sign-in again from the sign-in page.` |
| Provider returned an error or the person cancelled | `oauth_cancelled` | `Sign-in was cancelled.` | `Try GitHub, Google, or an email link again.` |
| Session missing or expired on a page that requires a member | `session_expired` | `Your session has expired.` | `Sign in again.` |
| Origin missing or not the application origin | `csrf_rejected` | `This request was rejected.` | `Reload the page and try again.` |
| Email empty, longer than 254 characters, or not one line | `email_invalid` | `Enter one email address of at most 254 characters.` | `Use the address the invite should reach.` |
| Role outside the four values | `role_invalid` | `The role must be owner, editor, contributor, or viewer.` | `Choose Owner, Editor, Contributor, or Viewer.` |
| Second membership for the same user and space | `membership_exists` | `This person already has a role in the space.` | `Change the existing role.` |
| Invite past 168 hours | `invite_expired` | `This invite has expired.` | `Ask an owner to send a new invite.` |
| Signed-in email differs from the invite | `invite_email` | `This invite was sent to a different email.` | `Sign in with the invited email.` |
| Invite revoked or already used | `invite_revoked` | `This invite was revoked.` | `Ask an owner to send a new invite.` |
| Change that leaves zero owners | `last_owner` | `A space must keep one owner.` | `Add another owner before changing this role.` |
| Update or delete an audit row | `audit_immutable` | `Audit events cannot be changed.` | `Record a new audit event.` |
| Delete a document | `delete_refused` | `Documents are archived, not deleted.` | `Archive the document. The row and its revisions stay.` |
| Agent key opens the web app | `permission_denied` | `An agent key cannot open the web app.` | `Sign in with GitHub, Google, or an email link.` |
| Grant opens the web app | `permission_denied` | `A grant cannot open the web app.` | `Sign in with GitHub, Google, or an email link.` |
| Permission refusals | `permission_denied` | The message in Permission responses for that action and caller | The hint in that same row |

`session_expired` is the page shown when a cookie is present and the row is missing or past its expiry. A request with no cookie uses the signed-out row of the action it attempted, not `session_expired`.

An invite stores the email in lowercase. `Ada@Example.com` and `ada@example.com` are one invite target and one user.

A used invite and a revoked invite share `invite_revoked`. The accept path does not reveal which of the two happened beyond that sentence.

The merge audit action `merge` is inserted by F07 inside the merge transaction. Reject, key creation, and key revocation write their own audit rows in F12 and F13. Those actions are not defined here. They use the same immutable `audit_events` table.

While sign-in is not built, none of these codes are returned for a local edit. F07-REQ-028 is that release.

## Limits and budgets

| Limit | Value |
| --- | --- |
| Session expiry | 720 hours (30 days) after the last authenticated request that read the session row. A session with no such request for 720 hours is expired |
| Session token | 32 bytes (256 bits), CSPRNG. The cookie holds this value |
| Cookie flags, HTTPS origin | `httpOnly`, `Secure`, `SameSite=Lax` |
| Magic link | 300 seconds (5 minutes) from send, one successful sign-in |
| Invite expiry | 168 hours (7 days) from `created_at` |
| Pending invites | 1 unused invite per email per space. A new invite revokes the older unused invite for that pair |
| Memberships | 1 per user per space |
| Roles | 4: `owner`, `editor`, `contributor`, `viewer` |
| Email | 1 to 254 characters, one line, stored lowercase |
| Name | 1 to 120 characters, one line, no CR and no LF. A character is one Unicode code point |
| Owners | At least 1 per space after the space is created |
| Sign-in methods | 3: GitHub OAuth, Google OAuth, email magic link. Password count is 0 |
| Cookie cache | Off. The session row is the authority on each authenticated request |
| Audit page size | No maximum number of audit rows is set. A read returns the space's rows newest first |
| Sign-in response time | No percentile and no latency budget are set |
| Environment, target | The hosted HTTPS app and Postgres. Not started |
| Environment, current release | The deployed editor. No session store. Local edits are not role-checked |

The 720-hour session, the 300-second magic link, and the 168-hour invite are not started. The current release has no session to expire.

## UI states

Sign-in is a page at `/sign-in`. It is not a dialog. Members live in the Settings dialog, section Members. Settings may be a dialog. Editing and review may not. Audit has no screen. Permission refusals on save, propose, and merge use the message and the hint on the surface that attempted the action (F09 and F12). They are not a second dialog.

Copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower. There is no illustration. On a coarse pointer the GitHub, Google, and email actions have a target at least 44px on the shorter side.

The sign-in page lists GitHub, then Google, then the email field, then the send action. That is the focus order. Sign-in and member changes are not core editor actions. The PRD gives them no shortcut.

| State | Sign-in page | Members section |
| --- | --- | --- |
| Empty | `Continue with GitHub`, `Continue with Google`, and `Email me a sign-in link`. No account list | Owner, no other members: `No other members. Invite someone by email.` A member who is not Owner, no other members: `No other members.` |
| Loading | `Signing in…` on GitHub or Google. `Sending link…` on the email action | `Loading members…` |
| Error | The message, then the hint | The message, then the hint. The list stays |
| Partial | `Check your email for a sign-in link. It expires in 5 minutes.` | An Owner sees pending invites with the email, the role, and the expiry. Other roles do not see pending invites |
| Success | `Signed in.` The page the person opened is shown | `Invite sent. It expires in 7 days.` `Role updated.` `Member removed.` |

Session expired uses the sign-in error copy: `Your session has expired.` then `Sign in again.`

While sign-in is not built, the sign-in page and the Members section are absent. The empty, loading, error, and success copy in this table is the later target. It is not on the live editor.

A Viewer who opens Members sees the member list (name, email, and role) and no invite form. An Editor and a Contributor see that same list. Pending invites and the invite form are Owner only.

## Out of scope

- Agent key format, key screens, key create, and key revoke (F13). The Owner gate is F15-REQ-026. The web-app refusal is F15-REQ-030.
- OAuth grants for assistants, MCP scopes, and the MCP route (F14 and F13). The prohibition on merge, delete, administer, and edit directly is F15-REQ-028 and F15-REQ-029.
- The share sheet, Copy link, and the public read link (F11). Can view and Can edit grant no role (F15-REQ-004).
- The proposal row, review, reject, and the reject audit payload (F12). The human propose gate is F15-REQ-022.
- The revision insert, archive write, and the `merge` audit payload (F07).
- The editor chrome, the Edit button, and the commit-message field (F09).
- Type schema editing (F02). The Owner gate is F15-REQ-026.
- Better Auth tables for accounts and verifications, beyond the session behavior in this spec. `users`, `memberships`, and `audit_events` are already in `specs/contracts/db.sql`.
- A legal hard-delete. F07 keeps archive as the only removal.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F15-Q-001 | The role table gives manage-keys to Owner only. The agent-keys sentence says owners and editors create keys. Which is in force? | The role table. Only Owner manages keys. Editors do not. | Product owner | F13 key creation by an Editor. It does not block F15-REQ-025 or F15-REQ-026 |
| F15-Q-002 | How many magic-link emails may one address receive? | Do not add a send cap in this spec. Five sends per email per 3600 seconds is a later limit if abuse shows up. | Product owner | A send cap. It does not block F15-REQ-006 |

Q3 and PRD-2 stay owner questions in `specs/decisions/open-questions.md`. This spec follows the recommended answers already recorded in ADR-0010 and ADR-0002. They are not open inside the requirements.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:users -->` — Owner, and collaborators invited to read, propose, or edit.
- `<!-- prd:product-principles -->` — agents propose, humans merge. No merge, delete, or admin tool for an agent.
- `<!-- prd:write-or-edit -->` — Owners and editors edit in place.
- `<!-- prd:saving -->` — Contributors see Propose instead of Save.
- `<!-- prd:auth-permissions-and-sharing -->` — human sessions and agent credentials do not mix.
- `<!-- prd:human-sign-in -->` — GitHub, Google, email magic link, no passwords, database sessions, `httpOnly`, `Secure`, `SameSite=Lax`, 30-day rolling expiry, CSRF, server-side role checks. The stack row selects Better Auth as the provider.
- `<!-- prd:roles -->` — Owner, Editor, Contributor, Viewer, and the five columns.
- `<!-- prd:sharing -->` — invite by email with a role, 7 days, audit of privileged actions.
- `<!-- prd:security-basics -->` — secrets live in environment variables.
- `<!-- prd:stack -->` — Auth row is Better Auth.
- `<!-- prd:data-model -->` — `users`, `memberships`, `audit_events`.
- `<!-- prd:screens -->` — Settings holds members. This spec places Members in the Settings dialog.
- `<!-- prd:acceptance-milestones-1-4 -->` — no OAuth scope or tool allows merging, editing directly, or deleting.
- `<!-- prd:open-questions -->` — PRD-2, whether editors also propose. The v1 answer is no.

Decisions in `specs/source/decisions-and-changes.md`: D3 and D7. D3 is no auth yet, decided by ADR-0002. D7 keeps Owner and Editor as the roles that save directly, and agents never merge. C8 is the live share sheet: Can view and Can edit set the starting mode and grant no rights, decided by ADR-0010.

Plan section 7 Q3: link access stays a starting mode. Edit rights come only from a role, through invites (F11, F15).

ADRs: ADR-0002, ADR-0010.

Constitution, principle 3: no endpoint, tool, or OAuth scope can merge, delete, or administer. Sign-in is not built yet. The check still applies to every endpoint, tool, and OAuth scope this spec adds, and this spec adds none that merge, delete, or administer.

Glossary: sign-in is human sessions and is not built; roles stay the later target. Can view and Can edit grant no rights. A grant is not a session. An endpoint is an HTTP route, including REST and the MCP route. A tool is one MCP tool. An OAuth scope cannot merge, delete, or administer. Specs say viewing. The mode value in the editor is `preview`.

Contract: `specs/contracts/db.sql` on `cursor/spec-storage-db-f59c`, tables `users`, `memberships`, and `audit_events`, and `assert_writer` for the edit-directly sentences. Better Auth session tables are not in that file. F07 leaves them to this spec. This spec states the session behavior and does not add `design.md`.
