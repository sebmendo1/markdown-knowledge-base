# ADR-0005: Reading type

**Status:** Accepted

## Context

The PRD sets reading type at 16px body, 1.6 line height, and a 720px max width.

Change request C4 sets the reading line near 66 characters at 17px and 1.7 line height. Plan section 2.2 recorded that as 17px, 1.7 line height, and about 66 characters.

The as-built reading-shell spec checked the app. Body text is 17px with line-height 1.7, and the column is also capped at 760px. At that size, 66ch measured 744px, so the cap binds and the text is 696px wide. "About 66 characters" alone does not describe the column.

## Options

1. 16px, line height 1.6, max width 720px.
2. 17px, line height 1.7, and a 66-character measure with no pixel cap.
3. 17px, line height 1.7, and a 760px column cap. The cap binds, so the text is 696px wide.

## Decision

Reading text is 17px with a line height of 1.7.

The reading column is capped at 760px. At 17px, 66ch measures 744px. That is wider than the text area inside the cap, so the cap binds and the text is 696px wide.

Specs record the 760px cap and the 696px text width. They do not use "about 66 characters" as the rule by itself.

## Replaces

PRD design token "Reading type: 16px body, 1.6 line height, 720px max width". Superseded by C4 for the type size, and by the as-built column for the width. Plan section 2.2's "about 66 characters" is not the binding width.

## Consequences

- F08: the document body is 17px with line height 1.7. The column cap is 760px, and the text is 696px wide because that cap binds.
- F21: the reading-type tokens record 17px, line height 1.7, the 760px cap, and the 696px text width. They do not record 16px / 1.6 / 720px, and they do not record 66 characters as the only measure.
