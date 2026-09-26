// Lines of `after` that are not in `before`, as 1-based line numbers. A line that moved counts as unchanged.
// Uses a longest common subsequence, and falls back to a set comparison when the pages are very long.
const MAX_CELLS = 4_000_000;

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

  if (midA.length * midB.length > MAX_CELLS) {
    const known = new Set(midA);
    midB.forEach((line, index) => {
      if (!known.has(line)) added.add(start + index + 1);
    });
    return added;
  }

  const cols = midB.length + 1;
  const table = new Uint32Array((midA.length + 1) * cols);
  for (let i = midA.length - 1; i >= 0; i -= 1) {
    for (let j = midB.length - 1; j >= 0; j -= 1) {
      table[i * cols + j] = midA[i] === midB[j] ? table[(i + 1) * cols + j + 1] + 1 : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1]);
    }
  }
  let i = 0;
  let j = 0;
  while (j < midB.length) {
    if (i < midA.length && midA[i] === midB[j]) {
      i += 1;
      j += 1;
    } else if (i < midA.length && table[(i + 1) * cols + j] >= table[i * cols + j + 1]) {
      i += 1;
    } else {
      added.add(start + j + 1);
      j += 1;
    }
  }
  return added;
}
