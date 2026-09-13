# Task 5 Brief: Upgraded useSpeech Hook & Speech Settings Modal

## Requirements
- Files created/modified:
  - `src/types/speech.ts`: Exported `SPEECH_CONFIG_STORAGE_KEY`.
  - `src/hooks/useSpeech.ts`: Upgraded hook with voice discovery via `speechSynthesis.getVoices()` / `onvoiceschanged`, automatic best-voice selection per accent region (US, UK, AU), style calculation (kid, natural, slow), rate and pitch clamping, and cross-tab/storage synchronization via `localStorage` and `gamehub_speech_config_updated` custom event. Full backward compatibility maintained for existing consumers.
  - `src/components/speech/VoicePreviewButton.tsx`: Accessible, kid-friendly voice sample preview button with minimum 16px typography.
  - `src/components/speech/SpeechSettingsModal.tsx`: Accessible dialog allowing accent selection (US, UK, AU), voice tone/style options (Friendly Kid, Natural English, Slow & Clear), speed rate presets (Slow 0.7x, Normal 0.85x, Brisk 1.0x), and voice preview button.
  - `tests/unit/components/SpeechSettingsModal.test.tsx`: Unit tests verifying hook state initialization, accent/style updating and storage persistence, preview button interaction, modal open/close actions, and strict kid-friendly typography ($\ge 16$px, zero `text-xs`/`text-sm`).
- Constraints:
  - Strict typography: min 16px font size on all UI elements (NO `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
  - Zero `any`, 100% tests passing.
