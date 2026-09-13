# Phase 32 Design Spec: Phonics Time Machine & Historical Civilizations Adventure (Cỗ Máy Thời Gian & Cuộc Du Hành Lịch Sử)

## 1. Overview & Pedagogical Purpose
**Phonics Time Machine** (`/timetravel`) is an epic chronological expedition where young English learners join **Giáo Sư Chronos 🕰️ (Professor Chronos)** and his navigation feline companion **Mèo Du Hành Pip 🐱 (Chrono-Kitten Pip)** aboard the *Chrono-Pod* to repair temporal rifts across 4 legendary historical civilizations.

Learners travel through time vortexes, decode ancient phonetic hieroglyphs and temporal runes, pronounce historical incantations with speech synthesis, restore 12 legendary historical artifacts, and curate the **Historical Time Museum (Viện Bảo Tàng Không Thời Gian)**.

### Key Pedagogical Pillars
1. **Systematic Phonics Chronology Progression**:
   - **Ancient Egypt (Kim Tự Tháp Ai Cập Cổ Đại)** (`ancient_egypt`): Short vowels & CVC hieroglyphic runes (`SUN`, `CAT`, `POT`).
   - **Ancient Greece (Đấu Trường Hy Lạp Cổ Đại)** (`ancient_greece`): Consonant blends & Olympic torches (`SWORD`, `SHIELD`, `CROWN`).
   - **Medieval Castle (Lâu Đài Hiệp Sĩ Trung Cổ)** (`medieval_castle`): Vowel teams, long vowels, silent letters & Magic E (`KNIGHT`, `CASTLE`, `BRAVE`).
   - **Future Neo-City (Thành Phố Tương Lai 3000)** (`future_cyber`): Compound words & multi-syllabic cyber engines (`SPACESHIP`, `HOLOGRAM`, `CYBERNETIC`).
2. **Multi-Sensory Audio-Visual Feedback**:
   - Spoken pronunciation and phonetic syllable breakdown powered by `useSpeech`.
   - Chrono-dial gears spinning, portal resonance hums, and victory time-chimes.
3. **Historical Time Museum (Viện Bảo Tàng Không Thời Gian)**:
   - Dynamic modal compendium showcasing all 12 restored historical relics with civilization era, syllable breakdown, phonics rules, and fascinating historical lore.
4. **Kid-Friendly Typography Standard**:
   - Minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.) throughout all components.
   - Strictly zero `text-xs`, `text-sm`, or sub-16px inline values.

---

## 2. Architecture & Data Contracts

### 2.1 Type Definitions (`src/types/phonics-time.ts`)
```typescript
export type TimeTravelEraId = 'ancient_egypt' | 'ancient_greece' | 'medieval_castle' | 'future_cyber';

export type TimeTravelerRank = 'novice_nomad' | 'chrono_voyager' | 'time_space_master';

export interface TimeChallenge {
  targetWord: string;
  phonicsFocus: string;
  vietnameseMeaning: string;
  phoneticBreakdown: string[];
  audioHint: string;
  historyFactVi: string;
  runeScramble: string[];
}

export interface TimeRelic {
  id: string;
  eraId: TimeTravelEraId;
  nameEn: string;
  nameVi: string;
  relicEmoji: string;
  eraNameVi: string;
  chronoOrbReward: number;
  descriptionVi: string;
  challenge: TimeChallenge;
}

export interface TimeTravelEraDefinition {
  id: TimeTravelEraId;
  nameEn: string;
  nameVi: string;
  eraEmoji: string;
  themeColor: string;
  bgGradient: string;
  descriptionVi: string;
  requiredRelics: number;
}

export interface TimeProgress {
  completedRelicIds: string[];
  currentEra: TimeTravelEraId;
  chronoOrbs: number;
  travelerRank: TimeTravelerRank;
  lastPlayedAt: string;
}
```

