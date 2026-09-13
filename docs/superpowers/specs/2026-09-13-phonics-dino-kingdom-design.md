# Phase 31 Design Spec: Phonics Dino Kingdom & Prehistoric Fossils Archeology (Vương Quốc Khủng Long & Khảo Cổ Tiền Sử)

## 1. Overview & Pedagogical Purpose
**Phonics Dino Kingdom** (`/dino`) is a prehistoric archeology expedition where young learners join **Tiến Sĩ Khảo Cổ Rex 🦖 (Dr. Rex)** and his robotic fossil-scanner companion **Chippy 🤖** to unearth ancient dinosaur fossils across 4 geological eras.

Learners chisel through prehistoric rock layers, assemble phonetic bone fragments, pronounce ancient incantations with speech synthesis, revive 12 legendary prehistoric creatures, and curate the **Prehistoric Fossil Museum (Viện Bảo Tàng Tiền Sử)**.

### Key Pedagogical Pillars
1. **Systematic Phonics Paleontology Progression**:
   - **Triassic Valley (Thung Lũng Tam Điệp)**: Short vowels & CVC excavation runes (`DIG`, `REX`, `MUD`, `FOG`).
   - **Jurassic Jungle (Rừng Rậm Jura)**: Consonant digraphs & blend fossil claws (`CLAW`, `TRACK`, `FERN`, `ROAR`).
   - **Cretaceous Volcano (Núi Lửa Phấn Trắng)**: Vowel teams, long vowels & Magic E amber gemstones (`BONE`, `SCALE`, `TAIL`, `FLIGHT`).
   - **Ice Age Tundra (Sông Băng Tiền Sử)**: Compound words & multi-syllabic behemoths (`MAMMOTH`, `FOSSIL`, `VOLCANO`, `SABERTOOTH`).
2. **Multi-Sensory Audio-Visual Feedback**:
   - Spoken pronunciation and phonetic syllable breakdown powered by `useSpeech`.
   - Chisel clinks, bone dusting sounds, and dinosaur victory roars.
3. **Prehistoric Fossil Museum (Viện Bảo Tàng Tiền Sử)**:
   - Dynamic modal compendium showcasing all 12 excavated prehistoric species with diet type, syllable breakdown, phonics rules, and paleontology trivia.
4. **Kid-Friendly Typography Standard**:
   - Minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.) throughout all components.
   - Strictly zero `text-xs`, `text-sm`, or sub-16px inline values.

---

## 2. Architecture & Data Contracts

### 2.1 Type Definitions (`src/types/phonics-dino.ts`)
```typescript
export type GeologicalEraId = 'triassic' | 'jurassic' | 'cretaceous' | 'iceage';

export type DinoDietType = 'herbivore' | 'carnivore' | 'omnivore' | 'piscivore';

export type PaleontologistRank = 'junior_digger' | 'expert_excavator' | 'legendary_dino_master';

export interface DinoChallenge {
  targetWord: string;
  phonicsFocus: string;
  vietnameseMeaning: string;
  phoneticBreakdown: string[];
  audioHint: string;
  paleoFactVi: string;
  boneScramble: string[];
}

export interface DinosaurFossil {
  id: string;
  eraId: GeologicalEraId;
  nameEn: string;
  nameVi: string;
  dinoEmoji: string;
  diet: DinoDietType;
  eraNameVi: string;
  amberReward: number;
  descriptionVi: string;
  challenge: DinoChallenge;
}

export interface GeologicalEraDefinition {
  id: GeologicalEraId;
  nameEn: string;
  nameVi: string;
  eraEmoji: string;
  themeColor: string;
  bgGradient: string;
  descriptionVi: string;
  requiredFossils: number;
}

export interface DinoProgress {
  completedFossilIds: string[];
  currentEra: GeologicalEraId;
  amberGems: number;
  paleontologistRank: PaleontologistRank;
  lastPlayedAt: string;
}
```

