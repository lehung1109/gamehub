# Task 6 Brief: PWA UI Components (Offline Indicator, Install Banner, Service Worker Registration)

## Requirements
- Files created:
  - `src/hooks/useNetworkStatus.ts`: Hook tracking online/offline state, pending offline queue count, syncing state, and auto-sync triggering upon network reconnection.
  - `src/components/pwa/OfflineIndicator.tsx`: Floating indicator alerting students when disconnected ("You are currently offline. Learning games are available offline. Your progress is saved safely.") or syncing, adhering to strict $\ge 16$px typography.
  - `src/components/pwa/InstallPromptBanner.tsx`: Accessible PWA installation banner capturing `beforeinstallprompt`, handling 24h dismissal cooldown, offering iOS Safari guidance, and enforcing min 16px typography.
  - `src/components/pwa/ServiceWorkerRegister.tsx`: Client-side component registering `/sw.js` and rendering PWA system components.
  - `tests/unit/components/PwaComponents.test.tsx`: Unit tests verifying online/offline transitions, queue count reactivity, indicator visibility, banner dismissal cooldown, and strict typography rules.
- Constraints:
  - Strict kid-friendly typography policy: minimum 16px font size on all UI components (NO `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
  - Zero `any`, 100% tests passing.
