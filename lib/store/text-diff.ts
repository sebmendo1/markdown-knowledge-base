import { lcsPairs } from "./lcs";

// One replaced span: `before[fromA, toA)` became `after[fromB, toB)`. Either side may be empty.
export type Hunk = { fromA: number; toA: number; fromB: number; toB: number };

type Token = { text: string; start: number };

const LINE = /[^\n]*\n|[^\n]+$/g;
const WORD = /[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}_\s]/gu;

function tokens(source: string, pattern: RegExp, offset = 0): Token[] {
  return [...source.matchAll(pattern)].map((match) => ({ text: match[0], start: offset + (match.index ?? 0) }));
}

// Hunks between two token lists, from the gaps between their longest common subsequence.
// `refine` splits a replaced run further; it gets the run's bounds and returns hunks inside them.
function tokenHunks(a: Token[], b: Token[], toA: number, toB: number, refine?: (hunk: Hunk) => Hunk[]): Hunk[] {
  let start = 0;
  while (start < a.length && start < b.length && a[start].text === b[start].text) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1].text === b[endB - 1].text) {
    endA -= 1;
    endB -= 1;
  }
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  const pairs = lcsPairs(
    midA.map((token) => token.text),
    midB.map((token) => token.text),
  ) ?? [];

  // Tokens cover the text end to end, so a position in the middle run is the start of its token,
  // and the end of the run is where the common suffix starts.
  const afterA = endA < a.length ? a[endA].start : toA;
  const afterB = endB < b.length ? b[endB].start : toB;
  const posA = (k: number) => (k < midA.length ? midA[k].start : afterA);
  const posB = (k: number) => (k < midB.length ? midB[k].start : afterB);

  const hunks: Hunk[] = [];
  let i = 0;
  let j = 0;
  const gap = (nextI: number, nextJ: number) => {
    if (nextI === i && nextJ === j) return;
    const hunk = { fromA: posA(i), toA: posA(nextI), fromB: posB(j), toB: posB(nextJ) };
    hunks.push(...(refine && hunk.toA > hunk.fromA && hunk.toB > hunk.fromB ? refine(hunk) : [hunk]));
  };
  for (const [pi, pj] of pairs) {
    gap(pi, pj);
    i = pi + 1;
    j = pj + 1;
  }
  gap(midA.length, midB.length);
  return hunks;
}

// A word-level diff: lines first, then words inside each replaced run of lines.
// Offsets are characters in `before` (A) and `after` (B).
export function diffText(before: string, after: string): Hunk[] {
  if (before === after) return [];
  if (before === "" || after === "") return [{ fromA: 0, toA: before.length, fromB: 0, toB: after.length }];
  const words = (hunk: Hunk): Hunk[] =>
    tokenHunks(
      tokens(before.slice(hunk.fromA, hunk.toA), WORD, hunk.fromA),
      tokens(after.slice(hunk.fromB, hunk.toB), WORD, hunk.fromB),
      hunk.toA,
      hunk.toB,
    );
  return tokenHunks(tokens(before, LINE), tokens(after, LINE), before.length, after.length, words);
}

export function countHunks(hunks: Hunk[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const hunk of hunks) {
    added += hunk.toB - hunk.fromB;
    removed += hunk.toA - hunk.fromA;
  }
  return { added, removed };
}
