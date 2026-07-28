import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Suppress Turbopack Prisma junction point warning on Windows
  // by keeping config clean
};

export default nextConfig;
