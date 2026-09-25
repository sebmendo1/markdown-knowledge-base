# F12: Proposals and review

## Summary

Proposals are suggested creates and updates that wait in an Inbox until a person merges, rejects, or requests changes. The loop is not started, so today there is no review UI and no one merges; when roles exist, an Owner or an Editor may merge, and an agent never may.

## Status and scope

Not started. The shipped app has no Inbox, no proposal screen, and no merge control. ADR-0002 is the decision for sign-in: there is no auth yet, and the four roles are the later target. ADR-0001 is the decision for routes: pages are `/{project}/{page-path}`, and a URL has no space segment. This feature is part of the later Ledger loop, not the first release.

This spec covers the proposal lifecycle, the Inbox, the rendered diff, merge, reject, request changes, withdraw, stale marks, edit before merge, and the conflict resolver. It follows Proposed ADR-0021, ADR-0022, ADR-0023, and ADR-0024. The product owner has not confirmed those four records. Validation codes and messages are F06, in `specs/contracts/errors.md`, except the proposal codes defined here. The `proposals` table, the merge transaction, revisions, links, metric-point rows, and the merge audit row are F07. Sign-in screens and session checks are F15. The full keymap contract is F20.

An agent key and an OAuth grant never merge, reject, request changes, or edit before merge. Once roles exist, Owner and Editor may merge, reject, request changes, and edit before merge. A Contributor may propose, update their own proposal after changes are requested, and withdraw their own open proposal. A Viewer may read documents and may not propose or review. Today those roles are not enforced, because the review UI is absent.

The operations the PRD names `propose_change`, `update_proposal`, and `get_proposal` are the lifecycle in this spec. Their JSON schemas, rate limits, and the other tools are F13. Metric charts are F16. This spec does not define either.

## Users and stories

- **F12-US-001** As the owner, I want an Inbox of proposals, so that I can review agent changes in one queue.
- **F12-US-002** As the owner, I want a rendered diff, so that I can read the change as prose.
- **F12-US-003** As the owner, I want to merge, reject, or request changes from the keyboard, so that a review stays on one screen.
- **F12-US-004** As the owner, I want to fix a typo and merge in one step, so that a small mistake does not need another round.
- **F12-US-005** As an agent, I want a find that matches zero or many times to be refused, so that a partial edit never reaches the Inbox.
- **F12-US-006** As a contributor, I want to propose without merging, so that an editor still decides what lands.
- **F12-US-007** As the owner, I want a 30-day-old proposal to stay open and look stale, so that I can still merge or reject it.

## Requirements

