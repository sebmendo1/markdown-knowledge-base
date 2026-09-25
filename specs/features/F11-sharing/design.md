# F11 design

Written against `spec.md` in this folder, from `origin/cursor/spec-invites-public-link-5902`. That branch is not merged.

F11-REQ-001 through F11-REQ-015 are the sheet in the tree, including the rule that this release shows no invite. F11-REQ-016 through F11-REQ-037 are not in the tree. They apply once sign-in exists. They do not replace the page link.

## Shipped modules

| Module | Role |
| --- | --- |
| `components/share-host.tsx` | The share dialog |
| `components/document-chrome.tsx` | The Share control, and the page state passed into the sheet |
| `components/workspace.tsx` | Applies `edit=0` or `edit=1`, then removes it |
| `components/draft-store.ts` | The mode that parameter sets |
| `app/share.css` | Dialog width |

## Shipped data and state

```ts
type Access = "view" | "edit";

type ShareDetail = {
  title: string;
  path: string;
  state: "repo" | "edited" | "created" | "missing";
};
```

The dialog opens when a page is open and the owner activates Share. It is labeled `Share {title}` and the heading is `Share “{title}”`. The label is "Anyone with the link". The sentence is "The link opens this page. Choose whether it starts in viewing or editing."

Can view and Can edit are one choice. Can view is selected when this page has no stored choice. The choice is stored on this machine at `markdown-kb:access:{path}`. Changing it does not read or write a role, a membership, or a permission.

The link is the current page URL, with the fragment removed and `edit` set to `0` for Can view or `1` for Can edit. On load, `edit=1` starts editing and `edit=0` starts viewing, and the parameter is removed. That is the same load step as F09-REQ-005.

Extra notes, and only these:

| Page state | Note |
| --- | --- |
| Edited in this browser | "Your edits live in this browser. The link opens the repository copy." |
| Created in this browser | "This page lives in this browser. Others who open the link won’t see it. Export it to share the file." |
| Repository copy | No note beyond the "Anyone with the link" sentence |

Copy link, on success, changes the control to "Copied". If the clipboard write and the fallback copy both fail, the control stays "Copy link" and no error is shown. "Close share", Escape, and the overlay close the dialog.

Wider than 640px, the dialog is at most 480px wide. At 640px or narrower, it is the viewport width minus 16px.

While sign-in is not built, the dialog stays this sheet. It shows no email field, no invite role, no Members section, and no public read-only space link.

## Not started

These types and tables are not in the tree. They do not change the shipped sheet.

```ts
type Role = "owner" | "editor" | "contributor" | "viewer";

type Invite = {
  email: string;       // stored lowercase
  space: string;
  role: Role;
  created_at: string;  // expiry is created_at plus 168 hours
  revoked_at: string | null;
  used_at: string | null;
};

type SpaceAccess = {
  public_read: boolean; // false when the space is created
};
```

One unused invite per lowercase email and space. Storing a new one revokes the older unused invite in the same action. Screen names are Owner, Editor, Contributor, and Viewer.

| Caller | Invite or public-link change | Save |
| --- | --- | --- |
| Owner | Allowed | Allowed, including from a page opened with Can edit |
| Editor | `permission_denied`, "Only an owner can manage members." or "Only an owner can change the public read-only link." | Allowed. Can view does not remove it |
| Contributor | `permission_denied`, the member message | `permission_denied`, "Contributors propose changes. They do not save directly." No revision |
| Viewer, or no membership | `permission_denied`, "You are not a member of this space." or the read message when `public_read` is false | `permission_denied`, "You do not have permission to change this document." |
| Signed out | The same non-member messages | The same change message, hint "Sign in as an owner or an editor." |
| Agent key or grant | `permission_denied`, "Agents cannot merge, delete, or administer." | `permission_denied`, "Agents propose changes. They do not save directly." |
| Endpoint, tool, or OAuth scope | The same agent refusal, with the hint that merge, delete, and administer are not on that surface | `permission_denied`, edit-directly is a human session action |

Accept shows the invited role and "Accept invite" only to the signed-in person with that email, and only while the invite is unused and unexpired. Accept sets that user's one membership to the invited role and does not insert a second. A second accept changes nothing. After 168 hours the code is `invite_expired`. A different email is `invite_email`. A revoked or used invite is `invite_revoked`. Each code has the message and hint in the requirement, and none of them insert or change a membership.

`public_read` starts false. While it is false, a caller with no membership gets `permission_denied`, "You do not have permission to read this space.", and does not see the document body. The page link is not a membership. While it is true, a caller with no membership may read documents at `/{project}/{page-path}`. That URL is the public read-only link. It adds no space segment and it is not a secret token. Can view and Can edit on that URL still only set the starting mode.

A caller with no membership does not see proposals, agent keys, or members, and those lists return no rows, with `permission_denied` and "You are not a member of this space." Audit events return `permission_denied`, "Only an owner can read the audit log.", and no rows. A propose or a merge from that caller, including when `public_read` is true, returns the same non-member refusal, inserts no proposal, and does not start a merge.

The Members section is in Settings, and only once sign-in exists. An Owner sees an email field, the four roles, and "Invite". An Editor, a Contributor, and a Viewer see the member list and do not see the invite form or pending invites. A stored invite shows "Invite sent. It expires in 7 days." and each unused invite lists its email, role, and expiry. The public control is visible only to an Owner: "Off. Only members can read this space." or "On. Anyone with the link can read. They cannot edit, and they cannot see proposals, keys, or members." On a coarse pointer, Invite and that control are at least 44px on the shorter side.

The page share dialog stays F11-REQ-001 through F11-REQ-014. Invites and the public link do not replace "Anyone with the link".

Invalid invite input, before any row is stored:

| Condition | Code | Message |
| --- | --- | --- |
| Email empty, longer than 254 characters, or not one line | `email_invalid` | "Enter one email address of at most 254 characters." |
| Role not one of the four stored values | `role_invalid` | "The role must be owner, editor, contributor, or viewer." |

## Contracts

The share dialog width and the 44px coarse target are in [`specs/contracts/tokens.md`](../../contracts/tokens.md). Escape on the share sheet is in [`specs/contracts/keymap.md`](../../contracts/keymap.md), dialog scope. The invite table is a schema change against the database contract from F07. It is not in the tree. Roles come from F15. This design does not invent a session.
