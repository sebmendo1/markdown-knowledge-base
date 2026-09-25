# F04 design

Written against `spec.md` in this folder, from `origin/cursor/spec-links-rendering-editing-7df9`. That branch is not merged. The syntax in this spec is what preview renders today. Charts are F05. Wiki links and embeds are F03. The outline is F08. Editing the source is F09.

Emoji shortcodes, subscript and superscript markers, fenced line highlights, footnote hover previews, ticking a task in preview, image zoom, and a video player are not in this spec and are not in this design.

## Modules

| Module | Role |
| --- | --- |
| `components/markdown-parts.tsx` | `markdownPlugins` and `markdownComponents` |
| `lib/markdown/plugins.ts` | `remarkAlerts`, `remarkHighlight`, `rehypeSinglePrefix` |
| `lib/markdown/schema.ts` | `sanitizeSchema` |
| `lib/markdown/highlight.ts` | Shiki for fenced code |
| `lib/markdown/csv.ts` | `parseDelimited` |
| `lib/markdown/frontmatter.ts` | Split a YAML map from the body, and surface a bad map |
| `components/blocks.tsx` | `CodeBlock`, `MermaidBlock`, `CsvTable` |
| `components/markdown-view.tsx`, `components/static-markdown.tsx` | Browser render and server render |
| `app/reading.css` | 17px, line height 1.7, and the column cap |

`remark-gfm`, `remark-math`, `rehype-katex`, `rehype-raw`, `rehype-sanitize`, and `rehype-slug` sit in that plugin list. A `chart`, `vega`, or `vega-lite` fence is rendered by `ChartBlock` and belongs to F05.

## Data shapes

The pipeline is one Markdown string in and one HTML tree out. Frontmatter is split off before the body is rendered.

```ts
type FrontSplit =
  | { ok: true; data: Record<string, unknown>; body: string }
  | { ok: false; message: string; body: string };

type CodeFence = { code: string; lang: string; html: string | null };

type CsvGrid = { header: string[]; rows: string[][] };
```

A failed frontmatter split still renders `body`. The message is `Frontmatter must be a map.` when the YAML is not a map, or the parser's own message when the parser throws. Neither case has a product error code.

Safe HTML is `sanitizeSchema`: the sanitizer's built-in tags plus `mark`, `details`, `summary`, `kbd`, `sub`, and `sup`. `class` and `id` are allowed. `style` is allowed on `div`, `span`, and `pre`. A table cell may keep `align`, shown as `text-align`. An image may carry `width`. A `script` element does not remain. Stripped tags produce no error message.

Callout markers that become a callout are the uppercase words `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, and `[!CAUTION]`, as the first text of a blockquote. The title text is Note, Tip, Important, Warning, or Caution. Any other marker stays a blockquote.

Shiki languages are typescript, tsx, javascript, jsx, json, yaml, bash, markdown, python, css, html, sql, diff, and swift, plus the aliases ts, js, py, yml, sh, shell, zsh, md, txt, and plaintext. An unknown language is plain text. The copy control is labeled "Copy", accessible name "Copy code". Success sets the label to "Copied" for 1.2 seconds. A failed clipboard write leaves "Copy" and shows no error.

`$…$` and `$$…$$` go through KaTeX. The server render includes the math HTML. A page the browser renders locally runs KaTeX in the page. A parse failure shows the source in red, with the parser message on the element's title, and the rest of the page stays.

A `mermaid` fence draws in the browser at security level `strict`, after the figure comes within 600px of the preview pane. Until then the figure is marked busy. A rejected diagram shows the parser message in red and leaves the surrounding page.

A `csv` or `tsv` fence is a table whose first row is the header. Choosing a header sorts the body by that column, ascending then descending. Cells that are both numbers sort numerically. Other cells sort by Unicode text. A quoted comma stays in one cell. An empty parse shows no table.

`==text==` is a highlight mark when the marked text is on one line and contains no `=`.

Checkboxes from `- [ ]` and `- [x]` render disabled in preview. Toggling one does not change the page and does not save a revision.

A link whose address starts with `http` opens in a new browsing context with `rel="noreferrer"`. An address that starts with `/` navigates inside the app. A scheme other than `http`, `https`, `irc`, `ircs`, `mailto`, or `xmpp` keeps the link text and drops the address.

Footnote references are superscript links to `#user-content-fn-{id}`. The footnote section heading is "Footnotes". The return link's accessible name is `Back to reference {n}`.

## State

Rendering is pure over the page source and the project doc list (the doc list is for F03). Sort order on a CSV table is component state on `CsvTable` and is not stored. The copy label's 1.2 second timer is local to `CodeBlock`. Mermaid's busy flag is local until the figure is near the pane.

The reading column is 17px with line height 1.7. Its width is `min(100%, 66ch + 64px)` and does not exceed 760px. On a narrow screen the type size stays 17px. Those numbers are the shipped rule in `app/reading.css`. The token catalog records the same measure, including that the 760px cap is what binds at 17px.

## Contracts

Type size, line height, the reading cap, mark radius (6px), inline code radius (8px), block radius (18px), and the callout colors are in [`specs/contracts/tokens.md`](../../contracts/tokens.md). This feature does not add a shortcut. Task checkboxes staying disabled in preview is this feature. Saving a tick is not.
