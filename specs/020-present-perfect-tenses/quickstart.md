# Quickstart: Validation Guide for Present Perfect Tenses

This guide explains how to validate that the new Present Perfect and Present Perfect Continuous tenses have been successfully integrated into the application.

## Prerequisites
- Node.js (v18+)
- Local development server running

## Setup

1. Check out the feature branch: `git checkout 020-present-perfect-tenses`
2. Install dependencies (if needed): `npm install`
3. Start the application: `npm run dev`

## Validation Scenarios

### Scenario 1: Tense Hub Map Integration
1. Open the browser and navigate to `http://localhost:3000/` (or your local port).
2. Enter the Tense Hub map (usually `/tenses`).
3. Locate the "Present Perfect" and "Present Perfect Continuous" nodes.
4. **Expected Outcome**: The nodes should be visually active, no longer displaying a "coming soon" lock. You should be able to click on them to enter the lesson.

### Scenario 2: Data Loading & UI Rendering
1. Click on the "Present Perfect" node to enter its lesson page.
2. Check the "Lý thuyết" (Quick Rules) tab.
3. **Expected Outcome**: The grammar rules, formulas, and workplace tips for Present Perfect are displayed without rendering errors.

### Scenario 3: Play Challenges
1. Switch to the "Thử thách" (Challenges) tab for the Present Perfect tense.
2. Click on "Conjugation" (Chia động từ).
3. Complete a few questions.
4. **Expected Outcome**: Questions are loaded properly in the IT/Workplace context. Submitting an answer evaluates correctness correctly and shows explanations.

*(Repeat Scenario 2 and 3 for Present Perfect Continuous)*

## Testing

Run unit and integration tests to ensure data schema compatibility:
```bash
npm run test:run
```
*(No specific new test files are required, but existing validation tests for `src/data/tenses` should parse the new JSON files successfully).*
