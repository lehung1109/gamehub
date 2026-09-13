# Design Spec: Phase 21 - Voice-Controlled Phonics Arcade & Speak-to-Play Games (Khu Trò Chơi Điều Khiển Bằng Giọng Nói)

**Date**: 2026-09-13  
**Status**: Approved (Autonomous Roadmap Execution)  
**Target Milestone**: Phase 21  

---

## 1. Overview & Pedagogical Value

For young ESL students (grades 1–2 / CEFR Pre-A1 to A1), passive pronunciation drills can feel repetitive. **Voice-Controlled Phonics Arcade (`/games/voice-arcade`)** transforms speaking into a video game controller:
- Students do not tap keys or touch buttons to jump or attack—**their voice is the joystick**.
- Shouting or speaking target vocabulary clearly and rhythmically controls character movements, blasts meteors, and propels rockets.
- Shy children lose their anxiety because the playful game context demands rapid, loud, and confident vocalization.

### Core Game Modes:
1. **Voice Jump Runner (Chú Thỏ Bật Nhảy Bằng Lời Nói)**:
   - Hurdles approach the player rabbit.
   - Say the target CVC or sight word printed on the hurdle (e.g., "JUMP!", "CAT!", "FAST!") to trigger a jump over the hurdle and collect stars.
2. **Meteor Blaster (Bắn Phá Thiên Thạch Từ Vựng)**:
   - Vocabulary asteroids fall slowly from space.
   - Speaking the asteroid's word accurately fires a laser turret blasting it into stardust before it touches the shield.
3. **Pitch Rocket Glider (Tên Lửa Giọng Hát)**:
   - Vocalizing vowel sounds (/æ/, /iː/, /uː/) propels the rocket upwards through floating phonics rings.

---

## 2. Core Architecture & Data Models

### 2.1 TypeScript Contracts (`src/types/voice-arcade.ts`)
```ts
export type ArcadeGameMode = 'runner' | 'blaster' | 'glider'
export type ArcadeDifficulty = 'easy' | 'medium' | 'hard'

export interface ArcadeWordTarget {
  id: string
  word: string
  phonicsSound: string
  translationVi: string
  icon: string
  scoreValue: number
}

export interface ArcadeStage {
  id: string
  gameMode: ArcadeGameMode
  titleVi: string
  titleEn: string
  descriptionVi: string
  difficulty: ArcadeDifficulty
  targetPhonics: string
  words: ArcadeWordTarget[]
  hurdleSpeed: number // Movement speed multiplier
  timeLimitSeconds: number
}

export interface ArcadeGameResult {
  stageId: string
  gameMode: ArcadeGameMode
  score: number
  wordsHit: number
  wordsMissed: number
  accuracyPercent: number
  maxCombo: number
  expEarned: number
}
```

### 2.2 Pure Engine Functions (`src/lib/voice-arcade-engine.ts`)
- `getAllArcadeStages()`: Returns all playable stages.
- `getStageById(id: string)`: Retrieves stage configuration.
- `evaluateSpokenWord(spokenText: string, targetWord: string)`: Compares speech recognition transcript with target word, accounting for accents and minor variations.
- `calculateArcadeScore(wordsHit: number, wordsMissed: number, maxCombo: number)`: Computes final points, accuracy percentage, and EXP rewards (20–50 XP).

---

## 3. Server Actions (`src/app/actions/voice-arcade.ts`)
- `getArcadeStageAction(stageId: string)`: Retrieves stage details.
- `submitArcadeScoreAction(result: ArcadeGameResult)`: Validates and records game score, awarding EXP and stars.

---

## 4. UI Components & Pages
- `src/components/arcade/VoiceArcadeHub.tsx`: Stage selection catalog with mode filters and difficulty badges.
- `src/components/arcade/VoiceArcadeGame.tsx`: Real-time voice controller game canvas/arena with microphone status indicator, target word banner, visual jump/blast animations, and score HUD.
- `src/components/arcade/ArcadeGameOverModal.tsx`: Victory/Game Over dialog with score breakdown, stars, and replay button.
- Routes:
  - `/games/voice-arcade`: Selection hub.
  - `/games/voice-arcade/[stageId]`: Dynamic SSG route with `generateStaticParams()`.

---

## 5. Strict Quality Gates & Typography Policy
- Minimum font size $\ge 16$px (`text-base` minimum; strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- TypeScript 5 strict: zero `any`.
- 100% Vitest test pass rate.
- Playwright E2E testing full game flow, voice controls, and typography audit.
