# Game Catalog & Visibility Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate 3 omitted mini-games (`reading`, `typing`, `roleplay`) into the primary game catalog, add a category taxonomy with an interactive tab and search filter to the homepage, and establish comprehensive test coverage (unit + E2E).

**Architecture:** Extend the core `Game` interface with `category` metadata in `src/types/index.ts`. Register the 3 missing games in `src/data/games.json` (increasing total catalog size to 19 games). Build a client component `GameCatalogSection` with category tabs and fuzzy search, embedding it into the Server-rendered `src/app/page.tsx`. Provide comprehensive Vitest and Playwright test suites.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Lucide React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-11-game-catalog-visibility-hub-design.md`

## Global Constraints

- Never mutate `route` signatures of existing games.
- All 19 games must have valid `id`, `slug`, `titleVi`, `titleEn`, `description`, `emoji`, `route`, `priority` (1-19), and `category`.
- The homepage `src/app/page.tsx` must remain a Server Component, delegating interactivity to `GameCatalogSection.tsx`.
- All existing Vitest tests (185 files) must remain 100% passing.
- Follow existing Tailwind v4 styling patterns and accessible ARIA attributes.

---

### Task 1: Type Definitions & Data Catalog Registration

**Files:**
- Modify: `src/types/index.ts:3-12`
- Modify: `src/data/games.json:1-164`
- Modify: `tests/data/games.test.ts:5-73`

**Interfaces:**
- Consumes: Existing `Game` interface in `src/types/index.ts`.
- Produces: `GameCategory` type and updated `Game` interface with `category?: GameCategory`. Full 19-game catalog in `src/data/games.json`.

- [ ] **Step 1: Update the failing test in `tests/data/games.test.ts`**

Update `tests/data/games.test.ts` to expect 19 games and check `category`:

```typescript
import { describe, it, expect } from "vitest";
import games from "@/data/games.json";
import { Game } from "@/types";

