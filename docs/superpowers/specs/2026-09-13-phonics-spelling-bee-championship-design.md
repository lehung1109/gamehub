# Design Specification: Phase 22 - Live Phonics Spelling Bee Championship & Tournament Arena

## 1. Overview & Vision
The **Phonics Spelling Bee Championship** (`/spelling-bee`) brings the prestigious international Spelling Bee experience to Vietnamese young learners in a fun, accessible, and pedagogically sound format.

Instead of passive word memorization, students participate in interactive championship divisions where words are delivered via standard English pronunciation, accompanied by phonetic IPA guides, contextual usage sentences, and bilingual clues. Learners spell target words using either a high-contrast touch/virtual keyboard or voice input letter-by-letter.

---

## 2. Core Feature Requirements

### 2.1 Championship Divisions (`SpellingBeeDivision`)
1. **Bronze Bee (Ong Đồng - Khởi Động)** (`bronze-bee`):
   - Focus: CVC words, short vowels, and simple 3–4 letter words.
   - Sample Words: `CAT`, `DOG`, `SUN`, `BAT`, `FOX`, `PIG`.
   - Time per word: 45 seconds. Lives: 3 bees 🐝.
2. **Silver Bee (Ong Bạc - Tăng Tốc)** (`silver-bee`):
   - Focus: Consonant blends, digraphs, and 4–6 letter everyday words.
   - Sample Words: `FROG`, `CHAIR`, `BREAD`, `SMILE`, `TRAIN`, `CLOUD`.
   - Time per word: 40 seconds. Lives: 3 bees 🐝.
3. **Golden Bee (Ong Vàng - Vô Địch)** (`golden-bee`):
   - Focus: Long vowels, Magic E, silent letters, and compound words.
   - Sample Words: `KNIGHT`, `BRIDGE`, `CASTLE`, `DRAGON`, `RAINBOW`.
   - Time per word: 35 seconds. Lives: 3 bees 🐝.

### 2.2 In-Tournament Clues & Audio Prompts
- **Pronounce Word**: High-quality TTS pronunciation at normal (1.0x) or slow (0.8x) speed.
- **Phonics Clue**: IPA phonetic transcription and Vietnamese meaning.
- **Example Sentence**: Contextual sentence with target word masked or pronounced.
- **Letter-by-Letter Input**: High-contrast virtual alphabet keys with backspace and submit actions.

### 2.3 Audio-Visual Feedback & SFX
- Pure Web Audio synthesis (`createRhythmSynthesizer` / chime / buzzer):
  - Correct letter / word chime.
  - Incorrect letter buzzer.
  - Championship victory fanfare.

### 2.4 Division Trophy & Certificate Modal
- Gold, Silver, Bronze trophy ribbons with student name and division title.
- EXP rewards and performance rating (1–3 stars).
- Direct actions: "Thử lại vòng thi", "Tham gia phân hạng khác".

### 2.5 Strict Kid-Friendly Typography Policy
- Minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).
- Strict zero tolerance for `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.

---

## 3. Data Contracts & Architecture

```ts
export type SpellingBeeTier = 'bronze' | 'silver' | 'gold'

export interface SpellingBeeWord {
  id: string
  word: string
  phonicsSound: string
  translationVi: string
  definitionVi: string
  exampleSentence: string
  points: number
}

export interface SpellingBeeDivision {
  id: string
  tier: SpellingBeeTier
  titleVi: string
  titleEn: string
  descriptionVi: string
  badgeEmoji: string
  timeLimitPerWord: number
  maxMistakes: number
  words: SpellingBeeWord[]
}

export interface SpellingBeeResult {
  divisionId: string
  tier: SpellingBeeTier
  score: number
  wordsCorrect: number
  wordsTotal: number
  accuracyPercent: number
  stars: number
  expEarned: number
  isChampion: boolean
}
```

---

## 4. Verification Plan
- **Unit Tests**:
  - TypeScript contract tests (`tests/unit/types/spelling-bee-types.test.ts`).
  - Engine tests (`tests/unit/lib/spelling-bee-engine.test.ts`).
  - Server actions tests (`tests/unit/actions/spelling-bee.test.ts`).
  - Component tests (`tests/components/spelling-bee/SpellingBeeArena.test.tsx`).
- **E2E Tests**:
  - Playwright test (`tests/e2e/phonics-spelling-bee-championship.spec.ts`).
  - Strict typography audit ($\ge 16$px).
- **Quality Gates**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
