# F14 tasks: OAuth for assistants

Steps are in dependency order. Each step names the requirements it satisfies, the test that proves it, and a size. Sizes are `one module`, `several modules`, or `a schema change`.

Tests live under `lib/oauth/*.test.ts` and run with `tsx --test`. A test name is the acceptance id from `spec.md`.

`LEDGER_OAUTH` is unset for F14-T01 and set for every later test. Later tests also set `LEDGER_API` and `LEDGER_AUTH`.

## F14-T01 Keep OAuth off

- Depends on: none
- Size: one module
- Requirements: F14-REQ-001
- Test: `lib/oauth/flag.test.ts` proves F14-AC-001a and F14-AC-001b

## F14-T02 Add OAuth tables

- Depends on: F12-T02
- Size: a schema change
- Requirements: F14-REQ-005, F14-REQ-011, F14-REQ-015
- Test: `lib/oauth/schema.test.ts` proves the storage half of F14-AC-005a (no client secret column), F14-AC-011a (one grant row), and F14-AC-015c (access token stored as SHA-256 hex, raw value does not start with `lk_`)

Adds `oauth_clients`, `oauth_codes`, `oauth_grants`, and `oauth_tokens`, and the foreign key on `proposals.oauth_grant_id`.

## F14-T03 Accept redirect URIs

- Depends on: none
- Size: one module
- Requirements: F14-REQ-007
- Test: `lib/oauth/redirects.test.ts` proves F14-AC-007a and F14-AC-007b

## F14-T04 Publish protected-resource metadata

- Depends on: F14-T01
- Size: one module
- Requirements: F14-REQ-002
- Test: `lib/oauth/metadata.test.ts` proves F14-AC-002a and F14-AC-002b

## F14-T05 Publish authorization-server metadata

- Depends on: F14-T01
- Size: one module
- Requirements: F14-REQ-003
- Test: `lib/oauth/metadata.test.ts` proves F14-AC-003a and F14-AC-003b

## F14-T06 Advertise the resource on 401

- Depends on: F13-T07, F14-T04
- Size: one module
- Requirements: F14-REQ-004
- Test: `lib/oauth/metadata.test.ts` proves F14-AC-004a

## F14-T07 Register a public client

- Depends on: F14-T02, F14-T03
- Size: one module
- Requirements: F14-REQ-005, F14-REQ-006
- Test: `lib/oauth/register.test.ts` proves F14-AC-005a, F14-AC-005b, F14-AC-006a, F14-AC-006b, and F14-AC-006c

## F14-T08 Show consent and refuse the wrong method

- Depends on: F14-T04, F14-T07
- Size: several modules
- Requirements: F14-REQ-008
- Test: `lib/oauth/authorize.test.ts` proves F14-AC-008a, F14-AC-008b, and F14-AC-008c

## F14-T09 Refuse a bad authorization request

- Depends on: F14-T08
- Size: one module
- Requirements: F14-REQ-009
- Test: `lib/oauth/authorize.test.ts` proves F14-AC-009a, F14-AC-009b, and F14-AC-009c

## F14-T10 Offer only read and propose

- Depends on: F14-T08
- Size: one module
- Requirements: F14-REQ-010
- Test: `lib/oauth/authorize.test.ts` proves F14-AC-010a, F14-AC-010b, and F14-AC-010c

## F14-T11 Gate approval by membership

- Depends on: F15-T13, F14-T08
- Size: one module
- Requirements: F14-REQ-012
- Test: `lib/oauth/authorize.test.ts` proves F14-AC-012a, F14-AC-012b, F14-AC-012c, F14-AC-012d, and F14-AC-012e

## F14-T12 Store a grant and a code

- Depends on: F14-T02, F14-T10, F14-T11
- Size: one module
- Requirements: F14-REQ-011
- Test: `lib/oauth/authorize.test.ts` proves F14-AC-011a and F14-AC-011b

## F14-T13 Deny or approve with no scope

- Depends on: F14-T08
- Size: one module
- Requirements: F14-REQ-013
- Test: `lib/oauth/authorize.test.ts` proves F14-AC-013a and F14-AC-013b

## F14-T14 Exchange a code

- Depends on: F14-T12
- Size: one module
- Requirements: F14-REQ-014, F14-REQ-018
- Test: `lib/oauth/tokens.test.ts` proves F14-AC-014a, F14-AC-014b, F14-AC-018a, F14-AC-018b, and F14-AC-018c

## F14-T15 Expire and hash access tokens

