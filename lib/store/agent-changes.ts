import { diffText, type Hunk } from "./text-diff";

// What agents changed on one page since the person last reviewed it.
// Offsets refer to `text`. `added` are spans an agent inserted; `removed` is text an agent deleted, anchored where it was.
export type AgentChanges = {
  text: string;
  added: { from: number; to: number }[];
  removed: { at: number; text: string }[];
};

export function emptyChanges(text: string): AgentChanges {
  return { text, added: [], removed: [] };
}

export function hasChanges(changes: AgentChanges): boolean {
  return changes.added.length > 0 || changes.removed.length > 0;
}

export function countChanges(changes: AgentChanges): { added: number; removed: number } {
  return {
    added: changes.added.reduce((sum, range) => sum + range.to - range.from, 0),
    removed: changes.removed.reduce((sum, item) => sum + item.text.length, 0),
  };
}

// A position in the old text, in the new one. Positions inside a replaced span go to its start (bias -1) or end (bias 1).
// A pure insertion at the position goes after it with bias 1, and before it with bias -1.
function mapPos(pos: number, hunks: Hunk[], bias: -1 | 1): number {
  let delta = 0;
  for (const hunk of hunks) {
    if (pos < hunk.fromA) break;
    if (pos > hunk.toA) {
      delta = hunk.toB - hunk.toA;
      continue;
    }
    if (pos === hunk.fromA && pos < hunk.toA) return hunk.fromB;
    if (pos === hunk.toA && pos > hunk.fromA) return hunk.toB;
    return bias < 0 ? hunk.fromB : hunk.toB;
  }
  return pos + delta;
}

// Parts of [from, to) that no hunk replaced, in new-text offsets. Text inserted inside the range splits it,
// so someone else's typing in the middle of an agent's insertion is not marked.
function mapRange(range: { from: number; to: number }, hunks: Hunk[]): { from: number; to: number }[] {
  const pieces: { from: number; to: number }[] = [];
  let from = range.from;
  for (const hunk of hunks) {
    if (hunk.fromA >= range.to) break;
    if (hunk.toA <= from) continue;
    if (hunk.fromA > from) pieces.push({ from, to: hunk.fromA });
    from = Math.max(from, hunk.toA);
  }
  if (from < range.to) pieces.push({ from, to: range.to });
  return pieces
    .map((piece) => ({ from: mapPos(piece.from, hunks, 1), to: mapPos(piece.to, hunks, -1) }))
    .filter((piece) => piece.to > piece.from);
}

function normalize(changes: AgentChanges): AgentChanges {
  const added = [...changes.added].sort((x, y) => x.from - y.from);
  const merged: AgentChanges["added"] = [];
  for (const range of added) {
    const last = merged.at(-1);
    if (last && range.from <= last.to) last.to = Math.max(last.to, range.to);
    else merged.push({ ...range });
  }
  const removed: AgentChanges["removed"] = [];
  for (const item of [...changes.removed].sort((x, y) => x.at - y.at)) {
    if (!item.text) continue;
    const last = removed.at(-1);
    if (last && last.at === item.at) last.text += item.text;
    else removed.push({ ...item });
  }
  return { text: changes.text, added: merged, removed };
}

function mapMarks(changes: AgentChanges, next: string, hunks: Hunk[]): AgentChanges {
  return {
    text: next,
    added: changes.added.flatMap((range) => mapRange(range, hunks)),
    removed: changes.removed.map((item) => ({ at: mapPos(item.at, hunks, -1), text: item.text })),
  };
}

// Carry the marks over an edit that was not an agent's, such as typing. Nothing new is marked.
export function mapThrough(changes: AgentChanges, next: string): AgentChanges {
  if (changes.text === next) return changes;
  return normalize(mapMarks(changes, next, diffText(changes.text, next)));
}

// Add an agent's edit from `prev` to `next`. Text the agent deletes counts as removed,
// except text an earlier agent edit inserted: that text just stops being marked.
export function recordAgentChange(changes: AgentChanges | null, prev: string, next: string): AgentChanges {
  const current = changes ? mapThrough(changes, prev) : emptyChanges(prev);
  if (prev === next) return current;
  const hunks = diffText(prev, next);
  const mapped = mapMarks(current, next, hunks);
  for (const hunk of hunks) {
    if (hunk.toB > hunk.fromB) mapped.added.push({ from: hunk.fromB, to: hunk.toB });
    if (hunk.toA <= hunk.fromA) continue;
    const original = subtract({ from: hunk.fromA, to: hunk.toA }, current.added);
    const text = original.map((span) => prev.slice(span.from, span.to)).join("");
    if (text) mapped.removed.push({ at: hunk.fromB, text });
  }
  return normalize(mapped);
}

function subtract(span: { from: number; to: number }, cuts: { from: number; to: number }[]): { from: number; to: number }[] {
  let pieces = [span];
  for (const cut of cuts) {
    pieces = pieces.flatMap((piece) => {
      if (cut.to <= piece.from || cut.from >= piece.to) return [piece];
      return [
        ...(cut.from > piece.from ? [{ from: piece.from, to: cut.from }] : []),
        ...(cut.to < piece.to ? [{ from: cut.to, to: piece.to }] : []),
      ];
    });
  }
  return pieces;
}

// The page as it would be without the agents' changes: agent insertions cut, agent deletions put back.
// The person's own edits stay.
export function baselineOf(changes: AgentChanges): string {
  let out = "";
  let pos = 0;
  let r = 0;
  const flushRemoved = (upTo: number) => {
    while (r < changes.removed.length && changes.removed[r].at <= upTo) {
      out += changes.text.slice(pos, Math.max(pos, changes.removed[r].at));
      pos = Math.max(pos, changes.removed[r].at);
      out += changes.removed[r].text;
      r += 1;
    }
  };
  for (const range of changes.added) {
    flushRemoved(range.from);
    out += changes.text.slice(pos, range.from);
    pos = range.to;
  }
  flushRemoved(changes.text.length);
  return out + changes.text.slice(pos);
}
