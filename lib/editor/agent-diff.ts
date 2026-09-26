import type { Node as PMNodeObject } from "@tiptap/pm/model";
import { lcsPairs } from "@/lib/store/lcs";
import { diffText } from "@/lib/store/text-diff";
import { parsePage } from "./from-markdown";

// Where to draw an agent's changes in the block editor, as document positions.
// `added` and `removed` are inside a paragraph or heading; the block kinds are whole blocks.
export type DiffMark =
  | { kind: "added"; from: number; to: number }
  | { kind: "block"; from: number; to: number }
  | { kind: "removed"; pos: number; text: string }
  | { kind: "removedBlock"; pos: number; text: string };

// An inline node that is not text takes one position; one placeholder character keeps offsets equal to positions.
const LEAF = "￼";

function inlineText(block: PMNodeObject): string {
  let text = "";
  block.forEach((child) => {
    text += child.isText ? (child.text ?? "") : LEAF;
  });
  return text;
}

function readable(text: string): string {
  return text.split(LEAF).join("");
}

function blockText(node: PMNodeObject): string {
  if (node.isAtom) return String(node.attrs.code ?? node.attrs.value ?? node.attrs.source ?? node.attrs.target ?? "");
  return node.textBetween(0, node.content.size, "\n", " ");
}

// Parents where a deleted block can be shown as a block of its own. Inside tables it would break the layout.
const SHOWS_REMOVED = new Set(["doc", "blockquote", "callout", "listItem", "taskItem", "tableCell", "tableHeader"]);

function keyOf(node: PMNodeObject): string {
  return JSON.stringify(node.toJSON());
}

function markNew(node: PMNodeObject, pos: number, marks: DiffMark[]) {
  if (node.isTextblock) {
    if (node.content.size > 0) marks.push({ kind: "added", from: pos + 1, to: pos + node.nodeSize - 1 });
    else marks.push({ kind: "block", from: pos, to: pos + node.nodeSize });
    return;
  }
  if (node.isAtom || node.isLeaf) {
    marks.push({ kind: "block", from: pos, to: pos + node.nodeSize });
    return;
  }
  node.forEach((child, offset) => markNew(child, pos + 1 + offset, marks));
}

function diffTextblock(before: PMNodeObject, after: PMNodeObject, pos: number, marks: DiffMark[]) {
  const oldText = inlineText(before);
  const newText = inlineText(after);
  const start = pos + 1;
  for (const hunk of diffText(oldText, newText)) {
    const removed = readable(oldText.slice(hunk.fromA, hunk.toA));
    if (removed) marks.push({ kind: "removed", pos: start + hunk.fromB, text: removed });
    if (hunk.toB > hunk.fromB) marks.push({ kind: "added", from: start + hunk.fromB, to: start + hunk.toB });
  }
  // Same text, different marks (bold, a link): show the block changed.
  if (oldText === newText) marks.push({ kind: "block", from: pos, to: pos + after.nodeSize });
}

// Two versions of a paragraph or heading that share less than this much text are shown as one removed and one added.
const MIN_SHARED = 0.4;

function similar(before: PMNodeObject, after: PMNodeObject): boolean {
  if (!after.isTextblock) return true;
  const oldText = inlineText(before);
  const newText = inlineText(after);
  const longest = Math.max(oldText.length, newText.length);
  if (longest === 0) return true;
  const changed = diffText(oldText, newText).reduce((sum, hunk) => sum + Math.max(hunk.toA - hunk.fromA, hunk.toB - hunk.fromB), 0);
  return 1 - changed / longest >= MIN_SHARED;
}

function diffPair(before: PMNodeObject, after: PMNodeObject, pos: number, marks: DiffMark[]) {
  if (after.isTextblock) {
    diffTextblock(before, after, pos, marks);
  } else if (after.isAtom || after.isLeaf || after.attrs.checked !== before.attrs.checked) {
    marks.push({ kind: "block", from: pos, to: pos + after.nodeSize });
  } else {
    diffChildren(before, after, pos + 1, marks);
  }
}

// Line up the children of two versions of a node, then mark what changed.
// `start` is the position of the first child of `after`.
function diffChildren(before: PMNodeObject, after: PMNodeObject, start: number, marks: DiffMark[]) {
  const oldKids: PMNodeObject[] = [];
  const newKids: { node: PMNodeObject; pos: number }[] = [];
  before.forEach((child) => oldKids.push(child));
  after.forEach((child, offset) => newKids.push({ node: child, pos: start + offset }));
  const endPos = start + after.content.size;
  const showRemoved = SHOWS_REMOVED.has(after.type.name);

  let i = 0;
  let j = 0;
  const remove = (upTo: number) => {
    const at = j < newKids.length ? newKids[j].pos : endPos;
    for (; i < upTo; i += 1) {
      const text = blockText(oldKids[i]).trim();
      if (showRemoved && text) marks.push({ kind: "removedBlock", pos: at, text });
    }
  };
  const add = (upTo: number) => {
    for (; j < upTo; j += 1) markNew(newKids[j].node, newKids[j].pos, marks);
  };
  // Identical blocks anchor the match. Between them, blocks of the same kind pair up in order,
  // and a paragraph pairs only with one that still shares most of its text.
  const gap = (nextI: number, nextJ: number) => {
    const oldGap = oldKids.slice(i, nextI);
    const newGap = newKids.slice(j, nextJ);
    const typePairs =
      lcsPairs(
        oldGap.map((node) => node.type.name),
        newGap.map((item) => item.node.type.name),
      ) ?? [];
    const baseI = i;
    const baseJ = j;
    for (const [gi, gj] of typePairs) {
      const oldNode = oldKids[baseI + gi];
      const newItem = newKids[baseJ + gj];
      if (!similar(oldNode, newItem.node)) continue;
      remove(baseI + gi);
      add(baseJ + gj);
      diffPair(oldNode, newItem.node, newItem.pos, marks);
      i += 1;
      j += 1;
    }
    remove(nextI);
    add(nextJ);
  };
  const pairs =
    lcsPairs(
      oldKids.map(keyOf),
      newKids.map((item) => keyOf(item.node)),
    ) ?? [];
  for (const [pi, pj] of pairs) {
    gap(pi, pj);
    i = pi + 1;
    j = pj + 1;
  }
  gap(oldKids.length, newKids.length);
}

// Marks for the agent changes between `baseline` (the page without them) and the open document.
export function agentDiffMarks(doc: PMNodeObject, baseline: string): DiffMark[] {
  const schema = doc.type.schema;
  const nodes = parsePage(baseline).nodes;
  let before: PMNodeObject;
  try {
    before = schema.nodeFromJSON({ type: "doc", content: nodes.length > 0 ? nodes : [{ type: "paragraph" }] });
  } catch {
    return [];
  }
  if (before.eq(doc)) return [];
  const marks: DiffMark[] = [];
  diffChildren(before, doc, 0, marks);
  return marks;
}