- **F12-REQ-001** While the review loop is not built, the system shall show no Inbox, no proposal screen, and no merge, reject, or request-changes control, and shall create no proposal.
- **F12-REQ-002** When a submission passes the checks in this spec and the validator returns no error, the system shall create one proposal with status `open`.
- **F12-REQ-003** If `action` is not `create` or `update`, then the system shall return `action_refused` and shall create no proposal.
- **F12-REQ-004** If `summary` is missing, has length outside 1 to 120 characters, or contains CR or LF, then the system shall return `summary_invalid` and shall create no proposal. A character is one Unicode code point.
- **F12-REQ-005** If a submission has both `content` and `edits`, or has neither, then the system shall return `proposal_body` and shall create no proposal.
- **F12-REQ-006** When an update sends a non-empty `edits` list and every `find` matches exactly once, the system shall apply the pairs in list order to a working copy that starts as the base revision's full Markdown, and shall store the result in `content` with `edits` null.
- **F12-REQ-007** If any pair has an empty `find`, zero matches, or more than one match, then the system shall return `edit_not_unique` and shall create no proposal and shall keep no pair.
- **F12-REQ-008** If `edits` is an empty list, then the system shall return `edits_empty` and shall create no proposal.
- **F12-REQ-009** If a create sends `edits`, then the system shall return `edits_need_update` and shall create no proposal.
- **F12-REQ-010** If an update omits `base_revision_id`, or that id is not a revision of the document at `path`, then the system shall return `base_missing` and shall create no proposal.
- **F12-REQ-011** When a create is stored, the system shall store a null `base_revision_id` and a null `document_id`.
- **F12-REQ-012** If the validator returns an error, then the system shall create no proposal and shall insert no revision.
- **F12-REQ-013** When the validator returns only warnings, the system shall create the proposal, store that result on the proposal, and shall allow merge despite those warnings.
- **F12-REQ-014** The system shall record the author as the agent key and its owning user, or as the human user when there is no agent key. An OAuth grant is recorded with the same agent glyph and label as an agent key.
- **F12-REQ-015** The system shall show each Inbox row with the author, the action word, the path, the summary, the validation badge, the age, and a status dot plus a status word.
- **F12-REQ-016** The system shall filter the Inbox by `Open`, `Changes requested`, and `Closed`, and shall open on `Open`.
- **F12-REQ-017** The system shall show the Inbox open count as the number of proposals whose status is `open` or `changes_requested`.
- **F12-REQ-018** The system shall order the Inbox by the author clock ascending, then by proposal id ascending.
- **F12-REQ-019** The system shall serve the Inbox at `/{project}/inbox` and one proposal at `/{project}/inbox/{id}`, and the first URL segment shall be the project.
- **F12-REQ-020** When `G` is followed by `I` within 1000 ms in the global scope, the system shall open the Inbox.
- **F12-REQ-021** The system shall show, in the proposal header, the summary, the author, the action word, the path, the age, and the validation badge.
- **F12-REQ-022** The system shall show the rendered diff by default. An insertion is highlighted green and underlined. A deletion is red and struck. Color shall not be the only distinction between them.
- **F12-REQ-023** When `D` is pressed in the review scope, the system shall toggle the rendered diff and a line-level source diff.
- **F12-REQ-024** The system shall show changed frontmatter as a table with columns field, before, and after. When both values are numbers, the after cell shall include the delta, after minus before, rendered from those decimal values with no exponent. A positive delta has a leading `+`. A negative delta has a leading `-`.
- **F12-REQ-025** When the action is `create`, the system shall show the document fully rendered with the tag `New`, and the view shall be the whole document.
- **F12-REQ-026** When `rationale` is non-null, the system shall show it under the proposal header.
- **F12-REQ-027** The system shall collapse an unchanged section to one line that shows its heading, and shall expand that section on request. A body with no headings that is entirely unchanged shall collapse to one line, `Unchanged`.
- **F12-REQ-028** The system shall align top-level body blocks by the ADR-0023 rule. Frontmatter is not a block. A list is one block. A blockquote is one block. Words are the matches of `[A-Za-z0-9]+`, lowercased, as a multiset. Similarity is the size of the multiset intersection divided by the size of the multiset union. If both word sets are empty, similarity is 1 when the types are equal and 0 otherwise. A pair is eligible only when the types are equal and the similarity is at least 0.5. Walk the old blocks from first to last, with the new-document cursor starting at -1. For each old block, among unused new blocks of index greater than the cursor that are eligible, pick the highest similarity and then the earliest index. If none qualify, the old block is a deletion. New blocks the cursor skips, and new blocks left at the end, are insertions in their original order.
- **F12-REQ-029** The system shall run the word diff only inside a paired block. An insertion or a deletion shall not be word-diffed against a neighbor.
- **F12-REQ-030** When a diagram or chart block in the document changes, the system shall render before and after with the source diff underneath. Math, callouts, and embeds shall render inside the rendered diff. The Metrics screen is F16.
- **F12-REQ-031** While a proposal's status is `open` or `changes_requested` and at least 720 hours have passed since its author clock, the system shall show `Stale` beside the status dot in the Inbox and on the proposal screen. The author clock is the later of the create time and the last successful `update_proposal`. A review note does not move it.
- **F12-REQ-032** When a stale proposal is stored through `update_proposal`, the system shall clear `Stale` and shall restart the 720-hour count from that store.
- **F12-REQ-033** The system shall keep a stale proposal in the open count and shall allow merge, reject, and request changes on it by the same rules as any proposal of that status.
- **F12-REQ-034** When `update_proposal` is called by the author on a proposal whose status is `changes_requested`, and the new bytes pass validation, the system shall store the new content, set status to `open`, set the author clock to the database time, and keep the review note.
- **F12-REQ-035** When the human author withdraws a proposal whose status is `open`, the system shall set status to `withdrawn` and shall insert no revision.
- **F12-REQ-036** When the reviewer merges a proposal whose status is `open` or `changes_requested`, whose base revision is the current head, and whose bytes have no validation error, the system shall run the F07 merge transaction and shall open the next proposal in the current filter.
- **F12-REQ-037** When the base revision is not the head, the system shall three-way merge the full Markdown as lines. A clean merge shall show `Rebased onto latest` and shall then merge. The merge shall not parse YAML, shall not sort keys, and shall not treat list items as a set.
- **F12-REQ-038** If that line merge conflicts, then the system shall insert no revision, shall show the conflict resolver, and shall return `merge_conflict` until the reviewer merges a non-empty `Resolved` field.
- **F12-REQ-039** When an Owner or Editor rejects a proposal whose status is `open` or `changes_requested`, the system shall set status to `rejected`, store the optional reason, and write one audit event with action `reject`.
- **F12-REQ-040** When an Owner or Editor requests changes, the system shall send that request only after the note has at least one non-whitespace character, and shall set status to `changes_requested` without moving the author clock.
- **F12-REQ-041** When an Owner or Editor edits before merge, the system shall let them change the proposal Markdown on the proposal screen and merge those bytes in the same step. The revision's `author_user_id` shall be the reviewer, and its `agent_key_id` shall be the proposal's agent key. `⌘S` during that edit shall insert no revision.
- **F12-REQ-042** If the caller is an agent key or an OAuth grant, then the system shall return `permission_denied` for merge, reject, request changes, and edit before merge, and shall insert no revision. Merge uses the message `Agents cannot merge.` The other three use `Agents cannot review this proposal.`
- **F12-REQ-043** When sign-in exists, the system shall allow merge, reject, request changes, and edit before merge only for Owner and Editor. A Contributor may create a proposal, update their own proposal in `changes_requested`, and withdraw their own `open` proposal. A Viewer shall not propose or review.
- **F12-REQ-044** When a Contributor submits Propose, the system shall create a proposal and shall insert no revision. When an Owner or Editor saves directly, the system shall insert a revision and shall create no proposal.
- **F12-REQ-045** While the review scope is active, the system shall bind `C` to request changes, `E` to edit before merge, `M` to merge, `R` to reject, `D` to the diff toggle, `J` to the next proposal, and `K` to the previous proposal. `C` shall not create a document. `E` shall not turn on document editing.
- **F12-REQ-046** The system shall give a keypress to the first matching scope in this order: dialog, editor, review, document, global. A single-character shortcut shall not fire while focus is in a text field.
- **F12-REQ-047** When the reviewer merges or rejects, the system shall show the success copy before the server returns, and shall restore the proposal and show the error if the write fails.
- **F12-REQ-048** When a merge succeeds and the current filter has no later row, the system shall open the Inbox on that filter.
- **F12-REQ-049** While a view is public read, the system shall show no Inbox, no proposal, and no open count.
- **F12-REQ-050** When a valid proposal is created, the system shall show its Inbox row within 2 seconds at the 95th percentile in the environment in Limits.
- **F12-REQ-051** The system shall keep `conflicted` and `stale` as marks on status `open` or `changes_requested`. Neither mark is a status value. While the conflicted mark is set, the system shall show `Conflicted` beside the status dot in the Inbox and on the proposal screen.
- **F12-REQ-052** The system shall write no audit event for request changes or withdraw. Reject and merge are the review actions that write an audit event. The merge audit row is the F07 merge transaction.
- **F12-REQ-053** When a proposal is read for its author, the system shall return the status, the review note, and the merged revision id.
- **F12-REQ-054** When `J` or `K` is pressed in the review scope, the system shall move to the next or previous row in the current filter and shall stay on the end row when there is no further row.
- **F12-REQ-055** The system shall keep merge, reject, request changes, edit before merge, and the conflict resolver on the proposal screen. Those flows shall not open a dialog.
- **F12-REQ-056** The system shall show each warning's message and hint on the proposal screen. A warning shall not block merge, reject, or request changes.
- **F12-REQ-057** If `update_proposal` includes no `content`, no `edits`, and no `summary`, then the system shall return `update_empty` and shall leave the proposal unchanged.
- **F12-REQ-058** If an update's path is not a document in the space, then the system shall return `document_missing` and shall create no proposal.
- **F12-REQ-059** If a proposal id matches no row in the space, then the system shall return `proposal_missing`.
- **F12-REQ-060** If the status is `merged`, `rejected`, or `withdrawn`, then the system shall return `merge_closed` for merge and `review_closed` for reject and request changes, and shall leave the row unchanged.
- **F12-REQ-061** If `update_proposal` is sent by a different agent key, a different OAuth grant, or a different user than the author, then the system shall return `proposal_author` and shall leave the row unchanged. This check comes before the status check.
- **F12-REQ-062** If withdraw is sent by an agent key, an OAuth grant, or a user other than the proposal's `author_user_id`, then the system shall return `proposal_author` and shall leave the status unchanged. The owning user of an agent key may withdraw that proposal while it is `open`.

