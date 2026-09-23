import type { Metadata } from "next";
import { StaticMarkdown } from "@/components/static-markdown";
import { Workspace } from "@/components/workspace";
import { getDoc, getDocs } from "@/lib/docs";
import { extractHeadings } from "@/lib/markdown/outline";
import { humanize } from "@/lib/workspace/paths";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getDocs().map((doc) => ({ slug: doc.slug }));
}

const decode = (slug: string[]) => slug.map((part) => decodeURIComponent(part));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decode((await params).slug);
  const title = getDoc(slug)?.title ?? humanize(slug.at(-1) ?? "Page");
  return { title: `${title} · markdown-kb` };
}

export default async function Page({ params }: Props) {
  const slug = decode((await params).slug);
  const docs = getDocs();
  const path = `${slug.join("/")}.md`;
  const doc = docs.find((entry) => entry.path === path);
  return (
    <Workspace
      docs={docs}
      currentPath={path}
      rendered={doc ? <StaticMarkdown source={doc.content} docs={docs} path={path} /> : null}
      headings={doc ? extractHeadings(doc.content) : []}
    />
  );
}
