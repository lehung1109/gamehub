# Quickstart: English Learning Games for Kids

**Feature Branch**: `001-english-learning-games` | **Date**: 2026-08-20

## Prerequisites

- **Node.js**: 20.9.0+ (required by Next.js 16)
- **Package Manager**: npm (or pnpm/yarn)
- **Browser**: Chrome 90+, Edge 90+, Safari 14+, or Firefox 90+ (for Web Speech API)
- **OS**: Any (Windows, macOS, Linux)

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd gamehub

# 2. Install dependencies
npm install

# 3. Start development server (Turbopack — sub-second HMR)
npm run dev

# 4. Open in browser
# → http://localhost:3000
```

## Project Dependencies

```bash
# Core
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint

# shadcn/ui — initialize and add components
npx shadcn@latest init
npx shadcn@latest add button card tabs badge dialog progress toggle toggle-group separator tooltip

# Drag & Drop (for spelling and sentence games)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @playwright/test
npx playwright install
```

## Build & Deploy

```bash
# Build static export
npm run build
# Output: out/ directory with static HTML/CSS/JS

# Preview locally
npx serve out

# Deploy to Vercel
npx vercel
# Or: push to GitHub and connect repo to Vercel dashboard
```

## Validation Scenarios

These scenarios verify the feature works end-to-end after implementation.

### Scenario 1: Homepage — Game Discovery

**Purpose**: Verify all 6 games are accessible from the homepage.

```text
1. Open http://localhost:3000
2. EXPECT: 6 game cards displayed in a grid
3. EXPECT: Each card shows emoji + Vietnamese title + description
4. EXPECT: Cards are ordered: Flashcard, Chữ cái, Nghe hiểu, Đánh vần, Số & Màu, Câu đơn giản
5. Click on "Học từ vựng" card
6. EXPECT: Navigate to /games/flashcard within 1 second
7. Resize browser to 360px width
8. EXPECT: Cards stack in single column, still fully visible and tappable
```

**Validates**: FR-001, FR-002, FR-014, SC-001

### Scenario 2: Flashcard — Topic Selection & Card Flipping

**Purpose**: Verify flashcard game flow from topic selection through card interaction.

```text
1. Navigate to /games/flashcard
2. EXPECT: Topic selection page with 5+ topics (Animals, Fruits, Family, School, Body Parts)
3. Click "Động vật" (Animals)
4. EXPECT: Navigate to /games/flashcard/animals
5. EXPECT: First card shows front side with large emoji (e.g., 🐱)
6. Tap/click the card
7. EXPECT: Card flips with animation, showing "Cat", "/kæt/", "Con mèo"
8. Click speaker button 🔊
9. EXPECT: Hear "Cat" spoken in English (Web Speech API)
10. Click speaker button rapidly 3 times
11. EXPECT: Only one speech plays at a time, no overlapping audio
12. Swipe right or click arrow
13. EXPECT: Next card appears with front side
14. EXPECT: Back button visible, navigates to homepage
```

**Validates**: FR-003, FR-004, FR-012, FR-016, FR-017, SC-006

### Scenario 3: Alphabet — Learning & Quiz Mode

**Purpose**: Verify alphabet grid interaction and quiz mode.

```text
1. Navigate to /games/alphabet
2. EXPECT: 26-letter grid (A-Z), large buttons
3. Tap letter "B"
4. EXPECT: Shows "Ball" + ⚽ + plays pronunciation of "B"
5. Switch to Quiz mode
6. EXPECT: System speaks a letter name
7. Tap the correct letter on the grid
8. EXPECT: Green feedback + ⭐🎉 animation, advance to next
9. Tap wrong letter
10. EXPECT: Red feedback + highlight correct letter + "Thử lại" option
```

**Validates**: FR-005, FR-006, FR-008, FR-012

### Scenario 4: Listening — Audio Comprehension Quiz

**Purpose**: Verify listening game with audio and image selection.

```text
1. Navigate to /games/listening
2. EXPECT: System speaks an English word + displays 3-4 emoji options
3. Click replay button
4. EXPECT: Word spoken again
5. Select correct emoji
6. EXPECT: Green feedback + auto-advance after 1.5s
7. Select wrong emoji
8. EXPECT: Red feedback + highlight correct answer + "Tiếp tục" button
```

**Validates**: FR-007, FR-008, FR-012

### Scenario 5: Spelling — Drag & Drop Letter Assembly

**Purpose**: Verify drag-and-drop spelling game works on touch and mouse.

```text
1. Navigate to /games/spelling
2. EXPECT: Emoji image (e.g., 🐶) + scrambled letters (D, O, G + 2-3 distractors)
3. Drag letter "D" to first slot
4. EXPECT: Letter snaps into position
5. Drag wrong letter "X" to second slot
6. EXPECT: Letter returns to bank with animation
7. Complete the word "DOG" by placing D, O, G
8. EXPECT: System speaks "Dog" + celebration animation (⭐🎉)
9. (On mobile) Use tap-to-place: tap letter, then tap slot
10. EXPECT: Same behavior as drag
```

**Validates**: FR-009, FR-012, FR-015

### Scenario 6: Numbers & Colors — Tab Navigation & Quiz

**Purpose**: Verify numbers and colors learning with tab switching.

```text
1. Navigate to /games/numbers-colors
2. EXPECT: Two tabs — "Số đếm" (active) and "Màu sắc"
3. Tap number 3
4. EXPECT: Shows "Three" + "Ba" + 🍎🍎🍎 + plays pronunciation
5. Switch to "Màu sắc" tab
6. EXPECT: Grid of 8+ color swatches
7. Tap red color swatch
8. EXPECT: Shows "Red" + "Đỏ" + plays pronunciation
9. Switch to quiz mode
10. EXPECT: System speaks color/number name, user selects correct option
```

**Validates**: FR-010, FR-012

### Scenario 7: Sentences — Word Ordering

**Purpose**: Verify sentence building with drag and tap interaction.

```text
1. Navigate to /games/sentences
2. EXPECT: Situation emoji (e.g., 🍽️) + scrambled words ("eating", "I", "am")
3. Arrange words in correct order: "I", "am", "eating"
4. Click "Kiểm tra"
5. EXPECT: System speaks "I am eating" + shows "Tôi đang ăn" + celebration
6. Arrange words wrong, click "Kiểm tra"
7. EXPECT: Highlight misplaced words + allow rearrangement
```

**Validates**: FR-011, FR-012, FR-015

### Scenario 8: Responsive & Cross-Browser

**Purpose**: Verify responsive layout and browser compatibility.

```text
1. Open homepage at 360px width (mobile)
2. EXPECT: Single column, all cards visible, text readable, buttons tappable
3. Open at 768px width (tablet)
4. EXPECT: 2-column grid, comfortable spacing
5. Open at 1024px+ (desktop)
6. EXPECT: 3-column grid, generous whitespace
7. Open any game in Chrome, then Safari, then Edge
8. EXPECT: All games work, pronunciation works in all three
9. Open game in browser without Web Speech API
10. EXPECT: Banner suggesting Chrome/Edge/Safari
11. Resize to below 320px
12. EXPECT: Suggestion to rotate device or use larger screen
```

**Validates**: FR-014, FR-018, SC-004, SC-005

### Scenario 9: Performance

**Purpose**: Verify load times meet success criteria.

```text
1. Run Lighthouse audit on homepage
2. EXPECT: Performance score ≥ 90
3. Simulate 3G connection, load any game page
4. EXPECT: Page interactive within 3 seconds (SC-002)
5. Navigate between games
6. EXPECT: Each navigation completes within 1 second
```

**Validates**: SC-002, SC-004

## Running Tests

```bash
# Unit & component tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npx tsc --noEmit
```
