# F11 Sharing

## Summary

Sharing lets the owner copy a page link that only chooses viewing or editing, and, once sign-in exists, invite a person by email with a role or turn on a public read-only space link that is off by default. The page link grants no role and no permission; edit rights come from a role given by an invite, and a public view never shows proposals, keys, or members.

## Status and scope

Partly built. The shipped slice is the Share control, the share sheet, the page link, and the `edit` parameter that sets the starting mode. F11-REQ-001 through F11-REQ-014 are that slice, and they stay in force after sign-in exists.

This spec also states the later target, which is not started: an email invite with one of the four roles, invites that expire after 168 hours (7 days), and an optional public read-only link for a space that is off by default. Public views never show proposals, keys, or members. The current release has no sign-in, so the shipped sheet does not offer invites or that public link.

PLAN section 2.2 matches the sheet that shipped: "Anyone with the link", with Can view and Can edit setting the starting mode and granting no rights. ADR-0010 and plan question Q3 stand: Can edit on a page link is only a starting mode. Edit rights come from a role, through invites, once sign-in exists.

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual. Scenarios for the later target were not run.

## Users and stories

No sign-in exists in the current release (decision D3). Anyone who can open a page may open Share and may open a copied link. Can view and Can edit do not create a viewer or an editor. There is no refusal for a missing role on that sheet, because no role is checked.

When sign-in exists, the roles are Owner, Editor, Contributor, and Viewer. Only an Owner may invite, revoke an invite, or turn the public read-only space link on or off. Owner and Editor may save. A Contributor, a Viewer, a caller with no membership, a signed-out caller, an agent key, a grant, an endpoint, a tool, and an OAuth scope may not. The page link still does not grant those rights.

- F11-ST-001 As the owner, I want a link to this page, so that I can send someone the page I am reading.
- F11-ST-002 As the owner, I want the link to start in viewing or editing, so that the next open matches how I want to hand it over.
- F11-ST-003 As the owner, I want that choice to stay a starting mode, so that a link cannot grant a right the product does not have.
- F11-ST-004 As the owner, I want to invite a person by email with a role, so that their rights come from that role once they accept.
- F11-ST-005 As the owner, I want an unused invite to expire after 7 days, so that an old invite cannot add a member.
- F11-ST-006 As the owner, I want a public read-only link for the space that stays off until I turn it on, so that the space stays private by default.
- F11-ST-007 As a person without a membership, I want a public space to show documents only, so that proposals, keys, and members stay hidden.

## Requirements

- F11-REQ-001 When a page is open and the owner activates Share, the system shall open a dialog labeled `Share {title}` whose heading is `Share “{title}”`.
- F11-REQ-002 The system shall show the label "Anyone with the link" and the sentence "The link opens this page. Choose whether it starts in viewing or editing."
- F11-REQ-003 The system shall offer Can view and Can edit as a single choice, with Can view selected when this page has no stored choice.
- F11-REQ-004 When the owner chooses Can view or Can edit, the system shall remember that choice for this page on this machine.
- F11-REQ-005 The system shall build the link as the current page URL, with the fragment removed and `edit` set to `0` for Can view or `1` for Can edit.
- F11-REQ-006 The system shall not read or write a role, a membership, or a permission when the owner changes Can view or Can edit.
- F11-REQ-007 When a page loads with `edit=1`, the system shall start in editing and remove `edit` from the address. When it loads with `edit=0`, the system shall start in viewing and remove `edit` from the address.
- F11-REQ-008 If the page state is "Edited in this browser", then the system shall also show "Your edits live in this browser. The link opens the repository copy."
- F11-REQ-009 If the page state is "Created in this browser", then the system shall also show "This page lives in this browser. Others who open the link won’t see it. Export it to share the file."
- F11-REQ-010 While the page state is "Repository copy", the system shall show no extra note beyond F11-REQ-002.
- F11-REQ-011 When the owner activates Copy link and the copy succeeds, the system shall change that control to "Copied".
- F11-REQ-012 If both the clipboard write and the fallback copy fail, then the system shall leave the control as "Copy link" and shall show no error message.
- F11-REQ-013 When the owner activates "Close share", presses Escape, or presses the overlay, the system shall close the dialog.
- F11-REQ-014 While the viewport is wider than 640px, the system shall size the dialog up to 480px wide. While the viewport is 640px wide or narrower, the system shall size it to the viewport width minus 16px.

F11-REQ-015 through F11-REQ-037 are the later target. They are not started. The current release does not implement them.

