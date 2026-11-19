import type { MetadataRoute } from "next";

// Installable PWA (no offline mode, NFR-1): manifest + icons only, no service worker.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habit Tracker",
    short_name: "Nawyki",
    description: "Śledzenie nawyków i celów",
    start_url: "/",
    display: "standalone",
    lang: "pl",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
