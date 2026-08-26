# Quickstart & Validation Guide

This guide outlines how to validate the newly implemented Chặng 4 (DevOps Challenge Stage).

## Prerequisites
- Local development server running (`npm run dev`)
- Node.js & npm installed

## 1. Validating UI Rendering & Mixed Question Flow
1. Navigate to the grammar lesson page (e.g., `http://localhost:3000/tenses/present-simple`).
2. Verify that **"Chặng 4: Thử thách IT & DevOps"** is visible on the "Practice" tab.
3. Click to start **Chặng 4**.
4. **Expected Outcome**:
   - The UI correctly displays the first question.
   - Upon submission, the UI seamlessly transitions to the next question, automatically adapting the interactive components based on whether the next question is a Conjugation, Error Hunting, or Sentence Building task.
   - The stage completes after 6 questions.

## 2. Validating Backward Compatibility & LocalStorage
1. Temporarily remove or rename the `devOpsChallenge` array in `src/data/tenses/present-simple.json`.
2. Reload the page.
3. **Expected Outcome**: Chặng 4 is hidden completely. No errors occur.
4. Restore the `devOpsChallenge` array.
5. Create a fake old `gamehub_tense_progress_v1` in `localStorage` containing only scores for conjugation, errorHunting, and sentenceBuilding.
6. Reload the page and complete Chặng 4.
7. **Expected Outcome**: The total score is accurately aggregated. The app does not crash when parsing the old progress data, and simply appends `devOpsChallenge` scores.

## 3. Validating Reusability (Regression Testing)
1. Navigate to Chặng 1, Chặng 2, and Chặng 3 and complete 1 question in each.
2. **Expected Outcome**: The individual stages behave exactly as they did before the refactoring. Styles, animations, and interactions (like drag-and-drop or typing) are fully functional.

## 4. Run Automated Tests
1. Run `npm run test:run` to verify unit tests for `storage.ts` logic.
2. Run `npm run test:e2e` to verify Playwright E2E tests still pass, meaning no regressions in previous UI components.
