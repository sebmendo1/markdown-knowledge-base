import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerKbTools } from "../lib/mcp/tools";

const server = new McpServer({ name: "markdown-kb", version: "0.1.0" });
registerKbTools(server);
await server.connect(new StdioServerTransport());