- F11-REQ-015 While sign-in is not built, the system shall show no email invite, no invite role, no Members section, and no public read-only space link, and the share dialog shall remain F11-REQ-001 through F11-REQ-014.
- F11-REQ-016 When sign-in is built, the system shall treat Can view and Can edit on a page link as a starting mode for a caller who is allowed to read the document. Can view shall open viewing. Can edit shall open editing. Can view and Can edit are not the Viewer and Editor roles. The link shall create no session, no membership, and no role, and shall grant no permission to save.
- F11-REQ-017 When sign-in is built and an Owner submits one email and one role, the system shall store one invite for that email in lowercase and that space, with the stored role `owner`, `editor`, `contributor`, or `viewer`, expiring 168 hours (7 days) after `created_at`. The screen names are Owner, Editor, Contributor, and Viewer.
- F11-REQ-018 When an Owner stores an invite and an unused invite already exists for that lowercase email and space, the system shall revoke that older unused invite in the same action. The space shall keep one unused invite for that pair.
- F11-REQ-019 If the invite email is empty, longer than 254 characters, or not one line, then the system shall return `email_invalid`, the message "Enter one email address of at most 254 characters.", and the hint "Use the address the invite should reach.", and shall store no invite.
- F11-REQ-020 If the role is not `owner`, `editor`, `contributor`, or `viewer`, then the system shall return `role_invalid`, the message "The role must be owner, editor, contributor, or viewer.", and the hint "Choose Owner, Editor, Contributor, or Viewer.", and shall store no invite.
- F11-REQ-021 When sign-in is built, the system shall allow only an Owner to store or revoke an invite. If the caller is an Editor, a Contributor, or a Viewer, then the system shall return `permission_denied`, the message "Only an owner can manage members.", and the hint "Ask an owner to invite or change roles.", and shall not store or revoke an invite. If the caller is signed out or has no membership, then the system shall return `permission_denied`, the message "You are not a member of this space.", and the hint "Ask an owner for an invite.", and shall not store or revoke an invite. If the caller is an agent key or a grant, then the system shall return `permission_denied`, the message "Agents cannot merge, delete, or administer.", and the hint "A human owner manages members in the web app.", and shall not store or revoke an invite. If the caller is an endpoint, a tool, or an OAuth scope, then the system shall return `permission_denied`, the message "Agents cannot merge, delete, or administer.", and the hint "Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.", and shall not store or revoke an invite.
- F11-REQ-022 When the person signs in with the invited email and the invite is unused and unexpired, the system shall show that person the invited role and the action "Accept invite", and shall not show "Accept invite" to any other email. When that person activates "Accept invite" before 168 hours (7 days) have passed since `created_at`, the system shall set that user's one membership in the space to the invited role and shall not insert a second membership. A second accept of the same invite shall change no membership.
- F11-REQ-023 If the accept is more than 168 hours (7 days) after the invite's `created_at`, then the system shall return `invite_expired`, the message "This invite has expired.", and the hint "Ask an owner to send a new invite.", and shall insert or change no membership.
- F11-REQ-024 If the signed-in email differs from the invite email, then the system shall return `invite_email`, the message "This invite was sent to a different email.", and the hint "Sign in with the invited email.", and shall insert or change no membership.
- F11-REQ-025 If the invite is revoked or already used, then the system shall return `invite_revoked`, the message "This invite was revoked.", and the hint "Ask an owner to send a new invite.", and shall insert or change no membership.
- F11-REQ-026 When sign-in is built and a space is created, the system shall set `public_read` to false.
- F11-REQ-027 If `public_read` is false and the caller has no membership, then the system shall return `permission_denied`, the message "You do not have permission to read this space.", and the hint "Sign in, or ask an owner for an invite.", shall not show the document body, and shall not treat the page link as a membership.
- F11-REQ-028 When sign-in is built, the system shall allow only an Owner to set `public_read` to true or to false. If the caller is an Editor, a Contributor, or a Viewer, then the system shall return `permission_denied`, the message "Only an owner can change the public read-only link.", and the hint "Ask an owner to turn it on or off.", and shall leave `public_read` unchanged. If the caller is signed out or has no membership, then the system shall return `permission_denied`, the message "You are not a member of this space.", and the hint "Ask an owner for an invite.", and shall leave `public_read` unchanged. If the caller is an agent key or a grant, then the system shall return `permission_denied`, the message "Agents cannot merge, delete, or administer.", and the hint "A human owner manages the public link in the web app.", and shall leave `public_read` unchanged. If the caller is an endpoint, a tool, or an OAuth scope, then the system shall return `permission_denied`, the message "Agents cannot merge, delete, or administer.", and the hint "Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.", and shall leave `public_read` unchanged.
- F11-REQ-029 Where `public_read` is true, the system shall let a caller with no membership read that space's documents at `/{project}/{page-path}`. The public read-only link is those document URLs. It adds no space segment and it is not a separate secret token. The page link's Can view or Can edit value still only sets the starting mode.
- F11-REQ-030 If the caller has no membership, then the system shall not show proposals, agent keys, or members, and a request for those lists shall return no rows. The system shall return `permission_denied`, the message "You are not a member of this space.", and the hint "Ask an owner for an invite." A request for audit events from that caller shall return `permission_denied`, the message "Only an owner can read the audit log.", the hint "Ask an owner if you need a membership record.", and no rows.
- F11-REQ-031 When sign-in is built, the system shall allow a human save, including a save on a page opened with Can edit, only to an Owner or an Editor. If the caller is a Contributor, then the system shall return `permission_denied`, the message "Contributors propose changes. They do not save directly.", and the hint "Submit a proposal instead of saving.", and shall insert no revision. If the caller is a Viewer or has no membership, then the system shall return `permission_denied`, the message "You do not have permission to change this document.", and the hint "Ask an owner for a role that can edit.", and shall insert no revision. If the caller is signed out, then the system shall return `permission_denied`, the message "You do not have permission to change this document.", and the hint "Sign in as an owner or an editor.", and shall insert no revision. If the caller is an agent key or a grant, then the system shall return `permission_denied`, the message "Agents propose changes. They do not save directly.", and the hint "Call propose_change. Agents cannot merge, delete, or administer.", and shall insert no revision. If the caller is an endpoint, a tool, or an OAuth scope, then the system shall return `permission_denied`, the message "You do not have permission to change this document.", and the hint "Edit directly is a human session action for an owner or an editor.", and shall insert no revision.
- F11-REQ-032 When sign-in is built, the system shall show an Owner, in Settings section Members, an email field, the roles Owner, Editor, Contributor, and Viewer, and the action "Invite". An Editor, a Contributor, and a Viewer shall see the member list and shall not see the invite form or pending invites.
- F11-REQ-033 When an Owner's invite is stored, the system shall show "Invite sent. It expires in 7 days." and shall list each unused invite with its email, its role, and its expiry.
- F11-REQ-034 While `public_read` is false, the system shall show an Owner the label "Public read-only link" and the sentence "Off. Only members can read this space." While `public_read` is true, the system shall show that Owner "On. Anyone with the link can read. They cannot edit, and they cannot see proposals, keys, or members." An Editor, a Contributor, a Viewer, a caller with no membership, and a signed-out caller shall not see that control.
- F11-REQ-035 While the primary pointer is coarse, the system shall size the Invite action and the public read-only link control to at least 44px on the shorter side.
- F11-REQ-036 When sign-in is built, the system shall keep the page share dialog as F11-REQ-001 through F11-REQ-014. Email invites and the public read-only space link shall be in Settings, section Members, and shall not replace "Anyone with the link".
- F11-REQ-037 If a caller with no membership proposes or merges, including when `public_read` is true, then the system shall return `permission_denied`, the message "You are not a member of this space.", and the hint "Ask an owner for an invite.", shall insert no proposal, and shall not start a merge.

