# Technical Design Specification: Pronunciation & Speaking Lab (Sub-project 6)

**Feature Branch**: `subproject-6-pronunciation-lab`  
**Date**: 2026-09-12  
**Status**: Approved / Ready for Review  

---

## 1. Executive Summary & Problem Statement

While GameHub boasts 19 interactive educational mini-games and comprehensive grammar hubs for 12 tenses and parts of speech, the platform currently relies exclusively on **Text-to-Speech (TTS)** (`window.speechSynthesis`). Learners can listen to native pronunciations, but they have **no mechanism to speak, record their voice, or receive feedback on their pronunciation**.

Speaking is the most critical and intimidating skill for ESL learners and workplace professionals. Sub-project 6 completes the educational matrix by introducing:
1. **`useSpeechRecognition` Hook**: A cross-browser React hook encapsulating `SpeechRecognition` / `webkitSpeechRecognition` with microphone lifecycle management, audio visualizer state, real-time interim results, and permission error handling.
2. **Pronunciation & Speaking Lab (`/games/pronunciation`)**: Mini-game #20 featuring:
   - Minimal pairs & phonics sound contrasts (`/iː/` vs `/ɪ/`, `/s/` vs `/ʃ/`, etc.).
   - High-impact workplace vocabulary with syllable stress markers.
   - Real-world workplace communicative sentences with word-by-word accuracy feedback.
3. **Phoneme & Token Evaluation Engine**: Deterministic algorithm evaluating word accuracy, calculating phonetic similarity, highlighting mispronounced words, and awarding 1-3 stars.
4. **Voice Option for Conversational Roleplay**: An optional microphone response mode in `/games/roleplay`.
5. **Teacher Config Builder**: Dedicated form in `ConfigCreateForm` and `ConfigEditForm` allowing teachers to curate custom speaking tasks with configurable passing thresholds.
6. **Supabase Progress Tracking**: Full synchronization with `game_sessions` and `session_details` via `useGameTracking`.

---

## 2. Architecture & Technical Choices

### 2.1 Speech Recognition Strategy: Client-Side Web Speech Recognition

| Metric | Web Speech Recognition API (Selected) | Cloud STT API (e.g. Whisper) |
|---|---|---|
| **Cost** | 100% Free / Unlimited | Pay-per-minute API billing |
| **Latency** | Instantaneous (<200ms real-time interim) | 1.5s - 3s network round-trip |
| **Privacy** | Audio processed on device / native browser stack | User audio uploaded to 3rd-party server |
| **Browser Support** | Chrome, Edge, Safari, Android Webview (>88% global) | Universal (any browser supporting mediaRecorder) |
| **Fallback** | Graceful manual review mode & unsupported banner | Requires internet + API keys |

**Decision**: Implement native `useSpeechRecognition` with a fallback UI when the browser does not support speech recognition (or microphone access is denied).

---

## 3. Core Components & State Design

### 3.1 Hook: `src/hooks/useSpeechRecognition.ts`

```typescript
export interface UseSpeechRecognitionOptions {
  lang?: string;             // Default: 'en-US'
  continuous?: boolean;      // Default: false
  interimResults?: boolean;  // Default: true
  maxAlternatives?: number;  // Default: 1
}

export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}
```

- **Lifecycle Management**: Safely cleans up on unmount (`recognition.abort()`).
- **Permission & Error State**: Captures `not-allowed` (user denied mic permission) and `no-speech` (timeout without voice) with user-friendly actionable Vietnamese toasts.

### 3.2 Token Evaluation Engine: `src/lib/pronunciation-evaluator.ts`

```typescript
export interface WordEvaluation {
  word: string;
  isMatch: boolean;
  score: number; // 0 - 100
}

export interface PronunciationResult {
  accuracy: number;         // 0 - 100%
  stars: 1 | 2 | 3;
  feedbackVi: string;
  wordDetails: WordEvaluation[];
  isPassed: boolean;
}

export function evaluatePronunciation(
  targetText: string,
  spokenText: string,
  passThreshold = 70
): PronunciationResult;
```

**Evaluation Rules**:
1. Normalized comparison (stripping trailing punctuation `, . ! ?`, case-insensitive).
2. Token-level fuzzy alignment (Levenshtein distance calculation per word).
3. If accuracy >= 90%: 3 stars, "Phát âm xuất sắc!".
4. If accuracy >= 70%: 2 stars, "Rất tốt! Cố gắng phát âm chuẩn các âm còn lại nhé.".
5. If accuracy < 70%: 1 star, "Cần luyện tập thêm. Hãy nghe lại âm mẫu và thử lại!".

