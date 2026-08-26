# Quickstart Validation Guide

This guide outlines how to validate the Quiz Back Navigation feature end-to-end.

## Prerequisites

- Node.js and npm installed.
- Development server running (`npm run dev`).

## Validation Scenario 1: Standard Navigation

1. Open the listening game route, e.g., `/games/listening` (or any other game using `QuizEngine`).
2. Observe the first question. Note that the "Back" button should not be present or disabled.
3. Select an answer for the first question.
4. When you auto-advance to the second question, verify that the "Back" button is now visible.
5. Click the "Back" button.
6. Verify you are back to question 1, and your previously selected answer is highlighted.

## Validation Scenario 2: Score Update on Change

1. Play through a few questions. Answer question 1 **incorrectly**.
2. Click "Back" until you are at question 1.
3. Change your answer to the **correct** option.
4. Complete the rest of the quiz.
5. Verify on the completion screen that your final score includes the point for question 1 (score is correct).

## Verification Commands

Run the unit tests to ensure `QuizEngine` logic is sound:
```bash
npm run test:run -- QuizEngine.test.tsx
```

Run E2E tests to ensure user flows in games are intact:
```bash
npm run test:e2e
```
