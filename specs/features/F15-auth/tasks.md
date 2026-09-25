# F15 tasks: Human sign-in, roles, permissions, and audit

Steps are in dependency order. Each step names the requirements it satisfies, the test that proves it, and a size. Sizes are `one module`, `several modules`, or `a schema change`.

Tests live under `lib/auth/*.test.ts` and run with `tsx --test`. A test name is the acceptance id from `spec.md`.

`LEDGER_AUTH` is unset for F15-T01 and for the no-session cases in F15-T02. Every later test sets the flag. A page link never becomes a credential. The signed-in page-link cases are proved with the read gate and the edit gate.

## F15-T01 Leave sign-in off

- Depends on: none
- Size: one module
- Requirements: F15-REQ-001, F15-REQ-002, F15-REQ-003
- Test: `lib/auth/flag.test.ts` proves F15-AC-001a, F15-AC-002a, and F15-AC-003a

## F15-T02 Treat the page link as a starting mode

- Depends on: none
- Size: one module
- Requirements: F15-REQ-004
- Test: `lib/auth/page-link.test.ts` proves F15-AC-004a and F15-AC-004b

## F15-T03 Add sessions and invites

- Depends on: none
- Size: a schema change
- Requirements: F15-REQ-007, F15-REQ-016, F15-REQ-018, F15-REQ-035
- Test: `lib/auth/schema.test.ts` proves the session token width used by F15-AC-007b, the one-membership constraint in F15-AC-016a, the invite expiry column used by F15-AC-018a, and the immutable trigger in F15-AC-035a

`users`, `memberships`, and `audit_events` are already in `specs/contracts/db.sql`. This step adds `invites` and the Better Auth session tables.

## F15-T04 Offer GitHub, Google, and a magic link

- Depends on: F15-T03
- Size: several modules
- Requirements: F15-REQ-005
- Test: `lib/auth/better-auth.test.ts` proves F15-AC-005a and F15-AC-005b

## F15-T05 Accept one magic link for 300 seconds

- Depends on: F15-T04
- Size: one module
- Requirements: F15-REQ-006
- Test: `lib/auth/magic-link.test.ts` proves F15-AC-006a, F15-AC-006b, F15-AC-006c, and F15-AC-006d

## F15-T06 Set the session cookie

- Depends on: F15-T03, F15-T04
- Size: one module
- Requirements: F15-REQ-007
- Test: `lib/auth/session.test.ts` proves F15-AC-007a and F15-AC-007b

## F15-T07 Roll the session expiry

- Depends on: F15-T06
- Size: one module
- Requirements: F15-REQ-008
- Test: `lib/auth/session.test.ts` proves F15-AC-008a and F15-AC-008b

## F15-T08 Treat a missing session as signed out

- Depends on: F15-T06
- Size: one module
- Requirements: F15-REQ-009
- Test: `lib/auth/session.test.ts` proves F15-AC-009a and F15-AC-009b

## F15-T09 Sign out

- Depends on: F15-T06
- Size: one module
- Requirements: F15-REQ-010
- Test: `lib/auth/session.test.ts` proves F15-AC-010a

## F15-T10 Reject a foreign Origin

- Depends on: F15-T06
- Size: one module
- Requirements: F15-REQ-011
- Test: `lib/auth/csrf.test.ts` proves F15-AC-011a and F15-AC-011b

## F15-T11 Confirm the provider callback

- Depends on: F15-T04, F15-T05
- Size: one module
- Requirements: F15-REQ-012
- Test: `lib/auth/callbacks.test.ts` proves F15-AC-012a and F15-AC-012b

## F15-T12 Write one user per email

- Depends on: F15-T04
- Size: one module
- Requirements: F15-REQ-014, F15-REQ-015
- Test: `lib/auth/users.test.ts` proves F15-AC-014a, F15-AC-014b, and F15-AC-015a

## F15-T13 Store one membership

- Depends on: F15-T03, F15-T12
- Size: one module
- Requirements: F15-REQ-016
- Test: `lib/auth/membership.test.ts` proves F15-AC-016a and F15-AC-016b

## F15-T14 Make the space creator the owner

