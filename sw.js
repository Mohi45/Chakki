const CACHE_NAME = "chakki-v1";

const urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/js/config.js",
    "/js/state.js",
    "/js/firebase.js",
    "/js/utils.js",
    "/js/sales.js",
    "/js/pisai.js",
    "/js/udhaar.js",
    "/js/ledger.js",
    "/js/ui.js",
    "/js/app.js"
];

// INSTALL
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// FETCH (offline support)
self.addEventListener("fetch", event => {

    // ❌ Skip POST (Firebase uses POST)
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then(res => {
            return res || fetch(event.request).then(response => {
                return caches.open("app-cache").then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});

// UPDATE
self.addEventListener("message", event => {
    if (event.data.action === "skipWaiting") {
        self.skipWaiting();
    }
});