import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pg', '@prisma/adapter-pg', 'bcrypt', 'bcryptjs', 'fs', 'net', 'dns', 'tls'],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
                protocol: "https",
        hostname: "pub-fe1e10f55f32400abc08fbea84931a54.r2.dev",
        pathname: "/**",
      }
    ]
  }
};

export default nextConfig;