## Acceptance scenarios

### F11-AC-001a Share dialog title

Test name: `share dialog names the page`

Given `docs/layout.md` is open and its title is Layout, when the owner activates Share, then the dialog is labeled "Share Layout" and the heading is "Share “Layout”".

Checked: ran, Chrome, 1280×800.

### F11-AC-002a Anyone with the link

Test name: `share sheet says anyone with the link`

Given the dialog is open on a repository page, when the body renders, then it shows "Anyone with the link" and "The link opens this page. Choose whether it starts in viewing or editing."

Checked: ran, Chrome, 1280×800 and 390×844.

### F11-AC-003a Can view is the default

Test name: `can view is selected when nothing is stored`

Given this page has no stored access choice, when the dialog opens, then Can view is selected and Can edit is not.

Checked: ran, Chrome, 1280×800, first open of that page in the profile.

### F11-AC-004a Choice is remembered

Test name: `can edit is stored for the page`

Given the dialog is open, when the owner chooses Can edit, then the stored value for `guide/docs/layout.md` is `edit`.

Checked: ran, Chrome, 1280×800.

### F11-AC-005a Link query

Test name: `can view and can edit set the edit query`

Given the dialog is open on `/guide/docs/layout`, when Can view is selected, then the link is that URL with `edit=0` and no fragment. When Can edit is selected, the link uses `edit=1`.

Checked: ran, Chrome, 1280×800. The links were `http://127.0.0.1:3000/guide/docs/layout?edit=0` and `?edit=1`.

### F11-AC-006a No rights

Test name: `can edit does not create a permission`

Given the owner chooses Can edit, when the choice is stored, then the stored value is the starting mode for that page.

Checked: ran, Chrome, 1280×800. The stored value was `edit`. The dialog has no role control. No sign-in request appeared. There is no membership record in this build to inspect.

### F11-AC-007a Edit parameter sets the mode

Test name: `edit query sets the starting mode and is removed`

Given the owner opens `/guide/docs/layout?edit=1`, when the page loads, then the address has no `edit` parameter and the status line says "Editing". Given `?edit=0`, the status line says "Viewing" and `edit` is gone.

Checked: ran, Chrome, 1280×800, both values.

