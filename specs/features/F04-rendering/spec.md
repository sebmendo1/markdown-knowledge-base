# F04 Rendering

## Summary

A page in preview is GitHub-flavored Markdown plus callouts, highlighted code, math, Mermaid, CSV tables, highlight marks, footnotes, and a short list of safe HTML. The column stays near a 66-character line at 17px, including on a narrow screen, where the line shortens and the type does not.

## Status and scope

Mostly built. This spec covers the syntax that renders in preview today.

A `chart`, `vega`, or `vega-lite` fence also renders. That behavior is F05, not this spec. The outline column is F08. Wiki links and embeds are F03; this spec covers what an embed's body looks like only by using the same renderer. Editing the source is F09.

Not started, from Markdown capabilities: emoji shortcodes, `~sub~` and `^sup^` as subscript and superscript, fenced-code line highlights such as `{3-5}`, footnote hover previews, ticking a task in preview so that the tick saves a revision, image zoom, and a video player for `assets/` media. D8 leaves attachments out of scope. Graphviz, maps, and 3D models were planned for a later version and are not started.

## Users and stories

There is no sign-in. "Reader" means the person looking at the page.

- **F04-US-001** As a reader, I want ordinary Markdown to look like a document, so that notes are readable without learning a private syntax.
- **F04-US-002** As a reader, I want diagrams, math, tables, and code to render in the column, so that a finding can carry its evidence.
- **F04-US-003** As a reader, I want a broken block to show its message and leave the rest of the page up, so that one error does not hide the document.

## Requirements

**F04-REQ-001** The system shall render CommonMark headings, emphasis, strong text, lists, links, images, blockquotes, and thematic breaks in the reading column.

**F04-REQ-002** The system shall render GitHub pipe tables, including column alignment, inside a region that scrolls horizontally when the table is wider than the column.

**F04-REQ-003** The system shall render `- [ ]` and `- [x]` as checkboxes. In preview each checkbox shall be disabled, and toggling it shall not change the page or save a revision.

**F04-REQ-004** The system shall render `~~text~~` and `~text~` as strikethrough, and a bare `http` or `https` URL as a link whose text is the URL.

**F04-REQ-005** When a link's address starts with `http`, the system shall open it in a new browsing context with `rel="noreferrer"`. When the address starts with `/`, the system shall navigate inside the app. If the address uses a scheme other than `http`, `https`, `irc`, `ircs`, `mailto`, or `xmpp`, the system shall keep the link text and drop the address.

**F04-REQ-006** The system shall render a footnote reference as a superscript link to `#user-content-fn-{id}`, and a footnote section whose heading text is "Footnotes", with a return link whose accessible name is `Back to reference {n}`.

**F04-REQ-007** When a blockquote's first text starts with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, or `[!CAUTION]`, the system shall render a callout whose title text is Note, Tip, Important, Warning, or Caution. The marker must be those uppercase words. Any other marker shall stay a blockquote.

**F04-REQ-008** The system shall highlight a fenced code block with Shiki and show a button labeled "Copy" whose accessible name is "Copy code". The loaded languages are typescript, tsx, javascript, jsx, json, yaml, bash, markdown, python, css, html, sql, diff, and swift, plus the aliases ts, js, py, yml, sh, shell, zsh, md, txt, and plaintext. An unknown language shall be highlighted as plain text.

**F04-REQ-009** When the copy succeeds, the system shall change the button label to "Copied" for 1.2 seconds and then restore "Copy". If the clipboard write fails, the system shall leave the label "Copy" and shall show no error.

**F04-REQ-010** The system shall render `$…$` and `$$…$$` with KaTeX. Repository HTML includes that math from the server render. A page the browser renders locally runs KaTeX in the page. If KaTeX cannot parse the expression, the system shall show the source in red, with the parser message on the element's title, and shall keep rendering the rest of the page.

**F04-REQ-011** When a fenced block is tagged `mermaid`, the system shall draw it in the browser with Mermaid's security level `strict`, after the figure comes within 600px of the preview pane. Until it draws, the figure shall be marked busy. If Mermaid rejects the diagram, the system shall show the parser message in red and shall not remove the surrounding page.

**F04-REQ-012** When a fenced block is tagged `csv` or `tsv`, the system shall render a table whose first row is the header. Choosing a header shall sort the body by that column, ascending then descending. Cells that are both numbers shall sort numerically; other cells shall sort by Unicode text. A quoted comma shall stay inside one cell. An empty parse shall show no table.

**F04-REQ-013** The system shall render `==text==` as a highlight mark when the marked text is on one line and contains no `=`.

