import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/api/debates/:id/stream",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-transform" },
          { key: "Connection", value: "keep-alive" },
          { key: "X-Accel-Buffering", value: "no" },
        ],
      },
    ];
  },
};

export default nextConfig;
