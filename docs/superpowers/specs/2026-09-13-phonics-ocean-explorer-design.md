# Phase 29 Design Spec: Phonics Ocean Explorer & Deep Sea Submarine (Thám Hiểm Đại Dương & Tàu Ngầm Ngữ Âm)

## 1. Overview & Pedagogical Purpose
**Phonics Ocean Explorer** (`/ocean`) is an immersive deep-sea scientific expedition game where young learners join **Captain Coral 🐬** and **Submarine AI Nautilus 🫧** aboard the high-tech research submersible *Neptune One*. 

Learners dive through 4 distinct ocean depth zones (from the sunlit coral reefs down to the Mariana Abyss), using acoustic sonar decoders to reconstruct phonics words from floating air bubbles, unlock marine species, and assemble the **Marine Biology Compendium**.

### Key Pedagogical Pillars
1. **Systematic Phonics Progression**:
   - **Sunlight Zone (0 - 200m)**: Short vowels & CVC marine words (`FIN`, `SUN`, `WET`).
   - **Twilight Zone (200 - 1,000m)**: Consonant digraphs & consonant blends (`SHELL`, `SHARK`, `CLAW`).
   - **Midnight Zone (1,000 - 4,000m)**: Vowel teams, diphthongs & Magic E (`WHALE`, `DIVE`, `GLOW`).
   - **Abyssal Trench (4,000m+)**: Multi-syllabic segmentation & compound words (`JELLYFISH`, `SUBMARINE`, `TREASURE`).
2. **Multi-Sensory Audio-Visual Feedback**:
   - Audio pronunciation of target words and phonics syllables powered by `useSpeech`.
   - Visual bubble-floating sound wave oscillations, submarine radar pings, and depth meter gauges.
3. **Marine Biology Compendium (Bách Khoa Sinh Vật Biển)**:
   - Each completed mission unlocks an interactive marine specimen card with pronunciation, phonetic breakdown, and real-world ocean science facts.
4. **Kid-Friendly Typography Standard**:
   - Minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).
   - Strictly zero `text-xs`, `text-sm`, or sub-16px inline arbitrary values.

---

## 2. Architecture & Data Contracts

### 2.1 Type Definitions (`src/types/phonics-ocean.ts`)
```typescript
export type OceanDepthZone = 'sunlight' | 'twilight' | 'midnight' | 'abyss';

export type DiverRank = 'snorkel_cadet' | 'sub_pilot' | 'ocean_master';

export interface OceanChallenge {
  targetWord: string;
  phonicsFocus: string;
  vietnameseMeaning: string;
  phoneticBreakdown: string[];
  audioHint: string;
  marineFact: string;
  bubbleScramble: string[];
}

export interface OceanMission {
  id: string;
  zoneId: OceanDepthZone;
  name: string;
  creatureName: string;
  creatureEmoji: string;
  depthMeters: number;
  description: string;
  challenge: OceanChallenge;
}

export interface OceanZoneDefinition {
  id: OceanDepthZone;
  name: string;
  vietnameseTitle: string;
  depthRange: string;
  colorTheme: string;
  bgGradient: string;
  description: string;
  requiredMissions: number;
}

export interface OceanProgress {
  completedMissionIds: string[];
  currentZone: OceanDepthZone;
  pearls: number;
  diverRank: DiverRank;
  lastPlayedAt: string;
}
```

### 2.2 Curated Dataset (`src/data/ocean/missions.ts`)
- 4 zones:
  - `sunlight`: 3 missions (`FIN`, `SUN`, `WET`)
  - `twilight`: 3 missions (`SHELL`, `SHARK`, `CLAW`)
  - `midnight`: 3 missions (`WHALE`, `DIVE`, `GLOW`)
  - `abyss`: 3 missions (`JELLYFISH`, `SUBMARINE`, `TREASURE`)
- Total: 12 curated deep-sea missions.

### 2.3 Pure Engine (`src/lib/phonics-ocean-engine.ts`)
- `getAllZones()`: Returns the 4 ocean depth zones.
- `getZoneById(id)`: Returns matching zone definition.
- `getAllMissions()`: Returns all 12 missions.
- `getMissionById(id)`: Returns specific mission.
- `getMissionsByZone(zoneId)`: Returns missions filtered by depth zone.
- `calculateDiverRank(completedCount)`:
  - $< 4$: `snorkel_cadet` (Học Viên Lặn 🤿)
  - $4 - 8$: `sub_pilot` (Thuyền Trưởng Tàu Ngầm 🚤)
  - $9 - 12$: `ocean_master` (Hải Vương Biển Sâu 🔱)
- `getDefaultOceanProgress()`: Initial progress state.
- `completeOceanMission(progress, missionId)`: Pure function updating progress, pearls (+50), and rank.

### 2.4 Server Actions (`src/app/actions/phonics-ocean.ts`)
- `getOceanProgressAction()`: Safely retrieves progress or default.
- `saveOceanProgressAction(progress)`: Validates and persists progress.

---

## 3. Component Hierarchy (`src/components/ocean/`)
1. `OceanHeaderBar`:
   - Submersible Depth Gauge (`0m - 11,000m`), Diver Rank badge with icon, Pearls counter (`🦪`), Compendium button (`📖 Bách Khoa`).
2. `OceanZoneSelector`:
   - 4 depth zone tabs showing depth range, badge counts, and lock/unlock status based on requirements.
3. `SubmarineSonarModal`:
   - Interactive sonar dive chamber.
   - Acoustic word clue, Captain Coral pronunciation button (`useSpeech`), floating bubble letter rack, reset and confirm buttons.
4. `OceanCompendiumModal`:
   - Grid of discovered marine species cards.
   - Plays pronunciation, displays syllables and educational ocean facts.
5. `PhonicsOceanExperience`:
   - Orchestrates zone navigation, mission launching, sonar modal, compendium modal, and sound feedback.

---

## 4. UI/UX & Strict Typography Standards
- Deep oceanic dark mode styling (`bg-slate-950`, `border-cyan-500/30`, `text-cyan-200`, `text-emerald-300`).
- Strict minimum font size $\ge 16$px (`text-base` minimum, headings `text-xl` to `text-4xl`).
- High-contrast touch targets $\ge 48$px for kid-friendly interaction.
- Stable CSS transitions and hover states without unstable continuous bounce animations.

---

## 5. Verification Strategy
1. **TypeScript Verification**: `npx tsc --noEmit` (zero errors).
2. **ESLint Verification**: `npm run lint` (zero warnings, zero errors).
3. **Vitest Unit & Component Tests**:
   - `tests/unit/types/phonics-ocean-types.test.ts`
   - `tests/unit/lib/phonics-ocean-engine.test.ts`
   - `tests/unit/actions/phonics-ocean.test.ts`
   - `tests/components/ocean/PhonicsOceanExperience.test.tsx`
   - `tests/app/ocean/page.test.tsx`
4. **Playwright E2E Test**:
   - `tests/e2e/phonics-ocean-explorer.spec.ts` (navigates from homepage, selects zone, completes sonar decode, opens compendium, audits typography $\ge 16$px).
5. **Full Regression & Build**:
   - `npm run test:run` (100% passing across 370+ test files).
   - `npm run build` (Turbopack production build passing 95+ routes).
