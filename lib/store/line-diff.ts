import { lcsPairs } from "./lcs";

// Lines of `after` that are not in `before`, as 1-based line numbers. A line that moved counts as unchanged.
// Uses a longest common subsequence, and falls back to a set comparison when the pages are very long.
export function addedLines(before: string, after: string): Set<number> {
  const b = after.split("\n");
  const added = new Set<number>();
  if (before === after) return added;
  // A new page: every line is new, blank ones included.
  if (before === "") {
    b.forEach((_, index) => added.add(index + 1));
    return added;
  }
  const a = before.split("\n");

  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);

  const pairs = lcsPairs(midA, midB);
  if (!pairs) {
    const known = new Set(midA);
    midB.forEach((line, index) => {
      if (!known.has(line)) added.add(start + index + 1);
    });
    return added;
  }
  const kept = new Set(pairs.map(([, j]) => j));
  midB.forEach((_, index) => {
    if (!kept.has(index)) added.add(start + index + 1);
  });
  return added;
}
