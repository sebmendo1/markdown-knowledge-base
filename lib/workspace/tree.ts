import { resolveDoc } from "../markdown/links";
import { titleOf } from "../markdown/outline";
import { allFolders, pagePath, type Page, type Workspace } from "./model";
import { folderOf, humanize, nameOf } from "./paths";
import { linksIn } from "./relink";

export type PageDoc = { id: string; path: string; slug: string[]; title: string; content: string };

export type TreeNode =
  | { kind: "folder"; path: string; name: string; children: TreeNode[] }
  | { kind: "page"; doc: PageDoc };

export function toDoc(page: Page): PageDoc {
  const bare = page.path.replace(/\.md$/i, "");
  return {
    id: page.id,
    path: page.path,
    slug: bare.split("/"),
    title: titleOf(page.content, nameOf(page.path).replace(/-/g, " ")),
    content: page.content,
  };
}

export function buildTree(ws: Workspace, docs: PageDoc[]): TreeNode[] {
  const folders = new Map<string, TreeNode[]>([["", []]]);
  for (const folder of allFolders(ws)) folders.set(folder, []);
  for (const folder of allFolders(ws)) {
    folders.get(folderOf(folder))?.push({ kind: "folder", path: folder, name: humanize(nameOf(folder)), children: folders.get(folder)! });
  }
  for (const doc of docs) folders.get(folderOf(doc.path))?.push({ kind: "page", doc });

  const label = (node: TreeNode) => (node.kind === "folder" ? node.name : node.doc.title);
  for (const children of folders.values()) {
    children.sort((a, b) => (a.kind === b.kind ? label(a).localeCompare(label(b)) : a.kind === "folder" ? -1 : 1));
  }
  return folders.get("")!;
}

export function backlinks(docs: PageDoc[], path: string): PageDoc[] {
  return docs.filter(
    (doc) => doc.path !== path && linksIn(doc.content).some((target) => resolveDoc(docs, target)?.path === path),
  );
}

export function importFiles(
  ws: Workspace,
  files: { name: string; content: string }[],
  folder: string,
  makeId: () => string,
  now: number,
) {
  let next = ws;
  const paths: string[] = [];
  for (const file of files) {
    const page: Page = {
      id: makeId(),
      path: pagePath(next, folder, file.name.replace(/\.(md|markdown|txt)$/i, "")),
      content: file.content.replace(/\r\n/g, "\n"),
      createdAt: now,
      updatedAt: now,
    };
    next = { ...next, pages: [...next.pages, page] };
    paths.push(page.path);
  }
  return { ws: next, paths };
}
