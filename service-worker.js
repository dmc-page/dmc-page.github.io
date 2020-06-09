var CACHE = "kanepi-v1";
var CACHE_URLS = [
  'index.html',
  'styles/app.css',
  'scripts/app.js',
  'scripts/knockout-3.5.1.js',
  'scripts/components/main.js',
  'scripts/components/camera.js',
  'scripts/components/overlay.js',
  'scripts/components/location.js'
];

// TODO: Remove when not in active dev
CACHE_URLS = [];

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (cache) {
            return cache.addAll(CACHE_URLS);
        })
    );
});

//// The activate handler takes care of cleaning up old caches.
//self.addEventListener('activate', event => {
//    const currentCaches = [PRECACHE, RUNTIME];
//    event.waitUntil(
//      caches.keys().then(cacheNames => {
//          return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
//      }).then(cachesToDelete => {
//          return Promise.all(cachesToDelete.map(cacheToDelete => {
//              return caches.delete(cacheToDelete);
//          }));
//      }).then(() => self.clients.claim())
//    );
//});

self.addEventListener("fetch", function (e) {
    e.respondWith(
        caches.match(e.request)
            .then(function (r) {
                if (r) return r;

                return fetch(e.request)
                    .then(function (r) {
                        if (!r || r.status !== 200 || r.type !== "basic")
                            return r;

                        // TODO: Remove when not in active dev
                        return r;

                        // Clone then cache
                        var r_cache = r.clone();

                        caches.open(CACHE)
                            .then(function (cache) {
                                cache.put(e.request, r_cache);
                            });

                        return r;
                    });
            })
    );
});

//// The fetch handler serves responses for same-origin resources from a cache.
//// If no response is found, it populates the runtime cache with the response
//// from the network before returning it to the page.
//self.addEventListener('fetch', event => {
//    // Skip cross-origin requests, like those for Google Analytics.
//    if (event.request.url.startsWith(self.location.origin)) {
//        event.respondWith(
//          caches.match(event.request).then(cachedResponse => {
//              if (cachedResponse) {
//                  return cachedResponse;
//              }

//              return caches.open(RUNTIME).then(cache => {
//                  return fetch(event.request).then(response => {
//                      // Put a copy of the response in the runtime cache.
//                      return cache.put(event.request, response.clone()).then(() => {
//                          return response;
//                      });
//                  });
//              });
//          })
//        );
//    }
//});