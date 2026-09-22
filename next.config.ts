import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingIncludes: {
    "/[...slug]": ["./content/**/*"],
  },
};

export default nextConfig;
