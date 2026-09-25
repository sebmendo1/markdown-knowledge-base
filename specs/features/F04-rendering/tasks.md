# F04 tasks

Steps are in dependency order. Size is the parts a step touches: one module, several modules, or a schema change. There is no calendar estimate.

Steps under Shipped are in the tree, and the tests named there already prove them. F04-T-013 is not started.

## Shipped

### F04-T-001 Render CommonMark and GFM

- Requirements: F04-REQ-001, F04-REQ-002, F04-REQ-003, F04-REQ-004
- Test: `guide page renders headings, lists, and inline code` (F04-AC-001a). `GFM alignment is text-align inside a scroll region` (F04-AC-002a). `preview task checkboxes are disabled` (F04-AC-003a). `tildes strike through and bare URLs link` (F04-AC-004a).
- Size: several modules
- Depends on: none
- Modules: `components/markdown-parts.tsx` with `remark-gfm`. The table sits in a horizontal scroll region. Preview checkboxes are disabled.

### F04-T-002 Keep safe link schemes

- Requirements: F04-REQ-005
- Test: `external links open outward and javascript links lose their address` (F04-AC-005a). An `http` address opens in a new context with `rel="noreferrer"`. A `/` address stays in the app. Any other scheme keeps the text and drops the address.
- Size: one module
- Depends on: F04-T-001
- Module: the anchor renderer in `components/markdown-parts.tsx`

### F04-T-003 Render footnotes

- Requirements: F04-REQ-006
- Test: `footnotes link to the note and back` (F04-AC-006a). The reference is a superscript to `#user-content-fn-{id}`. The section heading is "Footnotes". The return link's accessible name is `Back to reference {n}`.
- Size: one module
- Depends on: F04-T-001
- Module: GFM footnotes plus `rehypeSinglePrefix` in `lib/markdown/plugins.ts`

### F04-T-004 Render callouts

- Requirements: F04-REQ-007
- Test: `only uppercase alert markers become callouts` (F04-AC-007a). The five uppercase markers become Note, Tip, Important, Warning, and Caution. Any other marker stays a blockquote.
- Size: one module
- Depends on: F04-T-001
- Module: `remarkAlerts` in `lib/markdown/plugins.ts`

### F04-T-005 Highlight code and copy it

- Requirements: F04-REQ-008, F04-REQ-009
- Test: `fenced code is highlighted with Shiki` (F04-AC-008a). `failed copy leaves the Copy label` (F04-AC-009a). The button is "Copy", accessible name "Copy code". Success shows "Copied" for 1.2 seconds. A failed write leaves "Copy" and shows no error. An unknown language is plain text.
- Size: several modules
- Depends on: F04-T-001
- Modules: `lib/markdown/highlight.ts`, `CodeBlock` in `components/blocks.tsx`

### F04-T-006 Render math

- Requirements: F04-REQ-010
- Test: `KaTeX renders valid math and titles a parse error` (F04-AC-010a). A bad expression is the source in red, with the parser message on the title, and the rest of the page stays.
- Size: several modules
- Depends on: F04-T-001
- Modules: `remark-math` and `rehype-katex` in `markdownPlugins`. The server render includes the math HTML. A locally rendered page runs KaTeX in the page.

### F04-T-007 Draw Mermaid

- Requirements: F04-REQ-011
- Test: `Mermaid draws a flowchart and shows a parse error` (F04-AC-011a). Security level is `strict`. The figure is busy until it is within 600px of the preview pane. A rejected diagram shows the parser message in red and leaves the page.
- Size: one module
- Depends on: F04-T-001
- Module: `MermaidBlock` in `components/blocks.tsx`

### F04-T-008 Render a CSV or TSV table

- Requirements: F04-REQ-012
- Test: `CSV header sorts ascending` (F04-AC-012a). `csv keeps quoted commas in one cell`, in `lib/markdown/markdown.test.ts`. Numeric cells sort as numbers. Other cells sort as Unicode text. An empty parse shows no table.
- Size: several modules
- Depends on: F04-T-001
- Modules: `lib/markdown/csv.ts`, `CsvTable` in `components/blocks.tsx`

### F04-T-009 Render a highlight mark

- Requirements: F04-REQ-013
- Test: `double equals render a mark` (F04-AC-013a). The marked text is one line and contains no `=`.
- Size: one module
- Depends on: F04-T-001
- Module: `remarkHighlight` in `lib/markdown/plugins.ts`

### F04-T-010 Strip unsafe HTML

- Requirements: F04-REQ-014
- Test: `script tags are stripped without an error` (F04-AC-014a). The safe set is the sanitizer's built-in tags plus `mark`. `class` and `id` stay. `style` stays on `div`, `span`, and `pre`. A table cell may keep `align`. An image may keep `width`. No error message is shown for a stripped tag.
- Size: one module
- Depends on: F04-T-001
- Module: `sanitizeSchema` in `lib/markdown/schema.ts`, applied by `rehype-sanitize`

### F04-T-011 Show a bad frontmatter message

- Requirements: F04-REQ-015
- Test: `bad frontmatter shows the message and the body` (F04-AC-015a). A non-map shows `Frontmatter must be a map.` A thrown parser error shows the parser's message. The body still renders. There is no product error code.
- Size: one module
- Depends on: F04-T-001
- Module: `lib/markdown/frontmatter.ts`, shown above the body in the preview

### F04-T-012 Keep the reading measure

- Requirements: F04-REQ-016
- Test: `reading column stays 17px and does not overflow at 390px` (F04-AC-016a). Type is 17px, line height is 1.7, width is `min(100%, 66ch + 64px)` and at most 760px, including on a narrow screen.
- Size: one module
- Depends on: none
- Module: `app/reading.css`. The numbers match [`specs/contracts/tokens.md`](../../contracts/tokens.md).

## Not started

This step is the target. It is not in the tree. F04-T-001 through F04-T-010 test each syntax on its own and do not satisfy it.

### F04-T-013 Render one document the same in view, preview, and review

- Requirements: F04-REQ-017
- Test: `one document using every Markdown capability renders the same in view, editor preview, and review` (F04-AC-017a).
- Size: several modules
- Depends on: F04-T-001, F04-T-002, F04-T-003, F04-T-004, F04-T-005, F04-T-006, F04-T-007, F04-T-008, F04-T-009, F04-T-010, F04-T-011
- Modules: one fixture document that uses every syntax in Markdown capabilities, shown in view, in the editor preview, and in review. The three renders are the same. A review diff that shows a math span, a callout, and an embed is not this step.
