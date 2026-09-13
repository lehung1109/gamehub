# Task 8 Brief: End-to-End Verification with Playwright for Phase 11

## Requirements
- Files created:
  - `tests/e2e/pwa-offline-neural-tts.spec.ts`: End-to-end tests verifying:
    - PWA web manifest specification (`/manifest.webmanifest` HTTP 200, valid metadata).
    - `QuickVoiceSwitcher` in navbar/top bar: opening `SpeechSettingsModal`, switching accent to British English (UK), switching tone style to Friendly Kid, testing preview voice button, and closing modal with UI state synchronization.
    - Offline fallback page (`/offline`): reassuring messaging for children, retry button, and navigation back to home.
    - Automated computed style DOM audit confirming strict compliance with kid-friendly typography policy ($\ge 16$px) across all PWA screens and modal elements.
- Constraints:
  - Tests run and pass across Desktop Chromium and Mobile Chrome (Pixel 5).
  - 100% tests passing, zero warnings/errors.
