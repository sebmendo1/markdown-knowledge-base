export function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/, "");
  return slug || "untitled";
}

export function folderOf(path: string): string {
  const index = path.lastIndexOf("/");
  return index < 0 ? "" : path.slice(0, index);
}

export function nameOf(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/i, "");
}

export function join(folder: string, name: string): string {
  return folder ? `${folder}/${name}` : name;
}

export function ancestors(folder: string): string[] {
  const parts = folder.split("/").filter(Boolean);
  return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
}

export function within(path: string, folder: string): boolean {
  return path.startsWith(`${folder}/`);
}

export function humanize(segment: string): string {
  const text = segment.replace(/[-_]+/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : segment;
}

export function uniquePath(taken: Iterable<string>, base: string, ext = ""): string {
  const used = new Set(taken);
  let candidate = `${base}${ext}`;
  for (let count = 2; used.has(candidate); count += 1) candidate = `${base}-${count}${ext}`;
  return candidate;
}

export function hrefOf(path: string): string {
  return `/${path.replace(/\.md$/i, "")}`;
}
