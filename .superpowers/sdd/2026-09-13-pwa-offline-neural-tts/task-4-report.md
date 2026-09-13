# Task 4 Report: Next.js PWA Manifest & Service Worker Cache Engine

## Work Completed
- Created `src/app/manifest.ts`:
  - Returns W3C compliant `MetadataRoute.Manifest` with `name`, `short_name`, `theme_color` (`#4f46e5`), `background_color` (`#ffffff`), `display: 'standalone'`, and responsive icons (`192x192` and `512x512`).
- Created icons:
  - `public/icons/icon.svg`: High-resolution vector icon featuring gamepad and speech audio soundwaves.
  - `public/icons/icon-192.png` & `public/icons/icon-512.png`: Generated using native Node.js zlib script `scripts/generate-png-icons.mjs`.
- Created `src/app/offline/page.tsx`:
  - Reassuring kid-friendly offline fallback view with Lucide icons (`WifiOff`, `RotateCcw`, `Home`).
  - Strict compliance with minimum 16px typography policy (zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- Created `public/sw.js`:
  - Pre-caches core routes (`/`, `/offline`, `/manifest.webmanifest`, icons).
  - Handles `install` with `skipWaiting()`.
  - Handles `activate` with cache rotation (purging old cache keys) and `clients.claim()`.
  - Handles `fetch` with tailored strategies:
    - Bypasses mutations (`method !== 'GET'`) and API/Supabase calls.
    - Network-First with fallback to `/offline` for navigations (`mode === 'navigate'`).
    - Cache-First for media/audio/fonts/images.
    - Stale-While-Revalidate for other static assets.
- Created `tests/unit/pwa/manifest-and-sw.test.ts`:
  - 5 tests covering manifest format, SW cache naming, lifecycle events, fetch strategies, and offline page typography rules.
  - All 5 tests pass (100%).
