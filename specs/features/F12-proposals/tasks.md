# F12 tasks: Proposals and review

Steps are in dependency order. Each step names the requirements it satisfies, the test that proves it, and a size. Sizes are `one module`, `several modules`, or `a schema change`.

Tests live under `lib/review/*.test.ts` and run with `tsx --test`. A test name is the acceptance id from `spec.md`. UI tests render the review components with the flag on, at 860px and at 420px where the spec gives both widths.

`LEDGER_REVIEW` is unset for F12-T01 and set for every later test.

## F12-T01 Keep the review loop off

- Depends on: none
- Size: one module
- Requirements: F12-REQ-001
- Test: `lib/review/flag.test.ts` proves F12-AC-001a

## F12-T02 Add author clock and grant id

- Depends on: none
- Size: a schema change
- Requirements: F12-REQ-011, F12-REQ-014, F12-REQ-031
- Test: `lib/review/schema.test.ts` proves F12-AC-011a, F12-AC-014a, and F12-AC-031d (a review note leaves `author_clock` unchanged)

Adds `proposals.author_clock` and nullable `proposals.oauth_grant_id` on the F07 `proposals` table. A check allows at most one of `agent_key_id` and `oauth_grant_id`.

## F12-T03 Bind review keys

- Depends on: none
- Size: one module
- Requirements: F12-REQ-020, F12-REQ-045, F12-REQ-046, F12-REQ-054
- Test: `lib/review/keys.test.ts` proves F12-AC-020a, F12-AC-020b, F12-AC-045a, F12-AC-045b, F12-AC-046a, F12-AC-046b, F12-AC-046c, F12-AC-054a, and F12-AC-054b

## F12-T04 Align blocks and word-diff pairs

- Depends on: none
- Size: one module
- Requirements: F12-REQ-022, F12-REQ-028, F12-REQ-029
- Test: `lib/review/block-diff.test.ts` proves F12-AC-022a, F12-AC-028a, F12-AC-028b, F12-AC-028c, F12-AC-028d, and F12-AC-029a

## F12-T05 Apply find-and-replace edits

- Depends on: F12-T02
- Size: one module
- Requirements: F12-REQ-006, F12-REQ-007, F12-REQ-008, F12-REQ-009
- Test: `lib/review/apply-edits.test.ts` proves F12-AC-006a, F12-AC-006b, F12-AC-007a, F12-AC-007b, F12-AC-007c, F12-AC-007d, F12-AC-007e, F12-AC-008a, and F12-AC-009a

## F12-T06 Merge lines three ways

- Depends on: none
- Size: one module
- Requirements: F12-REQ-037
- Test: `lib/review/line-merge.test.ts` proves F12-AC-037a, F12-AC-037b, F12-AC-037c, and F12-AC-037d

## F12-T07 Diff frontmatter and fold sections

- Depends on: F12-T04
- Size: one module
- Requirements: F12-REQ-024, F12-REQ-027
- Test: `lib/review/frontmatter-diff.test.ts` proves F12-AC-024a, F12-AC-024b, F12-AC-027a, and F12-AC-027b

## F12-T08 Submit a proposal

- Depends on: F12-T02, F12-T05
- Size: one module
- Requirements: F12-REQ-002, F12-REQ-003, F12-REQ-004, F12-REQ-005, F12-REQ-010, F12-REQ-011, F12-REQ-012, F12-REQ-013, F12-REQ-058
- Test: `lib/review/submit.test.ts` proves F12-AC-002a, F12-AC-002b, F12-AC-003a, F12-AC-004a, F12-AC-004b, F12-AC-004c, F12-AC-005a, F12-AC-005b, F12-AC-010a, F12-AC-010b, F12-AC-011a, F12-AC-012a, F12-AC-013a, and F12-AC-058a

F12-AC-012a is the F06 `no_change` refusal this module returns before insert.

## F12-T09 Refuse closed proposals

- Depends on: F12-T02
- Size: one module
- Requirements: F12-REQ-060
- Test: `lib/review/closed.test.ts` proves F12-AC-060a and F12-AC-060b

## F12-T10 Record the author

- Depends on: F12-T02, F12-T08
- Size: one module
- Requirements: F12-REQ-014
- Test: `lib/review/author.test.ts` proves F12-AC-014a and F12-AC-014b

## F12-T11 Read a proposal for its author

- Depends on: F12-T10
- Size: one module
- Requirements: F12-REQ-053, F12-REQ-059
- Test: `lib/review/read.test.ts` proves F12-AC-053a and F12-AC-059a

## F12-T12 Resolve a conflict

- Depends on: F12-T06
- Size: one module
- Requirements: F12-REQ-038
- Test: `lib/review/conflict.test.ts` proves F12-AC-038a, F12-AC-038b, and F12-AC-038c

