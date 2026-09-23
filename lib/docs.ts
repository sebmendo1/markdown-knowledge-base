import fs from "node:fs";
import path from "node:path";
import { quickTitle } from "./markdown/scan";
import type { ProjectEntry, RepoProjectSummary } from "./workspace/projects";

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

export function getProjects(): ProjectEntry[] {
  return PROJECTS.map(entryOf);
}

export function getProject(slug: string): (ProjectEntry & { home: string }) | undefined {
  const project = PROJECTS.find((entry) => entry.slug === slug);
  return project ? { ...entryOf(project), home: project.home } : undefined;
}

export function getDocs(slug: string): Doc[] {
  const project = PROJECTS.find((entry) => entry.slug === slug);
  if (!project) return [];
  const order = project.order ?? [];
  const rank = (doc: Doc) => {
    const index = doc.slug.length > 1 ? order.indexOf(doc.slug[0]) : -1;
    return index === -1 ? 99 : index;
  };
  return walk(project.root(), []).sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title));
}

export function projectSummaries(): RepoProjectSummary[] {
  return PROJECTS.map((project) => ({ ...entryOf(project), kind: "repo", paths: getDocs(project.slug).map((doc) => doc.path) }));
}