### F11-AC-008a Edited-page note

Test name: `edited page warns that the link is the repository copy`

Given a page whose state is "Edited in this browser", when Share opens, then the note is "Your edits live in this browser. The link opens the repository copy."

Checked: manual. Share was opened on a repository copy, so this note was not on screen. The copy is the share dialog's note for that state.

### F11-AC-009a Created-page note

Test name: `created page warns the link will not show it`

Given a page whose state is "Created in this browser", when Share opens, then the note is "This page lives in this browser. Others who open the link won’t see it. Export it to share the file."

Checked: manual. No browser-created page was shared during the check.

### F11-AC-010a Repository copy has no extra note

Test name: `repository copy has no extra share note`

Given a repository copy, when Share opens, then the body has the F11-REQ-002 sentences and no edited or created note.

Checked: ran, Chrome, 1280×800.

### F11-AC-011a Copy link

Test name: `copy link changes the button to copied`

Given the dialog is open, when the owner activates Copy link and the write succeeds, then the control reads "Copied".

Checked: manual. Copy link was not activated.

### F11-AC-012a Copy failure

Test name: `failed copy leaves the button unchanged`

Given both copy methods fail, when the owner activates Copy link, then the control stays "Copy link" and no error message appears.

Checked: manual. Failure was not forced.

### F11-AC-013a Close the sheet

Test name: `escape closes the share sheet`

Given the dialog is open, when the owner presses Escape, then it closes.

Checked: ran, Chrome, 1280×800. "Close share" and the overlay were not pressed.

### F11-AC-014a Phone width

Test name: `share dialog uses the phone width`

Given a 390px viewport, when Share is open, then the dialog is 374px wide and still shows "Anyone with the link", Can view, and Can edit.

Checked: ran, Chrome, 390×844. The page under the sheet in that shot was "About this space" because an earlier drawer click had opened it. The sheet copy was the same.

### F11-AC-015a No invite in this release

Test name: `share sheet has no invite while sign-in is absent`

Given sign-in is not built and a page is open, when the owner activates Share, then the dialog has no email field, no invite role, and no public read-only space link, and it still shows "Anyone with the link".

Checked: the sheet checked in F11-AC-002a and F11-AC-006a had no email field, no invite role, and no public space link.

### F11-AC-016a Can edit grants no role

Test name: `can edit stays a starting mode after sign-in`

Given sign-in is built and a page link set to Can edit, when a caller who may read the document opens it, then the page starts in editing, and no session, membership, or role is created.

Checked: not run. Sign-in is not built.

### F11-AC-016b Can view grants no role

Test name: `can view stays a starting mode after sign-in`

Given sign-in is built and a page link set to Can view, when a caller who may read the document opens it, then the page starts in viewing, and no session, membership, or role is created.

Checked: not run. Sign-in is not built.

### F11-AC-017a Invite stores a role for 7 days

Test name: `owner invite stores the role and the expiry`

Given sign-in is built and an Owner invites `Ada@Example.com` as Editor, when the invite is stored, then the email is `ada@example.com`, the role is `editor`, and the expiry is 168 hours after `created_at`.

Checked: not run. Sign-in is not built.

### F11-AC-018a One unused invite

Test name: `a new invite revokes the older unused invite`

Given an unused invite for `ada@example.com` in a space, when the Owner stores a new invite for that email in that space, then the older invite is revoked and one unused invite remains for that pair.

Checked: not run. Sign-in is not built.

### F11-AC-019a Email rejected

Test name: `an invite email over 254 characters is rejected`

Given an Owner and an email of 255 characters, when they invite, then the code is `email_invalid`, the message is "Enter one email address of at most 254 characters.", the hint is "Use the address the invite should reach.", and no invite is stored.

Checked: not run. Sign-in is not built.

### F11-AC-020a Role rejected

Test name: `an invite role outside the four is rejected`

Given an Owner and a role value `admin`, when they invite, then the code is `role_invalid`, the message is "The role must be owner, editor, contributor, or viewer.", the hint is "Choose Owner, Editor, Contributor, or Viewer.", and no invite is stored.

Checked: not run. Sign-in is not built.

### F11-AC-021a Owner may invite

Test name: `an owner can store an invite`

Given an Owner, when they invite `ada@example.com` as Contributor, then the invite is stored.

Checked: not run. Sign-in is not built.

### F11-AC-021b Editor cannot invite

Test name: `an editor cannot invite`

Given an Editor, when they invite `ada@example.com` as Contributor, then the code is `permission_denied`, the message is "Only an owner can manage members.", the hint is "Ask an owner to invite or change roles.", and no invite is stored.

Checked: not run. Sign-in is not built.

### F11-AC-021c Other members and signed-out callers cannot invite

Test name: `non-owners cannot invite`

