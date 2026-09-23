---
type: doc
title: Decisions and change requests since the PRD
---

# Decisions and change requests since the PRD

This file records every product input given after the Ledger PRD, in order, as it was stated. It is a source for the specs. Specs cite it by section.

## D. Scoping answers, Sep 22, 2026

Eight questions were asked before the first build. The answer given was: "1c, 2b (Vercel, using Vercel MCP through Cursor), 3. No auth yet, 4. We'll work on this later. 5. Focus on running and visualizing the markdown editor first. 6. Just call it markdown-kb for now, 7.A, 8. Just markdown editor with charts, mermaid, etc. Use the Mobbin MCP to pull data from how Cursor, Devin, and similar agentic tools are designed, and focus on increasing readability and having the best markdown experience possible."

| ID | Question | Options offered | Answer |
| --- | --- | --- | --- |
| D1 | First implementation scope | A: milestones 1–4. B: 1–5. C: full v1, milestones 1–7 | C, full v1 |
| D2 | Where it runs | A: local Postgres. B: hosted from the start (Neon, Vercel, OAuth secrets). C: embedded PGlite | B, hosted on Vercel through the Vercel MCP |
| D3 | Human sign-in | A: magic link only. B: GitHub, Google, magic link. C: one seeded local owner | No auth yet |
| D4 | How agents connect | A: API keys only. B: API keys and MCP OAuth 2.1 | Later |
| D5 | Memento contents on first boot | A: schemas and instructions only. B: plus marked sample documents | Run and show the Markdown editor first |
| D6 | Product name in the UI | A: Ledger, space Memento. B: Memento. C: Ledger, name in one place | markdown-kb for now |
| D7 | Who may save directly | A: Owner and Editor save, Contributors propose, agents never merge. B: Owner only | A, as in the PRD |
| D8 | Experiment attachments | A: `assets/` is enough. B: optional run-log attachment | Markdown editor with charts, Mermaid, and similar; attachments not in scope |

Standing direction from the same answer: use Mobbin references from Cursor, Devin, and similar agentic tools. Readability and the Markdown experience come first.

## C. Change requests, in order

Each request below was built, checked in the browser, and deployed to production. Where a request changes a PRD value, the request is the newer instruction.

| ID | Request, as stated | What it changed |
| --- | --- | --- |
| C1 | "Vercel connected, continue. Feel free to create a new project and build there." "A new Vercel project that is." | Hosting on a new Vercel project, `markdown-kb-editor` |
| C2 | "Instead of switching between Preview and split in the UI, make this change work through a shortcut. Preview should be as default. Also minimize the borders, use more solid colors." | No mode control on screen. ⌘/ switches. Preview is the default. Hairline borders removed in favor of solid fills |
| C3 | "Make the left-sidebar expand / retract, and on retract, make it invisible, with the top-left icon to appear at the top." | Sidebar hides fully. A panel icon at the top left brings it back. The choice persists |
| C4 | "Optimize design for mobile and all form factor responsiveness with key principle: readability." | Reading line near 66 characters at 17px, 1.7 line height. Split stacks on narrow screens. 44px touch targets on coarse pointers |
| C5 | "make border radius slightly more exaggerated, and fix small details." | Radius 12px controls, 10px outline rows, 18px content blocks, 20px dialogs, 8px inline code, 6px mark |
| C6 | "Add settings and in settings add the ability to change between light / dark / system. Structure settings the same way as it's done in Cursor / Devin / etc." | Settings window with a section list and a content pane. Theme: Light, Dark, System. Dark when unset |
| C7 | "Enhance the UI further so that it's the three column design, and that the top and bottom sections are incorporated into the main section color, so it looks aesthetically more similar to how Cursor looks." | Files, page, and outline as three full-height columns. Title row and status line share the page color |
| C8 | "Add the option to edit and turn on / off editing. Also enable sharing so that I can share the docs similar to a Google Docs file." | Edit button in the title row. Share sheet with "Anyone with the link", Can view or Can edit, and Copy link. The link sets the starting mode; it grants no rights |
| C9 | "Review all of the original product specs. Create a plan to transform them so that they become detailed and comprehensive specs to be used for SDD." | This plan, in `specs/PLAN.md` |