## Acceptance scenarios

### F12-AC-001a

Given the shipped app, when a reader opens a project, then no navigation item is named Inbox, no control is labeled Merge, and no proposal row exists.

### F12-AC-002a

Given a valid create with summary `Log the 8k run` and content that passes validation, when it is submitted, then one proposal has status `open` and that summary.

### F12-AC-002b

Given a submission the validator rejects, when it is submitted, then the proposal count is unchanged.

### F12-AC-003a

Given action `archive`, when it is submitted, then the code is `action_refused`, the message is `Rename, archive, and delete are human actions.`, the hint is `Send create or update.`, and no proposal is created.

### F12-AC-004a

Given a summary of 121 characters, when it is submitted, then the code is `summary_invalid`, the message is `Summary must be one line of at most 120 characters.`, and no proposal is created.

### F12-AC-004b

Given a summary that contains a line feed, when it is submitted, then the code is `summary_invalid` and no proposal is created.

### F12-AC-004c

Given a missing summary, when it is submitted, then the code is `summary_invalid` and the message is `Summary is required.`

### F12-AC-005a

Given both `content` and `edits`, when it is submitted, then the code is `proposal_body`, the message is `Send content or edits, not both.`, and no proposal is created.

### F12-AC-005b

Given neither `content` nor `edits`, when it is submitted, then the code is `proposal_body` and the message is `Send content or edits.`

### F12-AC-006a

Given base Markdown `cat` and pairs `[{find: "c", replace: "b"}, {find: "b", replace: "d"}]`, when the update is stored, then `content` is `dat` and `edits` is null.

### F12-AC-006b

Given base `alpha beta alpha` and one pair whose find is `beta` and whose replace is empty, when the update is stored, then `content` is `alpha  alpha`.

### F12-AC-007a

Given base `alpha beta alpha` and find `alpha`, when the update is submitted, then the code is `edit_not_unique`, the message is `Find matched 2 times: "alpha".`, the hint is `Each find must match exactly once.`, and no proposal is created.

### F12-AC-007b

Given find `missing`, when the only match count is 0, then the message is `Find matched 0 times: "missing".` and no proposal is created.

### F12-AC-007c

Given an empty `find`, when the update is submitted, then the message is `Find is empty: "".` and no pair is stored.

### F12-AC-007d

Given a find of 81 `a` characters that occurs nowhere in the base, when the update is submitted, then the message includes the first 80 `a` characters, the 81st is absent, and no proposal is created.

### F12-AC-007e

Given base `Alpha` and find `alpha`, when the update is submitted, then the match count is 0.

### F12-AC-008a

Given `edits` as an empty list, when it is submitted, then the code is `edits_empty`, the message is `Edits needs at least one pair.`, the hint is `Send a find and replace, or send the full content.`, and no proposal is created.

### F12-AC-009a

Given action `create` and an `edits` list with one unique pair, when it is submitted, then the code is `edits_need_update`, the message is `Edits apply to an update, not a create.`, and no proposal is created.

### F12-AC-010a

Given an update with no `base_revision_id`, when it is submitted, then the code is `base_missing`, the message is `Update needs a base revision.`, the hint is `Send the revision id you read, as base_revision_id.`, and no proposal is created.

### F12-AC-010b

Given a `base_revision_id` from another document, when the update is submitted, then the code is `base_missing` and no proposal is created.

### F12-AC-011a

Given a valid create, when it is stored, then `base_revision_id` is null and `document_id` is null.

### F12-AC-012a

Given content byte-identical to the head, including line endings, when it is submitted as an update, then the code is `no_change`, the message is `Content is identical to the current head.`, and no proposal is created.

### F12-AC-013a

Given a proposal whose only issue is the warning `section_missing`, when it is submitted, then the proposal is `open`, the warning is stored, and merge is still allowed for an Owner.

### F12-AC-014a

Given an agent key labeled `Cursor · MacBook` owned by user 2, when its proposal is stored, then the row has that key, `author_user_id` 2, and the Inbox shows the agent glyph and `Cursor · MacBook`.

### F12-AC-014b

Given an OAuth grant labeled `Muse · Sebastian`, when its proposal is shown, then the row uses the agent glyph and that label.

### F12-AC-015a

Given an open update proposal created 5 minutes ago with no warnings, when the owner opens the Inbox, then the row shows the author, `Update`, the path, the summary, `Valid`, `5m`, a status dot, and the word `Open`.

### F12-AC-016a

Given one `open` proposal, one `changes_requested` proposal, and one `merged` proposal, when the owner selects `Closed`, then only the merged proposal is listed.

### F12-AC-016b

