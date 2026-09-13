# Phase 11 Implementation Plan: PWA Offline & Multi-Accent Neural TTS Engine

## Overview
This plan implements Phase 11: PWA installation, Service Worker offline caching, offline progress queueing, and multi-accent Neural Speech Synthesis (TTS).

---

## Tasks Breakdown

### Task 1: TypeScript Contracts & Domain Models for Speech & Offline Queue
**Files:**
- Create: `src/types/speech.ts`
- Modify: `src/types/index.ts`
- Test: `tests/unit/types/speech-types.test.ts`

**Steps:**
1. Write unit tests for speech types, accent codes, and offline queue contracts.
2. Run test (FAIL).
3. Implement contracts in `src/types/speech.ts`.
4. Run test (PASS).
5. Commit.

---

### Task 2: Multi-Accent Neural TTS Engine & Voice Discovery
**Files:**
- Create: `src/lib/speech/tts-engine.ts`
- Test: `tests/unit/lib/tts-engine.test.ts`

**Steps:**
1. Write unit tests checking neural voice ranking, accent filtering (`en-US`, `en-GB`, `en-AU`), pitch/rate presets (`kid`, `natural`, `slow`), and fallback tone generator.
2. Run test (FAIL).
3. Implement `tts-engine.ts`.
4. Run test (PASS).
5. Commit.

---

### Task 3: Offline Action Queue & Sync Manager
**Files:**
- Create: `src/lib/offline/offline-manager.ts`
- Test: `tests/unit/lib/offline-manager.test.ts`

**Steps:**
1. Write unit tests asserting item enqueueing, storage serialization, deduplication, retry limits, and sync dispatch.
2. Run test (FAIL).
3. Implement `offline-manager.ts`.
4. Run test (PASS).
5. Commit.

---

### Task 4: Next.js PWA Manifest & Service Worker Cache Engine
**Files:**
- Create: `src/app/manifest.ts`
- Create: `public/sw.js`
- Test: `tests/unit/pwa/manifest-and-sw.test.ts`

**Steps:**
1. Write unit tests validating manifest metadata return values and Service Worker caching route rules.
2. Run test (FAIL).
3. Implement `manifest.ts` and `public/sw.js`.
4. Run test (PASS).
5. Commit.

---

### Task 5: Upgraded useSpeech Hook & Speech Settings Modal
**Files:**
- Modify: `src/hooks/useSpeech.ts`
- Create: `src/components/speech/SpeechSettingsModal.tsx`
- Create: `src/components/speech/VoicePreviewButton.tsx`
- Test: `tests/unit/components/SpeechSettingsModal.test.tsx`

**Steps:**
1. Write unit tests for speech hook integration, accent selection, speed adjustments, and min-16px typography.
2. Run test (FAIL).
3. Implement upgraded `useSpeech.ts`, `SpeechSettingsModal.tsx`, and `VoicePreviewButton.tsx`.
4. Run test (PASS).
5. Commit.

---

### Task 6: PWA UI Components (Offline Indicator, Install Banner, Service Worker Registration)
**Files:**
- Create: `src/hooks/useNetworkStatus.ts`
- Create: `src/components/pwa/OfflineIndicator.tsx`
- Create: `src/components/pwa/InstallPromptBanner.tsx`
- Create: `src/components/pwa/ServiceWorkerRegister.tsx`
- Test: `tests/unit/components/PwaComponents.test.tsx`

**Steps:**
1. Write unit tests for network status transitions, install prompt triggers, banner dismissal cooldown, and min-16px typography.
2. Run test (FAIL).
3. Implement components and hooks.
4. Run test (PASS).
5. Commit.

---

### Task 7: Layout Shell Integration & Navbar Quick Voice Switcher
**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/speech/QuickVoiceSwitcher.tsx`
- Test: `tests/unit/components/LayoutPwaIntegration.test.tsx`

**Steps:**
1. Write unit test checking layout registration of PWA elements and voice switcher.
2. Run test (FAIL).
3. Implement `QuickVoiceSwitcher.tsx` and integrate into `layout.tsx`.
4. Run test (PASS).
5. Commit.

---

### Task 8: End-to-End Verification with Playwright for Phase 11
**Files:**
- Create: `tests/e2e/pwa-offline-neural-tts.spec.ts`
- Test: `npx playwright test tests/e2e/pwa-offline-neural-tts.spec.ts`

**Steps:**
1. Write Playwright E2E tests for manifest detection, offline indicator, speech modal opening, accent preview, and typography.
2. Run E2E tests on Desktop and Mobile Chrome.
3. Commit.