Given a Contributor, a Viewer, a signed-out caller, and a caller with no membership, when each invites, then the Contributor and the Viewer receive "Only an owner can manage members." and the signed-out caller and the caller with no membership receive "You are not a member of this space." with the hint "Ask an owner for an invite.", and no invite is stored.

Checked: not run. Sign-in is not built.

### F11-AC-021d Agents cannot invite

Test name: `an agent key a grant and an endpoint cannot invite`

Given an agent key, a grant, an endpoint, a tool, and an OAuth scope, when each invites, then each receives `permission_denied` and "Agents cannot merge, delete, or administer.", the agent key and the grant use the hint "A human owner manages members in the web app.", and the endpoint, the tool, and the OAuth scope use the hint "Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope.", and no invite is stored.

Checked: not run. Sign-in is not built.

### F11-AC-022a Accept sets the role

Test name: `accepting an invite sets the invited role`

Given an unused Editor invite for `ada@example.com` with 1 hour left, when Ada signs in with that email, then she sees "Accept invite" and the role Editor. When she accepts, her membership role is `editor` and she has one membership in the space.

Checked: not run. Sign-in is not built.

### F11-AC-022b Second accept changes nothing

Test name: `a second accept does not change the membership`

Given an invite already accepted as Editor, when the same email accepts it again, then the membership stays `editor` and no second membership is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-023a Expired invite

Test name: `an invite older than 7 days is refused`

Given an invite created 169 hours ago, when the invited email accepts, then the code is `invite_expired`, the message is "This invite has expired.", the hint is "Ask an owner to send a new invite.", and no membership is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-024a Wrong email

Test name: `a different email cannot accept the invite`

Given an invite for `ada@example.com`, when `bob@example.com` accepts it, then the code is `invite_email`, the message is "This invite was sent to a different email.", the hint is "Sign in with the invited email.", and no membership is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-025a Revoked invite

Test name: `a revoked invite cannot be accepted`

Given a revoked invite, when the invited email accepts, then the code is `invite_revoked`, the message is "This invite was revoked.", the hint is "Ask an owner to send a new invite.", and no membership changes.

Checked: not run. Sign-in is not built.

### F11-AC-026a Public link starts off

Test name: `a new space has public read off`

Given sign-in is built, when a space is created, then `public_read` is false.

Checked: not run. Sign-in is not built.

### F11-AC-027a Private space refuses a non-member

Test name: `public read off refuses a caller with no membership`

Given `public_read` false, no membership, and a page link set to Can edit, when the caller opens the page, then the code is `permission_denied`, the message is "You do not have permission to read this space.", the hint is "Sign in, or ask an owner for an invite.", the document body is not shown, and no membership is created.

Checked: not run. Sign-in is not built.

### F11-AC-028a Owner turns the public link on

Test name: `an owner can turn the public read-only link on`

Given an Owner and `public_read` false, when they turn the public read-only link on, then `public_read` is true.

Checked: not run. Sign-in is not built.

### F11-AC-028b Editor cannot change the public link

Test name: `an editor cannot change the public read-only link`

Given an Editor and `public_read` false, when they turn the public read-only link on, then the code is `permission_denied`, the message is "Only an owner can change the public read-only link.", the hint is "Ask an owner to turn it on or off.", and `public_read` stays false.

Checked: not run. Sign-in is not built.

### F11-AC-028c Other callers cannot change the public link

Test name: `non-owners cannot change the public read-only link`

Given a Contributor, a Viewer, a signed-out caller, a caller with no membership, an agent key, a grant, an endpoint, a tool, and an OAuth scope, when each sets `public_read` to true, then each is refused with the response in F11-REQ-028 for that caller and `public_read` stays false.

Checked: not run. Sign-in is not built.

### F11-AC-029a Public read uses the document URL

Test name: `public read opens the document url with no secret token`

Given `public_read` true and a caller with no membership, when they open `/guide/docs/layout`, then the document is shown, the address has no space segment, and no secret token was required.

Checked: not run. Sign-in is not built.

### F11-AC-029b Public read keeps the starting mode

Test name: `public read still treats can edit as a starting mode`

Given `public_read` true, no membership, and a page link set to Can edit, when the caller opens the page, then it starts in editing and no membership is created.

Checked: not run. Sign-in is not built.

### F11-AC-030a Public view hides proposals, keys, and members

Test name: `a public view does not show proposals keys or members`

Given `public_read` true and a caller with no membership, when they request proposals, agent keys, or members, then each response is `permission_denied`, the message is "You are not a member of this space.", the hint is "Ask an owner for an invite.", and no rows are returned.

Checked: not run. Sign-in is not built.

### F11-AC-030b Public view hides audit events

Test name: `a public view does not show audit events`

Given `public_read` true and a caller with no membership, when they request audit events, then the code is `permission_denied`, the message is "Only an owner can read the audit log.", the hint is "Ask an owner if you need a membership record.", and no rows are returned.