**F04-REQ-014** The system shall keep the HTML tags in the safe set and strip every other tag, with no error message. The safe set adds `mark` to the sanitizer's built-in tags, which already include `a`, `b`, `blockquote`, `br`, `code`, `del`, `details`, `div`, `em`, `h1` through `h6`, `hr`, `i`, `img`, `kbd`, `li`, `ol`, `p`, `pre`, `span`, `strong`, `sub`, `summary`, `sup`, `table` and its row and cell tags, and `ul`. `class` and `id` are allowed. The sanitizer schema allows `style` on `div`, `span`, and `pre`. Table cells keep an `align` value, which the page shows as `text-align` (F04-REQ-002). An image may carry `width`. A `script` element shall not remain in the rendered page.

**F04-REQ-015** If the page starts with YAML frontmatter that is not a map, or the YAML parser throws, the system shall show that message in red above the body and shall still render the body. The message for a list or other non-map is `Frontmatter must be a map.` A thrown parser error uses the parser's own message. Neither case has a product error code.

**F04-REQ-016** The system shall set the reading column to 17px type and a line height of 1.7. The column width shall be `min(100%, 66ch + 64px)` and shall not exceed 760px. On a narrow screen the type size shall stay 17px.

**F04-REQ-017** When one document uses every syntax in Markdown capabilities, the system shall render that document the same in view, in the editor preview, and in review.

## Acceptance scenarios

### F04-AC-001a CommonMark on the guide page

Given `/guide/docs/writing` in preview, when the page is shown, then it has a heading "Writing in markdown-kb", list items, a blockquote that became a callout, and inline code.

Test name: `guide page renders headings, lists, and inline code`. Manual, passed. Chrome, local dev server, desktop 1280×900 and 390×844.

### F04-AC-002a Aligned table scrolls in a region

Given a table with a left-aligned column and a right-aligned column, when the server HTML is read, then the cells carry `text-align:left` and `text-align:right` inside `div.table-scroll`.

Test name: `GFM alignment is text-align inside a scroll region`. Manual, passed. Server HTML of the probe page on the local dev server. The probe page was removed after the check.

### F04-AC-003a Tasks do not toggle in preview

Given the task list on `/guide/docs/writing` in preview, when the boxes are inspected, then the checked box is disabled and checked, and the open box is disabled and unchecked.

Test name: `preview task checkboxes are disabled`. Manual, passed. Desktop and 390px.

### F04-AC-004a Strikethrough and autolink

Given `~~gone~~`, `~sub~`, and a bare `https://example.com`, when the probe page is shown in preview, then both tilde forms are strikethrough (`del`), `:rocket:` stays the characters `:rocket:`, `^sup^` stays with the carets, and the URL is a link whose text is the URL.

Test name: `tildes strike through and bare URLs link`. Manual, passed. Desktop, preview, probe page. Confirmed in the server HTML as well as the live page.

### F04-AC-005a External, internal, and dropped schemes

Given the Vega-Lite link on the writing page, when it is inspected, then `target` is `_blank` and `rel` is `noreferrer`. Given `[bad](javascript:alert(1))`, when the probe page is rendered, then the text "bad" remains and the anchor has no `href`.

Test name: `external links open outward and javascript links lose their address`. Manual, passed. Desktop. The internal wiki addresses are F03.

### F04-AC-006a Footnotes

Given the writing page, when the footnote is rendered, then the reference is a superscript link to `#user-content-fn-1` and the note's return link has the accessible name `Back to reference 1`. The section heading text is "Footnotes".

Test name: `footnotes link to the note and back`. Manual, passed. Desktop and 390px, preview. There is no hover preview.

### F04-AC-007a Callouts

Given the writing page in preview, when the callouts are read, then the title texts are Note, Tip, Important, Warning, and Caution. Given `[!note]` in lowercase, when the probe page is shown, then it is a blockquote whose text starts `[!note] lowercase marker`, and `[!NOTE]` is a callout titled Note.

Test name: `only uppercase alert markers become callouts`. Manual, passed. Desktop. The five titles were also present at 390px on the writing page.

### F04-AC-008a Highlighted code

Given the `ts` fence on the writing page, when preview HTML is read, then the block is Shiki output and the control's accessible name is "Copy code".

Test name: `fenced code is highlighted with Shiki`. Manual, passed. Desktop and 390px.

### F04-AC-009a Copy failure is silent

Given the Copy control on the writing page, when it is activated in this headless Chrome and the clipboard write does not succeed, then the label stays "Copy".

