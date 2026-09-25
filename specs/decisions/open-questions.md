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
