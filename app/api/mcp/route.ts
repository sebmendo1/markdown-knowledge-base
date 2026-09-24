import path from "node:path";
import { NextResponse } from "next/server";
import { mcpSnippets } from "@/lib/mcp/snippets";

export const dynamic = "force-dynamic";

export function GET() {
  if (process.env.KB_LOCAL !== "1") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const kbDir = process.env.KB_DIR
    ? path.resolve(/*turbopackIgnore: true*/ process.env.KB_DIR)
    : path.join(process.cwd(), "kb");
  const serverFile = path.join(process.cwd(), "mcp", "server.ts");
  return NextResponse.json(mcpSnippets(kbDir, serverFile));
}