describe("games.json data integrity", () => {
  it("contains exactly 19 games", () => {
    expect(Array.isArray(games)).toBe(true);
    expect(games).toHaveLength(19);
  });

  it("each game satisfies the Game interface and validation rules", () => {
    const ids = new Set<string>();
    const priorities = new Set<number>();

    const expectedGameIds = [
      "flashcard",
      "alphabet",
      "listening",
      "spelling",
      "numbers-colors",
      "sentences",
      "memory-match",
      "word-search",
      "grammar-detective",
      "vocab-defense",
      "crossword",
      "falling-words",
      "hangman",
      "wordle",
      "word-connect",
      "odd-one-out",
      "reading",
      "typing",
      "roleplay",
    ];

    games.forEach((game: Game, index: number) => {
      expect(game.id).toBeDefined();
      expect(typeof game.id).toBe("string");
      expect(game.id.length).toBeGreaterThan(0);
      expect(ids.has(game.id)).toBe(false);
      ids.add(game.id);

      expect(game.slug).toBeDefined();
      expect(typeof game.slug).toBe("string");
      expect(game.slug).toBe(game.id);

      expect(game.titleVi).toBeDefined();
      expect(typeof game.titleVi).toBe("string");
      expect(game.titleVi.length).toBeGreaterThan(0);

      expect(game.titleEn).toBeDefined();
      expect(typeof game.titleEn).toBe("string");
      expect(game.titleEn.length).toBeGreaterThan(0);

      expect(game.description).toBeDefined();
      expect(typeof game.description).toBe("string");
      expect(game.description.length).toBeGreaterThan(0);

      expect(game.emoji).toBeDefined();
      expect(typeof game.emoji).toBe("string");
      expect(game.emoji.length).toBeGreaterThan(0);

      expect(game.route).toBeDefined();
      expect(typeof game.route).toBe("string");
      expect(game.route).toBe(`/games/${game.slug}`);

      expect(typeof game.priority).toBe("number");
      expect(game.priority).toBe(index + 1);
      priorities.add(game.priority);

      expect(game.category).toBeDefined();
      expect([
        "vocab",
        "phonics-audio",
        "grammar-sentence",
        "arcade-quiz",
        "roleplay-reading",
      ]).toContain(game.category);
    });

    expect(Array.from(ids)).toEqual(expectedGameIds);
    expect(priorities.size).toBe(19);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/data/games.test.ts`  
Expected: FAIL with `expected 16 to have length 19`

- [ ] **Step 3: Update `src/types/index.ts`**

Add `GameCategory` and update `Game`:

```typescript
export type GameCategory =
  | 'vocab'
  | 'phonics-audio'
  | 'grammar-sentence'
  | 'arcade-quiz'
  | 'roleplay-reading';

export interface Game {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  description: string;
  emoji: string;
  route: string;
  priority: number;
  category?: GameCategory;
}
```

- [ ] **Step 4: Update `src/data/games.json`**

Enrich all existing 16 games with their `category` and append `reading`, `typing`, and `roleplay` at priorities 17, 18, 19.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/data/games.test.ts tests/unit/data/game-instructions.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit changes**

```bash
git add src/types/index.ts src/data/games.json tests/data/games.test.ts
git commit -m "feat(catalog): register reading, typing, and roleplay games and add categories"
```

---

### Task 2: Interactive Game Catalog Component (`GameCatalogSection`)

**Files:**
- Create: `src/components/game/GameCatalogSection.tsx`
- Create: `tests/components/game/GameCatalogSection.test.tsx`

**Interfaces:**
- Consumes: `Game`, `GameCategory` from `@/types`, `GameCard` from `@/components/custom/GameCard`.
- Produces: `GameCatalogSection` React client component supporting category tabs and live search.

- [ ] **Step 1: Write component unit test in `tests/components/game/GameCatalogSection.test.tsx`**

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GameCatalogSection } from "@/components/game/GameCatalogSection";
import games from "@/data/games.json";
import { Game } from "@/types";

describe("GameCatalogSection", () => {
  const sampleGames: Game[] = games as Game[];

  it("renders all games by default under 'Tất cả' tab", () => {
    render(<GameCatalogSection games={sampleGames} />);
    expect(screen.getByRole("tab", { name: /tất cả/i })).toHaveAttribute("aria-selected", "true");
    const gameCards = screen.getAllByRole("link");
    expect(gameCards.length).toBe(sampleGames.length);
  });

  it("filters games by category when tab clicked", () => {
    render(<GameCatalogSection games={sampleGames} />);
    const vocabTab = screen.getByRole("tab", { name: /từ vựng/i });
    fireEvent.click(vocabTab);

    expect(vocabTab).toHaveAttribute("aria-selected", "true");
    const vocabGames = sampleGames.filter((g) => g.category === "vocab");
    const displayedLinks = screen.getAllByRole("link");
    expect(displayedLinks.length).toBe(vocabGames.length);
  });

  it("filters games by search query", () => {
    render(<GameCatalogSection games={sampleGames} />);
    const searchInput = screen.getByPlaceholderText(/tìm kiếm trò chơi/i);
    fireEvent.change(searchInput, { target: { value: "flashcard" } });

    expect(screen.getByText("Học từ vựng")).toBeInTheDocument();
    expect(screen.queryByText("Mưa Từ Vựng")).not.toBeInTheDocument();
  });

  it("shows friendly empty state when search finds nothing and allows resetting", () => {
    render(<GameCatalogSection games={sampleGames} />);
    const searchInput = screen.getByPlaceholderText(/tìm kiếm trò chơi/i);
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });

    expect(screen.getByText(/không tìm thấy trò chơi nào/i)).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /xóa bộ lọc/i });
    fireEvent.click(resetBtn);

    expect(screen.getAllByRole("link").length).toBe(sampleGames.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/game/GameCatalogSection.test.tsx`  
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `src/components/game/GameCatalogSection.tsx`**

Create `src/components/game/GameCatalogSection.tsx` with:
- Client directive `'use client'`
- Categories array: `all`, `vocab`, `phonics-audio`, `grammar-sentence`, `arcade-quiz`, `roleplay-reading`
- State for `selectedCategory` and `searchQuery`
- Dynamic filtering function
- Accessible tab buttons (`role="tab"`, `aria-selected`, `aria-controls`)
- Search input with clear button
- Game grid with `GameCard`
- Empty state with reset button

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/game/GameCatalogSection.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/components/game/GameCatalogSection.tsx tests/components/game/GameCatalogSection.test.tsx
git commit -m "feat(ui): add GameCatalogSection component with category tabs and search filter"
```

---

### Task 3: Integrate Catalog Section into Homepage

**Files:**
- Modify: `src/app/page.tsx:1-156`
- Modify: `tests/app/page.test.tsx:1-83`

**Interfaces:**
- Consumes: `GameCatalogSection` from `@/components/game/GameCatalogSection`, `gamesData` from `@/data/games.json`.
- Produces: Clean Server-rendered homepage rendering `GameCatalogSection`.

- [ ] **Step 1: Update `tests/app/page.test.tsx`**

Update assertions in `tests/app/page.test.tsx`:
- Expect 19 games instead of 16.
- Verify category tabs are rendered in homepage.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/page.test.tsx`  
Expected: FAIL with count mismatch or missing tabs.

- [ ] **Step 3: Update `src/app/page.tsx`**

In `src/app/page.tsx`:
- Import `GameCatalogSection` from `@/components/game/GameCatalogSection`.
- Replace the static `<main>` block with `<GameCatalogSection games={games} />`.
- Update hero description text to dynamic `${games.length} trò chơi tương tác sinh động!`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/app/page.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/app/page.tsx tests/app/page.test.tsx
git commit -m "feat(home): embed GameCatalogSection with interactive tabs into homepage"
```

---

### Task 4: E2E Playwright Tests for `reading`, `typing`, and `roleplay`

**Files:**
- Create: `tests/e2e/reading.spec.ts`
- Create: `tests/e2e/typing.spec.ts`
- Create: `tests/e2e/roleplay.spec.ts`

**Interfaces:**
- Consumes: Next.js running app at `/games/reading`, `/games/typing`, `/games/roleplay`.
- Produces: Verified browser end-to-end test scenarios.

- [ ] **Step 1: Write `tests/e2e/reading.spec.ts`**

Verify navigating to `/games/reading`, story modules display, selecting a module navigates to `/games/reading/[moduleId]`, questions load and choices can be selected.

- [ ] **Step 2: Write `tests/e2e/typing.spec.ts`**

Verify navigating to `/games/typing`, typing prompt appears, input receives keystrokes, correct submission updates score.

- [ ] **Step 3: Write `tests/e2e/roleplay.spec.ts`**

Verify navigating to `/games/roleplay`, chat dialogue turn displays, response choices appear, selecting choice progresses dialogue.

- [ ] **Step 4: Commit E2E tests**

```bash
git add tests/e2e/reading.spec.ts tests/e2e/typing.spec.ts tests/e2e/roleplay.spec.ts
git commit -m "test(e2e): add Playwright test suites for reading, typing, and roleplay games"
```

---

### Task 5: E2E Playwright Tests for `wordle`, `word-connect`, and `odd-one-out`

**Files:**
- Create: `tests/e2e/wordle.spec.ts`
- Create: `tests/e2e/word-connect.spec.ts`
- Create: `tests/e2e/odd-one-out.spec.ts`

**Interfaces:**
- Consumes: Next.js running app at `/games/wordle`, `/games/word-connect`, `/games/odd-one-out`.
- Produces: Verified browser end-to-end test scenarios.

- [ ] **Step 1: Write `tests/e2e/wordle.spec.ts`**

Verify navigating to `/games/wordle`, virtual keyboard or physical keys submit letters, letter tiles show evaluated color states.

- [ ] **Step 2: Write `tests/e2e/word-connect.spec.ts`**

Verify navigating to `/games/word-connect`, letter wheel renders, level progress indicators are present.

- [ ] **Step 3: Write `tests/e2e/odd-one-out.spec.ts`**

Verify navigating to `/games/odd-one-out`, 4 semantic cards display, clicking a card triggers evaluation and bilingual explanation banner.

- [ ] **Step 4: Commit E2E tests**

```bash
git add tests/e2e/wordle.spec.ts tests/e2e/word-connect.spec.ts tests/e2e/odd-one-out.spec.ts
git commit -m "test(e2e): add Playwright test suites for wordle, word-connect, and odd-one-out"
```

---

### Task 6: Full Regression Verification & Quality Gate

**Files:**
- Check: All modified files.

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`  
Expected: Clean compile with 0 errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`  
Expected: 0 lint errors.

- [ ] **Step 3: Run all unit & component tests**

Run: `npm run test:run`  
Expected: All test files pass.

- [ ] **Step 4: Build project**

Run: `npm run build:ci`  
Expected: Production build succeeds without errors.
