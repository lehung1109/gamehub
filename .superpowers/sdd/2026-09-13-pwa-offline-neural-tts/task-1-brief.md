# Task 1 Brief: TypeScript Contracts & Domain Models for Speech & Offline Queue

## Requirements
- Files created/modified:
  - `src/types/speech.ts` (Domain models: `AccentRegion`, `VoiceStyle`, `SpeechVoiceInfo`, `SpeechConfig`, `DEFAULT_SPEECH_CONFIG`, `ACCENT_LABELS`, `VOICE_STYLE_PRESETS`, `SpeechState`, `OfflineActionType`, `QueuedOfflineAction`, `OfflineSyncStatus`, `PWAInstallState`).
  - `src/types/index.ts` (re-export `* from './speech'`).
  - `tests/unit/types/speech-types.test.ts` (4/4 tests passing).
- Constraints:
  - Zero `any`.
  - Proper default constants tailored for children (pitch 1.15, rate 0.8).
  - Accurate accent definitions (`en-US`, `en-GB`, `en-AU`).
