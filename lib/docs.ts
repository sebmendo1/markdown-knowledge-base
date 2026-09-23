import fs from "node:fs";
import path from "node:path";
import { quickTitle } from "./markdown/scan";

export type Doc = {
  path: string;
  slug: string[];
  title: string;
  content: string;
};

const ROOT = path.join(process.cwd(), "content");
const FOLDER_ORDER = ["ledger", "docs"];

function walk(directory: string, prefix: string[]): Doc[] {
  if (!fs.existsSync(directory)) return [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const docs: Doc[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const next = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      docs.push(...walk(next, [...prefix, entry.name]));
      continue;
    }
    if (!entry.name.endsWith(".md")) continue;

    const slug = [...prefix, entry.name.slice(0, -3)];
    const content = fs.readFileSync(next, "utf8");
    const fallback = entry.name.slice(0, -3).replace(/-/g, " ");
    docs.push({
      path: `${slug.join("/")}.md`,
      slug,
      title: quickTitle(content, fallback),
      content,
    });
  }

  return docs;
}

export function getDocs(): Doc[] {
  return walk(ROOT, []).sort((a, b) => {
    const aFolder = FOLDER_ORDER.indexOf(a.slug[0] ?? "");
    const bFolder = FOLDER_ORDER.indexOf(b.slug[0] ?? "");
    const aOrder = aFolder === -1 ? 99 : aFolder;
    const bOrder = bFolder === -1 ? 99 : bFolder;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.title.localeCompare(b.title);
  });
}

export function getDoc(slug: string[]): Doc | undefined {
  const key = slug.join("/");
  return getDocs().find((doc) => doc.slug.join("/") === key);
}
