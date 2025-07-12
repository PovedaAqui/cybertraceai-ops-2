import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': ['./lib/db/migrations/**/*']
  }
};

export default nextConfig;
