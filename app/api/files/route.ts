import { NextResponse } from "next/server";
import { defaultStore, StoreError } from "@/lib/store/fs-store";
import type { Change } from "@/lib/store/sync";
import { DISK_BLOCKED } from "@/lib/workspace/projects";

export const dynamic = "force-dynamic";

function unavailable() {
  if (process.env.KB_LOCAL !== "1") return NextResponse.json({ error: "Not found" }, { status: 404 });
  return null;
}

function fail(error: unknown) {
  if (error instanceof StoreError) {
    const status = error.code === "not_found" ? 404 : 400;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }
  return NextResponse.json({ error: "Couldn't read or save those pages." }, { status: 500 });
}

function isChange(value: unknown): value is Change {
  if (!value || typeof value !== "object") return false;
  const change = value as { op?: string; path?: string; id?: string; from?: string; to?: string; content?: string; version?: string };
  if (change.op === "mkdir") return typeof change.path === "string";
  if (change.op === "create") return typeof change.id === "string" && typeof change.path === "string" && typeof change.content === "string";
  if (change.op === "write") {
    return typeof change.id === "string" && typeof change.path === "string" && typeof change.content === "string" && typeof change.version === "string";
  }
  if (change.op === "move") {
    return (
      typeof change.id === "string" &&
      typeof change.from === "string" &&
      typeof change.to === "string" &&
      typeof change.content === "string" &&
      typeof change.version === "string"
    );
  }
  if (change.op === "trash") return typeof change.id === "string" && typeof change.path === "string" && typeof change.version === "string";
  return false;
}

export async function GET(request: Request) {
  const blocked = unavailable();
  if (blocked) return blocked;
  const url = new URL(request.url);
  const project = url.searchParams.get("project") ?? "";
  try {
    const store = defaultStore();
    if (!project) {
      const blockedSlugs = new Set(DISK_BLOCKED);
      return NextResponse.json({ projects: store.listProjects().filter((item) => !blockedSlugs.has(item.slug)) });
    }
    const file = url.searchParams.get("path");
    if (file) return NextResponse.json(store.readFile(project, file));
    const listed = store.listFiles(project);
    return NextResponse.json({
      pages: listed.files.map((item) => ({ path: item.path, version: item.version })),
      folders: listed.folders,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  const blocked = unavailable();
  if (blocked) return blocked;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }
  const project = typeof (body as { project?: unknown }).project === "string" ? (body as { project: string }).project : "";
  const changes = (body as { changes?: unknown }).changes;
  if (!project || !Array.isArray(changes) || !changes.every(isChange)) {
    return NextResponse.json({ error: "Send a project and a list of changes." }, { status: 400 });
  }
  try {
    return NextResponse.json(defaultStore().applyChanges(project, changes));
  } catch (error) {
    return fail(error);
  }
}