Given the Inbox just opened, when no filter has been chosen, then the filter is `Open` and `changes_requested` rows are absent.

### F12-AC-017a

Given two `open` proposals, one of them stale, and one `changes_requested` proposal, when the sidebar renders, then the Inbox count is 3.

### F12-AC-018a

Given proposal 8 with an earlier author clock than proposal 3, when the Inbox renders, then proposal 8 is above proposal 3.

### F12-AC-019a

Given project `guide` and proposal 42, when the owner opens that proposal, then the path is `/guide/inbox/42`.

### F12-AC-019b

Given the URL `/guide/inbox/42`, when its segments are read, then the first segment is the project `guide` and there is no space-slug segment.

### F12-AC-020a

Given the global scope and focus outside a text field, when `G` and then `I` arrive 500 ms apart, then the Inbox opens.

### F12-AC-020b

Given the global scope, when `I` arrives 1001 ms after `G`, then the Inbox does not open from that chord.

### F12-AC-021a

Given an open proposal with a rationale, when the owner opens it, then the header shows the summary, the author, the action word, the path, the age, and the validation badge.

### F12-AC-022a

Given base body `The cat sat` and proposal body `The dog sat`, when the rendered diff is shown, then `cat` is struck and red, `dog` is green and underlined, and `The` and `sat` are unchanged.

### F12-AC-023a

Given the rendered diff and the review scope, when `D` is pressed, then the view is a line-level source diff. When `D` is pressed again, then the rendered diff is shown.

### F12-AC-024a

Given before `sample_size: 40` and after `sample_size: 42`, and no other frontmatter change, when the frontmatter table renders, then the row is field `sample_size`, before `40`, after `42` with delta `+2`, and unchanged keys are absent.

### F12-AC-024b

Given before `sample_size: 40` and after `sample_size: 30`, when the frontmatter table renders, then the after cell includes delta `-10`.

### F12-AC-025a

Given a create proposal, when it is opened, then the tag is `New` and the body is the full render, with no insertion or deletion marks.

### F12-AC-026a

Given rationale `The 8k window matched the hypothesis.`, when the proposal is opened, then that sentence is under the header.

### F12-AC-026b

Given a null rationale, when the proposal is opened, then no rationale block is shown.

### F12-AC-027a

Given two sections whose headings are `Setup` and `Observations`, and only `Observations` changed, when the rendered diff is shown, then `Setup` is one collapsed line and `Observations` is expanded.

### F12-AC-027b

Given an unchanged body with no headings, when the rendered diff is shown, then the body is one line, `Unchanged`.

### F12-AC-028a

Given old paragraphs `The cat sat` and `Birds fly`, and new paragraphs `Dogs run` and `The cat sat down`, when the diff aligns, then `Dogs run` is an insertion, `The cat sat` pairs with `The cat sat down`, and `Birds fly` is a deletion.

### F12-AC-028b

Given a heading `# The cat sat` and a paragraph `The cat sat`, when the diff aligns, then the two blocks are not a pair.

### F12-AC-028c

Given two empty fenced code blocks of the same type, when the diff aligns, then they pair. Similarity of two empty word sets of the same type is 1.

### F12-AC-028d

Given word multisets `{a, a, b}` and `{a, b, b}` on the same block type, when similarity is computed, then it is 0.5 and the pair is eligible. Given `{a, b}` and `{a, c}`, then similarity is 1/3 and the pair is not eligible.

### F12-AC-029a

Given the pair in F12-AC-028a, when the word diff runs, then `down` is an insertion and `The`, `cat`, and `sat` are not struck. `Dogs run` has no word diff against `Birds fly`.

### F12-AC-030a

Given a changed `chart` fence, when the review screen renders at 900px or wider, then before is on the left, after is on the right, and the source diff is underneath.

### F12-AC-030b

Given a math span, a callout, and an embed that render in the document, when the rendered diff is shown, then each of those three is rendered.

### F12-AC-031a

Given a proposal last updated by its author 30 days and 1 minute ago, and status `open`, when the owner opens the Inbox, then its row shows `Stale` beside the status dot.

### F12-AC-031b

Given an author clock exactly 720 hours before the database clock, when the proposal screen renders, then it shows `Stale`.

### F12-AC-031c

Given an author clock 719 hours and 59 minutes before the database clock, when the Inbox renders, then the row does not show `Stale`.

### F12-AC-031d

Given a stale proposal, when an Editor requests changes with a note, then the row still shows `Stale` and the author clock is unchanged.

### F12-AC-032a

Given a stale proposal in `changes_requested`, when the author `update_proposal` stores new valid content, then `Stale` is absent and the 720-hour count starts at that store.

### F12-AC-033a

Given a stale `open` proposal, when the owner merges it and validation has no error and the base is the head, then a revision is inserted and the open count decreases by 1.

### F12-AC-034a

Given status `changes_requested`, note `Pin the harness.`, and a valid new body from the same agent key, when `update_proposal` stores it, then status is `open`, the body is the new body, and the note is still `Pin the harness.`

### F12-AC-034b

Given status `open`, when the author calls `update_proposal`, then the code is `update_closed`, the message is `Updates are only accepted after changes were requested.`, and the row is unchanged.

### F12-AC-034c

Given a different agent key than the author, when it calls `update_proposal`, then the code is `proposal_author` and the row is unchanged.

### F12-AC-034d

Given an update that fails `field_missing`, when `update_proposal` runs, then the status stays `changes_requested` and the stored content is unchanged.

### F12-AC-035a

Given an `open` proposal whose author is contributor user 5, when user 5 withdraws it, then status is `withdrawn` and the revision count is unchanged.

### F12-AC-035b

Given status `changes_requested`, when the author withdraws, then the code is `withdraw_closed` and the status stays `changes_requested`.

### F12-AC-035c

Given an `open` proposal whose agent key is owned by user 2, when user 2 withdraws it, then status is `withdrawn` and no revision is inserted.

### F12-AC-036a

