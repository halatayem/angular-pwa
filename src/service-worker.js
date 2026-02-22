const STATIC_CACHE = "static-v5";
const DYNAMIC_CACHE = "dynamic-v5";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/offline.html",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png"
];

//STATIC cache vid install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

//Rensa gamla cache-versioner
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

//FETCH: API cache + static/dynamic + offline fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (!req.url.startsWith("http")) return;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  //API: /bilar → network-first, cache-fallback
  if (url.pathname === "/bilar") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() =>
          caches.match(req).then((cached) => {
            if (cached) return cached;
            // om man aldrig varit online: returnera tom lista
            return new Response("[]", {
              headers: { "Content-Type": "application/json" },
            });
          })
        )
    );
    return;
  }

  //Allt annat: cache-first, annars nät + dynamic cache
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
          //offline fallback för HTML
          if (req.headers.get("accept")?.includes("text/html")) {
            return caches.match("/assets/offline.html");
          }
        });
    })
  );
});