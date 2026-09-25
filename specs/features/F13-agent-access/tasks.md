# F13 tasks: Agent access

Steps are in dependency order. Each step names the requirements it satisfies, the test that proves it, and a size. Sizes are `one module`, `several modules`, or `a schema change`.

Tests live under `lib/agent/*.test.ts` and run with `tsx --test`. A test name is the acceptance id from `spec.md`.

`LEDGER_API` is unset for F13-T01 and set for every later test. The editor files `mcp/server.ts` and `lib/mcp/tools.ts` stay as they are.

## F13-T01 Leave the editor server in place

- Depends on: none
- Size: one module
- Requirements: F13-REQ-001
- Test: `lib/agent/flag.test.ts` proves F13-AC-001a, F13-AC-001b, and F13-AC-001c

## F13-T02 Store credential windows

- Depends on: none
- Size: a schema change
- Requirements: F13-REQ-008, F13-REQ-012
- Test: `lib/agent/schema.test.ts` proves the `agent_keys` hash and scope checks used by F13-AC-008a, and a `credential_calls` row used by F13-AC-012a

`agent_keys` is already in `specs/contracts/db.sql`. This step adds `credential_calls`.

## F13-T03 Shape the error object

- Depends on: none
- Size: one module
- Requirements: F13-REQ-027
- Test: `lib/agent/errors.test.ts` proves F13-AC-027a

## F13-T04 Refuse an oversized body

- Depends on: F13-T03
- Size: one module
- Requirements: F13-REQ-029
- Test: `lib/agent/admit.test.ts` proves F13-AC-029a

## F13-T05 Refuse an unknown route

- Depends on: F13-T03
- Size: one module
- Requirements: F13-REQ-003
- Test: `lib/agent/admit.test.ts` proves F13-AC-003a

## F13-T06 Reject a space argument

- Depends on: F13-T03
- Size: one module
- Requirements: F13-REQ-005
- Test: `lib/agent/admit.test.ts` proves F13-AC-005a

## F13-T07 Authenticate a bearer

- Depends on: F13-T03
- Size: one module
- Requirements: F13-REQ-006, F13-REQ-007, F13-REQ-011
- Test: `lib/agent/credential.test.ts` proves F13-AC-006a, F13-AC-006b, F13-AC-006c, F13-AC-006d, F13-AC-007a, and F13-AC-011a

## F13-T08 Create and revoke a key

- Depends on: F13-T02, F13-T07
- Size: one module
- Requirements: F13-REQ-008, F13-REQ-009
- Test: `lib/agent/keys.test.ts` proves F13-AC-008a, F13-AC-008b, F13-AC-008c, and F13-AC-009a

F13-AC-008c is the Contributor refusal in this module. F15-REQ-026 is a separate Owner-only check. See the boundary in `design.md`.

## F13-T09 Enforce read and propose scope

- Depends on: F13-T07
- Size: one module
- Requirements: F13-REQ-010
- Test: `lib/agent/credential.test.ts` proves F13-AC-010a, F13-AC-010b, and F13-AC-010c

## F13-T10 Count the three limits

- Depends on: F13-T02, F13-T07
- Size: one module
- Requirements: F13-REQ-012, F13-REQ-013
- Test: `lib/agent/limits.test.ts` proves F13-AC-012a, F13-AC-012b, F13-AC-012c, F13-AC-012d, F13-AC-013a, and F13-AC-013b

## F13-T11 Build the context pack

- Depends on: F13-T06
- Size: one module
- Requirements: F13-REQ-014, F13-REQ-015
- Test: `lib/agent/pack.test.ts` proves F13-AC-014a, F13-AC-014b, F13-AC-015a, and F13-AC-015b

## F13-T12 Search documents

- Depends on: F13-T06
- Size: one module
- Requirements: F13-REQ-016, F13-REQ-032
- Test: `lib/agent/search.test.ts` proves F13-AC-016a, F13-AC-016b, F13-AC-016c, and F13-AC-032a

F13-AC-032a uses the search environment in Limits: under 100 ms at the 95th percentile.

## F13-T13 List documents

- Depends on: F13-T06
- Size: one module
- Requirements: F13-REQ-017
- Test: `lib/agent/documents.test.ts` proves F13-AC-017a

## F13-T14 Read a document

- Depends on: F13-T06
- Size: one module
- Requirements: F13-REQ-018
- Test: `lib/agent/documents.test.ts` proves F13-AC-018a and F13-AC-018b

## F13-T15 Return a template

- Depends on: F13-T06
- Size: one module
- Requirements: F13-REQ-019
- Test: `lib/agent/template.test.ts` proves F13-AC-019a and F13-AC-019b

## F13-T16 Validate without writing

- Depends on: F13-T03
- Size: one module
- Requirements: F13-REQ-020, F13-REQ-028
- Test: `lib/agent/validate.test.ts` proves F13-AC-020a, F13-AC-020b, and F13-AC-028a, F13-AC-028b

## F13-T17 Propose, update, and read a proposal

- Depends on: F13-T08, F13-T09, F13-T10, and F12-T08, F12-T11, F12-T14
- Size: several modules
- Requirements: F13-REQ-021, F13-REQ-022, F13-REQ-023
- Test: `lib/agent/proposals.test.ts` proves F13-AC-021a, F13-AC-021b, F13-AC-021c, F13-AC-022a, F13-AC-022b, F13-AC-023a, and F13-AC-023b

## F13-T18 Return metric points

