# Quickstart: Present Continuous Tense Validation

This guide explains how to validate the Present Continuous tense data integration.

## Prerequisites
*   Node.js and npm installed.
*   Dependencies installed (`npm install`).

## Validation Scenarios

### Scenario 1: Automated Data Validation
Verify that the new data matches the required schema using the unit tests.

1. **Run Unit Tests**:
   ```bash
   npm run test:run
   ```
2. **Expected Outcome**: All tests pass, specifically any tests asserting the schema of `src/data/tenses/index.json` and `src/data/tenses/present-continuous.json`.

### Scenario 2: UI Visual Verification
Verify that the UI correctly parses and renders the new active tense.

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
2. **Navigate to Tenses Hub**: Open `http://localhost:3000/tenses` (or the equivalent route in the app).
   *   **Expected**: "Present Continuous" is listed without the "Coming Soon" badge, and is clickable.
3. **Navigate to Present Continuous Page**: Click on "Present Continuous".
   *   **Expected**: The page loads successfully. Quick Rules (To Be + V-ing) are rendered correctly.
4. **Play Challenges**: Start the challenges for the tense.
   *   **Expected**: The first challenge loads. Answering questions provides correct feedback based on the JSON configuration.
