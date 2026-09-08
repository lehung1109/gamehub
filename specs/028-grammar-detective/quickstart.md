# Quickstart & Verification Guide: Grammar Detective

**Feature**: `028-grammar-detective`
**Branch**: `028-grammar-detective`
**Status**: Ready for Verification

---

## 1. Prerequisites

- Node.js 20+ and npm installed
- Next.js development server running on port 3000 (`npm run dev`)
- Vitest for unit tests (`npm run test:run`)
- Playwright for end-to-end browser tests (`npm run test:e2e`)

---

## 2. Validation Scenarios

### Scenario A: Unit Test Suite Verification
Verify the core business logic, tokenizer, credibility deductions, and state machine transitions.

```bash
# Run unit tests specifically for Grammar Detective
npx vitest run src/app/games/grammar-detective/__tests__/
```

**Expected Outcome**:
- `tokenizer.test.ts`: Passes all tests verifying token slicing, whitespace preservation, and error mapping.
- `useGrammarDetective.test.ts`: Passes all tests verifying state transitions (`investigating` -> `deducing` -> `solved`), credibility reduction on wrong answers, and rank unlocking.

---

### Scenario B: Manual Browser Walkthrough (Detective Desk)
1. Open browser to `http://localhost:3000/games/grammar-detective`.
2. Observe the **Dossier Menu**:
   - Verify categories (Email, Incident, Chat, Social) and rank tiers (Intern, Junior, Senior, Chief).
   - Select the first Intern case: *"Urgent Release Deployment"*.
3. On the **Detective Desk**:
   - Verify the case document appears styled as an authentic email/document card.
   - Click the **Highlighter** tool button (turns bright yellow/neon).
   - Tap an innocent word: observe credibility drops by 1 (3 -> 2) and a non-blocking toast displays.
   - Tap the erroneous word (e.g. *"deploy"*): verify the **Deduction Card** modal opens immediately.
   - Listen to sentence audio with speaker button.
   - Select the correct option: verify the word updates in the document to *"deployed"*, the explanation shows in English & Vietnamese, and the solved counter increments.
   - Resolve remaining errors: verify the **Case Solved** modal appears with 2-3 stars, elapsed time, and confetti/sound fanfare.

---

### Scenario C: Playwright E2E Test Run
Verify end-to-end regression across desktop and mobile viewports.

```bash
# Run Playwright test for grammar detective
npx playwright test tests/grammar-detective.spec.ts
```

**Expected Outcome**:
- Completes automated user journey: navigate to page, select case, toggle highlighter, click error token, pick correct option, verify solved dialog.
- Mobile viewport test passes without triggering unwanted text selection menus.