- Depends on: F13-T06
- Size: one module
- Requirements: F13-REQ-024
- Test: `lib/agent/metrics.test.ts` proves F13-AC-024a and F13-AC-024b

## F13-T19 Bind the ten tool contracts

- Depends on: F13-T11, F13-T12, F13-T13, F13-T14, F13-T15, F13-T16, F13-T17, F13-T18
- Size: one module
- Requirements: F13-REQ-002, F13-REQ-025, F13-REQ-026
- Test: `lib/agent/tools.test.ts` proves F13-AC-002a, F13-AC-004a, F13-AC-025a, and F13-AC-026a

F13-AC-004a is the shared F12 `summary_invalid` sentence on both transports.

## F13-T20 Serve MCP and REST from one implementation

- Depends on: F13-T04, F13-T05, F13-T07, F13-T19
- Size: several modules
- Requirements: F13-REQ-004
- Test: `lib/agent/transport.test.ts` proves F13-AC-004a on `POST /api/v1/proposals` and on MCP `propose_change`

## F13-T21 Show Agent keys

- Depends on: F13-T08
- Size: several modules
- Requirements: F13-REQ-030
- Test: `components/settings/agent-keys.test.ts` proves F13-AC-030a and F13-AC-030b

## F13-T22 Show Connect

- Depends on: F13-T08
- Size: several modules
- Requirements: F13-REQ-031
- Test: `components/settings/connect.test.ts` proves F13-AC-031a and F13-AC-031b

## F13-T23 Answer a tool within 2 seconds

- Depends on: F13-T20
- Size: one module
- Requirements: F13-REQ-033
- Test: `lib/agent/latency.test.ts` proves F13-AC-033a

## F13-T24 Finish the log-an-experiment server path

- Depends on: F13-T11, F13-T15, F13-T17
- Size: one module
- Requirements: F13-REQ-034
- Test: `lib/agent/latency.test.ts` proves F13-AC-034a

The sum is one `get_context`, one `get_template`, and one `propose_change`, model time excluded, under 10 seconds at the 95th percentile.

## F13-T25 Log this experiment with no manual fixes

- Depends on: F13-T17, F13-T19
- Size: one module
- Requirements: F13-REQ-035
- Test: `lib/agent/log-experiment.test.ts` proves `log this experiment to Ledger needs no manual fixes` (F13-AC-035a)

The sentence is "log this experiment to Ledger". The agent uses only the ten MCP tools. The stored proposal is valid and needs no manual fixes.

## F13-T26 Accept the agent's retry

- Depends on: F13-T03, F13-T17
- Size: one module
- Requirements: F13-REQ-036
- Test: `lib/agent/retry.test.ts` proves `the agent retries and that retry succeeds` (F13-AC-036a)

`propose_change` first returns a structured error for an invalid proposal. The agent retries with a valid proposal. That retry succeeds and the proposal is stored.

## Coverage

| Requirement | Task | Test |
| --- | --- | --- |
| F13-REQ-001 | F13-T01 | F13-AC-001a |
| F13-REQ-002 | F13-T19 | F13-AC-002a |
| F13-REQ-003 | F13-T05 | F13-AC-003a |
| F13-REQ-004 | F13-T20 | F13-AC-004a |
| F13-REQ-005 | F13-T06 | F13-AC-005a |
| F13-REQ-006 | F13-T07 | F13-AC-006a |
| F13-REQ-007 | F13-T07 | F13-AC-007a |
| F13-REQ-008 | F13-T02, F13-T08 | F13-AC-008a |
| F13-REQ-009 | F13-T08 | F13-AC-009a |
| F13-REQ-010 | F13-T09 | F13-AC-010a |
| F13-REQ-011 | F13-T07 | F13-AC-011a |
| F13-REQ-012 | F13-T02, F13-T10 | F13-AC-012a |
| F13-REQ-013 | F13-T10 | F13-AC-013a |
| F13-REQ-014 | F13-T11 | F13-AC-014a |
| F13-REQ-015 | F13-T11 | F13-AC-015a |
| F13-REQ-016 | F13-T12 | F13-AC-016a |
| F13-REQ-017 | F13-T13 | F13-AC-017a |
| F13-REQ-018 | F13-T14 | F13-AC-018a |
| F13-REQ-019 | F13-T15 | F13-AC-019a |
| F13-REQ-020 | F13-T16 | F13-AC-020a |
| F13-REQ-021 | F13-T17 | F13-AC-021a |
| F13-REQ-022 | F13-T17 | F13-AC-022a |
| F13-REQ-023 | F13-T17 | F13-AC-023a |
| F13-REQ-024 | F13-T18 | F13-AC-024a |
| F13-REQ-025 | F13-T19 | F13-AC-025a |
| F13-REQ-026 | F13-T19 | F13-AC-026a |
| F13-REQ-027 | F13-T03 | F13-AC-027a |
| F13-REQ-028 | F13-T16 | F13-AC-028a |
| F13-REQ-029 | F13-T04 | F13-AC-029a |
| F13-REQ-030 | F13-T21 | F13-AC-030a |
| F13-REQ-031 | F13-T22 | F13-AC-031a |
| F13-REQ-032 | F13-T12 | F13-AC-032a |
| F13-REQ-033 | F13-T23 | F13-AC-033a |
| F13-REQ-034 | F13-T24 | F13-AC-034a |
| F13-REQ-035 | F13-T25 | F13-AC-035a |
| F13-REQ-036 | F13-T26 | F13-AC-036a |
