const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const ATX = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;

export type ScannedHeading = { depth: number; text: string };

function frontmatterTitle(block: string): string | null {
  const line = /^title:[ \t]*(.*)$/m.exec(block)?.[1]?.trim();
  if (!line || line === "|" || line === ">" || line.startsWith("|") || line.startsWith(">")) return null;
  if (line.startsWith('"')) {
    const end = line.lastIndexOf('"');
    try {
      return end > 0 ? String(JSON.parse(line.slice(0, end + 1))) : null;
    } catch {
      return null;
    }
  }
  if (line.startsWith("'")) {
    const end = line.lastIndexOf("'");
    return end > 0 ? line.slice(1, end).replace(/''/g, "'") : null;
  }
  return line.replace(/\s+#.*$/, "").trim() || null;
}

export function plainInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(?<!\[)\[([^\][]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/`+([^`]+)`+/g, "$1")
    .replace(/(\*\*|__|~~|==)(?=\S)(.+?)(?<=\S)\1/g, "$2")
    .replace(/(?<![\w*])([*_])(?=\S)(.+?)(?<=\S)\1(?![\w*])/g, "$2")
    .replace(/\\([\\`*_{}[\]()#+\-.!|~=<>])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function scanHeadings(source: string): ScannedHeading[] {
  const front = FRONTMATTER.exec(source);
  const lines = (front ? source.slice(front[0].length) : source).split(/\r?\n/);
  const headings: ScannedHeading[] = [];
  let fence: string | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const opened = FENCE.exec(line);
    if (fence) {
      if (opened && opened[1][0] === fence[0] && opened[1].length >= fence.length && !line.trim().slice(opened[1].length).trim()) fence = null;
      continue;
    }
    if (opened) {
      fence = opened[1];
      continue;
    }
    if (/^ {0,3}(\$\$)\s*$/.test(line)) {
      const close = lines.findIndex((entry, at) => at > index && /^ {0,3}\$\$\s*$/.test(entry));
      if (close !== -1) index = close;
      continue;
    }
    const atx = ATX.exec(line);
    if (atx) {
      headings.push({ depth: atx[1].length, text: plainInline(atx[2] ?? "") });
      continue;
    }
    const next = lines[index + 1];
    if (next !== undefined && line.trim() && !/^ {4}|^\t/.test(line) && /^ {0,3}(=+|-+)[ \t]*$/.test(next) && !/^\s*([-*+>]|\d+[.)])\s/.test(line)) {
      const previous = lines[index - 1];
      if (index === 0 || !previous?.trim()) {
        headings.push({ depth: next.trim()[0] === "=" ? 1 : 2, text: plainInline(line) });
        index += 1;
      }
    }
  }
  return headings;
}

export function quickTitle(source: string, fallback: string): string {
  const front = FRONTMATTER.exec(source);
  const titled = front ? frontmatterTitle(front[1]) : null;
  if (titled) return titled;
  return scanHeadings(source).find((heading) => heading.depth === 1)?.text || fallback;
}
