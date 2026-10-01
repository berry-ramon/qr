import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { createHash } from "node:crypto";

// Vite config - https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Keep sourcemaps in dev, drop them in production builds.
  const emitSourcemaps = mode === "development";

  return {
    base: "/",

    build: {
      sourcemap: emitSourcemaps ? "inline" : false,
      minify: !emitSourcemaps,
    },

    plugins: [react(), tailwindcss(), offlineAssets()],

    resolve: {
      alias: {
        // `import.meta.dirname` replaces `__dirname` for the native
        // config loader that Vite 8+ is migrating to.
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },

    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
    },

    preview: {
      host: "0.0.0.0",
      port: 4173,
    },
  };
});

/* =========================================================
   OFFLINE SERVICE WORKER
   ---------------------------------------------------------
   Emits a sw.js at build time that precaches every asset in
   the production bundle. Makes the whole QR Studio work
   offline - including logo uploads, exports, and history,
   all of which are already client-side only.
   ========================================================= */

function offlineAssets(): Plugin {
  return {
    name: "qr-studio-offline-assets",
    apply: "build",
    generateBundle(_, bundle) {
      const files = [
        "index.html",
        ...Object.keys(bundle).filter((file) => !file.endsWith(".map")),
      ];
      const version = createHash("sha256")
        .update(files.join("|"))
        .digest("hex")
        .slice(0, 12);

      const script = `const CACHE = 'qr-studio-${version}';
const ASSETS = ${JSON.stringify(files)};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS.map(file => new URL(file, self.registration.scope).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(hit =>
      hit ||
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          event.request.mode === 'navigate'
            ? caches.match(new URL('index.html', self.registration.scope).href)
            : Response.error()
        )
    )
  );
});`;

      this.emitFile({ type: "asset", fileName: "sw.js", source: script });
    },
  };
}
