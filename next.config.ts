import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // News cover images are served from /public or stored as data URLs, so no
  // remote image hosts are needed. Add remotePatterns here if that changes.
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      // Admin uploads travel to the Server Action as base64 data URLs, which the
      // default 1 MB body cap rejects outright (the failure surfaces as an opaque
      // redacted render error). Uploads are downscaled client-side well below
      // this, so the headroom is only for photos stored before that existed.
      // Stays under Vercel's hard 4.5 MB request-body limit.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
