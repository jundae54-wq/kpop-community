// Service Worker for K-Community PWA
const CACHE_NAME = 'k-community-v2-debug'
const urlsToCache = [
    '/',
    '/community',
    '/news',
    '/write',
    '/login',
    '/signup'
]

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting() // Force waiting SW to become active
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    )
})

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response
                const responseToCache = response.clone()

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache)
                    })

                return response
            })
            .catch(() => {
                return caches.match(event.request)
            })
    )
})

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName)
                        }
                    })
                )
            }),
            self.clients.claim() // Take control of all clients immediately
        ])
    )
})
