# Quickstart Validation Guide

This guide describes how to validate the "Complete Present Simple" randomization and expansion feature.

## Prerequisites

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Navigate to the Present Simple module: `http://localhost:3000/learn/present-simple`

## Scenario 1: Randomization and Session Stability

**Goal**: Verify that each run uses a different subset, but reloads don't break the current session.

1. Open the **Conjugation** stage (Chặng 1).
2. Note the first 2-3 questions.
3. Refresh the page (F5).
4. **Expected**: The same 2-3 questions appear in the same order.
5. Complete the stage (8 questions).
6. Return to the module hub and click the **Conjugation** stage again to start a new session.
7. **Expected**: A new set of 8 questions is displayed, different from the previous run.

*Repeat for Error Hunting (6 questions) and Sentence Building (6 questions).*

## Scenario 2: Question Bank Expansion Coverage

**Goal**: Verify the new content is present and valid.

1. Open `src/data/tenses/present-simple.json`.
2. **Expected**:
   - `challenges.conjugation` has $\ge$ 15 items.
   - `challenges.errorHunting` has $\ge$ 12 items.
   - `challenges.sentenceBuilding` has $\ge$ 12 items.
3. Check the `challengeCount` at the top of the file.
4. **Expected**: `challengeCount` is exactly `20`.

## Scenario 3: Progress Consistency

**Goal**: Verify that completing the module correctly updates the progress out of 20.

1. Clear `localStorage` and `sessionStorage` in DevTools.
2. Complete all 3 stages of Present Simple, answering all questions correctly.
3. Go to the dashboard/hub.
4. **Expected**: The progress shows 100% (20/20 questions).

## Scenario 4: Automated Tests

**Goal**: Verify logic with unit and E2E tests.

1. Run unit tests: `npm run test:run`
2. **Expected**: All tests pass, including new tests for the shuffle utility and hook/session logic.
3. Run E2E tests: `npm run test:e2e`
4. **Expected**: All existing flows pass with the new randomized setup.
