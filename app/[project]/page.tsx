import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { getProject, getProjects } from "@/lib/docs";
import { hrefOf } from "@/lib/workspace/paths";

type Props = { params: Promise<{ project: string }> };

export function generateStaticParams() {
  return getProjects().map((project) => ({ project: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject(decodeURIComponent((await params).project));
  return { title: project ? project.name : "Project · markdown-kb" };
}

const NO_DOCS: never[] = [];

export default async function ProjectHome({ params }: Props) {
  const slug = decodeURIComponent((await params).project);
  const repo = getProject(slug);
  if (repo) redirect(hrefOf(slug, repo.home));
  return <Workspace project={slug} projects={getProjects()} docs={NO_DOCS} currentPath="" rendered={null} headings={NO_DOCS} />;
}
