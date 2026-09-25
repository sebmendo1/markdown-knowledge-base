# F11 Sharing

## Summary

Sharing lets the owner copy a link to the open page and choose whether that link starts in viewing or in editing. The choice grants no role and no permission.

## Status and scope

Partly built. This spec covers the Share control, the share sheet, the page link, and the `edit` parameter that sets the starting mode.

Not started, and not required here: email invites, roles, a public read link for a whole space, invite expiry, and audit events. The PRD "Sharing" section is that later work.

PLAN section 2.2 matches the sheet that shipped: "Anyone with the link", with Can view and Can edit setting the starting mode and granting no rights.

Browser checks named below were run on 25 Sep 2026 in headless Chrome against the local dev server (`KB_LOCAL=1 next dev`), unless the scenario says manual.

## Users and stories

No sign-in exists (decision D3). Anyone who can open a page may open Share and may open a copied link. Can view and Can edit do not create a viewer or an editor. There is no refusal for a missing role, because no role is checked.

- F11-ST-001 As the owner, I want a link to this page, so that I can send someone the page I am reading.
- F11-ST-002 As the owner, I want the link to start in viewing or editing, so that the next open matches how I want to hand it over.
- F11-ST-003 As the owner, I want that choice to stay a starting mode, so that a link cannot grant a right the product does not have.

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

## Edge cases and errors

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Page was edited in this browser | none shown | "Your edits live in this browser. The link opens the repository copy." | none shown |
| Page was created in this browser | none shown | "This page lives in this browser. Others who open the link won’t see it. Export it to share the file." | export is named in the message; no separate hint |
| Copy succeeds | none shown | the control reads "Copied" | none |
| Copy fails | none shown | the control stays "Copy link" | none shown |
| Stored choice is not `edit` | none shown | Can view is selected | none shown |
| `edit` is neither `1` nor `0` | none shown | the mode is unchanged | none |

Invites, unknown emails, and expired links have no message because those flows are not started.

## Limits and budgets

| Item | Value | Where |
| --- | --- | --- |
| Dialog, wider than 640px | up to 480px wide, inset 32px from the viewport width | stylesheet; seen at 1280px |
| Dialog, 640px and below | viewport width minus 16px | measured 374px at 390px |
| Query values | `edit=0` or `edit=1` | measured |
| Storage | one value, `view` or `edit`, per `{project}/{path}` | key `markdown-kb:access:{project}/{path}` |
| Rights granted | none | no role record is written |
| Invite expiry | not started | PRD "Sharing" says 7 days; this sheet has no invite |
| No latency budget | the link is built on the client when the dialog renders | not timed |

## UI states

| State | Desktop, wider than 860px | Phone, 390px wide |
| --- | --- | --- |
| Success, repository page | "Share “{title}”". "Anyone with the link". "The link opens this page. Choose whether it starts in viewing or editing." Can view and Can edit. The link field. "Copy link", or "Copied" after a successful copy. | Same copy. Dialog 374px wide at 390px. |
| Success, edited page | The success copy plus "Your edits live in this browser. The link opens the repository copy." | Same copy. Not opened in the browser check. |
| Success, created page | The success copy plus "This page lives in this browser. Others who open the link won’t see it. Export it to share the file." | Same copy. Not opened in the browser check. |
| Empty | The sheet has no empty list. Share is absent when no page is open. | Same. |
| Loading | The link is filled when the dialog opens. There is no loading sentence. | Same. |
| Error, copy failed | Control stays "Copy link". No error sentence. | Same. Not forced in the browser check. |

## Out of scope

- Email invites, the four roles, a public space link, 7-day expiry, and audit events (PRD "Sharing", "Auth, permissions and sharing"). Not started.
- What Can edit will mean after sign-in, except the open question below.
- The editor that the `edit` parameter starts (F09).
- Export of a browser-created page. The created-page note names it; the export flow is not this spec.

## Open questions

- F11-Q-001 Owner. When sign-in exists, does Can edit on a link grant edit rights? Recommended answer, PLAN question Q3: the link stays a starting mode. Edit rights come only from a role, through invites. Blocks F15 and the rest of F11.
- F11-Q-002 Owner. Should a link to a browser-only page fail with an error instead of copying a URL that will not show the page? Recommended answer: keep the note in F11-REQ-009 until export or sync can carry the page.

## Trace

- PRD "Sharing": invite by email with a role, invites expire after 7 days, optional public read-only link per space off by default. Those items are not started.
- Change request C8: the share sheet, "Anyone with the link", Can view or Can edit, and Copy link. The link sets the starting mode and grants no rights.
- Decision D3: no auth yet, which is why the sheet cannot grant a role.
- PLAN section 2.2, sharing row, and PLAN question Q3.
- No ADR is written yet.
