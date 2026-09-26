import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { defaultStore } from "../lib/store/fs-store";
import { registerKbTools } from "../lib/mcp/tools";

// MCP clients launch this from their own working directory, so default to the repo's kb/ rather than ./kb.
process.env.KB_DIR ||= path.resolve(__dirname, "..", "kb");

const store = defaultStore();
// Stdout carries the protocol. Stderr shows up in client logs, which makes a wrong folder easy to spot.
console.error(`markdown-kb MCP: reading ${store.root}`);

const server = new McpServer({ name: "markdown-kb", version: "0.1.0" });
registerKbTools(server, store);
// No top-level await: package.json has no "type": "module", so tsx compiles this as CommonJS.
server.connect(new StdioServerTransport()).catch((error) => {
  console.error(error);
  process.exit(1);
});
