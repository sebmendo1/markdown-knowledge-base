const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

function yamlString(text: string): string {
  return /^[\p{L}\p{N}][\p{L}\p{N} .,()'&-]*$/u.test(text) ? text : JSON.stringify(text);
}

function setHeading(body: string, title: string): string | null {
  const lines = body.split("\n");
  let fenced = false;
  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s*(```|~~~)/.test(lines[index])) fenced = !fenced;
    else if (!fenced && /^#\s+/.test(lines[index])) {
      lines[index] = `# ${title}`;
      return lines.join("\n");
    }
  }
  return null;
}

export function setTitle(source: string, title: string): string {
  const clean = title.replace(/\s+/g, " ").trim() || "Untitled";
  const front = FRONTMATTER.exec(source);
  const start = front ? front[0].length : 0;
  const body = source.slice(start);
  const heading = setHeading(body, clean);

  if (front && /^title:.*$/m.test(front[1])) {
    const fields = front[1].replace(/^title:.*$/m, () => `title: ${yamlString(clean)}`);
    return front[0].replace(front[1], () => fields) + (heading ?? body);
  }
  if (heading !== null) return source.slice(0, start) + heading;
  return `${source.slice(0, start)}# ${clean}\n\n${body.replace(/^\n+/, "")}`;
}
