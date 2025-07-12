import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./lib/db/migrations/**/*']
    }
  }
};

export default nextConfig;