- Depends on: F15-T13
- Size: one module
- Requirements: F15-REQ-017
- Test: `lib/auth/membership.test.ts` proves F15-AC-017a

## F15-T15 Read the role from the database

- Depends on: F15-T13
- Size: one module
- Requirements: F15-REQ-013
- Test: `lib/auth/permissions.test.ts` proves F15-AC-013a

## F15-T16 Invite by email

- Depends on: F15-T03, F15-T14
- Size: several modules
- Requirements: F15-REQ-018
- Test: `lib/auth/invites.test.ts` proves F15-AC-018a, F15-AC-018b, F15-AC-018c, and F15-AC-018d

## F15-T17 Accept an invite

- Depends on: F15-T16
- Size: one module
- Requirements: F15-REQ-019
- Test: `lib/auth/invites.test.ts` proves F15-AC-019a

## F15-T18 Refuse a bad invite

- Depends on: F15-T16
- Size: one module
- Requirements: F15-REQ-020
- Test: `lib/auth/invites.test.ts` proves F15-AC-020a, F15-AC-020b, and F15-AC-020c

## F15-T19 Keep one owner

- Depends on: F15-T13
- Size: one module
- Requirements: F15-REQ-032
- Test: `lib/auth/membership.test.ts` proves F15-AC-032a and F15-AC-032b

## F15-T20 Audit membership changes

- Depends on: F15-T17, F15-T19
- Size: one module
- Requirements: F15-REQ-033
- Test: `lib/auth/audit.test.ts` proves F15-AC-033a and F15-AC-033b

## F15-T21 Audit invites

- Depends on: F15-T16
- Size: one module
- Requirements: F15-REQ-034
- Test: `lib/auth/audit.test.ts` proves F15-AC-034a and F15-AC-034b

## F15-T22 Leave audit rows unchanged

- Depends on: F15-T03
- Size: one module
- Requirements: F15-REQ-035
- Test: `lib/auth/audit.test.ts` proves F15-AC-035a

## F15-T23 Gate document read

- Depends on: F15-T02, F15-T15
- Size: one module
- Requirements: F15-REQ-004, F15-REQ-021
- Test: `lib/auth/permissions.test.ts` proves F15-AC-004d, F15-AC-021a, F15-AC-021b, and F15-AC-021c

## F15-T24 Gate human proposals

- Depends on: F15-T15
- Size: one module
- Requirements: F15-REQ-022
- Test: `lib/auth/permissions.test.ts` proves F15-AC-022a, F15-AC-022b, F15-AC-022c, and F15-AC-022d

## F15-T25 Gate edit directly

- Depends on: F15-T02, F15-T15
- Size: one module
- Requirements: F15-REQ-004, F15-REQ-023
- Test: `lib/auth/permissions.test.ts` proves F15-AC-004c, F15-AC-023a, F15-AC-023b, F15-AC-023c, F15-AC-023d, F15-AC-023e, F15-AC-023f, and F15-AC-023g

## F15-T26 Gate merge

- Depends on: F15-T15
- Size: one module
- Requirements: F15-REQ-024
- Test: `lib/auth/permissions.test.ts` proves F15-AC-024a, F15-AC-024b, F15-AC-024c, and F15-AC-024d

## F15-T27 Gate member management

- Depends on: F15-T16, F15-T19
- Size: several modules
- Requirements: F15-REQ-025
- Test: `lib/auth/permissions.test.ts` proves F15-AC-025a, F15-AC-025b, and F15-AC-025c

## F15-T28 Gate keys and types

- Depends on: F15-T15
- Size: one module
- Requirements: F15-REQ-026
- Test: `lib/auth/permissions.test.ts` proves F15-AC-026a, F15-AC-026b, and F15-AC-026c

This is the Owner-only check. F13-T08 keeps the Owner-or-Editor check in `lib/agent/keys.ts`. See the boundary in `design.md`.

## F15-T29 Refuse document delete

- Depends on: none
- Size: one module
- Requirements: F15-REQ-027
- Test: `lib/auth/permissions.test.ts` proves F15-AC-027a and F15-AC-027b

