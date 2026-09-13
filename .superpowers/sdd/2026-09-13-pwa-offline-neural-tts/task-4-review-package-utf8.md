diff --git a/public/icons/icon-192.png b/public/icons/icon-192.png
new file mode 100644
index 0000000..e755168
Binary files /dev/null and b/public/icons/icon-192.png differ
diff --git a/public/icons/icon-512.png b/public/icons/icon-512.png
new file mode 100644
index 0000000..745c0b9
Binary files /dev/null and b/public/icons/icon-512.png differ
diff --git a/public/icons/icon.svg b/public/icons/icon.svg
new file mode 100644
index 0000000..9776935
--- /dev/null
+++ b/public/icons/icon.svg
@@ -0,0 +1,27 @@
+<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
+  <defs>
+    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
+      <stop offset="0%" stop-color="#4f46e5" />
+      <stop offset="100%" stop-color="#7c3aed" />
+    </linearGradient>
+    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
+      <stop offset="0%" stop-color="#f59e0b" />
+      <stop offset="100%" stop-color="#ef4444" />
+    </linearGradient>
+  </defs>
+  <rect width="512" height="512" rx="128" fill="url(#bg)" />
+  <g fill="white" transform="translate(64, 64) scale(0.75)">
+    <!-- Gamepad Controller -->
+    <path d="M120 160 C 60 160 20 220 20 320 C 20 400 70 440 120 420 L 160 400 C 180 390 200 400 220 410 L 256 425 L 292 410 C 312 400 332 390 352 400 L 392 420 C 442 440 492 400 492 320 C 492 220 452 160 392 160 Z" opacity="0.95" />
+    <!-- D-Pad -->
+    <path d="M120 240 L 140 240 L 140 220 C 140 215 150 215 150 220 L 150 240 L 170 240 C 175 240 175 250 170 250 L 150 250 L 150 270 C 150 275 140 275 140 270 L 140 250 L 120 250 C 115 250 115 240 120 240 Z" fill="#4f46e5" />
+    <!-- Action Buttons -->
+    <circle cx="370" cy="235" r="14" fill="#f59e0b" />
+    <circle cx="340" cy="265" r="14" fill="#10b981" />
+    <circle cx="400" cy="265" r="14" fill="#3b82f6" />
+    <circle cx="370" cy="295" r="14" fill="#ef4444" />
+    <!-- Sound Waves for Speech -->
+    <path d="M 230 220 Q 256 200 282 220" stroke="#f59e0b" stroke-width="12" fill="none" stroke-linecap="round" />
+    <path d="M 215 190 Q 256 160 297 190" stroke="#f59e0b" stroke-width="12" fill="none" stroke-linecap="round" />
+  </g>
+</svg>
diff --git a/public/sw.js b/public/sw.js
new file mode 100644
index 0000000..d6130b5
--- /dev/null
+++ b/public/sw.js
@@ -0,0 +1,128 @@
+// public/sw.js
+// Service Worker for GameHub PWA: Offline Learning & Caching Engine
+
+const CACHE_NAME = 'gamehub-cache-v1'
+
+const PRECACHE_ASSETS = [
+  '/',
+  '/offline',
+  '/manifest.webmanifest',
+  '/icons/icon.svg',
+  '/icons/icon-192.png',
+  '/icons/icon-512.png',
+]
+
+// Install Event: Cache core shell and assets
+self.addEventListener('install', (event) => {
+  event.waitUntil(
+    caches
+      .open(CACHE_NAME)
+      .then((cache) => {
+        return cache.addAll(PRECACHE_ASSETS)
+      })
+      .then(() => self.skipWaiting())
+  )
+})
+
+// Activate Event: Clean up legacy caches and claim active clients
+self.addEventListener('activate', (event) => {
+  event.waitUntil(
+    caches
+      .keys()
+      .then((cacheNames) => {
+        return Promise.all(
+          cacheNames.map((cache) => {
+            if (cache !== CACHE_NAME) {
+              console.log('[ServiceWorker] Purging legacy cache:', cache)
+              return caches.delete(cache)
+            }
+          })
+        )
+      })
+      .then(() => self.clients.claim())
+  )
+})
+
+// Fetch Event: Caching strategies tailored for educational games and media
+self.addEventListener('fetch', (event) => {
+  // Only process GET requests; bypass mutations for background offline sync
+  if (event.request.method !== 'GET') {
+    return
+  }
+
+  const url = new URL(event.request.url)
+
+  // Bypass API calls and Supabase auth/storage endpoints
+  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
+    return
+  }
+
+  // Strategy 1: HTML Document Navigations -> Network-First with Offline Page Fallback
+  if (event.request.mode === 'navigate') {
+    event.respondWith(
+      fetch(event.request)
+        .then((networkResponse) => {
+          if (networkResponse && networkResponse.status === 200) {
+            const clone = networkResponse.clone()
+            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
+          }
+          return networkResponse
+        })
+        .catch(async () => {
+          const cached = await caches.match(event.request)
+          if (cached) return cached
+
+          const offlineFallback = await caches.match('/offline')
+          if (offlineFallback) return offlineFallback
+
+          return (await caches.match('/')) || new Response('Offline', { status: 503 })
+        })
+    )
+    return
+  }
+
+  // Strategy 2: Audio, Image, and Static Asset Requests -> Cache-First
+  const isStaticOrMedia =
+    /\.(png|jpg|jpeg|svg|webp|gif|ico|mp3|wav|ogg|m4a|woff|woff2|ttf|eot|css|js)$/i.test(
+      url.pathname
+    ) ||
+    event.request.destination === 'audio' ||
+    event.request.destination === 'image' ||
+    event.request.destination === 'font'
+
+  if (isStaticOrMedia) {
+    event.respondWith(
+      caches.match(event.request).then((cachedResponse) => {
+        if (cachedResponse) {
+          return cachedResponse
+        }
+
+        return fetch(event.request).then((networkResponse) => {
+          if (networkResponse && networkResponse.status === 200) {
+            const clone = networkResponse.clone()
+            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
+          }
+          return networkResponse
+        })
+      })
+    )
+    return
+  }
+
+  // Strategy 3: Stale-While-Revalidate for Other Dynamic Requests
+  event.respondWith(
+    caches.match(event.request).then((cachedResponse) => {
+      const fetchPromise = fetch(event.request)
+        .then((networkResponse) => {
+          if (networkResponse && networkResponse.status === 200) {
+            const clone = networkResponse.clone()
+            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
+          }
+          return networkResponse
+        })
+        .catch(() => null)
+
+      return cachedResponse || fetchPromise
+    })
+  )
+})
diff --git a/scripts/generate-png-icons.mjs b/scripts/generate-png-icons.mjs
new file mode 100644
index 0000000..ae36e75
--- /dev/null
+++ b/scripts/generate-png-icons.mjs
@@ -0,0 +1,73 @@
+import fs from 'node:fs'
+import path from 'node:path'
+import zlib from 'node:zlib'
+
+function createPngBuffer(width, height, r, g, b) {
+  // Signature
+  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
+
+  // IHDR
+  const ihdrData = Buffer.alloc(13)
+  ihdrData.writeUInt32BE(width, 0)
+  ihdrData.writeUInt32BE(height, 4)
+  ihdrData.writeUInt8(8, 8) // bit depth: 8
+  ihdrData.writeUInt8(2, 9) // color type: 2 (RGB)
+  ihdrData.writeUInt8(0, 10) // compression: 0
+  ihdrData.writeUInt8(0, 11) // filter: 0
+  ihdrData.writeUInt8(0, 12) // interlace: 0
+
+  const ihdrChunk = makeChunk('IHDR', ihdrData)
+
+  // Raw image data: filter byte (0) + RGB per pixel
+  const rowSize = 1 + width * 3
+  const rawData = Buffer.alloc(height * rowSize)
+  for (let y = 0; y < height; y++) {
+    const rowOffset = y * rowSize
+    rawData[rowOffset] = 0 // None filter
+    for (let x = 0; x < width; x++) {
+      const pixelOffset = rowOffset + 1 + x * 3
+      rawData[pixelOffset] = r
+      rawData[pixelOffset + 1] = g
+      rawData[pixelOffset + 2] = b
+    }
+  }
+
+  const compressedData = zlib.deflateSync(rawData)
+  const idatChunk = makeChunk('IDAT', compressedData)
+  const iendChunk = makeChunk('IEND', Buffer.alloc(0))
+
+  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
+}
+
+function crc32(buf) {
+  let c = 0xffffffff
+  for (let i = 0; i < buf.length; i++) {
+    c ^= buf[i]
+    for (let k = 0; k < 8; k++) {
+      c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
+    }
+  }
+  return (c ^ 0xffffffff) >>> 0
+}
+
+function makeChunk(type, data) {
+  const len = Buffer.alloc(4)
+  len.writeUInt32BE(data.length, 0)
+
+  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
+  const crcBuf = Buffer.alloc(4)
+  crcBuf.writeUInt32BE(crc32(typeAndData), 0)
+
+  return Buffer.concat([len, typeAndData, crcBuf])
+}
+
+const iconsDir = path.resolve('public/icons')
+if (!fs.existsSync(iconsDir)) {
+  fs.mkdirSync(iconsDir, { recursive: true })
+}
+
+// Indigo #4f46e5 -> (79, 70, 229)
+fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPngBuffer(192, 192, 79, 70, 229))
+fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPngBuffer(512, 512, 79, 70, 229))
+
+console.log('PNG icons generated successfully!')
diff --git a/src/app/manifest.ts b/src/app/manifest.ts
new file mode 100644
index 0000000..ef0c541
--- /dev/null
+++ b/src/app/manifest.ts
@@ -0,0 +1,35 @@
+import type { MetadataRoute } from 'next'
+
+export default function manifest(): MetadataRoute.Manifest {
+  return {
+    name: 'GameHub - English Learning Games for Kids',
+    short_name: 'GameHub',
+    description:
+      'Playful English learning games with multi-accent neural voices and offline practice for kids',
+    start_url: '/',
+    display: 'standalone',
+    background_color: '#ffffff',
+    theme_color: '#4f46e5',
+    orientation: 'portrait-primary',
+    icons: [
+      {
+        src: '/icons/icon-192.png',
+        sizes: '192x192',
+        type: 'image/png',
+        purpose: 'any',
+      },
+      {
+        src: '/icons/icon-512.png',
+        sizes: '512x512',
+        type: 'image/png',
+        purpose: 'maskable',
+      },
+      {
+        src: '/icons/icon-512.png',
+        sizes: '512x512',
+        type: 'image/png',
+        purpose: 'any',
+      },
+    ],
+  }
+}
diff --git a/src/app/offline/page.tsx b/src/app/offline/page.tsx
new file mode 100644
index 0000000..fef0e99
--- /dev/null
+++ b/src/app/offline/page.tsx
@@ -0,0 +1,51 @@
+'use client'
+
+import React from 'react'
+import Link from 'next/link'
+import { WifiOff, RotateCcw, Home } from 'lucide-react'
+
+export default function OfflinePage() {
+  const handleRetry = () => {
+    if (typeof window !== 'undefined') {
+      window.location.reload()
+    }
+  }
+
+  return (
+    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
+      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border-4 border-indigo-100 flex flex-col items-center">
+        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
+          <WifiOff className="w-12 h-12" aria-hidden="true" />
+        </div>
+
+        <h1 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
+          You are Offline!
+        </h1>
+
+        <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
+          No internet connection right now. Don&apos;t worry! Your games, scores, and flashcards are
+          saved safely on your device.
+        </p>
+
+        <div className="w-full flex flex-col gap-4">
+          <button
+            type="button"
+            onClick={handleRetry}
+            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
+          >
+            <RotateCcw className="w-6 h-6" />
+            <span>Try Reconnecting</span>
+          </button>
+
+          <Link
+            href="/"
+            className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3"
+          >
+            <Home className="w-6 h-6" />
+            <span>Return to Home</span>
+          </Link>
+        </div>
+      </div>
+    </div>
+  )
+}
diff --git a/tests/unit/pwa/manifest-and-sw.test.ts b/tests/unit/pwa/manifest-and-sw.test.ts
new file mode 100644
index 0000000..87cfa02
--- /dev/null
+++ b/tests/unit/pwa/manifest-and-sw.test.ts
@@ -0,0 +1,94 @@
+import { describe, it, expect } from 'vitest'
+import fs from 'node:fs'
+import path from 'node:path'
+import manifest from '@/app/manifest'
+
+describe('PWA Manifest & Service Worker Cache Engine', () => {
+  describe('manifest.ts', () => {
+    it('returns valid W3C PWA manifest metadata', () => {
+      const data = manifest()
+
+      expect(data.name).toContain('GameHub')
+      expect(data.short_name).toBe('GameHub')
+      expect(data.start_url).toBe('/')
+      expect(data.display).toBe('standalone')
+      expect(data.theme_color).toBe('#4f46e5')
+      expect(data.background_color).toBe('#ffffff')
+
+      expect(Array.isArray(data.icons)).toBe(true)
+      expect(data.icons?.length).toBeGreaterThanOrEqual(2)
+
+      const has192 = data.icons?.some(
+        (icon) => icon.sizes === '192x192' && icon.src.includes('192')
+      )
+      const has512 = data.icons?.some(
+        (icon) => icon.sizes === '512x512' && icon.src.includes('512')
+      )
+      expect(has192).toBe(true)
+      expect(has512).toBe(true)
+    })
+  })
+
+  describe('public/sw.js', () => {
+    const swPath = path.resolve(process.cwd(), 'public/sw.js')
+
+    it('exists and includes cache name versioning and core assets', () => {
+      expect(fs.existsSync(swPath)).toBe(true)
+      const content = fs.readFileSync(swPath, 'utf-8')
+
+      expect(content).toMatch(/const\s+CACHE_NAME\s*=\s*['"`]gamehub-cache-v/i)
+      expect(content).toContain("'/offline'")
+      expect(content).toContain("'/manifest.webmanifest'")
+    })
+
+    it('contains lifecycle handlers: install with skipWaiting, activate with clients.claim', () => {
+      const content = fs.readFileSync(swPath, 'utf-8')
+
+      expect(content).toContain("addEventListener('install'")
+      expect(content).toContain('skipWaiting')
+
+      expect(content).toContain("addEventListener('activate'")
+      expect(content).toContain('clients.claim')
+      expect(content).toContain('caches.delete')
+    })
+
+    it('contains fetch caching strategies for navigation, static assets, and non-GET bypass', () => {
+      const content = fs.readFileSync(swPath, 'utf-8')
+
+      expect(content).toContain("addEventListener('fetch'")
+      // Non-GET bypass
+      expect(content).toMatch(/request\.method\s*!==\s*['"`]GET['"`]/)
+      // Navigation handler with fallback
+      expect(content).toMatch(/request\.mode\s*===\s*['"`]navigate['"`]/)
+      // Audio or media cache check
+      expect(content).toMatch(/(audio|mp3|wav|png|svg|webp)/i)
+    })
+  })
+
+  describe('src/app/offline/page.tsx', () => {
+    it('exists and complies with strict kid-friendly typography (>= 16px)', () => {
+      const offlinePagePath = path.resolve(process.cwd(), 'src/app/offline/page.tsx')
+      expect(fs.existsSync(offlinePagePath)).toBe(true)
+
+      const content = fs.readFileSync(offlinePagePath, 'utf-8')
+      // Ensure strictly NO text-xs, text-sm, or small bracket sizes
+      const prohibitedClasses = [
+        'text-xs',
+        'text-sm',
+        'text-[10px]',
+        'text-[11px]',
+        'text-[12px]',
+        'text-[13px]',
+        'text-[14px]',
+      ]
+      for (const prohibited of prohibitedClasses) {
+        expect(content).not.toContain(prohibited)
+      }
+
+      // Ensure kid-friendly reassuring messaging
+      expect(content).toContain('Offline')
+      expect(content).toContain('saved safely')
+    })
+  })
+})
+

