import type { Metadata } from "next";
import { connection } from "next/server";
import { StaticMarkdown } from "@/components/static-markdown";
import { Workspace } from "@/components/workspace";
import { getDocs, getProject, getProjects } from "@/lib/docs";
import { extractHeadings } from "@/lib/markdown/outline";
import { humanize } from "@/lib/workspace/paths";

type Props = { params: Promise<{ project: string; slug: string[] }> };

export function generateStaticParams() {
  return getProjects().flatMap((project) => getDocs(project.slug).map((doc) => ({ project: project.slug, slug: doc.slug })));
}

const decode = (slug: string[]) => slug.map((part) => decodeURIComponent(part));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (process.env.KB_LOCAL === "1" || process.env.KB_DIR) await connection();
  const { project: slug, slug: parts } = await params;
  const path = `${decode(parts).join("/")}.md`;
  const project = getProject(slug);
  const doc = getDocs(slug).find((entry) => entry.path === path);
  const title = doc?.title ?? humanize(decode(parts).at(-1) ?? "Page");
  return { title: project ? `${title} · ${project.name}` : `${title} · markdown-kb` };
}

export default async function Page({ params }: Props) {
  if (process.env.KB_LOCAL === "1" || process.env.KB_DIR) await connection();
  const { project: slug, slug: parts } = await params;
  const project = decodeURIComponent(slug);
  const docs = getDocs(project);
  const path = `${decode(parts).join("/")}.md`;
  const doc = docs.find((entry) => entry.path === path);
  return (
    <Workspace
      project={project}
      projects={getProjects()}
      docs={docs}
      sync={getProject(project)?.synced ?? false}
      currentPath={path}
      rendered={doc ? <StaticMarkdown source={doc.content} docs={docs} project={project} path={path} /> : null}
      headings={doc ? extractHeadings(doc.content) : []}
    />
  );
}
