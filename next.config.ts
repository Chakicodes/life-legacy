import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Silence root inference warning by explicitly setting the project root
    root: __dirname,
  },
};

export default nextConfig;
