/* Scope is restricted to PingPong. Never intercept the rest of the portfolio. */
const CACHE = "pingpong-shell-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([
          "/pingpong/offline.html",
          "/pingpong/icon-192.png",
          "/pingpong/icon-512.png",
          "/pingpong/manifest.webmanifest",
        ]),
      ),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("pingpong-shell-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    request.headers.has("RSC")
  )
    return;
  if (request.mode === "navigate") {
    if (url.pathname !== "/pingpong" && url.pathname !== "/pingpong/") return;
    event.respondWith(
      fetch(request).catch(() => caches.match("/pingpong/offline.html")),
    );
    return;
  }
  if (!url.pathname.startsWith("/pingpong/") || url.pathname.endsWith(".js"))
    return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE).then((cache) => cache.put(request, copy)),
          );
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
