import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} - Premium architectural interiors`,
    short_name: SITE_NAME,
    description:
      "Premium baseboards, 3D wall panels, moldings and profiles for modern architecture.",
    start_url: "/en",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#1a1a1a",
    lang: "en",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["business", "lifestyle"],
    id: SITE_URL,
  };
}
