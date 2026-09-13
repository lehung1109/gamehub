# Task 1 Implementation Report: TypeScript Contracts & Domain Models for Speech & Offline Queue

## Summary of Changes
1. **`src/types/speech.ts`**:
   - Defined `AccentRegion` (`US`, `UK`, `AU`) with localized metadata `ACCENT_LABELS`.
   - Defined `VoiceStyle` (`kid`, `natural`, `slow`) with presets `VOICE_STYLE_PRESETS`.
   - Defined `SpeechConfig` with defaults in `DEFAULT_SPEECH_CONFIG`.
   - Defined `SpeechVoiceInfo` and `SpeechState`.
   - Defined offline queue contracts: `OfflineActionType`, `QueuedOfflineAction`, `OfflineSyncStatus`, and `PWAInstallState`.
2. **`src/types/index.ts`**:
   - Re-exported all contracts from `./speech`.
3. **Testing**:
   - `tests/unit/types/speech-types.test.ts` (4/4 passed).
   - `npx tsc --noEmit` cleanly passed with 0 errors.
