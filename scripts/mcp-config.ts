// Prints the MCP config for Cursor, Claude Code, and Codex with this checkout's real paths.
// Usage: npm run mcp:config   (set KB_DIR first to point agents at another folder)
import path from "node:path";
import { mcpSnippets } from "../lib/mcp/snippets";

const repo = path.resolve(__dirname, "..");
const kbDir = process.env.KB_DIR ? path.resolve(process.env.KB_DIR) : path.join(repo, "kb");
const snippets = mcpSnippets(kbDir, path.join(repo, "mcp", "server.ts"));

console.log(`Knowledge base folder: ${snippets.kbDir}\n`);
console.log("Cursor, in ~/.cursor/mcp.json:\n");
console.log(snippets.cursor);
console.log("\nClaude Code:\n");
console.log(snippets.claude);
console.log("\nCodex, in ~/.codex/config.toml:\n");
console.log(snippets.codex);
