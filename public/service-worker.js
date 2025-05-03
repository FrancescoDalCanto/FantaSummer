const CACHE_NAME = "fantasummer-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/manifest.json",
    "/vite.svg",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

// Install event: cache files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Service Worker: Caching files");
            return cache.addAll(urlsToCache);
        })
    );
});

// Activate event: cleanup old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("Service Worker: Removing old cache");
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event: serve cached content when offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Serve cached version if available
            return response || fetch(event.request);
        })
    );
});