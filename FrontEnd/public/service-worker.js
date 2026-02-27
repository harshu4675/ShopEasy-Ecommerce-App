const CACHE_NAME = "shopeasy-v1";

// Install event - skip waiting
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

// Activate event - claim clients
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Fetch event - cache first, then network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls and external requests
  if (
    event.request.url.includes("/api/") ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version
        return cachedResponse;
      }

      // Fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Don't cache if not a valid response
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone the response
          const responseToCache = networkResponse.clone();

          // Cache the fetched response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Return offline page if available
          return caches.match("/");
        });
    }),
  );
});
