import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { getDoc, getDocs } from "@/lib/docs";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamic = "force-static";

export function generateStaticParams() {
  return getDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: "Not found · markdown-kb" };
  return { title: `${doc.title} · markdown-kb` };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  return <Workspace docs={getDocs()} currentPath={doc.path} />;
}
