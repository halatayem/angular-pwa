const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v4";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/offline.html",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png"
];

// INSTALL – static cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE – rensa gamla cacher
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH – static + dynamic + offline + API
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (!req.url.startsWith("http")) return;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200) return res;

          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => {
          if (req.headers.get("accept")?.includes("text/html")) {
            return caches.match("/assets/offline.html");
          }

          if (req.url.includes("/api")) {
            return caches.match(req);
          }
        });
    })
  );
});