import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // News cover images are served from /public or stored as data URLs, so no
  // remote image hosts are needed. Add remotePatterns here if that changes.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
