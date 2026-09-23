import GithubSlugger from "github-slugger";

export type DocRef = {
  path: string;
  title: string;
};

export function resolveDoc<T extends DocRef>(docs: T[], ref: string): T | undefined {
  const normalized = ref.trim().replace(/\.md$/i, "").replace(/^\/+/, "");
  const exact = docs.find((doc) => doc.path.replace(/\.md$/i, "") === normalized);
  if (exact) return exact;

  const file = normalized.split("/").pop();
  const matches = docs.filter(
    (doc) => doc.path.replace(/\.md$/i, "").split("/").pop() === file,
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export function hrefFor(path: string, heading?: string): string {
  const base = `/${path.replace(/\.md$/i, "")}`;
  if (!heading) return base;
  return `${base}#${new GithubSlugger().slug(heading)}`;
}
