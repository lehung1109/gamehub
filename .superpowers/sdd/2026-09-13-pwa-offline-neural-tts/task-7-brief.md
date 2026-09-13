# Task 7 Brief: Layout Shell Integration & Navbar Quick Voice Switcher

## Requirements
- Files created/modified:
  - `src/components/speech/QuickVoiceSwitcher.tsx`: Kid-friendly navbar pill button displaying active accent flag, region label, and speech volume icon; clicking it opens `SpeechSettingsModal` directly. Complies with strictly $\ge 16$px typography.
  - `src/app/layout.tsx`: Configured PWA manifest link (`/manifest.webmanifest`), Apple web app metadata, and mounted `ServiceWorkerRegister` within the root session provider.
  - `src/app/page.tsx`: Integrated `QuickVoiceSwitcher` into top bar alongside student streak and profile badges.
  - `tests/app/layout.test.tsx`: Updated layout test to verify content rendering alongside `ServiceWorkerRegister`.
  - `tests/unit/components/LayoutPwaIntegration.test.tsx`: Unit tests verifying `QuickVoiceSwitcher` displays accent flag, opens modal on click, mounts `ServiceWorkerRegister`, and adheres strictly to kid-friendly typography ($\ge 16$px).
- Constraints:
  - Strict typography policy: minimum 16px font size on all UI components (NO `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
  - Zero `any`, clean ESLint (0 errors, 0 warnings), 100% tests passing.
