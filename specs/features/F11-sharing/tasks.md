# F11 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Shipped steps are the page link in the tree. Not-started steps are invites and the public read-only space link. They are not in the tree. A shipped share test is not proof of them. The page link stays a starting mode after those steps exist.

## Shipped

### F11-T-001 Open the share sheet and close it

- Requirements: F11-REQ-001, F11-REQ-002, F11-REQ-013, F11-REQ-014
- Test: `share dialog names the page` (F11-AC-001a). `share sheet says anyone with the link` (F11-AC-002a). `escape closes the share sheet` (F11-AC-013a). `share dialog uses the phone width` (F11-AC-014a).
- Size: one module
- Depends on: none
- Module: `components/share-host.tsx`. The dialog is labeled `Share {title}` and the heading is `Share “{title}”`. "Close share", Escape, and the overlay close it. Wider than 640px the dialog is at most 480px. At 640px or narrower it is the viewport width minus 16px.

### F11-T-002 Remember Can view or Can edit for this page

- Requirements: F11-REQ-003, F11-REQ-004, F11-REQ-005, F11-REQ-006
- Test: `can view is selected when nothing is stored` (F11-AC-003a). `can edit is stored for the page` (F11-AC-004a). `can view and can edit set the edit query` (F11-AC-005a). `can edit does not create a permission` (F11-AC-006a).
- Size: one module
- Depends on: F11-T-001
- Module: `components/share-host.tsx`. The key is `markdown-kb:access:{path}`. The link is the current page URL, fragment removed, `edit=0` or `edit=1`. The write does not touch a role, a membership, or a permission.

### F11-T-003 Apply the edit parameter as a starting mode

- Requirements: F11-REQ-007
- Test: `edit query sets the starting mode and is removed` (F11-AC-007a).
- Size: one module
- Depends on: F11-T-002, and on the mode store (F09-T-001)
- Module: the `edit` effect in `components/workspace.tsx`. `edit=1` starts editing. `edit=0` starts viewing. The parameter is removed without a reload.

### F11-T-004 Note a browser-only page

- Requirements: F11-REQ-008, F11-REQ-009, F11-REQ-010
- Test: `edited page warns that the link is the repository copy` (F11-AC-008a). `created page warns the link will not show it` (F11-AC-009a). `repository copy has no extra share note` (F11-AC-010a).
- Size: one module
- Depends on: F11-T-001
- Module: the note map in `components/share-host.tsx`. Repository copy shows only the F11-REQ-002 sentence.

### F11-T-005 Copy the link

- Requirements: F11-REQ-011, F11-REQ-012
- Test: `copy link changes the button to copied` (F11-AC-011a). `failed copy leaves the button unchanged` (F11-AC-012a).
- Size: one module
- Depends on: F11-T-002
- Module: the copy handler in `components/share-host.tsx`. Success sets the control to "Copied". If the clipboard write and the fallback both fail, the control stays "Copy link" and no error is shown.

### F11-T-006 Keep invites off this sheet

- Requirements: F11-REQ-015
- Test: `share sheet has no invite while sign-in is absent` (F11-AC-015a).
- Size: one module
- Depends on: F11-T-001
- Module: `components/share-host.tsx`. While sign-in is not built, the dialog has no email field, no invite role, no Members section, and no public read-only space link.

## Not started

These steps start when sign-in exists (F15). They do not replace F11-T-001 through F11-T-006.

### F11-T-007 Leave the page link as a starting mode

- Requirements: F11-REQ-016, F11-REQ-036
- Test: `can edit stays a starting mode after sign-in` (F11-AC-016a). `can view stays a starting mode after sign-in` (F11-AC-016b). `sign-in does not replace anyone with the link` (F11-AC-036a).
- Size: several modules
- Depends on: F11-T-002, F11-T-006
- Modules: the shipped share dialog stays in place. Can view opens viewing and Can edit opens editing for a caller who may read the document. Neither value is the Viewer or Editor role. The link creates no session, no membership, and no role, and it grants no permission to save. Email invites and the public link live in Settings, section Members.

### F11-T-008 Store one unused invite

- Requirements: F11-REQ-017, F11-REQ-018, F11-REQ-019, F11-REQ-020
- Test: `owner invite stores the role and the expiry` (F11-AC-017a). `a new invite revokes the older unused invite` (F11-AC-018a). `an invite email over 254 characters is rejected` (F11-AC-019a). `an invite role outside the four is rejected` (F11-AC-020a).
- Size: a schema change
- Depends on: F11-T-007
- Schema: an invite row for one lowercase email, one space, and one role (`owner`, `editor`, `contributor`, or `viewer`), expiring 168 hours after `created_at`. A new unused invite revokes the older unused invite for that pair in the same action. `email_invalid` and `role_invalid` store nothing. The messages and hints are the ones in F11-REQ-019 and F11-REQ-020.

### F11-T-009 Allow only an Owner to invite

