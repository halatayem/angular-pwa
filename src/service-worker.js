const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/polyfills.js",
  "/manifest.webmanifest",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/assets/offline.html"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/assets/offline.html");
        });
      })
  );
});