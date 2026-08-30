# Quickstart & Validation Guide: Complete Past Tenses

This guide provides steps to validate that the new Past Tense data files are correctly integrated and function end-to-end.

## Prerequisites

- Node.js installed and dependencies installed (`npm install`).
- Application running locally (`npm run dev`).

## Validation Scenarios

### 1. Schema Validation (Automated)

Validate that the new JSON files strictly conform to the expected schema and types without missing arrays or properties.

**Setup/Execution**:
```bash
# Run the unit/schema tests
npm run test:run
```

**Expected Outcome**:
All tests should pass, including tests specifically asserting the structure of `past-simple.json`, `past-continuous.json`, `past-perfect.json`, and `past-perfect-continuous.json`.

### 2. Tense Hub Map Activation (Manual E2E)

Verify that the past tenses are accessible to the user.

**Setup/Execution**:
1. Open the application in a browser (typically `http://localhost:3000`).
2. Navigate to the "Tense Hub" map.
3. Locate the nodes for "Past Simple", "Past Continuous", "Past Perfect", and "Past Perfect Continuous".

**Expected Outcome**:
The nodes for all four past tenses should be active and clickable (not labeled as "coming soon").

### 3. Gameplay & Content Validation (Manual E2E)

Verify that the lessons load and contain the correct context.

**Setup/Execution**:
1. Click on one of the newly activated past tense nodes (e.g., "Past Simple").
2. Start the practice lesson.
3. Play through a few challenges.

**Expected Outcome**:
The challenges should load successfully without errors. The questions, sentences, and explanations should clearly reflect an IT/Workplace context (e.g., deploying servers, writing code, attending standups) in the past tense.
