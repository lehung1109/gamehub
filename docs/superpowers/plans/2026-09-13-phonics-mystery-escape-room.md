# Implementation Plan: Phase 24 - Phonics Mystery Escape Room & Detective Quest

**Target Milestone**: Phase 24  
**Feature Branch**: `feat/phase-24-phonics-mystery-escape-room`  
**Route**: `/escape-room` and `/escape-room/[roomId]`

---

## 1. Architecture & File Breakdown

1. **Contracts & Types**:
   - `src/types/phonics-escape-room.ts`:
     - `EscapeRoomTheme`: `'pyramid' | 'library' | 'space-lab'`
     - `EscapeClueHotspot`: Hot-spot metadata, position, riddle, options, correct answer, unlocked letter.
     - `EscapeRoom`: Room details, clues, master cipher password, duration seconds.
     - `EscapeResult`: Keys earned (1–3), time spent, clues solved, EXP.
   - `tests/unit/types/phonics-escape-room-types.test.ts`: Type contracts and assertion tests.

2. **Curated Rooms Data & Pure Engine**:
   - `src/data/escape-room/rooms.ts`: 3 curated rooms (`pharaoh-tomb`, `haunted-library`, `space-station`).
   - `src/lib/phonics-escape-room-engine.ts`:
     - `getAllEscapeRooms()`
     - `getEscapeRoomById(id: string)`
     - `validateClueAnswer(hotspot, answerId)`
     - `validateMasterCode(room, enteredCode)`
     - `calculateEscapeScore(roomId, cluesSolved, totalClues, remainingSeconds, totalSeconds)`
   - `tests/unit/lib/phonics-escape-room-engine.test.ts`: Comprehensive pure function tests.

3. **Server Actions**:
   - `src/app/actions/phonics-escape-room.ts`:
     - `getEscapeRoomAction(roomId)`
     - `submitEscapeScoreAction(result)`
   - `tests/unit/actions/phonics-escape-room.test.ts`: Server action tests.

4. **UI Components**:
   - `src/components/escape-room/EscapeClueModal.tsx`: Hot-spot clue inspection and phonics riddle answering.
   - `src/components/escape-room/EscapeCipherKeypad.tsx`: Master cipher door lock keypad.
   - `src/components/escape-room/EscapeRoomPlayer.tsx`: Main game screen with room background, hot-spots, timer, clue notebook, cipher lock trigger.
   - `src/components/escape-room/EscapeCertificateModal.tsx`: Victory certificate with Golden Skeleton Keys 🗝️ and EXP.
   - `src/components/escape-room/PhonicsEscapeRoomHub.tsx`: Hub listing 3 escape rooms with difficulty, theme, and entry buttons.
   - `tests/components/escape-room/EscapeRoomPlayer.test.tsx`: Component tests.

5. **Page Routes & Homepage Integration**:
   - `src/app/escape-room/page.tsx`: Hub route with metadata.
   - `src/app/escape-room/[roomId]/page.tsx`: Dynamic SSG route with `generateStaticParams()`.
   - `src/app/page.tsx`: Add `🔍 Thoát Hiểm` link to top navigation bar.
   - `tests/app/escape-room/page.test.tsx` & `tests/app/page.test.tsx`.

6. **Playwright E2E Integration**:
   - `tests/e2e/phonics-mystery-escape-room.spec.ts`: E2E test verifying navigation, clue investigation, cipher unlocking, certificate display, and strict typography ($\ge 16$px).

7. **Quality Gate & Merge**:
   - TypeScript 5 strict check, ESLint clean check, full Vitest suite passing, Next.js Turbopack production build, merge into `main`, and push to `origin/main`.

---

## 2. Execution Tasks

- [ ] **Task 1: TypeScript Contracts**
- [ ] **Task 2: Curated Rooms & Engine Functions**
- [ ] **Task 3: Server Actions**
- [ ] **Task 4: UI Components & Unit Tests**
- [ ] **Task 5: Route Pages & Homepage Integration**
- [ ] **Task 6: Playwright E2E Integration**
- [ ] **Task 7: Quality Gate & Merge into `main`**
