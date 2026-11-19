import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal self-contained server (.next/standalone, run with `node server.js`): the image ships
  // only the traced runtime files instead of the whole node_modules, which with dev deps was a
  // 605 MB layer the GitLab registry's proxy rejected (413).
  output: "standalone",
};

export default nextConfig;