Given an `open` proposal whose `base_revision_id` is the head, and an Owner, when they press `M` and validation has no error, then one revision exists, the proposal status is `merged`, `merged_revision_id` is that revision, and the next Inbox row in that filter is on screen.

### F12-AC-036b

Given a `changes_requested` proposal whose base is the head, when an Editor merges it, then the proposal becomes `merged`.

### F12-AC-037a

Given base `title: A`, head `title: A`, and proposal `title: C`, and a base id that is not the head, when an Editor merges, then the notice is `Rebased onto latest`, the revision content contains `title: C`, and the keys are not sorted.

### F12-AC-037b

Given base line `title: A`, head line `title: B`, and proposal line `title: C`, when merge runs, then no revision is inserted.

### F12-AC-037c

Given base lines `zebra: 1`, `middle: 1`, and `alpha: 1`, a head that changes only the first line to `zebra: 2`, and a proposal that changes only the third line to `alpha: 2`, when the Editor merges, then the revision contains `zebra: 2`, then `middle: 1`, then `alpha: 2`, in that order.

### F12-AC-037d

Given one list-item line `- one` that the head replaces with `- two` and the proposal replaces with `- three`, when merge runs, then the line merge conflicts and no revision is inserted.

### F12-AC-038a

Given the conflict in F12-AC-037b, when the owner opens the proposal, then the screen shows `Base`, `Current`, and `Proposal`, the banner is `This proposal conflicts with the current head.`, and `Resolved` starts empty.

### F12-AC-038b

Given a conflict and an empty `Resolved` field, when the owner presses `M`, then the code is `merge_conflict`, the message is `This proposal conflicts with the current head.`, the hint is `Resolve it side by side, or request changes so the author resubmits.`, and no revision is inserted.

### F12-AC-038c

Given `Resolved` text that validates, when the owner merges it, then the revision content equals that text, the content has no conflict-marker line, and diff3 is not run on that merge.

### F12-AC-039a

Given an `open` proposal and an Editor, when they press `R` outside a text field, then status is `rejected`, `review_note` is null, and one audit event has action `reject`.

### F12-AC-039b

Given a reject reason `Duplicate of the 4k run.`, when the Editor submits Reject, then `review_note` is that sentence.

### F12-AC-040a

Given the review scope, when the owner presses `C` and the note is empty, then the status stays `open` and the code is `note_required`.

### F12-AC-040b

Given the note `Add the sample size.`, when the owner submits Request changes, then status is `changes_requested`, the note is that sentence, and the author clock is unchanged.

### F12-AC-041a

Given an agent proposal and an Editor who changes `teh` to `the` and merges, when the revision is read, then the content contains `the`, `author_user_id` is the Editor, and `agent_key_id` is the proposal's key.

### F12-AC-041b

Given edit before merge with focus in the proposal text, when `⌘S` is pressed, then no revision is inserted and the head is unchanged.

### F12-AC-042a

Given an agent key, when it merges, then the code is `permission_denied`, the message is `Agents cannot merge.`, the hint is `Agents propose changes. They cannot merge, delete, or administer.`, and no revision is inserted.

### F12-AC-042b

Given an OAuth grant, when it rejects, then the code is `permission_denied`, the message is `Agents cannot review this proposal.`, the hint is `Agents propose changes. They cannot merge, delete, or administer.`, and the status is unchanged.

### F12-AC-043a

Given sign-in and a Contributor, when they merge, then the code is `permission_denied`, the message is `Contributors cannot merge.`, the hint is `Ask an owner or an editor to merge this proposal.`, and no revision is inserted.

### F12-AC-043b

Given sign-in and a Viewer, when they submit a proposal, then the code is `permission_denied`, the message is `Viewers cannot propose.`, and no proposal is created.

### F12-AC-043c

Given sign-in and an Owner, when they merge a valid open proposal whose base is the head, then the proposal is `merged`.

### F12-AC-043d

Given sign-in and a Viewer, when they reject, then the code is `permission_denied`, the message is `You do not have permission to review proposals.`, the hint is `Ask an owner for a role that can review.`, and the status is unchanged.

### F12-AC-044a

Given sign-in and a Contributor, when they submit Propose with a valid file, then one `open` proposal exists and the revision count is unchanged.

### F12-AC-044b

Given sign-in and an Editor, when they save a valid document directly, then a revision is inserted and no proposal is created.

### F12-AC-045a

Given the proposal screen, focus outside a text field, and no dialog, when `C` is pressed, then request changes is started and no document is created.

### F12-AC-045b

Given that same screen, when `E` is pressed, then edit before merge starts and document editing stays off.

### F12-AC-046a

Given a dialog open on the proposal screen, when `M` is pressed, then no merge starts.

### F12-AC-046b

Given focus in the request-changes note, when `C` is pressed, then the field receives the character `c` and the request is not sent by that keypress.

### F12-AC-046c

Given focus in the edit-before-merge field, when `M` is pressed, then the field receives the character `m` and no revision is inserted.

### F12-AC-047a

Given a merge the server will accept, when the owner presses `M`, then `Merged.` is shown before the response arrives, and the proposal then stays `merged`.

### F12-AC-047b

Given a merge the server will refuse, when the owner presses `M`, then the proposal returns to its previous status and the error message and hint are shown.

### F12-AC-048a

Given one open proposal, when the owner merges it, then the Inbox filter `Open` shows the empty copy.

### F12-AC-049a

Given a public read view of the project, when the page renders, then no Inbox, no proposal text, and no open count are shown.

### F12-AC-050a

Given the Limits environment and a valid create, when the row has committed, then the Inbox DOM contains that row within 2 seconds on a 95th-percentile run.

### F12-AC-051a

Given a conflicted stale proposal whose status is `open`, when the owner opens the Inbox, then the status word is `Open` and the row shows `Conflicted` and `Stale` beside the status dot.

### F12-AC-052a

Given a request-changes that is stored, when audit events are listed, then no new event has that proposal as a request-changes action.

### F12-AC-052b

Given a reject, when audit events are listed, then one event has action `reject` and that proposal id.

### F12-AC-053a

