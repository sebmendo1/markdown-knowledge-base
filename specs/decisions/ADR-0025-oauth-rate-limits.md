# ADR-0025: OAuth grant rate limits

**Status:** Proposed

## Context

API keys are limited to 60 requests per minute, 30 proposals per hour, and 20 open proposals. Past that, the response is HTTP 429 with `Retry-After`.

OAuth grants call the same tools. The PRD states the numbers per key and does not repeat them for a grant. A grant with no limit would let an assistant exceed the key caps.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Limit keys only. Grants are unlimited.
2. Apply the same three numbers to each grant, counted per grant.
3. Share one counter across every grant and key for a user.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Each OAuth grant has the same limits as one API key:

- 60 requests per minute
- 30 proposals per hour
- 20 open proposals

The counter is the grant. Two grants for the same person do not share a counter. A grant does not share a counter with an API key.

Open proposals are those in `open` or `changes_requested` created by that grant.

When a limit is exceeded, the response is HTTP 429 with `Retry-After` set to the number of seconds until that window or slot frees. The call creates no proposal and changes no document.

## Replaces

The missing limit statement for OAuth grants in section 2.3. Key limits are unchanged.

## Consequences

- F13: key limits stay 60 per minute, 30 proposals per hour, and 20 open proposals.
- F14: each OAuth grant uses those same numbers and its own counters.
- X: over-limit calls return 429 with `Retry-After` and have no side effect.
