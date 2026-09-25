# ADR-0009: Modals

**Status:** Accepted

## Context

The PRD says to prefer inline editing and side panels over modals. The only modals are confirmations for irreversible actions.

What is live uses dialogs for more than that. C6 added a settings window with a section list and a content pane. C8 added a share sheet. Search and shortcut help are dialogs too.

Section 7 Q5 asks whether those dialogs stay. The recommended answer, adopted here, is yes. The PRD rule narrows to: no dialogs for editing or review flows.

## Options

1. Dialogs only to confirm an irreversible action.
2. Dialogs for settings, share, search, and shortcut help. No dialogs for editing or review flows. Irreversible-action confirmations may still be dialogs.
3. Dialogs for every screen, including editing and review.

## Decision

These are dialogs: settings, the share sheet, search, and shortcut help.

Editing and review flows do not use dialogs. A confirmation for an irreversible action may still be a dialog.

## Replaces

PRD interaction rule "The only modals are confirmations for irreversible actions." Superseded by C6, C8, and section 7 Q5. The narrowed rule is: no dialogs for editing or review flows.

## Consequences

- F09: editing does not open a dialog to enter or leave editing.
- F10: settings is a dialog with a section list and a content pane.
- F11: the share sheet is a dialog.
- F12: review actions are not dialogs, except a confirmation for an irreversible action.
- F17: search is a dialog.
- F20: shortcut help is a dialog.
