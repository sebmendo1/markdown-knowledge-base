import type { NextConfig } from "next";

const files = ["./content/**/*", "./specs/**/*", "./kb/**/*"];

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingIncludes: {
    "/[project]": files,
    "/[project]/[...slug]": files,
  },
  async redirects() {
    return ["docs", "ledger"].flatMap((folder) => [
      { source: `/${folder}`, destination: "/guide", permanent: false },
      { source: `/${folder}/:path+`, destination: `/guide/${folder}/:path+`, permanent: true },
    ]);
  },
};

export default nextConfig;
