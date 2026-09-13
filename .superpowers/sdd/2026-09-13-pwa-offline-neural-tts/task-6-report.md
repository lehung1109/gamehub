# Task 6 Report: PWA UI Components (Offline Indicator, Install Banner, Service Worker Registration)

## Work Completed
- Refactored `src/hooks/useNetworkStatus.ts`:
  - Resolved potential queue purge/data loss: `triggerSync(processorInput?)` dispatches `REQUEST_OFFLINE_SYNC_EVENT` (`'gamehub_request_offline_sync'`) and only runs `syncOfflineQueue` when a legitimate `processorInput` is provided, preventing unexecuted offline actions from being permanently removed.
  - Eliminated stale closure on reconnect by querying `navigator.onLine` directly.
  - Added `isMountedRef` guards to prevent memory leaks and unmounted state update warnings.
- Updated `src/components/pwa/InstallPromptBanner.tsx`:
  - Added direct display support for iOS Safari (`isAppleMobile`) so Apple mobile users see "Tap Share then Add to Home Screen" instructions even though WebKit does not dispatch `beforeinstallprompt`.
  - Safely guarded `window.matchMedia` for SSR/JSDOM.
- Updated `src/components/pwa/OfflineIndicator.tsx`:
  - Floating top banner for offline mode and bottom syncing badge.
  - Strict compliance with minimum 16px typography policy (zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- Created `src/components/pwa/ServiceWorkerRegister.tsx`:
  - Registers `/sw.js` and mounts `OfflineIndicator` and `InstallPromptBanner`.
- Updated `tests/unit/components/PwaComponents.test.tsx`:
  - 10 unit tests covering network transitions, dynamic queue count, offline/syncing indicators, actual `beforeinstallprompt` event dispatching, dismissal cooldown, `ServiceWorkerRegister` mounting, and automated typography inspection.
  - All 10 tests pass (100%).