Given a merged proposal with note `Ship it.` and merged revision 9, when the author reads it, then the result has status `merged`, review note `Ship it.`, and merged revision id 9.

### F12-AC-054a

Given three open proposals and the second on screen, when `J` is pressed in the review scope, then the third is on screen. When `K` is pressed, then the second is on screen.

### F12-AC-054b

Given the last proposal in the filter, when `J` is pressed, then that same proposal stays on screen.

### F12-AC-055a

Given the conflict resolver, when the screen is inspected, then `Base`, `Current`, `Proposal`, and `Resolved` are on the proposal screen and no dialog is open.

### F12-AC-056a

Given a stored `section_missing` warning, when the proposal screen renders, then the warning message and hint are shown and Merge is available to an Owner.

### F12-AC-057a

Given status `changes_requested` and an `update_proposal` with no content, no edits, and no summary, when the author submits it, then the code is `update_empty`, the message is `Update needs content, edits, or a summary.`, the hint is `Send the revised Markdown, or a new summary.`, and the row is unchanged.

### F12-AC-058a

Given action `update` and a path that matches no document, when it is submitted, then the code is `document_missing`, the message is `No document at that path.`, the hint is `Use create for a new file, or send the path you read.`, and no proposal is created.

### F12-AC-059a

Given no proposal 99 in the space, when a caller reads proposal 99, then the code is `proposal_missing`, the message is `No proposal has that id.`, and the hint is `Open a proposal from the Inbox.`

### F12-AC-060a

Given a `rejected` proposal, when an Editor merges it, then the code is `merge_closed`, the message is `This proposal is not open for merge.`, the hint is `Merge an open proposal, or one with changes requested.`, and the status stays `rejected`.

### F12-AC-060b

Given a `withdrawn` proposal, when an Editor requests changes, then the code is `review_closed`, the message is `This proposal is already closed.`, the hint is `Reject, request changes, and merge apply to an open proposal or one with changes requested.`, and the status stays `withdrawn`.

### F12-AC-061a

Given a `changes_requested` proposal created by agent key 9, when agent key 10 calls `update_proposal`, then the code is `proposal_author`, the message is `Only the author can update this proposal.`, the hint is `Use the same agent key or user that created it.`, and the row is unchanged.

### F12-AC-062a

Given an `open` proposal, when its agent key withdraws it, then the code is `proposal_author`, the message is `Only the author can withdraw this proposal.`, the hint is `The user who submitted it can withdraw it while it is open.`, and the status stays `open`.

## Edge cases and errors

F06 codes keep the messages and hints in `specs/contracts/errors.md`. A validation error on create or on `update_proposal` leaves the stored proposal unchanged and inserts no revision. `base_missing` and `no_change` are those F06 codes. `merge_closed` is the F07 code, with the F07 message and hint, when merge is asked of a proposal whose status is not `open` or `changes_requested`.

`find` is a case-sensitive substring. Whitespace counts. Matches are non-overlapping and scanned from the left. Each match consumes the length of `find`. `replace` may be empty, and that match is deleted. The message includes `find` truncated to 80 characters. A character is one Unicode code point. The field is `edits.{n}.find`, with `{n}` the 1-based pair index.

The author clock uses the database clock. Reviewer writes set `reviewed_at` and do not set the author clock. `update_proposal` sets the author clock only when the update is stored.

| Case | Code | Message | Hint |
| --- | --- | --- | --- |
| Action is not `create` or `update` | `action_refused` | `Rename, archive, and delete are human actions.` | `Send create or update.` |
| Summary missing or empty | `summary_invalid` | `Summary is required.` | `Send one line, from 1 to 120 characters.` |
| Summary longer than 120 characters, or CR or LF | `summary_invalid` | `Summary must be one line of at most 120 characters.` | `Send one line, from 1 to 120 characters.` |
| Both `content` and `edits`, or neither, on create | `proposal_body` | `Send content or edits, not both.` or `Send content or edits.` | `Use full Markdown in content, or a list of find and replace pairs.` |
| `find` empty | `edit_not_unique` | `Find is empty: "".` | `Each find must match exactly once.` |
| `find` matches 0 times | `edit_not_unique` | `Find matched 0 times: "{find}".` | `Each find must match exactly once.` |
| `find` matches more than once | `edit_not_unique` | `Find matched {count} times: "{find}".` | `Each find must match exactly once.` |
| `edits` is `[]` | `edits_empty` | `Edits needs at least one pair.` | `Send a find and replace, or send the full content.` |
| Create sends `edits` | `edits_need_update` | `Edits apply to an update, not a create.` | `Send content for a create, or send action update with a base revision.` |
| Update path is not a document | `document_missing` | `No document at that path.` | `Use create for a new file, or send the path you read.` |
| Unknown proposal id | `proposal_missing` | `No proposal has that id.` | `Open a proposal from the Inbox.` |
| `update_proposal` when status is not `changes_requested` | `update_closed` | `Updates are only accepted after changes were requested.` | `Wait for a reviewer to request changes, or submit a new proposal.` |
| `update_proposal` with no content, edits, or summary | `update_empty` | `Update needs content, edits, or a summary.` | `Send the revised Markdown, or a new summary.` |
| `update_proposal` from a different key, grant, or user | `proposal_author` | `Only the author can update this proposal.` | `Use the same agent key or user that created it.` |
| Withdraw from a different user, an agent key, or an OAuth grant | `proposal_author` | `Only the author can withdraw this proposal.` | `The user who submitted it can withdraw it while it is open.` |
| Withdraw when status is not `open` | `withdraw_closed` | `Only an open proposal can be withdrawn.` | `Withdraw before a reviewer requests changes, or wait for a decision.` |
| Merge of a closed proposal | `merge_closed` | `This proposal is not open for merge.` | `Merge an open proposal, or one with changes requested.` |
| Reject or request changes on a closed proposal | `review_closed` | `This proposal is already closed.` | `Reject, request changes, and merge apply to an open proposal or one with changes requested.` |
| Merge while the line merge conflicts and `Resolved` is empty | `merge_conflict` | `This proposal conflicts with the current head.` | `Resolve it side by side, or request changes so the author resubmits.` |
| Request changes with an empty or whitespace note | `note_required` | `Request changes needs a note.` | `Write what should change. The request is not sent while the note is empty.` |
| Agent key or OAuth grant merges | `permission_denied` | `Agents cannot merge.` | `Agents propose changes. They cannot merge, delete, or administer.` |
| Agent key or OAuth grant rejects, requests changes, or edits before merge | `permission_denied` | `Agents cannot review this proposal.` | `Agents propose changes. They cannot merge, delete, or administer.` |
| Contributor merges, rejects, requests changes, or edits before merge | `permission_denied` | `Contributors cannot merge.` | `Ask an owner or an editor to merge this proposal.` |
| Viewer proposes or reviews | `permission_denied` | `Viewers cannot propose.` or `You do not have permission to review proposals.` | `Ask an owner for a role that can propose.` or `Ask an owner for a role that can review.` |
| No session on a review write, once sign-in exists | `permission_denied` | `You do not have permission to review proposals.` | `Sign in as an owner or an editor.` |