### 3.3 Curriculum Data Model: `src/data/pronunciation/`

- **`index.json`**: Topic catalog
  1. `minimal-pairs`: Phonics contrasts (sheep vs ship, pen vs pan, leave vs live).
  2. `workplace-words`: Stress & multisyllabic terms (schedule, prioritize, architecture, comfortable, colleague).
  3. `standup-meeting`: Daily agile & project updates (e.g., "I finished the authentication task yesterday.").
  4. `client-presentation`: Professional phrases (e.g., "Thank you all for joining today's demo.").
- Data schema:
  ```typescript
  export interface PronunciationItem {
    id: string;
    targetText: string;
    phonetic: string;          // IPA transcription, e.g. "/ˈʃedʒuːl/"
    vietnameseMeaning: string;
    focusSound?: string;       // e.g. "/iː/ vs /ɪ/"
    difficulty: 'easy' | 'medium' | 'hard';
    sampleAudioText?: string;
  }
  ```

---

## 4. UI & Game Loop Specification

### 4.1 Route: `/games/pronunciation`

1. **Header**: Back button, Topic selector dropdown, Score indicator, Sound toggle.
2. **Target Display Card**:
   - Primary text in clean bold typography (`text-2xl font-bold`).
   - Phonetic IPA transcription (`text-sm font-mono text-muted-foreground`).
   - Vietnamese translation preview (`text-base text-primary/80`).
   - Listen Button (`SpeakButton` invoking native TTS `useSpeech`).
3. **Recording Arena**:
   - Animated Microphone Button with pulse ring effect when `isListening === true`.
   - Real-time sound wave indicator / interim transcript display.
   - Status badge: *"Nhấn để nói"* -> *"Đang nghe... hãy nói to và rõ ràng"* -> *"Đang phân tích..."*.
4. **Instant Visual Feedback Card**:
   - Real-time word breakdown: Matched words appear in **green**, missing/mispronounced words in **amber/red**.
   - Accuracy meter with percentage and star ratings.
   - "Thử lại" (Retry) or "Tiếp tục" (Next) buttons.

### 4.2 Conversational Roleplay Voice Integration (`/games/roleplay`)

- In `RoleplayDialogueBox.tsx`, add a microphone button next to each dialogue option.
- Learners can speak the chosen option instead of clicking, verifying their spoken fluency in context!

---

## 5. Teacher Config & Customization

1. **Catalog Registration**:
   - Register `pronunciation` in `src/data/games.json` with `id: "pronunciation"`, `priority: 20`, `category: "phonics-audio"`.
2. **Config Schema (`src/types/config.ts`)**:
   - `PronunciationGameConfig`: topic, difficulty, passThreshold (50-90%), wordCount (5-20), allowRetry.
3. **Form Component (`src/components/config/PronunciationConfigForm.tsx`)**:
   - Integrated into `ConfigCreateForm` and `ConfigEditForm`.
   - Live Preview support.

---

## 6. Testing & Quality Assurance Plan

1. **Unit & Logic Tests**:
   - `tests/lib/pronunciation-evaluator.test.ts`: 15+ tests verifying exact matches, partial matches, case insensitivity, punctuation stripping, and edge cases (empty speech, noise).
   - `tests/hooks/useSpeechRecognition.test.ts`: Mocking `window.SpeechRecognition`, testing permission denial, start/stop lifecycle.
2. **Component Tests**:
   - `tests/components/pronunciation/MicrophoneRecorder.test.tsx`: Visual feedback, listening state toggles.
   - `tests/components/pronunciation/PronunciationArena.test.tsx`: Target card rendering, IPA display, speech playback.
3. **Catalog & Schema Tests**:
   - Validate `src/data/games.json` includes 20 games with correct metadata and priority ordering.
   - Validate all pronunciation dataset JSON files against strict TypeScript schemas.
4. **E2E Playwright Suite**:
   - `tests/e2e/pronunciation-game.spec.ts`: Verify full game loop, topic selection, fallback mode when microphone is mocked or denied, score submission.
5. **Quality Gates**:
   - `npm run lint` -> 0 errors.
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run test:run` -> All 196+ suites passing.