Checked: not run. Sign-in is not built.

### F11-AC-031a Contributor cannot save from Can edit

Test name: `can edit does not let a contributor save`

Given a Contributor and a page link set to Can edit, when they save, then the code is `permission_denied`, the message is "Contributors propose changes. They do not save directly.", the hint is "Submit a proposal instead of saving.", and no revision is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-031b Viewer cannot save from Can edit

Test name: `can edit does not let a viewer save`

Given a Viewer and a page link set to Can edit, when they save, then the code is `permission_denied`, the message is "You do not have permission to change this document.", the hint is "Ask an owner for a role that can edit.", and no revision is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-031c Public reader cannot save

Test name: `public read does not grant a save`

Given `public_read` true, a signed-in caller with no membership, and a page link set to Can edit, when the caller saves, then the message is "You do not have permission to change this document.", the hint is "Ask an owner for a role that can edit.", and no revision is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-031d Editor can save from Can view

Test name: `can view does not remove an editor save`

Given an Owner or an Editor and a page link set to Can view, when they save, then the save is allowed.

Checked: not run. Sign-in is not built.

### F11-AC-031e Signed-out caller cannot save

Test name: `can edit does not let a signed-out caller save`

Given a signed-out caller and a page link set to Can edit, when they save, then the message is "You do not have permission to change this document.", the hint is "Sign in as an owner or an editor.", and no revision is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-031f Agent cannot save from Can edit

Test name: `can edit does not let an agent key save`

Given an agent key and a grant, and a page link set to Can edit, when each saves, then the message is "Agents propose changes. They do not save directly.", the hint is "Call propose_change. Agents cannot merge, delete, or administer.", and no revision is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-031g Endpoint cannot save

Test name: `an endpoint cannot save from a page link`

Given an endpoint, a tool, and an OAuth scope, and a page link set to Can edit, when each saves, then the message is "You do not have permission to change this document.", the hint is "Edit directly is a human session action for an owner or an editor.", and no revision is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-032a Owner sees the invite form

Test name: `only an owner sees the invite form`

Given an Owner in Settings section Members, when the section renders, then it shows an email field, Owner, Editor, Contributor, and Viewer, and the action "Invite".

Checked: not run. Sign-in is not built.

### F11-AC-032b Other roles do not see pending invites

Test name: `an editor does not see the invite form`

Given an Editor, when they open Members, then they see the member list, and they do not see the invite form, pending invites, or the public read-only link control.

Checked: not run. Sign-in is not built.

### F11-AC-033a Invite sent

Test name: `a stored invite says it expires in 7 days`

Given an Owner, when an invite is stored, then the section shows "Invite sent. It expires in 7 days." and the pending row shows that email, that role, and that expiry.

Checked: not run. Sign-in is not built.

### F11-AC-034a Public link off copy

Test name: `the public link tells the owner it is off`

Given an Owner and `public_read` false, when Members renders, then it shows "Public read-only link" and "Off. Only members can read this space."

Checked: not run. Sign-in is not built.

### F11-AC-034b Public link on copy

Test name: `the public link tells the owner it is on`

Given an Owner and `public_read` true, when Members renders, then the section shows "On. Anyone with the link can read. They cannot edit, and they cannot see proposals, keys, or members."

Checked: not run. Sign-in is not built.

### F11-AC-035a Coarse pointer target

Test name: `invite and public link controls meet the coarse target`

Given a coarse pointer and the Members section for an Owner, when it renders, then the Invite action and the public read-only link control are at least 44px on the shorter side.

Checked: not run. Sign-in is not built.

### F11-AC-036a Share sheet stays the page link

Test name: `sign-in does not replace anyone with the link`

Given sign-in is built and a page is open, when the owner activates Share, then the dialog still shows "Anyone with the link", Can view, and Can edit, and the email invite and the public read-only space link are in Settings section Members.

Checked: not run. Sign-in is not built.

### F11-AC-037a Public reader cannot propose

Test name: `public read does not grant a proposal`

Given `public_read` true and a caller with no membership, when they propose, then the code is `permission_denied`, the message is "You are not a member of this space.", the hint is "Ask an owner for an invite.", and no proposal is inserted.

Checked: not run. Sign-in is not built.

### F11-AC-037b Public reader cannot merge

Test name: `public read does not grant a merge`

Given `public_read` true and a caller with no membership, when they merge, then the message is "You are not a member of this space.", the hint is "Ask an owner for an invite.", and the merge does not start.

Checked: not run. Sign-in is not built.

