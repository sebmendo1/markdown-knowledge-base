# ADR-0036: Settings sections

**Status:** Accepted

## Context

F10 fixed Settings to three sections: General, Appearance, and MCP. General held one paragraph and MCP held connection snippets.

Since then the app has gained behavior a person needs to control or see:

- Agent activity: edits shown live, and a page that follows the agent (the MCP server and `/api/activity`).
- Browser storage that grows with drafts and saved versions, with no way to see it or clear it.
- Motion: pulses, sweeps, and smooth scrolling. These respect the operating system's reduced-motion setting, but the app cannot turn them off on its own.
- Spellcheck, which the block editor always turns on.

Constitution §6 allows Settings as a dialog, and rejects a second way to do the same thing.

## Options

1. Keep three sections, and put new controls where they are used.
2. Six sections, each holding only controls that change real behavior, or state that exists nowhere else.

## Decision

Option 2. The product owner chose it on 2026-09-26.

The sections are General, Appearance, Editor, Agents, Keyboard, and About, in that order.

- General keeps the Pages text and adds Storage: what this browser holds, the local folder, and a reset of this browser's copy. Files on disk and in the repository are untouched.
- Appearance keeps Theme and adds Motion: System or Reduce.
- Editor holds Spellcheck.
- Agents replaces MCP. It holds agent status, recent activity, Follow agents, Highlight what agents change, and the connection snippets that MCP held.
- Keyboard points to the shortcut help. It does not repeat the shortcut list, which would be a second copy of it.
- About holds the version and links to the guide, the specs, and the source.

## Replaces

- F10-REQ-005, replaced by F10-REQ-017.
- F10-REQ-012, replaced by F10-REQ-018.

## Consequences

- F10: new requirements F10-REQ-017 to F10-REQ-030.
- F20: the Keyboard section opens the help dialog that `?` opens. It is not a new shortcut.
- F21: Motion Reduce removes animation and transition in both themes.
