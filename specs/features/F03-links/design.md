# F03 design

Written against `spec.md` in this folder, from `origin/cursor/spec-links-rendering-editing-7df9`. That branch is not merged. Every requirement in that spec is behavior already in the tree. Version pins and backlinks computed at merge time are out of this spec; a target that contains `@` stays an unresolved link.

## Modules

| Module | Role |
| --- | --- |
| `lib/markdown/links.ts` | `resolveDoc` and `hrefFor` |
| `lib/markdown/plugins.ts` | `remarkWiki` turns wiki syntax into a link or an embed placeholder |
| `lib/markdown/outline.ts` | `extractHeadings` and `extractSection` |
| `components/markdown-parts.tsx` | Embed depth, the stop message, and the link renderer |
| `components/markdown-view.tsx`, `components/static-markdown.tsx` | Preview and the server render share those plugins |
| `lib/workspace/relink.ts` | Rewrites targets after a rename or a move |
| `lib/workspace/moves.ts` | Calls the relinker when a page or a folder moves |
| `lib/workspace/tree.ts` | `backlinks` |
| `components/workspace.tsx` | Passes the backlink list into the reading column |
| `components/missing-page.tsx` | The missing-URL screen |
| `lib/workspace/paths.ts` | `hrefOf` and `humanize` |

## Data shapes

```ts
type DocRef = { path: string; title: string };

type WikiMatch = {
  target: string;
  heading?: string;
  label?: string;
  embed: boolean;
};

type EmbedFrame = {
  path: string;
  heading: string;
  depth: number;
  trail: string[];
};
```

`resolveDoc` trims the target, strips one trailing `.md` without regard to case, and strips leading slashes. It then matches that text to a page path with `.md` removed. If no path matches, it matches the last segment to a file name and returns the page only when exactly one page has that name. Zero matches and two or more matches are unresolved. A target that contains `@` does not match a path or a unique file name, so it renders as unresolved text. That is the current fallback for a pin. This feature does not store a pin as its own field.

A resolved link goes to `/{project}/{path}` with `.md` removed, plus a `#` fragment when a heading was written. The visible text is the label if one was written, otherwise the heading text, otherwise the page title. Unresolved text is the label, the heading, or the target, in that order, in red, and it is not an anchor.

An embed is a paragraph whose only text is `![[target]]` or `![[target#Heading]]`. The same syntax with a label, or inside a sentence, is a wiki link, not an embed. A resolved embed shows a source link reading `{title}` or `{title} / {Heading}`, then the page body or the headed section, and omits the embedded page's property row. A missing embed replaces the paragraph with `Missing page: {target}` in red.

`extractSection` keeps the named heading and the lines after it until the next heading of the same or higher level. The heading match ignores case. If no heading matches, the embed uses the page body, and the source link still carries the fragment for the text that was written.

## State

There is no link store. Resolution reads the project's page list. The embed trail is an argument on the render, empty on the open page. `MAX_EMBED_DEPTH` in `markdown-parts.tsx` is 3. A fourth embed, or a path already on the trail, shows `Embed stops here: {path} is already shown above.` and does not render that body.

"Linked from" is derived on each render by `backlinks`. The open page is left out. An empty list has no heading. Preview and editing both render the page body, so the list is on both. Source mode has no preview pane.

## Contracts

Heading ids come from github-slugger, in document order, skipping headings inside fenced code. A repeated heading text gets `-1`, then `-2`. A wiki fragment is slugified on its own, so it matches the first heading with that text.

Colors and the embed radius are in [`specs/contracts/tokens.md`](../../contracts/tokens.md): the wiki link colors, the broken-link treatment, and the 18px block radius on an embed. This feature adds no shortcut. The `[[` picker is F09 and F20.
