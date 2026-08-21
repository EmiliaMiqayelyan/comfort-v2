import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    qualities: [75, 90, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [64, 96, 128, 256, 384, 512, 768],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.comfort.am" },
      { protocol: "https", hostname: "**.comfort.am" },
      // Admin may paste arbitrary https image URLs (Google thumbnails, CDNs, etc.)
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async rewrites() {
    const apiOrigin = (process.env.API_URL || "http://127.0.0.1:4000/api").replace(
      /\/api\/?$/,
      "",
    );
    return [{ source: "/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` }];
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
