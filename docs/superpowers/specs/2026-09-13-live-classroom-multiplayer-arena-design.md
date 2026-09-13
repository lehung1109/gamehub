# Phase 13 Technical Design: Live Classroom Multiplayer Arena Mode (Kahoot-Style Party Arena)

**Date:** 2026-09-13  
**Status:** Approved  
**Author:** Antigravity AI  

---

## 1. Overview & Pedagogical Motivation

Building upon Phase 7's 1v1 PvP duels and Phase 4's foundational arena prototypes, **Phase 13 delivers a comprehensive, high-energy Live Classroom Multiplayer Arena ("Kahoot Party Mode")** tailored for teacher-led English lessons:

1. **Teacher Big-Screen Command Center**: Designed for classroom projectors, Smartboards, and TVs, featuring Fullscreen mode, dynamic SVG QR code for friction-free tablet/phone joins, live answer distribution histograms, and animated 3D podiums.
2. **Student Mobile-First Controller**: Fast, tactile 4-color tiles (and 2-color True/False), speed-decay bonus calculation, streak multipliers, haptic/vibration feedback, and instant personal rank reveals.
3. **Diverse Question Formats**:
   - **4-Choice Multiple Choice**: Classic Kahoot style with colored geometric shapes (Red Triangle, Blue Diamond, Yellow Circle, Green Square).
   - **True / False (Đúng / Sai)**: 2 massive color-coded tiles (Blue True / Red False).
   - **Audio Phonics Challenge**: Spoken prompts played via the host screen with phoneme or vocabulary identification on student controllers.
4. **Zero-Dependency Web Audio Sound Engine**: Built-in sound synthesis using native Web Audio API (Lobby beat, 15-second countdown tension rhythm, answer chime, reveal drumroll, and podium victory fanfare) requiring zero external audio downloads.
5. **Post-Game SRS Integration**: Automatically analyzes classroom error rates; provides a 1-click action to export questions with $>40\%$ incorrect answers directly into the classroom's Mistake Notebook (Sổ Tay Từ Khó) for Spaced Repetition reinforcement.

---

## 2. Realtime Synchronization Architecture

```
[Teacher Projector Host Screen]                     [Student Mobile Controllers]
    /admin/arena/[arenaId]                                   /arena/[pin]
               │                                                  │
               ├───► 1. Creates Arena & Displays Dynamic QR ──────┤
               │     (Room PIN + SVG QR Code on big screen)       │ Scans QR or enters PIN
               │                                                  │
               ▼                                                  ▼
   [Supabase Realtime Broadcast Channel: `arena:{pin}` + PostgreSQL Store]
               │
               ├───► 2. Event `ROUND_START` (Sub-100ms) ──────────►
               │     - Question payload, time limit, type         │ Renders color tiles
               │     - Host begins Web Audio countdown tension    │
               │                                                  │
               │◄──── 3. Event `ANSWER_SUBMITTED` ────────────────┤
               │     - Instant histogram column increments        │ Calculates speed score
               │                                                  │
               ├───► 4. Event `ROUND_REVEAL` ─────────────────────►
               │     - Reveals correct answer, top 5 scoreboard   │ Displays personal rank,
               │     - Host plays answer fanfare                  │ streak flame & points
               │                                                  │
               ├───► 5. Event `ARENA_FINISHED` ───────────────────►
               │     - 3D Gold/Silver/Bronze Podium ceremony      │ Shows final standing &
               │     - Star/XP rewards payout to profiles         │ Star earnings
               │     - "Add Hardest Questions to Mistake SRS"     │
               │                                                  │
               ▼                                                  ▼
     [Resilient Fallback: HTTP Polling 2s if school firewall blocks WebSockets]
```

---

## 3. Data Contracts & Extended Question Types

### `src/types/arena.ts`
- Extend `ArenaQuestionType = 'multiple_choice' | 'true_false' | 'phonics_audio'`.
- Add `questionType`, `audioPromptUrl`, and `pointsMultiplier` to `LiveArenaQuestion`.
- Define `ArenaRealtimeEvent` union for typed WebSocket broadcast messaging.
- Define `ArenaSoundConfig` for volume and mute control.

---

## 4. Web Audio Synthesizer Sound Engine

### `src/lib/arena/sound-engine.ts`
- Uses `window.AudioContext` or `webkitAudioContext`.
- Synthesizes procedural sound waves (`sine`, `triangle`, `sawtooth`, `square`):
  1. `playLobbyGroove()`: Fun, relaxing background arpeggio pattern.
  2. `playCountdownTension(secondsRemaining)`: Progressively accelerating bass pulse with pitch rise during the final 5 seconds.
  3. `playAnswerSubmitChime()`: Pleasant major-third ping confirming answer receipt.
  4. `playRevealDrumroll()`: Dramatic snare-style noise burst leading to reveal.
  5. `playPodiumCelebration()`: Trumpet fanfare with cascading arpeggios.
- Clean stop and volume attenuation methods with mute persistence.

---

## 5. Projector Host Screen & Dynamic QR Code

### `src/components/admin/arena/TeacherArenaHost.tsx`
- **Dynamic QR Code Generation**: Uses pure SVG QR code generator (zero external network dependency) encoding `${origin}/arena/${pin}`.
- **Fullscreen Mode**: Supports native HTML5 Fullscreen API toggle for projection.
- **Lobby Management**: Live participant counter with one-click kick button for disruptive student names.
- **Live Response Histogram**: Realtime animated bars showing count of answers per option before time expires.
- **Post-Game Remediation**: Automated calculation of difficult questions with direct export to `mistake_notebook` / `student_srs_cards`.

---

## 6. Student Mobile Controller Client

### `src/components/arena/StudentArenaClient.tsx`
- Full-screen color-coded tactile buttons (Kahoot colors: Red Triangle, Blue Diamond, Yellow Circle, Green Square, or True/False Blue/Red).
- Haptic vibration via `navigator.vibrate([40, 30, 40])` on tap.
- Dynamic scoring algorithm awarding up to 1,000 base points based on submission speed:
  $$\text{Points} = \text{round}\left(1000 \times \left(1 - \frac{\text{responseTime}}{\text{timeLimit} \times 2}\right) \times \text{streakMultiplier}\right)$$
- Streak flame multiplier (+10% per consecutive correct answer, up to 1.5x).

---

## 7. Kid-Friendly Typography & Accessibility Policy

- Minimum font size $\ge 16$px across all controls, options, and status labels.
- Strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- High-contrast geometric icons ensuring color-blind accessibility.

---

## 8. Verification Strategy

1. **Vitest Unit Tests**:
   - Sound engine initialization, tone generation, and graceful browser fallback.
   - Speed score calculation and streak multiplier verification.
   - SVG QR code generation and URL accuracy.
   - Realtime event serialization and deserialization.
2. **Playwright E2E Tests**:
   - Host screen creation, QR code visibility, and lobby entry.
   - Realtime multi-client question answering, timer countdown, and reveal.
   - Fullscreen toggle and podium celebration.
   - Typography audit across all arena views.
