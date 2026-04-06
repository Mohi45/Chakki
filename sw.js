// 🔄 VERSION (CHANGE THIS ON EVERY UPDATE)
const CACHE_NAME = "chakki-app-v2";

// 📦 FILES TO CACHE
const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./img/chakkilogo192.png",
    "./img/chakkilogo512.png"
];

// 🚀 INSTALL
self.addEventListener("install", event => {
    self.skipWaiting(); // ✅ force new SW

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 🔥 ACTIVATE (DELETE OLD CACHE)
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key); // ✅ remove old cache
                    }
                })
            )
        )
    );

    self.clients.claim();
});

// 🌐 FETCH (NETWORK FIRST + OFFLINE)
self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(res => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, res.clone());
                    return res;
                });
            })
            .catch(() => caches.match(event.request))
    );
});

// 🔁 LISTEN FOR UPDATE COMMAND
self.addEventListener("message", event => {
    if (event.data && event.data.action === "skipWaiting") {
        self.skipWaiting();
    }
});