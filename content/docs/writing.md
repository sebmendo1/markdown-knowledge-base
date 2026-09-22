---
type: doc
title: Writing in markdown-kb
---

# Writing in markdown-kb

markdown-kb is a reading surface for notes kept as Markdown. The source stays exact. Preview is a view of that source.

> [!NOTE]
> An edit is a draft in this browser. It stays on this machine. Reset, in the top bar, shows the repository copy again.

## Measure

Prose sits in a column about 720 pixels wide, with room between lines. Headings stay quiet. The outline on the right follows the page as you scroll.

A useful line is long enough to hold a thought and short enough to find the next one.

## Lists

What the preview renders:

- Headings, emphasis, links, and images
- Tables, task lists, and footnotes
- Code, math, diagrams, and charts

- [x] Read the page before editing it
- [ ] Switch to Split when you want the source beside the preview

## Tables

| Pane | What it is for |
| --- | --- |
| Files | Jump between pages |
| Preview | Read |
| Source | Edit the exact Markdown |
| Outline | Move through the page |

## Callouts

> [!TIP]
> Press `⌘K` to jump to a page. Press `⌘/` to cycle Preview, Split, and Source.

> [!IMPORTANT]
> The Markdown file is the document. Preview is a view of it.

> [!WARNING]
> A local draft overrides the repository copy until you reset it.

> [!CAUTION]
> A diagram or chart with a syntax error shows the message beside the block. The rest of the page still reads.

## Code

```ts
export const reading = {
  measure: 720,
  lineHeight: 1.65,
  fontSize: 16.5,
};
```

## Math

The reading measure stays near $720$ pixels.

$$
42 \le \text{characters per line} \le 75
$$

## Diagrams

```mermaid
flowchart LR
  files[Files] --> preview[Preview]
  preview --> outline[Outline]
  source[Source] --> preview
```

## Charts

Charts are [Vega-Lite](https://vega.github.io/vega-lite/) specs in a `chart` fence. The numbers below are an example of the syntax.

```chart
title: Example word counts
width: container
height: 260
data:
  values:
    - { section: Measure, words: 80 }
    - { section: Tables, words: 40 }
    - { section: Diagrams, words: 25 }
    - { section: Charts, words: 30 }
mark: { type: bar, cornerRadiusEnd: 2 }
encoding:
  x: { field: section, type: nominal, axis: { title: null, labelAngle: 0 } }
  y: { field: words, type: quantitative, axis: { title: null } }
```

## A table from CSV

```csv
pane,job
Files,Jump between pages
Preview,Read
Source,Edit the exact Markdown
Outline,Move through the page
```

## Links and notes

See the [[shortcuts]] for every key, or the [[layout]] of the screen. The keyboard section is included below.

![[shortcuts#Keyboard]]

Drafts never leave the browser.[^1]

[^1]: Reset drops the draft and shows the file from the repository again.

==Highlight== marks a phrase you want to find again. ~~Strikethrough~~ marks something you replaced. Press <kbd>⌘</kbd> <kbd>K</kbd> from anywhere.

<details>
<summary>Why the source stays plain</summary>

A diff is easier to trust when the editor does not rewrite the file. Preview can be careful because the source is allowed to stay ordinary Markdown.
</details>
