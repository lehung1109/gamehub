# Design Specification: Phase 23 - Interactive Phonics Cinema & Animated Micro-Lessons

## 1. Overview & Vision
The **Interactive Phonics Cinema** (`/cinema`) transforms passive cartoon watching into an active, high-engagement English learning adventure. 

Young learners enter an animated movie theater where short cartoon micro-lessons (1–2 minutes each) tell humorous, educational stories about friendly characters. At key dramatic moments, the movie pauses and challenges the child with an interactive Phonics puzzle (e.g. choosing the correct rhyming object to help a dinosaur cross a river, or pronouncing a Magic E spell to unlock a castle door). Only when the student answers correctly does the movie resume playing!

---

## 2. Core Feature Requirements

### 2.1 Animated Cartoon Episodes (`CinemaEpisode`)
1. **The Hungry Dino (Chú Khủng Long Đói Bụng)** (`the-hungry-dino`):
   - Phonics target: Short vowels /æ/, /ɒ/, /ʌ/ (CVC Words).
   - Story: Dino Rex wakes up hungry and searches the prehistoric forest for snacks.
   - Interactive Prompts: Picking between `BAT` vs `SUN` to feed Dino, jumping over rocks with `HOP`.
2. **The Magic Potion (Nồi Thuốc Tiên Kỳ Diệu)** (`the-magic-potion`):
   - Phonics target: Digraphs /ʃ/, /tʃ/, /θ/ (`SHIP`, `FISH`, `CHAIR`, `CHEST`).
   - Story: Sunny the Wizard brews a sparkling potion to turn a gloomy rain into candy stars.
   - Interactive Prompts: Identifying the potion ingredients with digraph sounds.
3. **The Flying Carpet (Chiếc Thảm Bay Thần Kỳ)** (`the-flying-carpet`):
   - Phonics target: Long vowels & Magic E (`CAKE`, `KITE`, `ROSE`, `BIKE`).
   - Story: Luna and Oliver ride an enchanted carpet across starry cloud castles.
   - Interactive Prompts: Powering the carpet boost by collecting Magic E gems.

### 2.2 Procedural Vector/Canvas Animation Engine
- **Zero Heavyweight Video Downloads**: Built completely with responsive SVG vector animations, CSS keyframe transformations, and Web Audio / Speech Synthesis voice narration.
- **Scene Progression**:
  - Auto-play narration with highlightable English & Vietnamese bilingual subtitles.
  - Interactive pause triggers where the scene pauses smoothly with a spotlight on the character.
  - Resume animation upon successful completion of the phonics challenge.

### 2.3 Popcorn Reward System 🍿
- Students earn Golden Popcorn 🍿 for each interactive prompt solved without hints.
- Final Ticket Stub Certificate displaying total popcorn, star rating (1–3 stars), and EXP awarded.

### 2.4 Strict Kid-Friendly Typography Policy
- Minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).
- Strict zero tolerance for `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.

---

## 3. Data Contracts & Architecture

```ts
export type CinemaCategory = 'cvc' | 'digraphs' | 'vowels'

export interface CinemaInteractivePrompt {
  id: string
  questionVi: string
  questionEn: string
  options: {
    id: string
    text: string
    icon: string
    isCorrect: boolean
    phonicsHint: string
  }[]
  explanationVi: string
  popcornReward: number
}

export interface CinemaScene {
  id: string
  sceneNumber: number
  titleVi: string
  narrationEn: string
  narrationVi: string
  backgroundTheme: 'jungle' | 'wizard-lab' | 'starry-sky'
  characterEmoji: string
  characterAnimation: 'bounce' | 'fly' | 'wiggle'
  interactivePrompt?: CinemaInteractivePrompt
}

export interface CinemaEpisode {
  id: string
  titleVi: string
  titleEn: string
  synopsisVi: string
  category: CinemaCategory
  durationEstimate: string
  badgeIcon: string
  targetPhonics: string
  scenes: CinemaScene[]
}

export interface CinemaResult {
  episodeId: string
  popcornEarned: number
  maxPopcorn: number
  correctPrompts: number
  totalPrompts: number
  stars: number
  expEarned: number
  completedAt: string
}
```

---

## 4. Verification Plan
- **Unit Tests**:
  - TypeScript contracts (`tests/unit/types/phonics-cinema-types.test.ts`).
  - Pure engine (`tests/unit/lib/phonics-cinema-engine.test.ts`).
  - Server actions (`tests/unit/actions/phonics-cinema.test.ts`).
  - Player component (`tests/components/cinema/PhonicsCinemaPlayer.test.tsx`).
- **E2E Tests**:
  - Playwright integration test (`tests/e2e/interactive-phonics-cinema.spec.ts`).
  - Strict typography audit ($\ge 16$px).
- **Quality Gates**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
