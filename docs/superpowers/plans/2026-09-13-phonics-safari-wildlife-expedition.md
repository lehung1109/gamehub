# Implementation Plan: Phase 26 - Phonics Safari & Wildlife Nature Expedition

**Target Milestone**: Phase 26  
**Route**: `/safari`  
**Dependencies**: Next.js 16 (Turbopack), Tailwind CSS v4, Lucide React, Vitest, Playwright.

---

## Proposed Tasks

### Task 1: TypeScript Contracts (`src/types/phonics-safari.ts`)
- Define `SafariBiomeType` (`'savanna' | 'rainforest' | 'arctic' | 'ocean'`).
- Define `ExplorerRank` (`'junior-scout' | 'wild-ranger' | 'safari-master'`).
- Define `SafariAnimalChallenge`: question, options, correctOptionIndex, phoneticRuleVi, funFactVi.
- Define `SafariAnimal`: id, nameEn, nameVi, emoji, biome, syllables, phonicsFocus, audioPronunciation, challenge.
- Define `SafariBiomeDefinition`: id, nameEn, nameVi, themeColor, backgroundStyle, animalIds, descriptionVi.
- Define `SafariProgress`: photographedAnimalIds, completedBiomes, explorerRank, totalPhotosCaptured.
- Create unit test: `tests/unit/types/phonics-safari-types.test.ts`.

### Task 2: Curated Biomes, Animals & Pure Engine (`src/data/safari/animals.ts`, `src/lib/phonics-safari-engine.ts`)
- 4 Biomes with 16 curated wildlife animals (4 animals per biome).
- Functions in `src/lib/phonics-safari-engine.ts`:
  - `getAllBiomes(): SafariBiomeDefinition[]`
  - `getBiomeById(id: SafariBiomeType): SafariBiomeDefinition | undefined`
  - `getAnimalById(id: string): SafariAnimal | undefined`
  - `getAnimalsByBiome(biome: SafariBiomeType): SafariAnimal[]`
  - `calculateExplorerRank(photographedCount: number): ExplorerRank`
  - `recordSnapshot(progress: SafariProgress, animalId: string, answerIndex: number): { success: boolean; updatedProgress: SafariProgress; error?: string }`
  - `getDefaultSafariProgress(): SafariProgress`
- Create unit test: `tests/unit/lib/phonics-safari-engine.test.ts`.

### Task 3: Server Actions (`src/app/actions/phonics-safari.ts`)
- `getSafariProgressAction(studentId?: string): Promise<SafariActionResult<SafariProgress>>`
- `saveSafariProgressAction(progress: SafariProgress): Promise<SafariActionResult<{ saved: boolean; totalPhotos: number; explorerRank: string }>>`
- Create unit test: `tests/unit/actions/phonics-safari.test.ts`.

### Task 4: UI Components (`src/components/safari/`)
- `SafariHeaderBar.tsx`: Explorer rank, photo count (X/16), Field Guide trigger, back button.
- `SafariBiomeSelector.tsx`: Biome tab selector with custom icons and progress indicators.
- `SafariCameraModal.tsx`: Viewfinder lens overlay, shutter snapshot trigger, phonics multiple choice options.
- `SafariFieldGuideModal.tsx`: Field guide notebook with animal stickers, audio pronunciations, fun facts.
- `PhonicsSafariExperience.tsx`: Main interactive container coordinating biomes, audio feedback, and modals.
- Create component unit tests: `tests/components/safari/PhonicsSafariExperience.test.tsx`.

### Task 5: Route Page & Homepage Navigation (`src/app/safari/page.tsx`, `src/app/page.tsx`)
- Create `/safari` page with metadata and kid-friendly layout.
- Add `safari-topbar-link` in `src/app/page.tsx`.
- Update `tests/app/page.test.tsx` and add `tests/app/safari/page.test.tsx`.

### Task 6: Playwright E2E Integration (`tests/e2e/phonics-safari-wildlife-expedition.spec.ts`)
- Test navigation from homepage topbar link to `/safari`.
- Select Savanna biome, click unphotographed animal (Lion / Elephant).
- Answer phonics question in camera viewfinder modal, capture photo.
- Verify Field Guide notebook updates with new animal sticker and audio pronunciation.
- Strict typography audit ($\ge 16$px, no `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).

### Task 7: Quality Gate & Merge into `main`
- Run `npx tsc --noEmit`
- Run `npm run lint`
- Run `npm run test:run`
- Run `npm run build`
- Merge `feat/phase-26-phonics-safari-wildlife-expedition` into `main` and push.