`{find}` is the find string truncated to 80 characters. `{count}` is the integer match count.

A create whose path or slug is already taken returns the F06 code `path_invalid` or `slug_taken` and creates no proposal. A merge of a create whose path was taken after the proposal opened returns that same code, leaves the proposal `open` or `changes_requested`, and inserts no document.

`R` outside a text field rejects at once with a null reason. A reason is sent only from the Reject control. `C` focuses the note and does not send. The Request changes control sends when the trimmed note is non-empty.

Edit before merge of a proposal whose base is not the head runs the line merge against the edited bytes. A clean result merges with `Rebased onto latest`. A conflict stays on the resolver and inserts no revision.

A conflicted proposal stays in its status. The mark is derived when the proposal is read: the line merge of base, head, and the stored content conflicts. `update_proposal` clears the mark when the new content merges cleanly onto the head. It can remain conflicted when the new content still conflicts.

Terminal statuses are `merged`, `rejected`, and `withdrawn`. They accept no merge, reject, request changes, edit before merge, or `update_proposal`.

The Propose control's label is F09. This spec owns the proposal that control creates.

## Limits and budgets

A character is one Unicode code point. A day in the stale rule is 24 hours. 30 days are 720 hours.

| Limit | Value |
| --- | --- |
| Stale threshold | 720 hours from the author clock. Exactly 720 hours is stale. 719 hours and 59 minutes is not |
| Stale clock | Database clock, compared at read time. Not started |
| Summary | 1 to 120 characters, no CR and no LF |
| Rationale | No maximum is set |
| Review note | No maximum is set. A request-changes note needs at least 1 non-whitespace character. A reject reason may be absent |
| Find text in an error | First 80 characters |
| Jaccard threshold | 0.5, inclusive, on the word-multiset index in F12-REQ-028 |
| Word pattern | `[A-Za-z0-9]+`, lowercased, as a multiset |
| Document size | 204800 bytes (200 KB, 200 × 1024), UTF-8, from F06. This spec does not raise it |
| `G` then `I` | `I` within 1000 ms of `G` |
| Inbox appearance | 2 seconds at the 95th percentile. The clock starts when the proposal insert commits and stops when that row is in the Inbox DOM. Environment: the review app server with Postgres, one space, 100 existing open proposals, one create, no other review action, desktop viewport 1280 × 800 CSS pixels. Not started |
| Review time | Median under 2 minutes of reviewer time for one experiment proposal, from opening it to merge or reject, with the reviewer at the keyboard on the proposal screen. Instrumentation of that median is out of scope |
| Coarse-pointer targets | At least 44px on Merge, Request changes, Reject, and Edit before merge |
| Open proposals per key, and request rate | F13. This spec does not set those caps |

## UI states

Copy is the same at a desktop viewport of 860px or wider and at a phone viewport of 420px or narrower. There is no illustration. Loading is a skeleton of the Inbox rows or of the proposal header and diff, with the accessible name below. Status is a dot plus a word. Agent authors show a glyph plus the key or grant label.

At 860px and wider, an Inbox row keeps author, action, path, summary, validation, age, and status on one line. At 420px and narrower, the row stacks summary, status word, and age, then author, action, and path. At 900px and wider, a changed diagram or chart is side by side and the conflict panes `Base`, `Current`, and `Proposal` are side by side. Below 900px, before is above after, and the panes stack in the order Base, Current, Proposal. `Resolved` is below the panes at both widths.

Review actions are buttons on the proposal screen. They are not dialogs. Shortcut help, search, settings, and share may be dialogs over the screen, and while one is open the review keys do not fire.

### Inbox

| State | Copy |
| --- | --- |
| Empty, filter `Open` | `No proposals. Connect an agent in Settings → Agent keys.` |
| Empty, filter `Changes requested` | `No proposals are waiting on changes.` |
| Empty, filter `Closed` | `No closed proposals.` |
| Loading | `Loading proposals…` |
| Error | `The Inbox did not load.` Then the hint `Reload the page.` |
| Partial, filter hides other statuses | The filter name, then the rows of that filter |
| Success, rows present | No extra sentence. Each row shows its status word |

The sidebar item is `Inbox` plus the open count, including `Inbox 0`.

### Proposal

| State | Copy |
| --- | --- |
| Empty, create | Tag `New`, then the full document. No diff marks |
| Loading | `Loading proposal…` |
| Error | The error message, then the hint |
| Partial, warnings | `Valid, with warnings.` Then each warning message and hint |
| Partial, conflict | `This proposal conflicts with the current head.` Panes `Base`, `Current`, and `Proposal`. Field `Resolved` |
| Partial, stale | `Stale` beside the status dot. The status word stays `Open` or `Changes requested` |
| Success, merged | `Merged.` |
| Success, rebased and merged | `Rebased onto latest` Then `Merged.` |
| Success, rejected | `Rejected.` |
| Success, changes requested | `Changes requested.` |
| Success, withdrawn | `Withdrawn.` |
| Success, valid update | Badge `Valid` |
| Success, clean proposal with no warnings | Badge `Valid` |