- Requirements: F11-REQ-021
- Test: `an owner can store an invite` (F11-AC-021a). `an editor cannot invite` (F11-AC-021b). `non-owners cannot invite` (F11-AC-021c). `an agent key a grant and an endpoint cannot invite` (F11-AC-021d).
- Size: one module
- Depends on: F11-T-008, and on roles (F15)
- Module: the invite permission check. An Editor, Contributor, or Viewer gets "Only an owner can manage members." A signed-out caller or a caller with no membership gets "You are not a member of this space." An agent key, a grant, an endpoint, a tool, or an OAuth scope gets "Agents cannot merge, delete, or administer." Each response is `permission_denied` with the hint in F11-REQ-021, and none of them store or revoke an invite.

### F11-T-010 Accept an invite into one membership

- Requirements: F11-REQ-022, F11-REQ-023, F11-REQ-024, F11-REQ-025
- Test: `accepting an invite sets the invited role` (F11-AC-022a). `a second accept does not change the membership` (F11-AC-022b). `an invite older than 7 days is refused` (F11-AC-023a). `a different email cannot accept the invite` (F11-AC-024a). `a revoked invite cannot be accepted` (F11-AC-025a).
- Size: several modules
- Depends on: F11-T-008
- Modules: the accept action and the membership write. "Accept invite" is shown only to the invited email, and only while the invite is unused and unexpired. Accept sets that user's one membership and does not insert a second. A second accept changes nothing. `invite_expired`, `invite_email`, and `invite_revoked` use the messages and hints in the requirements and change no membership.

### F11-T-011 Keep a new space private

- Requirements: F11-REQ-026, F11-REQ-027
- Test: `a new space has public read off` (F11-AC-026a). `public read off refuses a caller with no membership` (F11-AC-027a).
- Size: a schema change
- Depends on: F11-T-007
- Schema: `public_read` on the space, default false. While it is false, a caller with no membership gets `permission_denied`, "You do not have permission to read this space.", does not see the document body, and is not treated as a member because of the page link.

### F11-T-012 Let an Owner turn the public link on or off

- Requirements: F11-REQ-028
- Test: `an owner can turn the public read-only link on` (F11-AC-028a). `an editor cannot change the public read-only link` (F11-AC-028b). `non-owners cannot change the public read-only link` (F11-AC-028c).
- Size: one module
- Depends on: F11-T-011
- Module: the `public_read` update. Only an Owner may set it. Every other caller gets the `permission_denied` response in F11-REQ-028 for that caller, and `public_read` stays unchanged.

### F11-T-013 Read a public space at the document URL

- Requirements: F11-REQ-029, F11-REQ-030, F11-REQ-037
- Test: `public read opens the document url with no secret token` (F11-AC-029a). `public read still treats can edit as a starting mode` (F11-AC-029b). `a public view does not show proposals keys or members` (F11-AC-030a). `a public view does not show audit events` (F11-AC-030b). `public read does not grant a proposal` (F11-AC-037a). `public read does not grant a merge` (F11-AC-037b).
- Size: several modules
- Depends on: F11-T-012
- Modules: the document route and the list guards. While `public_read` is true, a caller with no membership reads `/{project}/{page-path}`. There is no space segment and no secret token. Can view and Can edit still only set the starting mode. Proposals, keys, and members return no rows. Audit events return "Only an owner can read the audit log." A propose or a merge returns "You are not a member of this space.", inserts no proposal, and does not start a merge.

### F11-T-014 Save only as an Owner or an Editor

- Requirements: F11-REQ-031
- Test: `can edit does not let a contributor save` (F11-AC-031a). `can edit does not let a viewer save` (F11-AC-031b). `public read does not grant a save` (F11-AC-031c). `can view does not remove an editor save` (F11-AC-031d). `can edit does not let a signed-out caller save` (F11-AC-031e). `can edit does not let an agent key save` (F11-AC-031f). `an endpoint cannot save from a page link` (F11-AC-031g).
- Size: one module
- Depends on: F11-T-007, and on the revision save (F09-T-019)
- Module: the human save check. Owner and Editor may save, including from Can edit, and Can view does not remove an Editor's save. A Contributor, a Viewer, a caller with no membership, a signed-out caller, an agent key, a grant, an endpoint, a tool, and an OAuth scope each get the `permission_denied` message and hint in F11-REQ-031, and no revision is inserted. This check is not the shipped local save (F09-T-008).

### F11-T-015 Show Members to an Owner

- Requirements: F11-REQ-032, F11-REQ-033, F11-REQ-034, F11-REQ-035
- Test: `only an owner sees the invite form` (F11-AC-032a). `an editor does not see the invite form` (F11-AC-032b). `a stored invite says it expires in 7 days` (F11-AC-033a). `the public link tells the owner it is off` (F11-AC-034a). `the public link tells the owner it is on` (F11-AC-034b). `invite and public link controls meet the coarse target` (F11-AC-035a).
- Size: several modules
- Depends on: F11-T-008, F11-T-012
- Modules: a Members section in Settings. An Owner sees the email field, the four roles, and "Invite". Other roles see the member list and do not see the invite form or pending invites. A stored invite shows "Invite sent. It expires in 7 days." and lists each unused invite with email, role, and expiry. The public-link sentences are the off sentence and the on sentence in F11-REQ-034, and only an Owner sees that control. On a coarse pointer, Invite and that control are at least 44px on the shorter side.
