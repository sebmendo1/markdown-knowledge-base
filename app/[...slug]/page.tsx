import type { Metadata } from "next";
import { Workspace } from "@/components/workspace";
import { getDoc, getDocs } from "@/lib/docs";
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
  return <Workspace docs={getDocs()} currentPath={`${slug.join("/")}.md`} />;
}
