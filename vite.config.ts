import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_BASE_URL?.trim();

  let apiOriginPattern: RegExp | undefined;
  if (apiBase) {
    try {
      const origin = new URL(apiBase).origin;
      apiOriginPattern = new RegExp(`^${escapeRegExp(origin)}/`);
    } catch {
      // Invalid VITE_BASE_URL — skip API runtime caching
    }
  }

  const runtimeCaching = apiOriginPattern
    ? [
        {
          urlPattern: apiOriginPattern,
          handler: "StaleWhileRevalidate" as const,
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 80,
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
      ]
    : [];

  return {
    root: ".", // Ensure Vite looks for index.html in the correct place
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["config.js", "vite.svg", "icon-192.png", "icon-512.png"],
        manifest: {
          id: "/",
          name: "Beyond The Bracket",
          short_name: "Bracket",
          scope: "/",
          start_url: "/",
          orientation: "portrait",
          display: "standalone",
          background_color: "#0f172a",
          theme_color: "#0f172a",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: "index.html",
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching,
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    build: {
      outDir: "dist", // Output directory for production
      emptyOutDir: true, // Clears the output directory before building
    },
  };
});
