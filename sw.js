// CACHE NAME
const CACHE_NAME = "chakki-app-v1";

// FILES TO CACHE
const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./img/chakkilogo.png"
];

// INSTALL
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// FETCH (OFFLINE SUPPORT)
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});