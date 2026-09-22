import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // produces a minimal .next/standalone server for Docker deployments
  allowedDevOrigins: ['192.168.1.95', 'localhost:3000'],   
};

export default nextConfig;
