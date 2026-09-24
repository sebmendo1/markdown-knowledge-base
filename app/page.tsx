import type { Metadata } from "next";
import { connection } from "next/server";
import { Launcher } from "@/components/launcher";
import { projectSummaries } from "@/lib/docs";

export const metadata: Metadata = { title: "Projects · markdown-kb" };

export default async function Home() {
  if (process.env.KB_LOCAL === "1" || process.env.KB_DIR) await connection();
  return <Launcher repo={projectSummaries()} />;
}
