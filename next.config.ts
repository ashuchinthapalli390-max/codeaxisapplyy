import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.codeaxisapply.xyz",
      },
      {
        protocol: "https",
        hostname: "codeaxisapply.xyz",
      },
    ],
  },
};

export default nextConfig;
