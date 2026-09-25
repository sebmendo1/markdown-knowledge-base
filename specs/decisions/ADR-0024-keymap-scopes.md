# ADR-0024: Keymap scopes

**Status:** Proposed

## Context

The PRD binds `C` to New document, and also to Request changes on the review screen. It binds `E` to Edit, and also to Edit before merge. The same key cannot do both in one place. The keymap needs scopes.

Phase 3 names the scopes the contract will use: global, document, editor, review, and dialog. This ADR assigns the conflicting keys to those scopes.

This is a recommended resolution. The product owner has not confirmed it.

## Options

1. Let `C` and `E` mean both actions everywhere, and let the last handler win.
2. Give each shortcut one action per scope, with dialog, then editor, then review, then document, then global.
3. Remove `C` and `E` from review and keep only the global meanings.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

Exactly one scope handles a keypress. The first scope that matches wins, in this order: dialog, editor, review, document, global.

**Dialog.** A dialog is open (settings, share, search, shortcut help, or an irreversible-action confirmation). Single-character shortcuts do not reach the page behind the dialog. `Escape` closes the top dialog. `⌘K` does not open a second dialog while one is open.

**Editor.** Editing is on and focus is in the source. `C`, `E`, `M`, `R`, `J`, `K`, and `D` are text input, not commands. `⌘S` saves. `⌘/` turns editing off.

**Review.** A proposal is on screen, focus is not in a text field, and no dialog is open. `C` requests changes and does not create a document. The request is not sent until the note is non-empty. `E` edits the proposal before merge. `M` merges. `R` rejects. `D` toggles the rendered diff and the source diff. `J` and `K` move to the next and previous proposal.

**Document.** A document is on screen, editing is off, focus is not in a text field, and no dialog is open. `C` starts a new document. `E` turns editing on. `⌘/` turns editing on.

**Global.** No dialog is open and focus is not in a text field. `⌘K` opens search. `?` opens shortcut help. `G` then `I` opens the inbox. `G` then `T` opens the timeline. `G` then `M` opens metrics. `⌘\` toggles the outline column.

A single-character shortcut does not fire while focus is in a text field. That includes the commit-message line and any dialog field.

## Replaces

The unspecified scopes for `C` (New document and Request changes) and `E` (Edit and Edit before merge) in section 2.3.

## Consequences

- F09: `E` and `⌘/` enter editing only in the document scope. Inside the editor they do not start a second edit session. `C` in the editor inserts the character `c`.
- F12: on the proposal screen, `C` requests changes and `E` edits before merge.
- F20: the keymap records these five scopes and this precedence.
