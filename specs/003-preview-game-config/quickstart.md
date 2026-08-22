# Quickstart: Preview Game Configuration

**Feature**: 003-preview-game-config | **Date**: 2026-08-22

## Prerequisites

- Node.js 18+ installed
- GameHub project dependencies installed (`npm install`)
- Supabase project running (local or remote) with `.env.local` configured
- At least one admin account created

## Setup

```bash
# Start development server
npm run dev
```

Navigate to `http://localhost:3000/login` and sign in as admin.

## Validation Scenarios

### Scenario 1: Preview New Config (US1 — Create Flow)

**Steps**:

1. Navigate to `/admin/configs/new` and select "Flashcard" game
2. Fill in config name: "Test Flashcard Preview"
3. In settings, select only "Animals" topic and set word limit to 3
4. Click the **"Chơi thử"** button (next to "Lưu cấu hình")

**Expected**:
- A new browser tab opens at `/games/flashcard?preview=<encoded-settings>`
- The flashcard topic picker shows only the "Animals" topic
- An amber banner is visible: "⚠️ Chế độ xem trước — Cấu hình chưa được lưu"
- The original config form tab still has all settings intact

**Verification**:
- Confirm the URL contains a `preview=` parameter (not `config=`)
- Confirm no new record in `game_configs` table (check Supabase dashboard)
- Confirm the banner uses amber/orange styling (distinct from the indigo ConfigBanner)

---

### Scenario 2: Preview Edited Config (US2 — Edit Flow)

**Steps**:

1. Navigate to `/admin/dashboard` and click on an existing flashcard config
2. Change the word limit from its current value to 2
3. Click the **"Chơi thử"** button

**Expected**:
- A new tab opens showing the flashcard game with the modified word limit of 2
- The preview banner is displayed
- Return to the edit form — the word limit field still shows 2 (unsaved change preserved)

**Verification**:
- Click "Chơi thử" multiple times — each tab independently reflects the settings at the time of click
- Closing the edit form tab does not affect any preview tabs

---

### Scenario 3: Preview Banner Distinction (US3)

**Steps**:

1. Open a game with a **saved config**: `/games/flashcard?config=<existing-config-id>`
2. Note the banner appearance
3. Open a game in **preview mode**: `/games/flashcard?preview=<encoded-settings>`
4. Note the banner appearance

**Expected**:
- Saved config: shows the **indigo** ConfigBanner with "Bài học tùy chỉnh: <config name>"
- Preview mode: shows the **amber** PreviewBanner with "⚠️ Chế độ xem trước — Cấu hình chưa được lưu"
- The banners are visually distinct and immediately distinguishable

---

### Scenario 4: Validation Before Preview (US4)

**Steps**:

1. Navigate to `/admin/configs/new` and select "Numbers & Colors" game
2. Set number range min to 15, max to 5 (invalid: min > max)
3. Click the **"Chơi thử"** button

**Expected**:
- No new tab opens
- Validation error is displayed on the form
- The settings are **not** encoded (validation blocks before encoding)

---

### Scenario 5: All 6 Games Preview (SC-002)

Repeat Scenario 1 for each game type to verify universal support:

| Game | Route | Settings to Test |
|------|-------|-----------------|
| Flashcard | `/games/flashcard` | topics: ["animals"], wordLimit: 3 |
| Alphabet | `/games/alphabet` | letterRange: ["A","B","C"], mode: "quiz" |
| Listening | `/games/listening` | topics: ["fruits"], questionCount: 5 |
| Spelling | `/games/spelling` | topics: ["family"], wordLimit: 4 |
| Numbers & Colors | `/games/numbers-colors` | numberRange: [1,10], mode: "quiz" |
| Sentences | `/games/sentences` | categories: ["greeting"], sentenceCount: 3 |

**Expected**: Each game loads with preview settings applied and preview banner displayed.

## Automated Test Commands

```bash
# Run unit tests (includes preview encode/decode, hook, component tests)
npm run test:run

# Run E2E tests (includes preview flow tests)
npm run test:e2e
```

## Key Things NOT Included Here

- Full implementation code for components, hooks, and utilities → see `tasks.md`
- Database migrations → none needed (preview is stateless)
- Complete test suites → test files are part of implementation tasks
- Component styling details → see [contracts/preview-api.md](contracts/preview-api.md) for interface contracts
