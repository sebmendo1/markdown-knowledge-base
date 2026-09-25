# ADR-0005: Reading type

**Status:** Accepted

## Context

The PRD sets reading type at 16px body, 1.6 line height, and a 720px max width.

Change request C4, already live, sets the reading line near 66 characters at 17px and 1.7 line height, so a page is easier to read.

## Options

1. 16px, line height 1.6, max width 720px.
2. 17px, line height 1.7, a measure of 66 characters.
3. 17px and 1.7 line height, but keep the 720px max width.

## Decision

Reading text is 17px with a line height of 1.7. The reading measure is 66 characters (`max-width: 66ch` on that text). The 720px cap is not used.

## Replaces

PRD design token "Reading type: 16px body, 1.6 line height, 720px max width". Superseded by C4.

## Consequences

- F08: the document body uses 17px, line height 1.7, and a 66-character measure.
- F21: the reading-type tokens record those values, not 16px / 1.6 / 720px.
