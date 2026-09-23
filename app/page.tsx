import type { Metadata } from "next";
import { Launcher } from "@/components/launcher";
import { projectSummaries } from "@/lib/docs";

export const metadata: Metadata = { title: "Projects · markdown-kb" };

export default function Home() {
  return <Launcher repo={projectSummaries()} />;
}
