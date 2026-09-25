# ADR-0011: Phones

**Status:** Accepted

## Context

The PRD says there is no native app. The web app is responsive and read-mostly on phones.

Change request C4, already live, asks for mobile and every form factor, with readability as the principle. The split view stacks on narrow screens. Touch targets on coarse pointers are 44px. Editing is part of that layout, not removed on a phone.

The reading measure itself is ADR-0005.

## Options

1. Responsive, and read-mostly on phones. Editing is a desktop action.
2. Readable on phones, and editing works on phones. The source and preview stack on a narrow screen. Coarse-pointer targets are at least 44px.
3. A native phone app.

## Decision

The web app stays the phone client. There is no native app.

When the viewport is 900px wide or narrower, source and preview stack in one column instead of sitting side by side. 900px is the split breakpoint the plan records for the built shell. Editing still works: the Edit control and the editor are available. The page is not read-only on a phone.

On a coarse pointer (`pointer: coarse`), interactive targets are at least 44px by 44px.

## Replaces

PRD non-goal wording that the web app is "read-mostly on phones", insofar as that forbids editing on a phone. Superseded by C4.

## Consequences

- F08: the shell is readable at phone width, and the split stacks under 900px.
- F09: editing is available at phone width.
- F20: phone use does not depend on hover.
- F21: the 900px split breakpoint and the 44px coarse-pointer target are tokens.
