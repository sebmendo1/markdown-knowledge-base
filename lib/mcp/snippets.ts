export type McpSnippets = {
  kbDir: string;
  serverFile: string;
  cursor: string;
  claude: string;
  codex: string;
};

function tomlString(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

export function mcpSnippets(kbDir: string, serverFile: string): McpSnippets {
  const cursor = JSON.stringify(
    {
      mcpServers: {
        "markdown-kb": {
          command: "npx",
          args: ["tsx", serverFile],
          env: { KB_DIR: kbDir },
        },
      },
    },
    null,
    2,
  );
  const claude = `claude mcp add markdown-kb --scope user -e KB_DIR=${kbDir} \\\n  -- npx tsx ${serverFile}`;
  const codex = `[mcp_servers.markdown-kb]\ncommand = "npx"\nargs = ["tsx", ${tomlString(serverFile)}]\nenv = { KB_DIR = ${tomlString(kbDir)} }`;
  return { kbDir, serverFile, cursor, claude, codex };
}
