# Design Spec: Phase 18 - Phonics Rhythm Chant & Karaoke Studio (Phòng Thu Vè Phonics & Karaoke Nhịp Điệu)

**Date**: 2026-09-13  
**Status**: Approved (Autonomous Roadmap Execution)  
**Target Milestone**: Phase 18  

---

## 1. Overview & Pedagogical Objective

Young ESL learners (grades 1–2 / CEFR Pre-A1 to A1) internalize English pronunciation, stress, prosody, and phonemic awareness most effectively when rhythm, music, and rhyme are combined (Jazz Chants / Nursery Rhymes).

**Phase 18 introduces the Phonics Rhythm Chant & Karaoke Studio (`/chants`)**:
1. **Synchronized Karaoke Lyrics & Bouncing Ball**: Real-time word-level lyric highlighting timed to musical beats per minute (BPM).
2. **Synthesized Rhythmic Beat Engine**: Pure Web Audio API procedural rhythm synthesizer (woodblock, kick, claps) requiring zero external media files, fully offline PWA compatible.
3. **Interactive Rhythm Tap & Chant Game**: Students tap the beat or chant words into the microphone on beat, accumulating combo streaks and scoring ("PERFECT!", "GREAT!", "NICE!").
4. **Studio Voice Recording & Playback**: Children record their chant performance, play it back with rhythmic backing, cheering sound effects, and earn XP + Gold.
5. **Classroom Big-Screen Mode**: High-contrast, large-font projector mode with visual tempo metronome for teachers leading whole-class choral chanting.
6. **Strict Typography Policy**: $\ge 16$px font size everywhere (strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).

---

## 2. Core Architecture & Data Models

### 2.1 TypeScript Types (`src/types/phonics-chant.ts`)
```ts
export type ChantDifficulty = 'pre-a1' | 'a1' | 'a2'

export interface ChantWordTiming {
  word: string
  beatIndex: number // The beat index (0, 1, 2, 3...) when this word is stressed
  phonicsFocus?: string // Highlighted sound or word family (e.g. "at", "op", "ee")
}

export interface ChantLine {
  id: string
  textEn: string
  textVi: string
  words: ChantWordTiming[]
}

export interface PhonicsChant {
  id: string
  titleEn: string
  titleVi: string
  descriptionVi: string
  difficulty: ChantDifficulty
  phonicsTarget: string // e.g. "Word family -at & short vowel /æ/"
  bpm: number // Beats per minute (e.g. 90, 100, 110)
  totalBeats: number
  lines: ChantLine[]
  themeColor: string // Tailwind color accent
  badgeIcon: string // Emoji representation
}

export interface ChantPerformanceScore {
  chantId: string
  perfectCount: number
  greatCount: number
  goodCount: number
  missCount: number
  maxCombo: number
  accuracyPercent: number
  expGained: number
}
```

### 2.2 Curated Chants Catalog (`src/data/chants/phonics-chants.ts`)
Three high-quality rhythmic chants crafted for young learners:
1. **The Cat on the Mat** (`cat-on-the-mat`):
   - Phonics target: Short /æ/, family `-at` (cat, fat, hat, mat, rat).
   - BPM: 92 (moderate, steady rhythm).
2. **Hop, Pop, Don't Stop!** (`hop-pop-dont-stop`):
   - Phonics target: Short /ɒ/, plosives /p/, /t/ (hop, pop, top, stop).
   - BPM: 104 (energetic, bouncy rhythm).
3. **Five Little Frogs on a Log** (`five-little-frogs`):
   - Phonics target: Blends /fr/, /l/, /g/ and counting rhyme.
   - BPM: 96 (playful, melodic rhythm).

### 2.3 Web Audio Procedural Beat Engine (`src/lib/rhythm-beat-synthesizer.ts`)
- Pure client-side Web Audio API synthesizer.
- Synthesizes rhythmic percussion without external audio assets:
  - `playKick(context, time)`: low frequency sine sweep (150Hz -> 30Hz).
  - `playWoodblock(context, time)`: resonant bandpass wood click (800Hz).
  - `playSnareOrClap(context, time)`: noise burst with exponential decay.
- Precise audio clock scheduling via `AudioContext.currentTime`.

---

## 3. Server Actions & Progress Tracking (`src/app/actions/phonics-chant.ts`)
- `getChantDetailsAction(chantId: string)`: Server action to retrieve chant metadata and timing.
- `submitChantPerformanceAction(result: ChantPerformanceScore)`: Validates accuracy, awards gamification XP (20-40 XP) and records session.

---

## 4. UI Components & Pages

1. **`src/components/chant/ChantCatalog.tsx`**:
   - Card grid of curated chants with phonics targets, difficulty badges, BPM meters, and "Bắt Đầu Hát Vè" CTA buttons.
2. **`src/components/chant/KaraokeChantStudio.tsx`**:
   - Bouncing beat indicator / animated metronome.
   - Large karaoke lyric display with highlighted active word and phonics focus badge.
   - Rhythm tap bar with accuracy feedback indicator ("PERFECT", "GREAT", "NICE").
   - Voice recording controller and performance playback.
3. **`src/components/chant/ChantCompletedModal.tsx`**:
   - Celebration modal displaying combo rating, accuracy percentage, stars (1-3), and XP reward.
4. **App Routes**:
   - `/chants`: Chant studio catalog.
   - `/chants/[chantId]`: Live karaoke & rhythm chant experience.

---

## 5. Strict Quality Gates & Typography Policy
- **Minimum Font Size**: $\ge 16$px (`text-base` minimum; zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- **TypeScript 5**: Zero `any`.
- **Vitest**: 100% pass rate across contracts, data, synthesizer, actions, and components.
- **Playwright**: End-to-end test verifying catalog navigation, karaoke playback, rhythm interaction, and strict typography enforcement.
