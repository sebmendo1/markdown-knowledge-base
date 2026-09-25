# Constitution

Apply these checks before a change merges. When `specs/source/decisions-and-changes.md` or the conflict table in `specs/PLAN.md` section 2.2 replaces a value from `specs/source/ledger-prd.md`, the check uses the later value.

## Product principles

### 1. Everything is Markdown

A document is a Markdown file with frontmatter. A type schema, a template, space settings, and agent instructions are Markdown too. Export writes that same folder of files.

Check: reject a change that stores knowledge as anything other than a Markdown file or a draft. The shipped store is files plus a draft in browser localStorage. A second store is not a document.

### 2. No AI in the product

The product stores, validates, diffs, versions, and displays. It does not generate, rewrite, or summarize. An agent does that work. The product does not.

Check: reject generation, rewriting, summarization, chat, or search-by-embedding inside the product. The editor slash menu inserts structure only.

### 3. Agents propose, humans merge

An agent key and a grant may read and create a proposal. They cannot merge, delete, or administer. A missing merge tool is the anti-slop policy.

Check: no endpoint, tool, or OAuth scope can merge, delete, or administer. Sign-in is not built yet, and agents come later. The check still applies to every endpoint, tool, and OAuth scope that exists, and to every one a spec adds.

### 4. Structure over pages

Six document types, with required fields, are how a document is queried. A concluded experiment yields a metric point when its proposal merges.

Check: reject a board, a database, or a page builder as the model. A page is a document that still needs a document type. A new field belongs on a type schema.

### 5. History is the product

A revision is immutable. Only a human save or a merged proposal creates one. Change over time is a view.

Check: reject a save or a merge that leaves no revision of the previous content. Until server revisions exist, that record is the draft history in the browser, and the files on disk. Keeping only the latest text fails the check.

### 6. Simple beats complete

One way to do each thing. If a feature needs a manual, cut it.

Check: reject a second path for something the product already does. A dialog is allowed for settings, the share sheet, search, and shortcut help. Reject a dialog for editing or for review.

### 7. Keyboard-first, Cursor-grade craft

The unset theme is dark. Light and system are available. Craft is dense, fast, and quiet. Every core action has a shortcut. Readability comes first.

Check: reject a core action with no shortcut, a theme that is light when unset, or a reading line that gives up the line near 66 characters at 17px and 1.7 line height. Preview is the default. The right column is the outline only. Solid fills stay; the hairline borders from the PRD do not come back.

## SDD rules

- Spec first. A pull request that changes behavior also changes its spec, and the spec change is reviewed first.
- IDs are stable and never reused. The forms are `F12-REQ-014`, `F12-AC-014a`, and `ADR-0007`.
- Every task traces to a requirement. No task lacks a requirement. Every requirement has at least one task and one test.
- A superseded requirement stays in place, marked, with the ADR that replaced it. A removed requirement is marked removed, with that ADR.

## Standing direction

Readability first. Cursor-grade craft. The craft reference is Cursor, Devin, and similar agentic products. The Markdown editor and reading come before sign-in and agents. The product name in the UI is markdown-kb for now.