## Edge cases and errors

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Page was edited in this browser | none shown | "Your edits live in this browser. The link opens the repository copy." | none shown |
| Page was created in this browser | none shown | "This page lives in this browser. Others who open the link won’t see it. Export it to share the file." | export is named in the message; no separate hint |
| Copy succeeds | none shown | the control reads "Copied" | none |
| Copy fails | none shown | the control stays "Copy link" | none shown |
| Stored choice is not `edit` | none shown | Can view is selected | none shown |
| `edit` is neither `1` nor `0` | none shown | the mode is unchanged | none |
| Invite email empty, longer than 254 characters, or not one line | `email_invalid` | "Enter one email address of at most 254 characters." | "Use the address the invite should reach." |
| Invite role outside the four values | `role_invalid` | "The role must be owner, editor, contributor, or viewer." | "Choose Owner, Editor, Contributor, or Viewer." |
| Invite past 168 hours | `invite_expired` | "This invite has expired." | "Ask an owner to send a new invite." |
| Signed-in email differs from the invite | `invite_email` | "This invite was sent to a different email." | "Sign in with the invited email." |
| Invite revoked or already used | `invite_revoked` | "This invite was revoked." | "Ask an owner to send a new invite." |
| Read, no membership, `public_read` false | `permission_denied` | "You do not have permission to read this space." | "Sign in, or ask an owner for an invite." |
| Invite or revoke, Editor, Contributor, or Viewer | `permission_denied` | "Only an owner can manage members." | "Ask an owner to invite or change roles." |
| Invite or revoke, signed out or no membership | `permission_denied` | "You are not a member of this space." | "Ask an owner for an invite." |
| Invite or revoke, agent key or grant | `permission_denied` | "Agents cannot merge, delete, or administer." | "A human owner manages members in the web app." |
| Invite or revoke, endpoint, tool, or OAuth scope | `permission_denied` | "Agents cannot merge, delete, or administer." | "Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope." |
| Public link change, Editor, Contributor, or Viewer | `permission_denied` | "Only an owner can change the public read-only link." | "Ask an owner to turn it on or off." |
| Public link change, signed out or no membership | `permission_denied` | "You are not a member of this space." | "Ask an owner for an invite." |
| Public link change, agent key or grant | `permission_denied` | "Agents cannot merge, delete, or administer." | "A human owner manages the public link in the web app." |
| Public link change, endpoint, tool, or OAuth scope | `permission_denied` | "Agents cannot merge, delete, or administer." | "Merge, delete, and administer are not available on an endpoint, a tool, or an OAuth scope." |
| Proposals, keys, or members, no membership | `permission_denied` | "You are not a member of this space." | "Ask an owner for an invite." |
| Audit events, no membership | `permission_denied` | "Only an owner can read the audit log." | "Ask an owner if you need a membership record." |
| Save, Contributor, including from Can edit | `permission_denied` | "Contributors propose changes. They do not save directly." | "Submit a proposal instead of saving." |
| Save, Viewer or no membership, including from Can edit | `permission_denied` | "You do not have permission to change this document." | "Ask an owner for a role that can edit." |
| Save, signed out | `permission_denied` | "You do not have permission to change this document." | "Sign in as an owner or an editor." |
| Save, agent key or grant | `permission_denied` | "Agents propose changes. They do not save directly." | "Call propose_change. Agents cannot merge, delete, or administer." |
| Save, endpoint, tool, or OAuth scope | `permission_denied` | "You do not have permission to change this document." | "Edit directly is a human session action for an owner or an editor." |
| Propose or merge, no membership, including when public read is on | `permission_denied` | "You are not a member of this space." | "Ask an owner for an invite." |

The shipped sheet has no invite, so it returns none of the invite or public-link codes. While sign-in is not built, a local edit does not return them. An invite stores the email in lowercase. `Ada@Example.com` and `ada@example.com` are one invite target. A used invite and a revoked invite share `invite_revoked`. An accept that would leave the space with zero owners is refused by F15 with `last_owner`, the message "A space must keep one owner.", and the hint "Add another owner before changing this role." This spec does not change that sentence.

## Limits and budgets

| Item | Value | Where |
| --- | --- | --- |
| Dialog, wider than 640px | up to 480px wide, inset 32px from the viewport width | stylesheet; seen at 1280px |
| Dialog, 640px and below | viewport width minus 16px | measured 374px at 390px |
| Query values | `edit=0` or `edit=1` | measured |
| Storage | one value, `view` or `edit`, per `{project}/{path}` | key `markdown-kb:access:{project}/{path}` |
| Rights granted by the page link | none | no role record is written, including after sign-in |
| Invite expiry | 168 hours (7 days) from `created_at` | later target; not started. The shipped sheet has no invite |
| Unused invites | 1 per lowercase email per space | a new invite revokes the older unused invite for that pair |
| Invite email | 1 to 254 characters, one line, stored lowercase | later target |
| Roles on an invite | 4: Owner, Editor, Contributor, Viewer (`owner`, `editor`, `contributor`, `viewer`) | later target |
| Public read-only link | off (`public_read` false) on a new space | later target. On, document URLs `/{project}/{page-path}` are readable with no membership. No secret token |
| Coarse pointer | Invite and the public link control at least 44px on the shorter side | later target, Members section |
| No latency budget | the page link is built on the client when the dialog renders | not timed. No percentile is set for invite or public-link actions |

