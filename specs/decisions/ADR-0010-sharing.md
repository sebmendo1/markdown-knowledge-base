# ADR-0010: Sharing

**Status:** Accepted

## Context

The PRD shares a space by email invite with a role. Invites expire after 7 days. A public read-only link for the whole space is optional and off by default. Public views hide proposals, keys, and members.

Change request C8, already live, adds a share sheet like a document link: "Anyone with the link", a choice of Can view or Can edit, and Copy link. The link sets the starting mode. It grants no rights.

Section 7 Q3 asks what "Can edit" means once sign-in exists. The recommended answer, adopted here, is that the link stays a starting mode. Edit rights come only from a role, through invites (F11, F15).

## Options

1. Email invites with a role, plus an optional public read link per space, off by default.
2. A page link. "Anyone with the link" can open it. Can view and Can edit set only the starting mode and grant no rights. After sign-in exists, edit rights still come only from a role via an invite.
3. Can edit on the link grants edit rights to anyone who opens it.

## Decision

The share sheet offers "Anyone with the link", Can view or Can edit, and Copy link.

Can view opens the page in preview. Can edit opens the page in editing. Neither choice grants a role, a session, or permission to save on behalf of anyone else.

When sign-in exists, that link still only picks the starting mode. Permission to edit comes from the Owner or Editor role, given by an invite. The link does not confer that role.

## Replaces

PRD sharing model (email invite with a role, and a public read-only space link off by default) as the live share behavior. Superseded by C8. Section 7 Q3 adds the rule for after sign-in: the link remains a starting mode.

## Consequences

- F11: the live share path is the page link and the starting mode. Invites, when built, grant roles and do not change what the link does.
- F15: edit permission is a role check. A shared link is not a credential.
