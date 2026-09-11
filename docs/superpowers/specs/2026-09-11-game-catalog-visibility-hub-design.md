# Technical Design Specification: Game Catalog & Visibility Hub (Sub-project 1)

**Feature Branch**: `subproject-1-game-catalog-visibility`  
**Date**: 2026-09-11  
**Status**: Approved (Draft for Review)  

---

## 1. Overview & Business Context

GameHub has developed 19 interactive educational mini-games. However, three completed mini-games (Reading Comprehension, Typing Challenge, and Conversational Roleplay) are currently omitted from the primary game catalog (`src/data/games.json`), making them inaccessible from the homepage.

Furthermore, with 19 games in total, displaying them in a flat grid creates cognitive overload for learners and teachers. This sub-project addresses discoverability, categorization, data integrity, and end-to-end test coverage.

### Key Objectives
1. **Catalog Registration**: Register `reading`, `typing`, and `roleplay` in `src/data/games.json` with priorities 17, 18, 19.
2. **Category Classification**: Extend the `Game` schema with a `category` property to group games by learning objective:
   - `vocab` (Vocabulary mastery)
   - `phonics-audio` (Listening & Phonics)
   - `grammar-sentence` (Grammar & Sentence structures)
   - `arcade-quiz` (Word Puzzles & Arcade challenges)
   - `roleplay-reading` (Contextual reading & conversation)
3. **Interactive Category Tabs & Search**: Provide a responsive filter bar on the homepage allowing learners to quickly filter by category or search by name.
4. **Data Integrity & Regression Safety**: Update Vitest data tests to strictly validate 19 games and ensure all existing routes remain functional.
5. **E2E Playwright Test Coverage**: Add missing E2E test suites for `reading`, `typing`, `roleplay`, `wordle`, `word-connect`, and `odd-one-out`.

---

## 2. Architecture & Data Model Changes

### 2.1 Type Definitions (`src/types/index.ts`)

Extend the `Game` interface:

```typescript
export type GameCategory =
  | 'vocab'
  | 'phonics-audio'
  | 'grammar-sentence'
  | 'arcade-quiz'
  | 'roleplay-reading'

export interface Game {
  id: string
  slug: string
  titleVi: string
  titleEn: string
  description: string
  emoji: string
  route: string
  priority: number
  category?: GameCategory
}
```

### 2.2 Catalog Dataset (`src/data/games.json`)

Append the three missing games and assign appropriate categories to all 19 games:

| Priority | ID / Slug | Category | Vietnamese Title | English Title | Emoji | Route |
|---|---|---|---|---|---|---|
| 1 | `flashcard` | `vocab` | Học từ vựng | Flashcard | 🃏 | `/games/flashcard` |
| 2 | `alphabet` | `phonics-audio` | Chữ cái & Phonics | Alphabet & Phonics | 🔤 | `/games/alphabet` |
| 3 | `listening` | `phonics-audio` | Nghe hiểu | Listening | 👂 | `/games/listening` |
| 4 | `spelling` | `vocab` | Đánh vần | Spelling | ✏️ | `/games/spelling` |
| 5 | `numbers-colors` | `arcade-quiz` | Số & Màu sắc | Numbers & Colors | 🔢 | `/games/numbers-colors` |
| 6 | `sentences` | `grammar-sentence` | Câu đơn giản | Simple Sentences | 💬 | `/games/sentences` |
| 7 | `memory-match` | `vocab` | Lật thẻ tìm cặp | Memory Match | 🧠 | `/games/memory-match` |
| 8 | `word-search` | `vocab` | Săn tìm từ vựng | Word Search | 🔍 | `/games/word-search` |
| 9 | `grammar-detective` | `grammar-sentence` | Thám tử sửa lỗi | Grammar Detective | 🕵️ | `/games/grammar-detective` |
| 10 | `vocab-defense` | `arcade-quiz` | Hiệp sĩ Từ vựng | Word Knight: RPG Battle | ⚔️ | `/games/vocab-defense` |
| 11 | `crossword` | `arcade-quiz` | Giải đố Ô chữ | Crossword Master | 🧩 | `/games/crossword` |
| 12 | `falling-words` | `vocab` | Mưa Từ Vựng | Falling Words | 🌧️ | `/games/falling-words` |
| 13 | `hangman` | `arcade-quiz` | Giải Cứu Nhà Thám Hiểm | Word Explorer: Balloon Hangman | 🎈 | `/games/hangman` |
| 14 | `wordle` | `arcade-quiz` | Thử Thách Đoán Từ | Wordle Master | 🟩 | `/games/wordle` |
| 15 | `word-connect` | `vocab` | Vòng Xoay Nối Chữ | Word Connect | 🔄 | `/games/word-connect` |
| 16 | `odd-one-out` | `vocab` | Truy Tìm Kẻ Lạc Loài | Odd One Out | 🎯 | `/games/odd-one-out` |
| 17 | `reading` | `roleplay-reading` | Luyện đọc hiểu | Reading Comprehension | 📖 | `/games/reading` |
| 18 | `typing` | `roleplay-reading` | Luyện gõ từ vựng | Typing Challenge | ⌨️ | `/games/typing` |
| 19 | `roleplay` | `roleplay-reading` | Hội thoại tương tác | Conversational Roleplay | 💬 | `/games/roleplay` |

