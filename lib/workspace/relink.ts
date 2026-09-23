import { resolveDoc, type DocRef } from "../markdown/links";

const WIKI = /(!?\[\[)([^\]|#]+)((?:#[^\]|]*)?(?:\|[^\]]*)?\]\])/g;

function refs(paths: string[]): DocRef[] {
  return paths.map((path) => ({ path, title: "" }));
}

export function relinker(before: string[], moves: Map<string, string>) {
  const oldRefs = refs(before);
  const nextRefs = refs(before.map((path) => moves.get(path) ?? path));

  return (content: string) =>
    content.replace(WIKI, (all, open: string, target: string, rest: string) => {
      const hit = resolveDoc(oldRefs, target);
      if (!hit) return all;
      const dest = moves.get(hit.path) ?? hit.path;
      const byPath = target.includes("/");
      const stillExact = target.trim().replace(/\.md$/i, "").replace(/^\/+/, "") === dest.replace(/\.md$/i, "");
      if (byPath ? stillExact : resolveDoc(nextRefs, target)?.path === dest) return all;

      const bare = dest.replace(/\.md$/i, "");
      const file = bare.split("/").pop() ?? bare;
      const short = resolveDoc(nextRefs, file)?.path === dest && !target.includes("/");
      return `${open}${short ? file : bare}${rest}`;
    });
}

export function linksIn(content: string): string[] {
  return Array.from(content.matchAll(WIKI), (match) => match[2].trim());
}
