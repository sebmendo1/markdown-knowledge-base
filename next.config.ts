import type { NextConfig } from "next";
import pkg from "./package.json";

const files = ["./content/**/*", "./specs/**/*", "./kb/**/*"];

const nextConfig: NextConfig = {
  agentRules: false,
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version },
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
