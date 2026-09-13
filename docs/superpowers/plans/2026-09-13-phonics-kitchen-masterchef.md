# Implementation Plan: Phase 27 - Phonics Kitchen & Junior MasterChef Academy

**Target Milestone**: Phase 27  
**Route**: `/kitchen`  
**Dependencies**: Next.js 16 (Turbopack), Tailwind CSS v4, Lucide React, Vitest, Playwright.

---

## Proposed Tasks

### Task 1: TypeScript Contracts (`src/types/phonics-kitchen.ts`)
- `KitchenStationType` (`'pizzeria' | 'sushi-bar' | 'bakery-dessert' | 'taco-cantina'`).
- `MasterChefRank` (`'apprentice-cook' | 'sous-chef' | 'executive-masterchef'`).
- `RecipeIngredientChallenge`: targetWord, promptVi, options, correctOptionIndex, phoneticRuleVi.
- `KitchenRecipe`: id, nameEn, nameVi, emoji, station, ingredients, phonicsFocus, audioPronunciation, storyVi.
- `KitchenStationDefinition`: id, nameEn, nameVi, themeColor, backgroundGradient, descriptionVi, recipeIds.
- `KitchenProgress`: masteredRecipeIds, chefStars, chefRank, completedStations.
- Unit tests: `tests/unit/types/phonics-kitchen-types.test.ts`.

### Task 2: Curated Recipes & Pure Engine (`src/data/kitchen/recipes.ts`, `src/lib/phonics-kitchen-engine.ts`)
- 4 Kitchen Stations with 12 signature recipes (3 per station).
- Pure engine functions in `src/lib/phonics-kitchen-engine.ts`:
  - `getAllStations(): KitchenStationDefinition[]`
  - `getStationById(id: KitchenStationType): KitchenStationDefinition | undefined`
  - `getAllRecipes(): KitchenRecipe[]`
  - `getRecipeById(id: string): KitchenRecipe | undefined`
  - `getRecipesByStation(station: KitchenStationType): KitchenRecipe[]`
  - `calculateChefRank(masteredCount: number): MasterChefRank`
  - `getDefaultKitchenProgress(): KitchenProgress`
  - `cookRecipe(progress: KitchenProgress, recipeId: string, answerIndex: number): { success: boolean; updatedProgress: KitchenProgress; error?: string }`
- Unit tests: `tests/unit/lib/phonics-kitchen-engine.test.ts`.

### Task 3: Server Actions (`src/app/actions/phonics-kitchen.ts`)
- `getKitchenProgressAction(studentId?: string): Promise<KitchenActionResult<KitchenProgress>>`
- `saveKitchenProgressAction(progress: KitchenProgress): Promise<KitchenActionResult<{ saved: boolean; totalMastered: number; chefRank: string }>>`
- Unit tests: `tests/unit/actions/phonics-kitchen.test.ts`.

### Task 4: UI Components (`src/components/kitchen/`)
- `KitchenHeaderBar.tsx`: Chef rank badge, recipe counter (X/12), Recipe Book modal trigger, reset progress button.
- `KitchenStationSelector.tsx`: Station selector tabs (Pizzeria 🍕, Sushi Bar 🍣, Parisian Bakery 🥞, Taco Cantina 🌮).
- `CookingWorkbenchModal.tsx`: Interactive cooking preparation area with pot/oven, phonetic ingredient selection, sizzling audio feedback.
- `RecipeBookModal.tsx`: MasterChef recipe book displaying unlocked dishes, ingredient rules, pronunciations.
- `PhonicsKitchenExperience.tsx`: Main client coordinator container.
- Unit tests: `tests/components/kitchen/PhonicsKitchenExperience.test.tsx`.

### Task 5: Route Page & Homepage Navigation (`src/app/kitchen/page.tsx`, `src/app/page.tsx`)
- Create `/kitchen` route page.
- Add `kitchen-topbar-link` in `src/app/page.tsx`.
- Update `tests/app/page.test.tsx` and create `tests/app/kitchen/page.test.tsx`.

### Task 6: Playwright E2E Integration (`tests/e2e/phonics-kitchen-masterchef.spec.ts`)
- Navigate from homepage topbar link to `/kitchen`.
- Select station, open recipe cooking workbench, select correct phonetic ingredient, complete dish.
- Open MasterChef Recipe Book and verify unlocked dish.
- Strict typography audit ($\ge 16$px, no `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).

### Task 7: Quality Gate & Merge into `main`
- Run `npx tsc --noEmit`.
- Run `npm run lint`.
- Run `npm run test:run`.
- Run `npm run build`.
- Merge into `main` and `git push origin main`.