## F15-T30 Refuse merge and admin on a tool

- Depends on: F15-T26
- Size: one module
- Requirements: F15-REQ-028
- Test: `lib/auth/permissions.test.ts` proves F15-AC-028a, F15-AC-028b, and F15-AC-028c

## F15-T31 Refuse direct edit on a tool

- Depends on: F15-T25
- Size: one module
- Requirements: F15-REQ-029
- Test: `lib/auth/permissions.test.ts` proves F15-AC-029a and F15-AC-029b

## F15-T32 Keep keys and grants out of the web app

- Depends on: F15-T06
- Size: one module
- Requirements: F15-REQ-030
- Test: `lib/auth/session.test.ts` proves F15-AC-030a and F15-AC-030b

## F15-T33 Set the human proposal author

- Depends on: F15-T24
- Size: one module
- Requirements: F15-REQ-031
- Test: `lib/auth/permissions.test.ts` proves F15-AC-031a and F15-AC-031b

## F15-T34 Let an Owner read the audit log

- Depends on: F15-T20
- Size: one module
- Requirements: F15-REQ-036
- Test: `lib/auth/audit.test.ts` proves F15-AC-036a, F15-AC-036b, and F15-AC-036c

## F15-T35 Keep provider secrets on the server

- Depends on: F15-T04
- Size: one module
- Requirements: F15-REQ-037
- Test: `lib/auth/secrets.test.ts` proves F15-AC-037a

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F15-REQ-001 | F15-T01 | F15-AC-001a |
| F15-REQ-002 | F15-T01 | F15-AC-002a |
| F15-REQ-003 | F15-T01 | F15-AC-003a |
| F15-REQ-004 | F15-T02, F15-T23, F15-T25 | F15-AC-004a |
| F15-REQ-005 | F15-T04 | F15-AC-005a |
| F15-REQ-006 | F15-T05 | F15-AC-006a |
| F15-REQ-007 | F15-T03, F15-T06 | F15-AC-007a |
| F15-REQ-008 | F15-T07 | F15-AC-008a |
| F15-REQ-009 | F15-T08 | F15-AC-009a |
| F15-REQ-010 | F15-T09 | F15-AC-010a |
| F15-REQ-011 | F15-T10 | F15-AC-011a |
| F15-REQ-012 | F15-T11 | F15-AC-012a |
| F15-REQ-013 | F15-T15 | F15-AC-013a |
| F15-REQ-014 | F15-T12 | F15-AC-014a |
| F15-REQ-015 | F15-T12 | F15-AC-015a |
| F15-REQ-016 | F15-T03, F15-T13 | F15-AC-016a |
| F15-REQ-017 | F15-T14 | F15-AC-017a |
| F15-REQ-018 | F15-T03, F15-T16 | F15-AC-018a |
| F15-REQ-019 | F15-T17 | F15-AC-019a |
| F15-REQ-020 | F15-T18 | F15-AC-020a |
| F15-REQ-021 | F15-T23 | F15-AC-021a |
| F15-REQ-022 | F15-T24 | F15-AC-022a |
| F15-REQ-023 | F15-T25 | F15-AC-023a |
| F15-REQ-024 | F15-T26 | F15-AC-024a |
| F15-REQ-025 | F15-T27 | F15-AC-025a |
| F15-REQ-026 | F15-T28 | F15-AC-026a |
| F15-REQ-027 | F15-T29 | F15-AC-027a |
| F15-REQ-028 | F15-T30 | F15-AC-028a |
| F15-REQ-029 | F15-T31 | F15-AC-029a |
| F15-REQ-030 | F15-T32 | F15-AC-030a |
| F15-REQ-031 | F15-T33 | F15-AC-031a |
| F15-REQ-032 | F15-T19 | F15-AC-032a |
| F15-REQ-033 | F15-T20 | F15-AC-033a |
| F15-REQ-034 | F15-T21 | F15-AC-034a |
| F15-REQ-035 | F15-T03, F15-T22 | F15-AC-035a |
| F15-REQ-036 | F15-T34 | F15-AC-036a |
| F15-REQ-037 | F15-T35 | F15-AC-037a |
