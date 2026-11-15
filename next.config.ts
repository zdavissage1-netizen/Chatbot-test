import type { NextConfig } from "next";
import { env } from "process";

const devOrigin = env.REPLIT_DOMAINS?.split(",")[0]?.trim();

const nextConfig: NextConfig = {
  ...(devOrigin ? { allowedDevOrigins: [devOrigin] } : {}),
  poweredByHeader: false,
};

export default nextConfig;
