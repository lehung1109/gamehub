# Implementation Plan: Phase 28 - Phonics Space Odyssey & Cosmic Planet Explorer

**Target Milestone**: Phase 28  
**Route**: `/space`  
**Dependencies**: Next.js 16 (Turbopack), Tailwind CSS v4, Lucide React, Vitest, Playwright.

---

## Proposed Tasks

### Task 1: TypeScript Contracts (`src/types/phonics-space.ts`)
- `SpaceSectorType` (`'mars' | 'saturn' | 'neptune' | 'galaxy'`).
- `AstronautRank` (`'cadet-explorer' | 'fleet-commander' | 'star-lord'`).
- `SpaceMissionChallenge`: targetWord, promptVi, options, correctOptionIndex, phoneticRuleVi.
- `SpaceMission`: id, nameEn, nameVi, emoji, sector, targetPhonics, audioPronunciation, storyVi, challenge.
- `SpaceSectorDefinition`: id, nameEn, nameVi, themeColor, backgroundGradient, descriptionVi, missionIds.
- `SpaceProgress`: completedMissionIds, cosmicCrystals, astronautRank, completedSectors.
- Unit tests: `tests/unit/types/phonics-space-types.test.ts`.

### Task 2: Curated Missions & Pure Engine (`src/data/space/missions.ts`, `src/lib/phonics-space-engine.ts`)
- 4 Sectors with 12 curated space exploration missions (3 per sector).
- Pure engine functions in `src/lib/phonics-space-engine.ts`:
  - `getAllSectors(): SpaceSectorDefinition[]`
  - `getSectorById(id: SpaceSectorType): SpaceSectorDefinition | undefined`
  - `getAllMissions(): SpaceMission[]`
  - `getMissionById(id: string): SpaceMission | undefined`
  - `getMissionsBySector(sector: SpaceSectorType): SpaceMission[]`
  - `calculateAstronautRank(completedCount: number): AstronautRank`
  - `getDefaultSpaceProgress(): SpaceProgress`
  - `completeMission(progress: SpaceProgress, missionId: string, answerIndex: number): { success: boolean; updatedProgress: SpaceProgress; error?: string }`
- Unit tests: `tests/unit/lib/phonics-space-engine.test.ts`.

### Task 3: Server Actions (`src/app/actions/phonics-space.ts`)
- `getSpaceProgressAction(studentId?: string): Promise<SpaceActionResult<SpaceProgress>>`
- `saveSpaceProgressAction(progress: SpaceProgress): Promise<SpaceActionResult<{ saved: boolean; totalMissions: number; astronautRank: string }>>`
- Unit tests: `tests/unit/actions/phonics-space.test.ts`.

### Task 4: UI Components (`src/components/space/`)
- `SpaceHeaderBar.tsx`: Astronaut rank badge, mission counter (X/12), crystals counter, Compendium trigger, reset progress button.
- `SpaceSectorSelector.tsx`: Sector navigation tabs (Mars 🚀, Saturn 🪐, Neptune ❄️, Galaxy 🌌).
- `CosmicRoverModal.tsx`: Rover landing simulation, radio frequency decoding challenge, space thruster audio feedback.
- `SpaceCompendiumModal.tsx`: Cosmic space compendium modal showing unlocked planets, astronomical facts, and pronunciation buttons.
- `PhonicsSpaceExperience.tsx`: Main client coordinator container.
- Unit tests: `tests/components/space/PhonicsSpaceExperience.test.tsx`.

### Task 5: Route Page & Homepage Navigation (`src/app/space/page.tsx`, `src/app/page.tsx`)
- Create `/space` route page.
- Add `space-topbar-link` in `src/app/page.tsx`.
- Update `tests/app/page.test.tsx` and create `tests/app/space/page.test.tsx`.

### Task 6: Playwright E2E Integration (`tests/e2e/phonics-space-odyssey.spec.ts`)
- Navigate from homepage topbar link to `/space`.
- Select sector, open mission modal, answer challenge, land rover.
- Open Cosmic Space Compendium and verify unlocked mission card.
- Strict typography audit ($\ge 16$px, no `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).

### Task 7: Quality Gate & Merge into `main`
- Run `npx tsc --noEmit`.
- Run `npm run lint`.
- Run `npm run test:run`.
- Run `npm run build`.
- Merge into `main` and `git push origin main`.
