// public/sw.js
// Service Worker for GameHub PWA: Offline Learning & Caching Engine

const CACHE_NAME = 'gamehub-cache-v1'

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Install Event: Cache core shell and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate Event: Clean up legacy caches and claim active clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('[ServiceWorker] Purging legacy cache:', cache)
              return caches.delete(cache)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch Event: Caching strategies tailored for educational games and media
self.addEventListener('fetch', (event) => {
  // Only process GET requests; bypass mutations for background offline sync
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)

  // Bypass API calls and Supabase auth/storage endpoints
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    return
  }

  // Strategy 1: HTML Document Navigations -> Network-First with Offline Page Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
        .catch(async () => {
          const cached = await caches.match(event.request)
          if (cached) return cached

          const offlineFallback = await caches.match('/offline')
          if (offlineFallback) return offlineFallback

          return (await caches.match('/')) || new Response('Offline', { status: 503 })
        })
    )
    return
  }

  // Strategy 2: Audio, Image, and Static Asset Requests -> Cache-First
  const isStaticOrMedia =
    /\.(png|jpg|jpeg|svg|webp|gif|ico|mp3|wav|ogg|m4a|woff|woff2|ttf|eot|css|js)$/i.test(
      url.pathname
    ) ||
    event.request.destination === 'audio' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'

  if (isStaticOrMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
      })
    )
    return
  }

  // Strategy 3: Stale-While-Revalidate for Other Dynamic Requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        })
        .catch(() => null)

      return cachedResponse || fetchPromise
    })
  )
})
