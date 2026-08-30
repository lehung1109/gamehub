# Quickstart: Validation Guide for Longer Sentences

This guide covers how to validate that the expanded sentence sorting data has been successfully integrated and meets all criteria.

## Prerequisites

- Node.js installed
- Dependencies installed (`npm install`)

## 1. Static Validation (Unit Tests)

Before running the app, we validate that the data strictly conforms to the requirements without regressions.

1. Ensure a unit test exists (e.g., `tests/data/sentences.test.ts`) that asserts:
   - There are exactly 50 sentences.
   - Every sentence has between 10 and 12 words.
2. Run the unit test suite:
   ```bash
   npm run test:run
   ```
3. **Expected Outcome**: The tests pass with zero failures.

## 2. Visual Validation (UI Run)

Start the development server to verify the sentences render correctly without layout breakage on longer lengths.

1. Start the server:
   ```bash
   npm run dev
   ```
2. Navigate to the sentence sorting game route (e.g., `/games/sentence-sorting` or equivalent route for this feature).
3. Play a few rounds.
4. **Expected Outcome**: 
   - The scrambled tiles contain 10-12 words.
   - The layout wraps nicely on smaller screens (use browser dev tools to test responsive design).
   - Emojis, translations, and categories display properly.
