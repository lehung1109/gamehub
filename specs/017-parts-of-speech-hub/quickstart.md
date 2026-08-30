# Quickstart & Validation Guide

This guide details how to run and validate the Parts of Speech Hub feature locally.

## Prerequisites
- Node.js (v20+)
- npm installed
- Project dependencies installed (`npm install`)

## Setup
1. Ensure you are on the `017-parts-of-speech-hub` branch (or the worktree for this feature).
2. Start the local development server:
   ```bash
   npm run dev
   ```

## Validation Scenarios

### 1. Hub Navigation
**Action**: Open browser and navigate to `http://localhost:3000/parts-of-speech`
**Expected Outcome**: 
- You should see the Parts of Speech Hub page.
- The page should list at least the "Danh từ (Noun)" lesson as active, and others as "Coming Soon".

### 2. Lesson Rendering
**Action**: Click on the "Danh từ (Noun)" lesson card.
**Expected Outcome**: 
- You are navigated to `/parts-of-speech/noun`.
- The Quick Rules/Grammar summary is displayed.
- A "Start Practice" button is visible.

### 3. Stage 1: Word Family
**Action**: Click "Start Practice".
**Expected Outcome**: 
- You enter the Word Family stage.
- You can interact with the options (drag-and-drop or selection) to form the correct word.
- Submitting the correct answer advances to the next question.
- Finishing all questions shows the stage score and transitions to Stage 2.

### 4. Stage 2 & 3: Fill-in Blank & Error Hunting
**Action**: Continue through Stage 2 (Fill-in Blank) and Stage 3 (Error Hunting).
**Expected Outcome**: 
- The UI correctly presents the context emails/sentences.
- Selecting the correct word form or hunting the wrong token works.
- Explanations are shown after each answer.

### 5. Progress Persistence
**Action**: Complete the lesson, return to the Hub (`/parts-of-speech`), and refresh the page.
**Expected Outcome**: 
- The "Danh từ (Noun)" lesson card should display your score/progress.
- The progress is loaded from `localStorage`.

## Automated Testing
Run the following commands to verify tests pass:
```bash
# Run unit tests
npm run test:run

# Run E2E tests (Playwright)
npm run test:e2e
```