### 2.2 Curated Dataset (`src/data/time/relics.ts`)
- 4 historical civilizations:
  - `ancient_egypt`:
    - `SUN` (Thần Mặt Trời Ra - /s-ʌ-n/)
    - `CAT` (Mèo Thần Bastet - /k-æ-t/)
    - `POT` (Bình Gốm Phù Sa - /p-ɒ-t/)
  - `ancient_greece`:
    - `SWORD` (Thanh Kiếm Sparta - /s-w-ɔː-d/)
    - `SHIELD` (Khiên Đồng Hy Lạp - /ʃ-iː-l-d/)
    - `CROWN` (Vương Miện Nguyệt Quế - /k-r-aʊ-n/)
  - `medieval_castle`:
    - `KNIGHT` (Hiệp Sĩ Quả Cảm - /n-aɪ-t/)
    - `CASTLE` (Lâu Đài Đá - /k-ɑː-s-l/)
    - `BRAVE` (Lòng Dũng Cảm - /b-r-eɪ-v/)
  - `future_cyber`:
    - `SPACESHIP` (Phi Thuyền Không Gian - /s-p-eɪ-s-ʃ-ɪ-p/)
    - `HOLOGRAM` (Ảnh Ảo Ba Chiều - /h-ɒ-l-ə-ɡ-r-æ-m/)
    - `CYBERNETIC` (Vi Mạch Lượng Tử - /s-aɪ-b-ə-n-e-t-ɪ-k/)
- Total: 12 curated historical relics across 4 eras.

### 2.3 Pure Engine (`src/lib/phonics-time-engine.ts`)
- `getAllEras()`: Returns 4 historical era definitions.
- `getEraById(id)`: Returns specific era definition.
- `getAllRelics()`: Returns all 12 relics.
- `getRelicById(id)`: Returns specific relic by ID.
- `getRelicsByEra(eraId)`: Returns relics filtered by historical era.
- `calculateTimeTravelerRank(completedCount)`:
  - $< 4$: `novice_nomad` (Nhà Du Hành Tập Sự 🧭)
  - $4 - 8$: `chrono_voyager` (Chuyên Viên Dòng Thời Gian ⏳)
  - $9 - 12$: `time_space_master` (Bậc Thầy Không Thời Gian 🌌)
- `getDefaultTimeProgress()`: Initial progress state.
- `completeTimeRelic(progress, relicId)`: Pure function updating completed relics, chrono-orbs (+50), and rank.

### 2.4 Server Actions (`src/app/actions/phonics-time.ts`)
- `'use server'` safe persistence actions with fallback to default state.
- `getTimeProgressAction()`: Retrieve player's temporal progress.
- `saveTimeProgressAction(progress: TimeProgress)`: Persist temporal progress.

### 2.5 Prehistoric UI Components & Architecture
- `TimeHeaderBar.tsx`: Top status bar displaying Chronos & Pip avatar, rank badge, 0/12 restored counter, and Chrono-Orbs counter.
- `ChronoEraSelector.tsx`: Horizontal era tabs with civilization emoji, color accents, and active indicators.
- `ChronoCapsuleModal.tsx`: Interactive temporal capsule modal featuring scrambled rune buttons, speech pronunciation button (`useSpeech`), feedback animations, and +50 Chrono-Orbs reward celebration.
- `TimeMuseumModal.tsx`: Comprehensive museum exhibit modal with relic filters, detailed historical stories, and speech synthesis pronunciation.
- `PhonicsTimeExperience.tsx`: Top-level interactive client component orchestrating state, speech synthesis, sound synthesis, and modal triggers.

### 2.6 Page Route & Navigation Integration
- Route: `src/app/timetravel/page.tsx`
- Metadata: Title and description for Phonics Time Machine.
- Homepage topbar link: `timetravel-topbar-link` in `src/app/page.tsx`.

---

## 3. Testing & Quality Assurance
- **TypeScript Strictness**: Zero `any`, strict compiler flags.
- **ESLint Compliance**: Zero warnings, zero errors.
- **Unit Tests**:
  - `tests/unit/types/phonics-time-types.test.ts`
  - `tests/unit/lib/phonics-time-engine.test.ts`
  - `tests/unit/actions/phonics-time.test.ts`
  - `tests/components/time/PhonicsTimeExperience.test.tsx`
  - `tests/app/timetravel/page.test.tsx`
  - `tests/app/page.test.tsx` (updated for `timetravel-topbar-link`)
- **Playwright E2E**:
  - `tests/e2e/phonics-time-machine.spec.ts`
  - Verifies navigation from homepage, era switching, capsule puzzle solving, museum inspection, and strict typography audit ($\ge 16$px).
