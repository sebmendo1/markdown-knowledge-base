# Open questions

Only the product owner can close these. The plan already proceeds with the recommended answer in each row. Specs written before an answer use that recommendation.

Owner on every row: product owner.

## Plan section 7

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| Q1 | Where are the specs going: the full Ledger loop (agents propose, humans merge), or markdown-kb as an editor with Ledger later? | Spec the full Ledger loop. Mark the editor features as the first release. | product owner | F07, F11, F12, F13, F14, F15, F16, F18, F19, F22 |
| Q2 | Which values win where the PRD and the change requests differ (plan section 2.2)? | The change requests, since they are newer and live. [ADR-0001](ADR-0001-name-and-routes.md) through [ADR-0011](ADR-0011-phones.md) record that. | product owner | F01, F07, F08, F09, F10, F11, F15, F20, F21, F22 |
| Q3 | What does "Can edit" mean once sign-in exists? | Link access stays a starting mode. Edit rights come only from a role, through invites (F11, F15). See [ADR-0010](ADR-0010-sharing.md). | product owner | F11, F15 |
| Q4 | Editor model: source beside a preview, as built, or live preview inline, as in the PRD? | Keep the built editing mode. Spec inline live preview as a later option inside F09. See [ADR-0004](ADR-0004-editor-model.md). | product owner | F09 |
| Q5 | Dialogs: keep settings, share, search, and help as dialogs? | Yes. Narrow the PRD rule to "no dialogs for editing or review flows". See [ADR-0009](ADR-0009-modals.md). | product owner | F09, F10, F11, F12, F17, F20 |
| Q6 | SDD tooling: GitHub Spec Kit commands, Kiro-style requirements, design, and tasks, or plain Markdown in the plan's layout? | Plain Markdown in the layout in plan section 3. It maps onto Spec Kit's specify, plan, and tasks steps. Not Spec Kit commands, and not Kiro. | product owner | F01–F22 and X (spec format only) |
| Q7 | The six PRD open questions | Keep them open, with the product owner on each row below. The name and the direct-save rule already have partial answers in D6 and D7. | product owner | The six PRD rows below |

## PRD open questions

The PRD lists these six at the end and leaves them open. D6 and D7 answer the name and the save rule only in part. The plan does not treat the other four as answered.

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| PRD-1 | Final product name. "Ledger" is a placeholder. | Keep markdown-kb in the UI until a final name is chosen (D6, [ADR-0001](ADR-0001-name-and-routes.md)). | product owner | F08, F22 |
| PRD-2 | Should humans with the editor role also go through proposals, for a stricter record? The PRD's v1 answer is no. | No. Owner and Editor save directly. Contributors propose. Agents never merge (D7, [ADR-0002](ADR-0002-sign-in-and-roles.md)). | product owner | F09, F12, F15 |
| PRD-3 | Do experiments need a run-log attachment (raw outputs, traces) in v1, or are assets enough? | No run-log attachment. D8 left attachments out of the editor work. Do not add a run-log field. When assets exist, `assets/` is enough. | product owner | F01, F09 |
| PRD-4 | Which evals define Memento's launch bar, and what are their metrics and baselines? | Do not hard-code a launch-bar eval. The owner writes the eval files, which is what the PRD already says. Specs name no launch-bar eval. | product owner | F16, F22 |
| PRD-5 | Should `get_context` be configurable per space, for example which sections to include? | Not in v1. The pack stays the fixed one in [ADR-0028](ADR-0028-context-token-budget.md). | product owner | F13 |
| PRD-6 | Confirm this side project has no overlap with day-job agreements before sharing it publicly. | Do not present the product as a public service until the owner confirms. The share sheet in [ADR-0010](ADR-0010-sharing.md) grants no rights and is not that public launch. | product owner | F11 |

## Found while aligning the code (2026-09-25)

These came up while checking the specs against the code. Each row keeps the shipped behavior until the owner answers.

| ID | Question | Recommended answer | Owner | Blocks |
| --- | --- | --- | --- | --- |
| A1 | F09-REQ-021 limits the slash menu to seven inserts. The shipped menu also inserts lists, quote, divider, toggle, embed, Mermaid, chart, CSV, and math. Remove them, or widen the requirement? | Widen it. Every shipped item inserts structure, and none sends text to a model, which is what constitution §2 checks. Replace F09-REQ-021 with a requirement that lists the shipped items, through a new ADR. | product owner | F09 |
| A2 | Export exists on the project card (F19-REQ-001) and in the page tree menu ("Export project (.zip)"). Constitution §6 allows one path. Which stays? | Keep the page tree menu, which works for every project kind and matches the F10 General copy ("Export a project from the Pages menu"). Remove the card action, and rewrite F19-REQ-001 and F19-AC-001a to F19-AC-001c. | product owner | F10, F19 |
| A3 | `specs/contracts/db.sql` grants `ledger_app` no write on `users`, `memberships`, `spaces.public_read`, `agent_keys`, or `audit_events`, and has no function that writes them. F11, F12, F13, F14, and F15 need those writes. | Add SECURITY DEFINER writer functions for each, in one schema ADR before storage work starts (F07-T-005). | product owner | F07, F11, F12, F13, F14, F15 |
| A4 | `append_revision` calls `assert_writer`, which needs a session user with an Owner or Editor membership. F12-T19 merges with `LEDGER_AUTH` unset. | Require `LEDGER_AUTH` before `LEDGER_REVIEW`. Proposals ship after sign-in. | product owner | F12, F15 |
| A5 | The invites table is specified twice: F11-T-008 and F15-T03 (`lib/auth/invites.ts`, with `expires_at` and `created_by`). | Use the F15 shape. F11 reuses `lib/auth/invites.ts`. | product owner | F11, F15 |
| A6 | Revisions and `audit_events` carry `agent_key_id` but no OAuth grant id, so a merged proposal from an OAuth grant loses its agent attribution. | Add a nullable `oauth_grant_id` to `revisions` and `audit_events`, with a check that at most one of the two agent ids is set. | product owner | F12, F14 |
| A7 | `app/[project]/inbox`, `app/[project]/metrics`, and `app/[project]/timeline` are static segments. They hide a page whose path is `inbox`, `metrics`, or `timeline` at the project root. | Reserve those three names at the project root. Creating or renaming a page to one of them fails with `path_invalid`. | product owner | F01, F12, F16, F18 |
| A8 | Streamable HTTP on `app/api/mcp/route.ts` uses GET, which today returns the MCP snippets. | Move the snippets to `app/api/mcp/snippets/route.ts` in F13-T20. | product owner | F10, F13 |
