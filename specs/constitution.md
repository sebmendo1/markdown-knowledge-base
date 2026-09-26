# Constitution

Check every change against these rules before it merges.

If `specs/source/decisions-and-changes.md` or the conflict table in `specs/PLAN.md` section 2.2 changes a value from `specs/source/ledger-prd.md`, use the newer value.

## Summary

This page sets the rules every change must pass before it merges. It has seven product principles, each with a check. Everything is stored as Markdown files. The product never uses AI to write or rewrite content; agents do that. Agents can only propose changes, and only humans can merge, delete, or manage. Documents are organized by six types with required fields, not boards or page builders. Every save or merge keeps a copy of what came before. There is only one way to do each thing, and dialogs are limited to settings, sharing, search, and shortcut help. The app is keyboard-first and dark by default, with a shortcut for every core action and a reading line of about 66 characters. The page also sets the spec rules: specs change before code, IDs never change, every task and test traces to a requirement, and old requirements stay marked instead of being deleted. Last, it sets the direction: reading comes first, the craft bar is Cursor and similar agent tools, the editor comes before sign-in and agents, and the app is called markdown-kb for now.

## Product principles

### 1. Everything is Markdown

Every document is a Markdown file with frontmatter. So are type schemas, templates, space settings, and agent instructions. Export gives you the same folder of files.

Check: knowledge is stored only as Markdown files, or as a draft in browser localStorage. Reject any other store.

### 2. No AI in the product

The product stores, checks, compares, versions, and shows documents. It never writes, rewrites, or summarizes them. Agents do that.

Check: reject AI generation, rewriting, summaries, chat, or embedding search in the product. The slash menu only inserts structure.

### 3. Agents propose, humans merge

Agents can read and make proposals. They can't merge, delete, or manage anything. Leaving out a merge tool is how we keep low-quality AI content out.

Check: no endpoint, tool, or OAuth scope can merge, delete, or administer. This applies to everything that exists now and everything a spec adds, even though sign-in and agents aren't built yet.

### 4. Structure over pages

There are six document types, each with required fields. Documents are found by type and field. When a proposal for a finished experiment merges, it adds a metric point.

Check: reject boards, databases, or page builders as the model. Every page needs a document type. New fields go on a type schema.

### 5. History is the product

A revision never changes. Only a human save or a merged proposal makes one. Changes over time are a view.

Check: every save or merge keeps a copy of what was there before. Until the server keeps revisions, the browser's draft history and the files on disk are that copy. Keeping only the latest text fails.

### 6. Simple beats complete

There is one way to do each thing. If a feature needs a manual, cut it.

Check: reject a second way to do something the product already does. Dialogs are only for settings, sharing, search, and shortcut help. No dialogs for editing or review.

### 7. Keyboard-first, Cursor-grade craft

Dark is the default theme. Light and system themes are options. The app is dense, fast, and quiet. Every core action has a shortcut. Reading comes first.

Check: reject any of these:

- a core action with no shortcut
- light as the default theme
- a reading line that isn't about 66 characters, at 17px type and 1.7 line height

Also: preview is the default view, the right column shows only the outline, and surfaces use solid fills, not the PRD's thin borders.

## Spec rules

- **Spec first.** A pull request that changes behavior also changes its spec. The spec change is reviewed first.
- **IDs never change and are never reused.** They look like `F12-REQ-014`, `F12-AC-014a`, and `ADR-0007`.
- **Everything traces.** Every task comes from a requirement. Every requirement has at least one task and one test.
- **Old requirements stay.** A replaced requirement stays in place, marked, with the ADR that replaced it. A removed one is marked removed, with its ADR.

## Direction

Reading comes first. Aim for the craft of Cursor, Devin, and similar agent tools. Build the Markdown editor and reading before sign-in and agents. The app is called markdown-kb for now.
