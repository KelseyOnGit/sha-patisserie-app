import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  output: 'standalone', // produces a minimal .next/standalone server for Docker deployments
  allowedDevOrigins: ['192.168.1.95', '192.168.1.97', 'localhost:3000'],   
};

export default nextConfig;
