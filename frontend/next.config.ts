import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ATS-checker",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
