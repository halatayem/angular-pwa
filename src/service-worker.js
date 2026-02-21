const STATIC_CACHE = "static-v3";
const DYNAMIC_CACHE = "dynamic-v3";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/offline.html"
];

// static cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// rensa gamla cache-versioner
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

// static + dynamic + offline 
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Undvik chrome-extension-felet
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
          // Offline
          if (req.headers.get("accept")?.includes("text/html")) {
            return caches.match("/assets/offline.html");
          }
        });
    })
  );
});
