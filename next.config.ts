import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pg', '@prisma/adapter-pg', 'bcrypt', 'bcryptjs', 'fs', 'net', 'dns', 'tls'],
};

export default nextConfig;