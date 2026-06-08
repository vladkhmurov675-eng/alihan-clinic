import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pg', '@prisma/adapter-pg', 'bcrypt', 'bcryptjs'],
  experimental: {
    turbo: {
      rules: {}
    }
  }
};

export default nextConfig;