Test name: `failed copy leaves the Copy label`. Manual, passed. The success label "Copied" was not observed: the clipboard write did not succeed in this environment. The 1.2 second restore is the code path, not a timed browser check.

### F04-AC-010a Math and a broken expression

Given the writing page, when the display math is rendered, then a KaTeX block shows 42, a less-than-or-equal sign, and 75. Given `$$\frac{$$` with no closing brace, when the probe page is shown, then the red element contains `\frac{` and its title starts `ParseError: KaTeX parse error:`. The links below it still render.

Test name: `KaTeX renders valid math and titles a parse error`. Manual, passed. Desktop. Valid math was also in the 390px writing page.

### F04-AC-011a Mermaid draws and reports a parse error

Given the flowchart on the writing page, when the figure is scrolled into view, then it is no longer busy and it contains an SVG. Given a fence `flowchart LR` followed by `A -->` and no node, when the figure is scrolled into view, then there is no SVG and the red text starts `Parse error on line 3:`.

Test name: `Mermaid draws a flowchart and shows a parse error`. Manual, passed. Desktop, preview. Before the scroll, the broken figure was busy and empty.

### F04-AC-012a CSV sort

Given the csv fence on the writing page, when the header "pane" is chosen, then the header reads `pane ↑`.

Test name: `CSV header sorts ascending`. Manual, passed. Desktop.

Given the quoted row `Files,"Jump, then read"`, when it is parsed, then the second cell is `Jump, then read`.

Test name: `csv keeps quoted commas in one cell`. Automated, passed (`npm test`).

### F04-AC-013a Highlight

Given `==Highlight==` on the writing page, when preview is shown, then the word Highlight is a `mark` element.

Test name: `double equals render a mark`. Manual, passed. Desktop and 390px.

### F04-AC-014a Script is removed

Given a `script` element in the probe body, when the rendered page is searched, then `.md` contains no `script` element, and the rest of the page is still there.

Test name: `script tags are stripped without an error`. Manual, passed. Desktop, preview, probe page.

### F04-AC-015a Frontmatter that is not a map

Given a frontmatter body that is a YAML list, when the probe page is shown in preview, then the red line is `Frontmatter must be a map.` and the heading "Link probe" is still rendered.

Test name: `bad frontmatter shows the message and the body`. Manual, passed. Desktop, preview. The same page in editing showed no `.block-error`; that difference is F09's surface, and the preview message is this requirement.

### F04-AC-016a Reading measure

Given the writing page in preview at 1280×900, when the column is measured, then the font size is 17px, the line height is 28.9px (1.7 × 17px), and the column is 760px wide including padding. At 390×844 the font size is still 17px, the column is 390px wide, and the page does not scroll sideways.

Test name: `reading column stays 17px and does not overflow at 390px`. Manual, passed. Chrome, local dev server, both viewports.

### F04-AC-017a One document, three surfaces

Given one document that uses every syntax in Markdown capabilities, when that document is shown in view, in the editor preview, and in review, then the three renders are the same.

Test name: `one document using every Markdown capability renders the same in view, editor preview, and review`. Not run.

## Edge cases and errors

No rendering failure in this feature has a product error code or a hint. The visible message is the whole report.

| Situation | Code | Message | Hint |
| --- | --- | --- | --- |
| Frontmatter is not a map | None | `Frontmatter must be a map.` | None |
| Frontmatter YAML throws | None | The parser's message. The fallback string in code, if the throw is not an Error, is `Invalid YAML.` That fallback was not raised in the browser. | None |
| KaTeX cannot parse | None | The expression stays visible in red. The title is the parser message, for example `ParseError: KaTeX parse error: Unexpected end of input in a macro argument, expected '}' at end of input: \frac{`. | None |
| Mermaid cannot parse | None | The parser message, for example `Parse error on line 3:` followed by the diagram excerpt. | None |
| Clipboard copy fails | None | None. The button stays `Copy`. | None |
| Tag outside the safe set, or a `javascript:` address | None | None. The tag or the address is dropped. Link text remains. | None |
| Unknown code language | None | None. The block is highlighted as plain text. Not loaded in the browser. | None |
| Empty csv or tsv | None | None. No table is shown. Not loaded in the browser. | None |

A diagram or math error does not replace a previously drawn SVG for that same figure in this implementation: a failed Mermaid render shows the message and no SVG. The PRD line about keeping the last good render above the error is not what this path does.

## Limits and budgets

These are implementation limits, not a percentile service level. No p95 render budget is published.

