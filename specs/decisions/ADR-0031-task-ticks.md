# ADR-0031: Task ticks in view mode

**Status:** Proposed

## Context

Task lists use `- [ ]` and `- [x]`. The PRD says editors can tick them in view mode, and each tick saves a revision. It does not say the revision message, or which roles may tick. "Editors" can mean the Editor role or anyone with the editor open.

Saves are human saves. Contributors propose instead of saving. Agents do not edit directly.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Any viewer may tick, with no revision message.
2. Owner and Editor may tick in view mode. Each tick is one revision with the message `Tick task`. Other roles and agents cannot.
3. Ticking creates a proposal instead of a revision.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

In view mode (editing off), a task checkbox can be toggled only by someone who may save directly.

While the first release has no sign-in (ADR-0002), the local user may tick. When roles exist, Owner and Editor may tick. Contributor, Viewer, and agents may not. For them the checkbox does not change the file and no revision is written.

Each allowed toggle writes one revision through the human-save path. The validator runs. Errors block the tick and the checkbox stays as it was. Warnings do not block.

The revision message is `Tick task`. The only content change is that task's marker, between `[ ]` and `[x]`. The surrounding bytes stay the same.

## Replaces

The unstated commit message and the unstated roles for ticking a task in view mode, in section 2.3.

## Consequences

- F04: a task checkbox in the reading view follows this rule.
- F07: a tick is one human-save revision, message `Tick task`.
- F09: the tick is allowed in view mode and does not turn editing on.
- F15: when roles exist, only Owner and Editor may tick.