## UI states

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success, repository page | "Share “{title}”". "Anyone with the link". "The link opens this page. Choose whether it starts in viewing or editing." Can view and Can edit. The link field. "Copy link", or "Copied" after a successful copy. | Same copy. Dialog 374px wide at 390px. |
| Success, edited page | The success copy plus "Your edits live in this browser. The link opens the repository copy." | Same copy. Not opened in the browser check. |
| Success, created page | The success copy plus "This page lives in this browser. Others who open the link won’t see it. Export it to share the file." | Same copy. Not opened in the browser check. |
| Empty | The sheet has no empty list. Share is absent when no page is open. | Same. |
| Loading | The link is filled when the dialog opens. There is no loading sentence. | Same. |
| Error, copy failed | Control stays "Copy link". No error sentence. | Same. Not forced in the browser check. |

The Members section is the later target. It is absent while sign-in is not built. Copy is the same at a desktop viewport wider than 860px and at a phone viewport 390px wide. The settings dialog keeps the sizes in F10. There is no illustration.

| State | Members, Owner | Members, Editor, Contributor, or Viewer |
| --- | --- | --- |
| Empty | "No other members. Invite someone by email." The invite form. "Public read-only link" and "Off. Only members can read this space." | "No other members." No invite form. No public link control. |
| Loading | "Loading members…" | "Loading members…" |
| Error | The message, then the hint. The list stays. | The message, then the hint. The list stays. |
| Partial | Pending invites, each with email, role, and expiry. The public link shows the off sentence or the on sentence for the current `public_read`. | The member list. No pending invites. |
| Success | "Invite sent. It expires in 7 days." After the public link changes: "On. Anyone with the link can read. They cannot edit, and they cannot see proposals, keys, or members." or "Off. Only members can read this space." | The member list shows the new member and role after an invite is accepted. No invite-sent sentence. |

"Accept invite" is shown only to the signed-in invited email, at those same widths. The screen shows the invited role and "Accept invite". It does not show proposals, keys, or members. There is no loading sentence. An error shows the message, then the hint. After success, the membership role is the invited role.

## Out of scope

- Sign-in and sessions (F15). This spec names who may invite, who may turn on the public link, and who may save after a page link. F15 names the session.
- The `invite` audit row (F15). Storing or revoking an invite here is the same transaction as that row. This spec adds no second audit action.
- Changing a member's role, or removing a member, other than by accepting an invite (F15).
- Proposals, the Inbox, and merge, beyond the refusal for a caller with no membership (F12, F15).
- Agent key screens (F13). A public view does not show keys.
- The editor that the `edit` parameter starts (F09).
- Export of a browser-created page. The created-page note names it; the export flow is not this spec.

## Open questions

- F11-Q-001 Closed by ADR-0010 and plan section 7 Q3. Can edit on a page link is only a starting mode. Edit rights come from a role, through invites, once sign-in exists. It blocks nothing in this spec.
- F11-Q-002 Owner. Should a link to a browser-only page fail with an error instead of copying a URL that will not show the page? Recommended answer: keep the note in F11-REQ-009 until export or sync can carry the page.
- F11-Q-003 Owner. What happens when the email transport refuses an invite? Recommended answer: the invite row stays the record, the Owner still sees "Invite sent. It expires in 7 days.", and a bounce does not revoke the invite. Blocks the transport failure only. It does not block F11-REQ-017 through F11-REQ-025.

## Trace

- PRD `<!-- prd:sharing -->` in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`: invite by email with a role, invites expire after 7 days, optional public read-only link per space off by default, public views never show proposals, keys, or members.
- PRD `<!-- prd:roles -->` on that branch: Owner, Editor, Contributor, and Viewer.
- PRD `<!-- prd:data-model -->` on that branch: `spaces.public_read`.
- Change request C8: the share sheet, "Anyone with the link", Can view or Can edit, and Copy link. The link sets the starting mode and grants no rights.
- Decision D3: no auth in the current release, which is why invites and the public space link are not started.
- Decision D7: Owner and Editor save directly. Contributors propose.
- ADR-0010 on `cursor/record-architecture-decisions-4859`: the page link stays a starting mode. Edit rights come from a role, through invites.
- ADR-0002 on that branch: no auth in the current release. The four roles are the later target.
- ADR-0001 on that branch: a page URL is `/{project}/{page-path}` with no space segment. The public read-only link uses that URL.
- Plan section 2.2 sharing row, plan section 7 Q3, and plan section 5.
- F15 on `cursor/spec-sign-in-roles-audit-bc2e`: sessions, the role gates, the invite responses, and the `invite` audit row. This spec uses those sentences and does not reopen Q3.
