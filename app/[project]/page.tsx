import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Workspace } from "@/components/workspace";
import { getDocs, getProject, getProjects } from "@/lib/docs";
import { hrefOf } from "@/lib/workspace/paths";

type Props = { params: Promise<{ project: string }> };

export function generateStaticParams() {
  return getProjects().map((project) => ({ project: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (process.env.KB_LOCAL === "1" || process.env.KB_DIR) await connection();
  const project = getProject(decodeURIComponent((await params).project));
  return { title: project ? project.name : "Project · markdown-kb" };
}

const NO_DOCS: never[] = [];

export default async function ProjectHome({ params }: Props) {
  if (process.env.KB_LOCAL === "1" || process.env.KB_DIR) await connection();
  const slug = decodeURIComponent((await params).project);
  const repo = getProject(slug);
  if (repo?.home) redirect(hrefOf(slug, repo.home));
  return (
    <Workspace
      project={slug}
      projects={getProjects()}
      docs={repo ? getDocs(slug) : NO_DOCS}
      sync={repo?.synced ?? false}
      currentPath=""
      rendered={null}
      headings={NO_DOCS}
    />
  );
}
