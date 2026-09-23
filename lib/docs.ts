import fs from "node:fs";
import path from "node:path";
import { quickTitle } from "./markdown/scan";
import { defaultStore, type DiskFile } from "./store/fs-store";
import { DISK_BLOCKED, type ProjectEntry, type ProjectSummary } from "./workspace/projects";

export type Doc = {
  path: string;
  slug: string[];
  title: string;
  content: string;
};

type RepoProject = {
  slug: string;
  name: string;
  description: string;
  root: () => string;
  home: string;
  order?: string[];
};

const PROJECTS: RepoProject[] = [
  {
    slug: "guide",
    name: "markdown-kb guide",
    description: "How to write, organize, and read pages here. Formatting, diagrams, charts, and shortcuts.",
    root: () => path.join(process.cwd(), "content"),
    home: "docs/writing.md",
    order: ["ledger", "docs"],
  },
  {
    slug: "specs",
    name: "Ledger specs",
    description: "The Ledger PRD, every decision since, and the plan for turning them into specs.",
    root: () => path.join(process.cwd(), "specs"),
    home: "PLAN.md",
  },
];

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

const entryOf = (project: RepoProject): ProjectEntry => ({
  slug: project.slug,
  name: project.name,
  description: project.description,
  kind: "repo",
});

export type LoadedProject = ProjectEntry & { home: string; synced: boolean };

const blocked = new Set(DISK_BLOCKED);

function diskProjects() {
  try {
    return defaultStore().listProjects().filter((project) => !blocked.has(project.slug));
  } catch {
    return [];
  }
}

function diskDocs(slug: string): Doc[] {
  let files: DiskFile[] = [];
  try {
    files = defaultStore().listFiles(slug).files;
  } catch {
    return [];
  }
  return files
    .map((file) => {
      const slugParts = file.path.replace(/\.md$/i, "").split("/");
      const fallback = slugParts.at(-1)?.replace(/-/g, " ") ?? "Page";
      return { path: file.path, slug: slugParts, title: quickTitle(file.content, fallback), content: file.content };
    })
    .sort((a, b) => a.title.localeCompare(b.title) || a.path.localeCompare(b.path));
}

export function getProjects(): ProjectEntry[] {
  return [
    ...PROJECTS.map(entryOf),
    ...diskProjects().map((project): ProjectEntry => ({
      slug: project.slug,
      name: project.name,
      description: project.description,
      kind: "disk",
    })),
  ];
}

export function getProject(slug: string): LoadedProject | undefined {
  const project = PROJECTS.find((entry) => entry.slug === slug);
  if (project) return { ...entryOf(project), home: project.home, synced: false };
  const disk = diskProjects().find((entry) => entry.slug === slug);
  if (!disk) return undefined;
  const docs = diskDocs(slug);
  const home = docs.find((doc) => !doc.path.includes("/"))?.path ?? docs[0]?.path ?? "";
  return { slug: disk.slug, name: disk.name, description: disk.description, kind: "disk", home, synced: true };
}

export function getDocs(slug: string): Doc[] {
  const project = PROJECTS.find((entry) => entry.slug === slug);
  if (!project) return diskProjects().some((entry) => entry.slug === slug) ? diskDocs(slug) : [];
  const order = project.order ?? [];
  const rank = (doc: Doc) => {
    const index = doc.slug.length > 1 ? order.indexOf(doc.slug[0]) : -1;
    return index === -1 ? 99 : index;
  };
  return walk(project.root(), []).sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title));
}

export function projectSummaries(): ProjectSummary[] {
  return [
    ...PROJECTS.map((project) => ({ ...entryOf(project), kind: "repo" as const, paths: getDocs(project.slug).map((doc) => doc.path) })),
    ...diskProjects().map((project) => ({
      slug: project.slug,
      name: project.name,
      description: project.description,
      kind: "disk" as const,
      paths: project.paths,
    })),
  ];
}
