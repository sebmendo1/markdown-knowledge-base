# ADR-0034: Accessibility

**Status:** Proposed

## Context

The PRD requires the product to be usable with the keyboard alone, and says every core action has a shortcut. Status is a colored dot plus a word, never color alone. The UI stack is described as accessible.

Section 2.3 notes that the WCAG level, contrast, focus order, and screen-reader behavior are unstated. Without them, two builds can both be "keyboard-only" and still differ in contrast, where focus moves, and what a screen reader announces.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Require keyboard-only use and leave contrast, focus order, and screen-reader names unstated.
2. Require WCAG 2.2 Level AA, with a fixed focus order and a named state for preview versus editing.
3. Require WCAG 2.2 Level AAA.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

The target is WCAG 2.2 Level AA, on top of the existing keyboard-only rule.

- Text contrast is at least 4.5:1 against its background. Text that is at least 24px, or at least 18.5px and bold, is at least 3:1.
- User-interface components and the focus indicator are at least 3:1 against the adjacent color.
- Focus order is the files column, then the page, then the outline column, top to bottom inside each column. An open dialog traps focus until it closes, then focus returns to the control that opened it.
- Every control has an accessible name.
- A status includes a word, not color alone.
- When editing turns on or off, the accessible state of the page becomes `Editing` or `Preview`.
- Every screen can be completed with the keyboard alone. A pointer is not required.

## Replaces

The unstated WCAG level, contrast, focus order, and screen-reader behavior in section 2.3. The PRD keyboard-only rule and the "word plus color" status rule stay.

## Consequences

- F08: focus order is files, page, then outline, and the page state is announced as `Editing` or `Preview`.
- F20: keyboard-only use remains required, and dialogs trap focus.
- F21: color tokens have to meet the contrast ratios above in both themes.
- X: the accessibility bar for the product is WCAG 2.2 Level AA.