- Reading type: 17px. Line height: 1.7, measured at 28.9px. Column: `min(100%, 66ch + 64px)`, also capped at 760px. Measured at 760px on a 1280px-wide Chrome viewport, and 390px on a 390px-wide viewport. Environment: local Next.js dev server, Chrome headless, 25 Sep 2026.
- Mermaid starts drawing when the figure is within 600px of the preview pane, and the busy figure reserves at least 180px of height. Drawn SVGs are kept in memory, at most 60, keyed by theme plus source. The cache cap was not filled in the browser.
- Copy confirmation lasts 1.2 seconds after a successful write.
- Code highlight is loaded when the block is shown. On a repository page the server HTML already includes Shiki for that response.
- KaTeX display math scrolls horizontally inside the column rather than widening the page.
- CSV number-versus-text comparison has no row cap in the code. A large table was not timed.

## UI states

| State | Desktop (1280px) | 390px wide |
| --- | --- | --- |
| Success | The column shows the rendered page: callouts, the code block with Copy, KaTeX, a drawn diagram after it nears the pane, a CSV table, footnotes, and marks. Status reads `Viewing` (F09). | Same content. Font stays 17px. Outline is hidden. Copy is fully visible because a coarse pointer was emulated. No sideways page scroll. |
| Empty | A page whose body is empty shows an empty column. No empty-state sentence is rendered by this feature. Not loaded as its own fixture. | Same. |
| Loading | A Mermaid figure is busy and empty until it nears the pane. A code block shows the plain text until Shiki HTML is available; repository HTML already contains Shiki. | The writing-page diagram was still busy when the 390px check finished, because it was not scrolled into view. |
| Error | Red `.block-error` or red KaTeX, with the messages above. No error code. | Not separately loaded for the broken fixtures. The writing page at 390px had no error. |
| Partial | A broken diagram, a broken formula, or bad frontmatter leaves the rest of the page in place. Observed together on the probe page. | Not separately loaded. |

Production `https://markdown-kb-editor.vercel.app/guide/docs/writing` returned the same markers: callouts, KaTeX, a Mermaid figure, a CSV table, footnotes, a mark, and the Copy control. Production was not clicked.

## Out of scope

- `chart` / Vega-Lite fences, including remote-data refusal and export (F05). A chart host is present on the writing page and is not specified here.
- Wiki targets, embeds, and "Linked from" (F03).
- The outline, the three-column shell, and settings (F08, F10).
- Turning preview into editing, and saving (F09).
- Emoji shortcodes, subscript and superscript syntax, code line highlights, footnote hover cards, ticking tasks in preview, image zoom, and video playback. Not started.
- Uploads into `assets/` (D8). An ordinary Markdown image still follows F04-REQ-001; none was on the checked pages.
- Sanitizing as a Ledger validation warning (`math_invalid`, `mermaid_invalid`). Not started.

## Open questions

| Question | Owner | Blocks |
| --- | --- | --- |
| Should `~text~` stay strikethrough, as rendered, or become subscript as in Markdown capabilities? | Product owner | A change to F04-REQ-004. The built behavior is strikethrough. |
| Should a task tick in preview save a revision, as Markdown capabilities asks? | Product owner | The unbuilt tick-to-save behavior. Preview boxes are disabled. |
| Should code fences honor a `{3-5}` line-highlight marker? | Product owner | Not started. The highlighter ignores that marker today. |

## Trace

- PRD sections: Markdown capabilities (Supported syntax, Performance and safety, Portability); Document view (body max width, which section 2.2 replaces).
- PRD acceptance: one document using every syntax in Markdown capabilities renders the same in view, editor preview, and review (F04-REQ-017).
- Plan section 2.2, rows "Reading type" and "Phones": 17px, line height 1.7, about 66 characters. C4. The older 16px, 1.6, and 720px values do not apply.
- Plan section 2.2, row "Surfaces": solid fills rather than hairline borders. C2. Token values belong to F21.
- Decisions: D5 (reading the editor comes first), D6 (the product is markdown-kb), D8 (attachments and the experiment run-log are out of scope).
- Change requests: C2, C4. C8 does not change the renderer.
- D7 (who may save) does not change preview rendering.
- ADRs: none recorded yet.
- Code: `components/markdown-parts.tsx`, `components/static-markdown.tsx`, `components/blocks.tsx`, `lib/markdown/plugins.ts`, `lib/markdown/schema.ts`, `lib/markdown/highlight.ts`, `lib/markdown/csv.ts`, `lib/markdown/frontmatter.ts`, `app/reading.css`, `app/globals.css`.