### 2.2 Curated Dataset (`src/data/dino/dinosaurs.ts`)
- 4 geological eras:
  - `triassic`: 3 fossils (`DIG`, `REX`, `MUD`, `FOG` - picking 3: `DIG`, `REX`, `MUD` or 4) -> 3 per era = 12 fossils.
    - `triassic`: `DIG` (Khai quật), `REX` (Bạo chúa nhí), `MUD` (Bùn hóa thạch)
    - `jurassic`: `CLAW` (Móng vuốt), `TRACK` (Dấu chân cổ), `ROAR` (Tiếng gầm)
    - `cretaceous`: `BONE` (Xương hóa thạch), `SCALE` (Vảy giáp), `TAIL` (Đuôi gai)
    - `iceage`: `MAMMOTH` (Voi ma mút), `FOSSIL` (Hóa thạch cổ), `VOLCANO` (Núi lửa cổ đại)
- Total: 12 curated dinosaur & prehistoric fossils.

### 2.3 Pure Engine (`src/lib/phonics-dino-engine.ts`)
- `getAllEras()`: Returns 4 geological era definitions.
- `getEraById(id)`: Returns specific era definition.
- `getAllFossils()`: Returns all 12 fossils.
- `getFossilById(id)`: Returns specific fossil by ID.
- `getFossilsByEra(eraId)`: Returns fossils filtered by geological era.
- `calculatePaleontologistRank(completedCount)`:
  - $< 4$: `junior_digger` (Nhà Khảo Cổ Tập Sự 🔍)
  - $4 - 8$: `expert_excavator` (Chuyên Gia Khai Quật 🦕)
  - $9 - 12$: `legendary_dino_master` (Đại Bậc Thầy Khủng Long 🦖)
- `getDefaultDinoProgress()`: Initial progress state.
- `completeDinoFossil(progress, fossilId)`: Pure function updating completed fossils, amber gems (+50), and rank.

### 2.4 Server Actions (`src/app/actions/phonics-dino.ts`)
- `getDinoProgressAction()`: Safely retrieves progress or default.
- `saveDinoProgressAction(progress)`: Validates and persists progress.

---

## 3. Component Hierarchy (`src/components/dino/`)
1. `DinoHeaderBar`:
   - Paleontologist Rank Badge with icon, Fossil Counter (`X/12`), Amber Gems counter (`💎`), Museum trigger button (`🏛️ Viện Bảo Tàng`), Reset button.
2. `DinoSiteSelector`:
   - 4 geological era tabs with era emojis, required fossil thresholds, and lock/unlock indicators.
3. `FossilDigModal`:
   - Interactive fossil excavation chamber.
   - Fossil skeleton animation, Dr. Rex audio pronunciation via `useSpeech`, bone fragment tiles, clear and resurrect buttons.
4. `DinoMuseumModal`:
   - Prehistoric museum compendium displaying all 12 fossil display cases with pronunciations, syllables, diet badges, and paleo facts.
5. `PhonicsDinoExperience`:
   - Orchestrates era selection, fossil launching, excavation modal, museum modal, and synthesizer audio feedback.

---

## 4. UI/UX & Strict Typography Standards
- Prehistoric adventure dark earth & jungle theme (`bg-stone-950`, `border-emerald-500/30`, `text-emerald-200`, `text-amber-300`).
- Strict minimum font size $\ge 16$px (`text-base` minimum, headings `text-xl` to `text-4xl`).
- High-contrast interactive elements $\ge 48$px touch targets.
- Stable CSS animations (no `animate-bounce` on interactive clickable elements).

---

## 5. Verification Strategy
1. **TypeScript Verification**: `npx tsc --noEmit` (zero errors).
2. **ESLint Verification**: `npm run lint` (zero warnings, zero errors).
3. **Vitest Unit & Component Tests**:
   - `tests/unit/types/phonics-dino-types.test.ts`
   - `tests/unit/lib/phonics-dino-engine.test.ts`
   - `tests/unit/actions/phonics-dino.test.ts`
   - `tests/components/dino/PhonicsDinoExperience.test.tsx`
   - `tests/app/dino/page.test.tsx`
4. **Playwright E2E Test**:
   - `tests/e2e/phonics-dino-park.spec.ts` (navigates from homepage, digs fossil, unlocks museum, audits typography $\ge 16$px).
5. **Full Regression & Build**:
   - `npm run test:run` (100% passing).
   - `npm run build` (Turbopack production build passing all routes).
