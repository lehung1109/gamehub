# Quickstart Validation Guide

This guide details how to validate the Future Tenses feature implementation.

## Prerequisites
- Node.js installed
- Dependencies installed (`npm install`)

## Setup

Start the local development server:
```bash
npm run dev
```

## Validation Scenarios

### Scenario 1: Verify UI Activation
1. Navigate to `http://localhost:3000/tenses`
2. Scroll to the "Future" (Tương lai) section.
3. Verify that the following 4 cards do NOT have a "coming soon" lock icon and are clickable:
   - Future Simple
   - Future Continuous
   - Future Perfect
   - Future Perfect Continuous

### Scenario 2: Verify Content Loading
1. Click on the "Future Simple" card.
2. Verify you are redirected to `http://localhost:3000/tenses/future-simple`.
3. Verify the "Quy tắc cốt lõi" (Quick Rules) tab displays the grammatical structure and workplace tips correctly without any rendering errors.
4. Switch to the "Luyện tập" (Practice/Challenges) tab.
5. Answer a few questions and verify the logic works (meaning the JSON `challenges` array was parsed correctly).
6. Repeat for the other 3 future tenses.

## Automated Verification

Run the existing E2E tests to ensure nothing was broken and that the future tenses integrate correctly if covered by E2E:
```bash
npm run test:e2e
```
