import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { humanize, nameOf } from "../workspace/paths";
import { defaultStore, StoreError, type Store } from "../store/fs-store";

const project = z.string().describe("Project slug from list_projects or create_project.");
const filePath = z.string().describe("Page path relative to the project, ending in .md, such as notes/idea.md.");
const version = z.string().describe("The version returned by the latest read_file for this page.");

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const body = error instanceof StoreError ? { error: message, code: error.code, ...error.details } : { error: message };
  return { isError: true, content: [{ type: "text" as const, text: JSON.stringify(body, null, 2) }] };
}

async function run(work: () => unknown) {
  try {
    return ok(await work());
  } catch (error) {
    return fail(error);
  }
}

export function registerKbTools(server: McpServer, store: Store = defaultStore()) {
  server.registerTool(
    "list_projects",
    {
      description: "List knowledge-base projects on disk, with their slugs, names, descriptions, and page paths. Call this before creating a project so you don't duplicate one.",
      annotations: { readOnlyHint: true },
    },
    async () => run(() => store.listProjects()),
  );

  server.registerTool(
    "create_project",
    {
      description: "Create a project folder. The folder slug is derived from name. A project.md file stores the name and description.",
      inputSchema: {
        name: z.string().describe("Display name, such as Test Notes."),
        description: z.string().optional().describe("One line about what this project holds."),
      },
    },
    async ({ name, description }) => run(() => store.createProject(name, description)),
  );

  server.registerTool(
    "list_files",
    {
      description: "List the Markdown files and folders in one project. Paths are relative to the project. Read a page before changing it.",
      annotations: { readOnlyHint: true },
      inputSchema: { project },
    },
    async ({ project: slug }) => run(() => store.listFiles(slug, { includeMeta: true })),
  );

  server.registerTool(
    "read_file",
    {
      description: "Read one Markdown page. Keep the version from the result and send that same version to update_file, move_file, or delete_file.",
      annotations: { readOnlyHint: true },
      inputSchema: { project, path: filePath },
    },
    async ({ project: slug, path }) => run(() => store.readFile(slug, path)),
  );

  server.registerTool(
    "create_file",
    {
      description: "Create a new .md page, including any missing parent folders. Fails if the path already exists; update that page instead of creating it again.",
      inputSchema: {
        project,
        path: filePath,
        content: z.string().optional().describe("Markdown for the new page. Defaults to a heading taken from the file name."),
      },
    },
    async ({ project: slug, path, content }) =>
      run(() => {
        const body = content ?? `# ${humanize(nameOf(path))}\n\n`;
        return store.createFile(slug, path, body);
      }),
  );

  server.registerTool(
    "update_file",
    {
      description: "Change a page by sending the full Markdown as content, or by sending edits as find-and-replace pairs for a small change. Always send the version from the latest read_file. If the page changed, this fails: call read_file again and retry.",
      inputSchema: {
        project,
        path: filePath,
        version,
        content: z.string().optional().describe("Full new Markdown. Omit this when sending edits."),
        edits: z
          .array(
            z.object({
              find: z.string().describe("Exact text to find. The first match is replaced once."),
              replace: z.string().describe("Text that replaces the match."),
            }),
          )
          .optional()
          .describe("Small edits, applied in order. Omit this when sending content."),
      },
    },
    async ({ project: slug, path, version: expected, content, edits }) =>
      run(() => store.updateFile(slug, path, expected, { content, edits })),
  );

  server.registerTool(
    "create_folder",
    {
      description: "Create a folder, and any missing parents, inside a project. The path has no .md suffix.",
      inputSchema: {
        project,
        path: z.string().describe("Folder path, such as notes/ideas."),
      },
    },
    async ({ project: slug, path }) => run(() => store.createFolder(slug, path)),
  );

  server.registerTool(
    "move_file",
    {
      description: "Move or rename a page. Wiki links that pointed at the old path are rewritten. Send the version from the latest read_file.",
      inputSchema: {
        project,
        from: filePath.describe("Current path."),
        to: filePath.describe("New path, ending in .md."),
        version,
      },
    },
    async ({ project: slug, from, to, version: expected }) => run(() => store.moveFile(slug, from, to, expected)),
  );

  server.registerTool(
    "delete_file",
    {
      description: "Move a page to the project's .trash folder. It stays on disk and can be read from there. Send the version from the latest read_file.",
      annotations: { destructiveHint: true },
      inputSchema: { project, path: filePath, version },
    },
    async ({ project: slug, path, version: expected }) => run(() => store.trashFile(slug, path, expected)),
  );

  server.registerTool(
    "search",
    {
      description: "Search page paths, titles, and Markdown in one project. The match is case-insensitive.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        project,
        query: z.string().describe("Text to find."),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum hits. Defaults to 20."),
      },
    },
    async ({ project: slug, query, limit }) => run(() => store.search(slug, query, limit ?? 20)),
  );
}
