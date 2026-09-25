# ADR-0007: Radius

**Status:** Accepted

## Context

The PRD radius tokens are 6px for controls and 8px for panels.

Change request C5, already live, makes the radius more exaggerated and fixes the small pieces: 12px controls, 10px outline rows, 18px content blocks, 20px dialogs, 8px inline code, and 6px mark.

## Options

1. 6px controls and 8px panels.
2. The C5 scale: 12px controls, 10px outline rows, 18px content blocks, 20px dialogs, 8px inline code, 6px mark.
3. One radius for every control and panel.

## Decision

Use the C5 radii:

| Element | Radius |
| --- | --- |
| Controls | 12px |
| Outline rows | 10px |
| Content blocks | 18px |
| Dialogs | 20px |
| Inline code | 8px |
| Mark | 6px |

## Replaces

PRD radius "6px controls, 8px panels". Superseded by C5.

## Consequences

- F21: radius tokens use the C5 values above.