---

## 3. UI Component Architecture

### 3.1 Homepage Catalog Filter (`src/components/game/GameCatalogSection.tsx`)

A new client component rendered inside `src/app/page.tsx`:
- **Category Filter Tabs**:
  - `all`: Tất cả (19)
  - `vocab`: Từ vựng (7)
  - `phonics-audio`: Phát âm & Nghe (2)
  - `grammar-sentence`: Ngữ pháp & Đặt câu (2)
  - `arcade-quiz`: Giải đố Arcade (5)
  - `roleplay-reading`: Đọc & Hội thoại (3)
- **Search Input**: Instant case-insensitive fuzzy filtering on `titleVi`, `titleEn`, and `description`.
- **Keyboard & Screen Reader Accessible**: Tab list follows ARIA tabs pattern (`role="tablist"`, `role="tab"`, `aria-selected`).
- **Empty State**: Friendly fallback card when search query matches zero games with a quick "Xóa tìm kiếm" (Reset search) button.

---

## 4. Testing & Quality Assurance Plan

### 4.1 Unit & Data Integrity Tests
1. **`tests/data/games.test.ts`**:
   - Update assertion to `expect(games).toHaveLength(19)`.
   - Update `expectedGameIds` to include `reading`, `typing`, and `roleplay`.
   - Verify all games have a defined, valid `category`.
2. **`tests/app/page.test.tsx`**:
   - Verify that all 19 games are rendered when "All" is active.
   - Verify that clicking category tabs filters the displayed games to the expected subsets.
   - Verify search input filtering.

### 4.2 End-to-End Playwright Tests (`tests/e2e/`)
Add dedicated test specs:
1. `tests/e2e/reading.spec.ts`: Test navigation to `/games/reading`, select story module, complete comprehension quiz, and view score.
2. `tests/e2e/typing.spec.ts`: Test navigation to `/games/typing`, type words with keyboard, check correctness and streak.
3. `tests/e2e/roleplay.spec.ts`: Test navigation to `/games/roleplay`, participate in dialogue turns, select choices, listen to TTS audio.
4. `tests/e2e/wordle.spec.ts`: Test navigation to `/games/wordle`, enter guesses, verify letter tile coloring (green/yellow/gray).
5. `tests/e2e/word-connect.spec.ts`: Test navigation to `/games/word-connect`, drag/connect letters, verify word solved in crossword slots.
6. `tests/e2e/odd-one-out.spec.ts`: Test navigation to `/games/odd-one-out`, select semantic outlier, verify bilingual explanation.

---

## 5. Implementation Steps Summary

1. Update `GameCategory` and `Game` interface in `src/types/index.ts`.
2. Add `reading`, `typing`, and `roleplay` to `src/data/games.json` and enrich all 19 entries with `category`.
3. Create `GameCatalogSection.tsx` client component.
4. Integrate `GameCatalogSection` into `src/app/page.tsx`.
5. Update `tests/data/games.test.ts` and `tests/app/page.test.tsx`.
6. Implement missing Playwright E2E test specs.
7. Run `npm run test:run` and `npm run test:e2e` to verify 100% green status.