## F12-T13 Derive stale and conflicted marks

- Depends on: F12-T02, F12-T06
- Size: one module
- Requirements: F12-REQ-031, F12-REQ-051
- Test: `lib/review/marks.test.ts` proves F12-AC-031a, F12-AC-031b, F12-AC-031c, F12-AC-031d, and F12-AC-051a

## F12-T14 Update a proposal

- Depends on: F12-T11
- Size: one module
- Requirements: F12-REQ-032, F12-REQ-034, F12-REQ-057, F12-REQ-061
- Test: `lib/review/update.test.ts` proves F12-AC-032a, F12-AC-034a, F12-AC-034b, F12-AC-034c, F12-AC-034d, F12-AC-057a, and F12-AC-061a

The author check in F12-REQ-061 runs before the status check.

## F12-T15 Withdraw a proposal

- Depends on: F12-T11
- Size: one module
- Requirements: F12-REQ-035, F12-REQ-062
- Test: `lib/review/withdraw.test.ts` proves F12-AC-035a, F12-AC-035b, F12-AC-035c, and F12-AC-062a

## F12-T16 Reject and request changes

- Depends on: F12-T09, F12-T11
- Size: one module
- Requirements: F12-REQ-039, F12-REQ-040, F12-REQ-052
- Test: `lib/review/review-actions.test.ts` proves F12-AC-039a, F12-AC-039b, F12-AC-040a, F12-AC-040b, F12-AC-052a, and F12-AC-052b

## F12-T17 Merge

- Depends on: F12-T08, F12-T12, F12-T13
- Size: several modules
- Requirements: F12-REQ-033, F12-REQ-036
- Test: `lib/review/merge.test.ts` proves F12-AC-033a, F12-AC-036a, and F12-AC-036b

The F07 merge transaction inserts the revision and the merge audit row. This module decides that the transaction may start.

## F12-T18 Edit before merge

- Depends on: F12-T06, F12-T17
- Size: several modules
- Requirements: F12-REQ-041
- Test: `lib/review/edit-before-merge.test.ts` proves F12-AC-041a and F12-AC-041b

## F12-T19 Check who may propose and review

- Depends on: F12-T08, F12-T14, F12-T15, F12-T16, F12-T17, F12-T18
- Size: one module
- Requirements: F12-REQ-042, F12-REQ-043, F12-REQ-044
- Test: `lib/review/permissions.test.ts` proves F12-AC-042a, F12-AC-042b, F12-AC-043a, F12-AC-043b, F12-AC-043c, F12-AC-043d, F12-AC-044a, and F12-AC-044b

When `LEDGER_AUTH` is unset, role rows are not consulted. Agent keys and grants still receive F12-REQ-042.

## F12-T20 Query the Inbox

- Depends on: F12-T13
- Size: one module
- Requirements: F12-REQ-015, F12-REQ-016, F12-REQ-017, F12-REQ-018
- Test: `lib/review/inbox.test.ts` proves F12-AC-015a, F12-AC-016a, F12-AC-016b, F12-AC-017a, and F12-AC-018a

## F12-T21 Render creates, charts, and diagrams

- Depends on: F12-T04
- Size: several modules
- Requirements: F12-REQ-025, F12-REQ-030
- Test: `components/review/rendered-diff.test.ts` proves F12-AC-025a, F12-AC-030a, and F12-AC-030b

## F12-T22 Serve Inbox routes

- Depends on: F12-T20
- Size: several modules
- Requirements: F12-REQ-019
- Test: `lib/review/routes.test.ts` proves F12-AC-019a and F12-AC-019b

## F12-T23 Hide proposals on a public read view

- Depends on: F12-T20
- Size: one module
- Requirements: F12-REQ-049
- Test: `lib/review/inbox.test.ts` proves F12-AC-049a

## F12-T24 Show a new row within 2 seconds

- Depends on: F12-T20, F12-T22
- Size: one module
- Requirements: F12-REQ-050
- Test: `lib/review/inbox-latency.test.ts` proves F12-AC-050a

The clock and the 1280×800 environment are the Limits row for Inbox appearance.

## F12-T25 Build the proposal screen

- Depends on: F12-T03, F12-T07, F12-T12, F12-T21, F12-T22
- Size: several modules
- Requirements: F12-REQ-021, F12-REQ-023, F12-REQ-026, F12-REQ-055, F12-REQ-056
- Test: `components/review/proposal-screen.test.ts` proves F12-AC-021a, F12-AC-023a, F12-AC-026a, F12-AC-026b, F12-AC-055a, and F12-AC-056a

