# Task 4 Brief: Next.js PWA Manifest & Service Worker Cache Engine

## Requirements
- Files created:
  - `src/app/manifest.ts`: Standard Next.js 15+ App Router web manifest configuration returning `MetadataRoute.Manifest` with standalone display, `#4f46e5` theme color, and icons (`192x192` and `512x512`).
  - `public/icons/`: Generated PNG icons (`icon-192.png`, `icon-512.png`) and SVG master icon (`icon.svg`).
  - `scripts/generate-png-icons.mjs`: Node.js script using native `zlib` for generating valid PNG buffers without external binary dependencies.
  - `src/app/offline/page.tsx`: Kid-friendly offline fallback route ensuring reassurance, retry action, and strict $\ge 16$px typography (zero `text-xs`/`text-sm`).
  - `public/sw.js`: Service worker implementing `skipWaiting` on install, `clients.claim` and cache purging on activate, Cache-First strategy for audio and static media, Network-First with `/offline` fallback for document navigations, and bypass for non-GET / API routes.
  - `tests/unit/pwa/manifest-and-sw.test.ts`: Comprehensive unit tests verifying manifest schema, SW event handlers and routing strategies, and offline page typography rules.
- Constraints:
  - Strict kid-friendly typography rule (no `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
  - Zero `any`, 100% tests passing.
