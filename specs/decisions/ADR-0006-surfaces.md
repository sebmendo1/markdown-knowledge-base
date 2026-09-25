# ADR-0006: Surfaces

**Status:** Accepted

## Context

The PRD surface treatment is a near-black base, panels one step lighter, hairline 1px borders, and no shadows.

Change request C2, already live, says to minimize borders and use more solid colors. Hairline borders were removed in favor of solid fills.

## Options

1. Hairline 1px borders and no shadows.
2. Solid fills, with borders removed.
3. Solid fills plus shadows.

## Decision

Surfaces are solid fills. Borders that separated those surfaces are removed. Shadows are not added.

## Replaces

PRD surface rule "hairline 1px borders". Superseded by C2. The PRD rule "no shadows" still stands, because C2 does not add shadows.

## Consequences

- F21: surface tokens use solid fills and do not use a 1px hairline border between those surfaces.
