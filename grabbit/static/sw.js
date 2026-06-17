const CACHE = "grabbit";
const PRECHACHE = ["/", "/static/app.js", "/static/app.css"];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECHACHE)));
    self.skipWaiting();
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", e => {
    const url = new URL(e.request.url);

    if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});