Action words are `Create` and `Update`. Status words are `Open`, `Changes requested`, `Merged`, `Rejected`, and `Withdrawn`. The validation badge is `Valid` or `Warnings`. Age since `created_at` is `just now` while the elapsed time is under 60 seconds. From 60 seconds up to, and not including, 3600 seconds, it is `{n}m` with `{n}` the whole minutes. From 3600 seconds up to, and not including, 48 hours, it is `{n}h` with `{n}` the whole hours. From 48 hours upward, it is `{n}d` with `{n}` the whole days.

Controls are labeled `Merge`, `Request changes`, `Reject`, and `Edit before merge`. The note field and the reason field are inline. The request-changes note starts empty. The reject reason starts empty.

## Out of scope

- MCP and REST schemas, tool descriptions, rate limits, the 20-open-proposal cap, and OAuth token lifetimes (F13, F14). ADR-0025 states the grant limits for F13.
- Metric charts, the Metrics screen, baselines, and comparability (F16). The F07 merge transaction writes `metric_points`. This spec does not draw them.
- The frontmatter field catalog and the rule messages already in `specs/contracts/errors.md` (F06), other than the codes in Edge cases.
- The `proposals` table, revision immutability, and the merge transaction's SQL (F07). This spec says when that transaction runs and what the reviewer sees.
- The editor, the Propose button's placement, and the human-save conflict screen (F09). A contributor's Propose creates a proposal by F12-REQ-044.
- Sign-in screens, invites, and session cookies (F15). Role checks for when sign-in exists are in this spec.
- The keymap file and the document, editor, and global bindings beyond the review keys named here (F20).
- Design tokens for green, red, and the status dot (F21).
- `design.md` and `tasks.md` for this feature.
- Delete, archive, and member administration. Agents never receive those powers. The refusals live on F07 and F15.

## Open questions

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| F12-Q-001 | Does the stale clock move when a reviewer writes a note? | No. It moves only when the author creates the proposal or a successful `update_proposal` stores. Reviewer notes do not count. This spec follows that answer. | Product owner | A change to F12-REQ-031 and F12-REQ-032 if the owner decides notes count |

ADR-0021, ADR-0022, ADR-0023, and ADR-0024 are Proposed. This spec follows them. They are not open questions here. ADR-0002 is Accepted: there is no auth yet, and the four roles are the later target.

## Trace

PRD anchors in `specs/source/ledger-prd.md` on `cursor/rebuild-prd-tables-f4c0`:

- `<!-- prd:summary -->` — agents propose, and a person merges.
- `<!-- prd:product-principles -->` — agents propose, humans merge. Ledger stores, validates, diffs, versions, and displays.
- `<!-- prd:users -->` — the owner reviews proposals. Agents propose.
- `<!-- prd:goals-for-v1 -->` — reviewing a proposal takes under two minutes.
- `<!-- prd:success-metrics -->` — median time from proposal to merge or reject under 2 minutes of review time.
- `<!-- prd:core-concepts -->` — a proposal is a suggested create or update. An agent key cannot merge.
- `<!-- prd:review-and-merge -->` — Inbox, rendered diff, `M`, `R`, `C`, and the next proposal after merge.
- `<!-- prd:saving -->` — Contributors see Propose instead of Save.
- `<!-- prd:screens -->` — Inbox and Proposal routes and columns. The live route shape is ADR-0001, not `/memento`.
- `<!-- prd:empty-states -->` — the Inbox empty sentence.
- `<!-- prd:charts-in-review -->` — a changed diagram or chart, and math, callouts, and embeds in the rendered diff.
- `<!-- prd:proposals-and-review -->` through `<!-- prd:on-merge -->` — lifecycle, contents, review screen, diff engine, conflicts, and the merge transaction.
- `<!-- prd:tools -->` — `propose_change`, `get_proposal`, and `update_proposal`. No tool merges.
- `<!-- prd:limits -->` — a proposal identical to the head is `no_change`. The per-key caps are F13.
- `<!-- prd:validation -->` and `<!-- prd:validation-behavior -->` — errors block a proposal. Warnings show on the review screen.
- `<!-- prd:roles -->`, `<!-- prd:agent-keys -->`, `<!-- prd:oauth-grants -->` — who may merge, and the agent glyph on OAuth proposals.
- `<!-- prd:sharing -->` — merges and rejects write an audit event. A public read view does not show proposals.
- `<!-- prd:data-model -->` — the proposal columns.
- `<!-- prd:invariants -->` — a merge is one of the two writers of a revision.
- `<!-- prd:interaction-rules -->` — keyboard lists, agent glyph, status dot plus a word, skeletons, optimistic merge and reject.
- `<!-- prd:keyboard-shortcuts -->` — `G I`, `M`, `R`, `C`, `D`, `J`, and `K`.
- `<!-- prd:acceptance-milestones-1-4 -->` — the proposal appears in the Inbox within 2 seconds. Merging creates a revision. An agent key cannot merge.
- `<!-- prd:open-questions -->` — humans with the Editor role do not go through proposals. D7 and ADR-0002.

Decisions in `specs/source/decisions-and-changes.md`: D3 (no auth yet), D6 (markdown-kb, no space segment in the URL), D7 (Owner and Editor save directly, Contributors propose, agents never merge).

Change requests: none of C1 through C9 replace the review loop. C8 is the share sheet. ADR-0009 keeps review off dialogs.

ADRs: ADR-0001, ADR-0002, ADR-0009, ADR-0011, ADR-0021, ADR-0022, ADR-0023, ADR-0024.

Plan section 5 is the stale example this spec uses for F12-REQ-031, F12-REQ-032, F12-REQ-033, and F12-AC-031a. Plan section 2.3 is the gap list those four Proposed ADRs close.

Depends on F06 and F07. The keymap scopes are also F20. Role storage is F15.