- Depends on: F14-T14
- Size: one module
- Requirements: F14-REQ-015
- Test: `lib/oauth/tokens.test.ts` proves F14-AC-015a, F14-AC-015b, and F14-AC-015c

## F14-T16 Rotate refresh tokens

- Depends on: F14-T15
- Size: one module
- Requirements: F14-REQ-016
- Test: `lib/oauth/tokens.test.ts` proves F14-AC-016a, F14-AC-016b, and F14-AC-016c

## F14-T17 Revoke a grant when a refresh token is reused

- Depends on: F14-T16
- Size: one module
- Requirements: F14-REQ-017
- Test: `lib/oauth/tokens.test.ts` proves F14-AC-017a

## F14-T18 Call the ten tools with a grant

- Depends on: F13-T20, F14-T15
- Size: several modules
- Requirements: F14-REQ-019
- Test: `lib/oauth/bearer.test.ts` proves F14-AC-019a, F14-AC-019b, F14-AC-019c, F14-AC-019d, and F14-AC-019e

## F14-T19 Keep each grant on its own counters

- Depends on: F13-T10, F14-T18
- Size: one module
- Requirements: F14-REQ-020
- Test: `lib/oauth/limits.test.ts` proves F14-AC-020a, F14-AC-020b, F14-AC-020c, and F14-AC-020d

## F14-T20 Check Origin on browser OAuth posts

- Depends on: F15-T10, F14-T12
- Size: one module
- Requirements: F14-REQ-024
- Test: `lib/oauth/csrf.test.ts` proves F14-AC-024a and F14-AC-024b

## F14-T21 Revoke a grant from Settings

- Depends on: F14-T17, F14-T20
- Size: several modules
- Requirements: F14-REQ-021
- Test: `lib/oauth/grants.test.ts` proves F14-AC-021a, F14-AC-021b, F14-AC-021c, F14-AC-021d, and F14-AC-021e

## F14-T22 List grants in Agents

- Depends on: F14-T21
- Size: several modules
- Requirements: F14-REQ-022
- Test: `components/settings/agents.test.ts` proves F14-AC-022a, F14-AC-022b, F14-AC-022c, and F14-AC-022d

## F14-T23 Store the grant label on a proposal

- Depends on: F12-T10, F14-T18
- Size: one module
- Requirements: F14-REQ-023
- Test: `lib/oauth/bearer.test.ts` proves F14-AC-023a

## F14-T24 Show the three OAuth cards

- Depends on: F14-T04
- Size: several modules
- Requirements: F14-REQ-025
- Test: `components/settings/oauth-cards.test.ts` proves F14-AC-025a, F14-AC-025b, and F14-AC-025c

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F14-REQ-001 | F14-T01 | F14-AC-001a |
| F14-REQ-002 | F14-T04 | F14-AC-002a |
| F14-REQ-003 | F14-T05 | F14-AC-003a |
| F14-REQ-004 | F14-T06 | F14-AC-004a |
| F14-REQ-005 | F14-T02, F14-T07 | F14-AC-005a |
| F14-REQ-006 | F14-T07 | F14-AC-006a |
| F14-REQ-007 | F14-T03 | F14-AC-007a |
| F14-REQ-008 | F14-T08 | F14-AC-008a |
| F14-REQ-009 | F14-T09 | F14-AC-009a |
| F14-REQ-010 | F14-T10 | F14-AC-010a |
| F14-REQ-011 | F14-T02, F14-T12 | F14-AC-011a |
| F14-REQ-012 | F14-T11 | F14-AC-012a |
| F14-REQ-013 | F14-T13 | F14-AC-013a |
| F14-REQ-014 | F14-T14 | F14-AC-014a |
| F14-REQ-015 | F14-T02, F14-T15 | F14-AC-015a |
| F14-REQ-016 | F14-T16 | F14-AC-016a |
| F14-REQ-017 | F14-T17 | F14-AC-017a |
| F14-REQ-018 | F14-T14 | F14-AC-018a |
| F14-REQ-019 | F14-T18 | F14-AC-019a |
| F14-REQ-020 | F14-T19 | F14-AC-020a |
| F14-REQ-021 | F14-T21 | F14-AC-021a |
| F14-REQ-022 | F14-T22 | F14-AC-022a |
| F14-REQ-023 | F14-T23 | F14-AC-023a |
| F14-REQ-024 | F14-T20 | F14-AC-024a |
| F14-REQ-025 | F14-T24 | F14-AC-025a |
