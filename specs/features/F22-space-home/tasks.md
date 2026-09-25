# F22 tasks: Space home

Dependency order. Each step names the requirements it satisfies, the test that proves them, and a size. Size is one module, several modules, or a schema change. No step lacks a requirement. These steps do not add a table.

## 1. Keep the project cards and the editor empty pages

Satisfies: F22-REQ-001, F22-REQ-002, F22-REQ-003, F22-REQ-004, F22-REQ-005, F22-REQ-006, F22-REQ-007, F22-REQ-009, F22-REQ-020.

Size: several modules (`app/page.tsx`, `components/launcher.tsx`, `components/missing-page.tsx`, `components/page-tree.tsx`, `components/workspace-store.ts`).

Tests:

- F22-AC-001a in `lib/space/cards.test.ts`
- F22-AC-002a, F22-AC-002b in `lib/space/cards.test.ts`
- F22-AC-003a in `lib/space/cards.test.ts`
- F22-AC-004a, F22-AC-005a, F22-AC-005b, F22-AC-006a in `lib/space/empty-pages.test.ts`
- F22-AC-007a in `lib/space/empty-pages.test.ts`
- F22-AC-009a in `lib/space/empty-pages.test.ts`
- F22-AC-020a in `lib/space/empty-pages.test.ts`

`/` shows the brand, the heading `Projects`, and the lead line. A card shows kind, description, four folder names, overflow, and the foot. `New project` uses its line. Empty, missing, and unknown pages use the shipped copy and no illustration. The sidebar empty line is the `+` sentence. Before hydration, `has no pages yet` is not shown.

## 2. Choose redirect or the orientation screen

Satisfies: F22-REQ-008, F22-REQ-010.

Size: one module (`app/[project]/page.tsx`).

Tests: F22-AC-008a, F22-AC-008b, F22-AC-010a in `lib/space/route.test.ts`.

Depends on step 1. While the Ledger home is not in use, `/{project}` redirects to the home path and does not show a harness card, an experiment list, or a proposal count. When it is in use, `/guide` stays `/guide` and shows the orientation screen. The URL is not `/memento`.

## 3. Render the space file

Satisfies: F22-REQ-011.

Size: one module (`components/space-home/space-home.tsx`).

Test: F22-AC-011a in `lib/space/body.test.ts`.

Depends on step 2. The body of `.ledger/space.md` goes through the document renderer. The YAML block is not shown as the body. A missing or archived head is `space_missing`.

## 4. Fill the four regions

Satisfies: F22-REQ-012, F22-REQ-013, F22-REQ-014, F22-REQ-015.

Size: one module (`lib/space/home.ts`).

Tests:

- F22-AC-012a, F22-AC-012b, F22-AC-012c in `lib/space/home.test.ts`
- F22-AC-013a, F22-AC-013b in `lib/space/home.test.ts`
- F22-AC-014a, F22-AC-014b in `lib/space/home.test.ts`
- F22-AC-015a in `lib/space/home.test.ts`

Depends on step 3. One active non-archived harness, tie broken by smaller document id. Five experiments by date, then head time, then smaller id, with the status word. The proposal count includes `open` and `changes_requested`, including a stale open proposal, and excludes `merged`. A public read-only view hides the count and the inbox link. Five current findings. A superseded finding is absent.

## 5. Seed a space that was not imported

Satisfies: F22-REQ-016.

Size: one module (`lib/space/seed.ts`).

Tests: F22-AC-016a, F22-AC-016b, F22-AC-016c in `lib/space/seed.test.ts`.

Depends on step 2. A space created without a zip gets `.ledger/space.md`, `.ledger/agents.md`, and the six F02 type files, and no experiment. The space file is `type: doc` with the quoted title and the default-harness sentence. A zip that lacks `.ledger/space.md` does not gain that file. This step does not call the F19 importer.

## 6. Teach the empty regions in one line

Satisfies: F22-REQ-017, F22-REQ-018.

Size: one module (`components/space-home/space-home.tsx`).

Tests: F22-AC-017a, F22-AC-017b, F22-AC-018a, F22-AC-018b in `lib/space/empty-regions.test.ts`.

Depends on steps 4 and 5. The chart note is present when there is one eval and two experiments, and absent when there is one eval and three experiments. The harness empty line is `No harness yet. Add the setup you run.` with the single action `New harness`. No empty region has an illustration or a second action.

## 7. Open the home by role

Satisfies: F22-REQ-019.

Size: one module (`app/[project]/page.tsx`).

Tests: F22-AC-019a, F22-AC-019b, F22-AC-019c in `lib/space/access.test.ts`.

Depends on steps 2 and 4. While sign-in is absent, the proposal count is shown and no role is checked. A Viewer may read the home when sign-in exists. An agent key receives `permission_denied` and does not see the home.