## F12-T26 Show merge and reject before the server returns

- Depends on: F12-T17, F12-T25
- Size: one module
- Requirements: F12-REQ-047, F12-REQ-048
- Test: `components/review/optimistic.test.ts` proves F12-AC-047a, F12-AC-047b, and F12-AC-048a

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F12-REQ-001 | F12-T01 | F12-AC-001a |
| F12-REQ-002 | F12-T08 | F12-AC-002a |
| F12-REQ-003 | F12-T08 | F12-AC-003a |
| F12-REQ-004 | F12-T08 | F12-AC-004a |
| F12-REQ-005 | F12-T08 | F12-AC-005a |
| F12-REQ-006 | F12-T05 | F12-AC-006a |
| F12-REQ-007 | F12-T05 | F12-AC-007a |
| F12-REQ-008 | F12-T05 | F12-AC-008a |
| F12-REQ-009 | F12-T05 | F12-AC-009a |
| F12-REQ-010 | F12-T08 | F12-AC-010a |
| F12-REQ-011 | F12-T02, F12-T08 | F12-AC-011a |
| F12-REQ-012 | F12-T08 | F12-AC-002b |
| F12-REQ-013 | F12-T08 | F12-AC-013a |
| F12-REQ-014 | F12-T02, F12-T10 | F12-AC-014a |
| F12-REQ-015 | F12-T20 | F12-AC-015a |
| F12-REQ-016 | F12-T20 | F12-AC-016a |
| F12-REQ-017 | F12-T20 | F12-AC-017a |
| F12-REQ-018 | F12-T20 | F12-AC-018a |
| F12-REQ-019 | F12-T22 | F12-AC-019a |
| F12-REQ-020 | F12-T03 | F12-AC-020a |
| F12-REQ-021 | F12-T25 | F12-AC-021a |
| F12-REQ-022 | F12-T04 | F12-AC-022a |
| F12-REQ-023 | F12-T25 | F12-AC-023a |
| F12-REQ-024 | F12-T07 | F12-AC-024a |
| F12-REQ-025 | F12-T21 | F12-AC-025a |
| F12-REQ-026 | F12-T25 | F12-AC-026a |
| F12-REQ-027 | F12-T07 | F12-AC-027a |
| F12-REQ-028 | F12-T04 | F12-AC-028a |
| F12-REQ-029 | F12-T04 | F12-AC-029a |
| F12-REQ-030 | F12-T21 | F12-AC-030a |
| F12-REQ-031 | F12-T02, F12-T13 | F12-AC-031a |
| F12-REQ-032 | F12-T14 | F12-AC-032a |
| F12-REQ-033 | F12-T17 | F12-AC-033a |
| F12-REQ-034 | F12-T14 | F12-AC-034a |
| F12-REQ-035 | F12-T15 | F12-AC-035a |
| F12-REQ-036 | F12-T17 | F12-AC-036a |
| F12-REQ-037 | F12-T06 | F12-AC-037a |
| F12-REQ-038 | F12-T12 | F12-AC-038a |
| F12-REQ-039 | F12-T16 | F12-AC-039a |
| F12-REQ-040 | F12-T16 | F12-AC-040a |
| F12-REQ-041 | F12-T18 | F12-AC-041a |
| F12-REQ-042 | F12-T19 | F12-AC-042a |
| F12-REQ-043 | F12-T19 | F12-AC-043a |
| F12-REQ-044 | F12-T19 | F12-AC-044a |
| F12-REQ-045 | F12-T03 | F12-AC-045a |
| F12-REQ-046 | F12-T03 | F12-AC-046a |
| F12-REQ-047 | F12-T26 | F12-AC-047a |
| F12-REQ-048 | F12-T26 | F12-AC-048a |
| F12-REQ-049 | F12-T23 | F12-AC-049a |
| F12-REQ-050 | F12-T24 | F12-AC-050a |
| F12-REQ-051 | F12-T13 | F12-AC-051a |
| F12-REQ-052 | F12-T16 | F12-AC-052a |
| F12-REQ-053 | F12-T11 | F12-AC-053a |
| F12-REQ-054 | F12-T03 | F12-AC-054a |
| F12-REQ-055 | F12-T25 | F12-AC-055a |
| F12-REQ-056 | F12-T25 | F12-AC-056a |
| F12-REQ-057 | F12-T14 | F12-AC-057a |
| F12-REQ-058 | F12-T08 | F12-AC-058a |
| F12-REQ-059 | F12-T11 | F12-AC-059a |
| F12-REQ-060 | F12-T09 | F12-AC-060a |
| F12-REQ-061 | F12-T14 | F12-AC-061a |
| F12-REQ-062 | F12-T15 | F12-AC-062a |
