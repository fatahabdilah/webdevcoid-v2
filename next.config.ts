import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Hide the dev-only "N" / "Cache disabled" badge; compile and runtime errors still show
  devIndicators: false,
  partialPrefetching: true,
  images: {
    // AVIF first (smaller than WebP), and keep optimised images for 31 days: the site's photos rarely change, so
    // Vercel re-optimises them far less often
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
