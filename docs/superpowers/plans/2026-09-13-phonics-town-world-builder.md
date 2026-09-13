# Implementation Plan: Phase 25 - Phonics Town & Interactive Vocabulary World Builder

**Target Milestone**: Phase 25  
**Feature Branch**: `feat/phase-25-phonics-town-world-builder`  
**Route**: `/town`

---

## 1. Architecture & File Breakdown

1. **Contracts & Types**:
   - `src/types/phonics-town.ts`:
     - `BuildingType`: `'bakery' | 'zoo' | 'hospital' | 'library' | 'spaceport' | 'police-station'`
     - `BuildingLevel`: `1 | 2 | 3`
     - `TownBuildingDefinition`: Building template metadata, levels, icons, costs, phonics targets, resident NPC.
     - `PlacedBuilding`: Grid slot index (0–5), type, level, lastHarvestAt.
     - `TownResidentQuest`: Riddle prompt, options, correct answer, reward bricks, reward prosperity.
     - `TownState`: Placed buildings list, bricks balance, prosperity stars, mayorTitle.
   - `tests/unit/types/phonics-town-types.test.ts`: Type contract validation.

2. **Curated Town Buildings & Pure Engine**:
   - `src/data/town/buildings.ts`: 6 curated building definitions with 3 level upgrades each and resident quests.
   - `src/lib/phonics-town-engine.ts`:
     - `getAllBuildingDefinitions()`
     - `getBuildingDefinition(type: BuildingType)`
     - `canAffordBuilding(bricks: number, type: BuildingType, currentLevel: number)`
     - `constructOrUpgradeBuilding(townState: TownState, slotIndex: number, type: BuildingType)`
     - `validateResidentQuest(quest: TownResidentQuest, optionId: string)`
     - `calculateMayorRank(prosperityStars: number)`
     - `getDefaultTownState()`
   - `tests/unit/lib/phonics-town-engine.test.ts`: Unit tests for engine functions.

3. **Server Actions**:
   - `src/app/actions/phonics-town.ts`:
     - `getTownStateAction(studentId?: string)`
     - `saveTownStateAction(state: TownState)`
   - `tests/unit/actions/phonics-town.test.ts`: Server action tests.

4. **UI Components**:
   - `src/components/town/TownHeaderBar.tsx`: Bricks counter (`🧱`), Prosperity stars (`🌟`), Mayor rank badge, reset town button.
   - `src/components/town/TownBuildingCard.tsx`: Building vector card showing current level graphic, resident NPC, and upgrade button.
   - `src/components/town/TownBuildMenuModal.tsx`: Modal to choose and construct a new building on an empty slot.
   - `src/components/town/TownResidentQuestModal.tsx`: Interactive dialogue with resident NPC and phonics challenge.
   - `src/components/town/PhonicsTownGrid.tsx`: Main interactive 6-slot town grid with terrain paths, trees, and buildings.
   - `tests/components/town/PhonicsTownGrid.test.tsx`: Comprehensive UI component tests.

5. **Page Routes & Homepage Integration**:
   - `src/app/town/page.tsx`: Hub route with metadata.
   - `src/app/page.tsx`: Add `🏙️ Thành Phố` top navigation bar link.
   - `tests/app/town/page.test.tsx` & `tests/app/page.test.tsx`.

6. **Playwright E2E Integration**:
   - `tests/e2e/phonics-town-world-builder.spec.ts`: E2E test verifying town navigation, building construction, resident quest solving, prosperity increase, and typography audit ($\ge 16$px).

7. **Quality Gate & Merge**:
   - TypeScript 5 strict check, ESLint clean check, full Vitest regression suite, Next.js Turbopack production build, merge into `main`, and push to `origin/main`.

---

## 2. Execution Tasks

- [ ] **Task 1: TypeScript Contracts**
- [ ] **Task 2: Curated Buildings & Town Engine**
- [ ] **Task 3: Server Actions**
- [ ] **Task 4: UI Components & Unit Tests**
- [ ] **Task 5: Route Page & Homepage Integration**
- [ ] **Task 6: Playwright E2E Integration**
- [ ] **Task 7: Quality Gate & Merge into `main`**
