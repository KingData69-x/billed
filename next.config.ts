import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // pdf-lib uses fs in some code paths — alias to empty for browser bundles
      canvas: { browser: "./empty.ts" },
    },
  },
};

export default nextConfig;
