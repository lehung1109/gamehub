# Phase 13 Implementation Plan: Live Classroom Multiplayer Arena Mode (Kahoot-Style Party Arena)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, real-time Live Classroom Multiplayer Arena ("Kahoot Party Mode") featuring dynamic SVG QR code joining, zero-dependency procedural Web Audio sound synthesis, polymorphic question formats (4-Color Multiple Choice, 2-Color True/False, Phonics Audio), live host response histograms, and 1-click Post-Game Mistake Notebook SRS synchronization.

**Architecture:** Teacher projector screen (`/admin/arena/[arenaId]`) coordinates room state via hybrid Supabase Realtime Broadcast channels (`arena:{pin}`) with automated 2.5s HTTP polling fallback. Zero-dependency procedural Web Audio synthesizes countdowns and fanfares. Student mobile clients (`/arena/[pin]`) interact via tactile color tiles with haptic vibration and speed decay scoring. Post-match analytics compute high-error questions ($>40\%$ error) and export them directly to the Mistake Notebook for Spaced Repetition reinforcement.

**Tech Stack:** Next.js 16.3.5, React 19, TypeScript 5 (strict, zero `any`), Tailwind CSS v4, Supabase Realtime & PostgreSQL, Native Web Audio API, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-live-classroom-multiplayer-arena-design.md`

## Global Constraints

- Strict kid-friendly typography policy: minimum 16px font size (strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- TypeScript 5 strict mode, zero `any`.
- Next.js 16.3.5 + React 19 standards (no synchronous `setState` inside `useEffect` bodies).
- Zero external audio file dependencies (100% procedural Web Audio synthesis).
- Realtime hybrid synchronization with resilient HTTP polling fallback.

---

### Task 1: TypeScript Contracts & Question Polymorphism

**Files:**
- Modify: `src/types/arena.ts`
- Test: `tests/unit/types/arena-types.test.ts`

**Interfaces:**
- Produces:
  - `ArenaQuestionType = 'multiple_choice' | 'true_false' | 'phonics_audio'`
  - `ArenaQuestion` extended with `questionType?: ArenaQuestionType`, `audioPromptUrl?: string`, `pointsMultiplier?: number`
  - `ArenaRealtimeEvent` union for broadcast synchronization
  - `ArenaSoundConfig` interface for audio settings
  - `HardQuestionSummary` interface for SRS export

- [ ] **Step 1: Write failing unit tests for arena types and contracts**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Update `src/types/arena.ts` with polymorphic types and event definitions**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 2: Web Audio Procedural Sound Engine

**Files:**
- Create: `src/lib/arena/sound-engine.ts`
- Test: `tests/unit/lib/arena-sound-engine.test.ts`

**Interfaces:**
- Produces:
  - `class ArenaSoundEngine`:
    - `static getInstance(): ArenaSoundEngine`
    - `init(): void`
    - `playLobbyGroove(): void`
    - `stopLobbyGroove(): void`
    - `playCountdownTension(secondsRemaining: number): void`
    - `playAnswerSubmitChime(): void`
    - `playRevealDrumroll(): void`
    - `playPodiumCelebration(): void`
    - `setMuted(muted: boolean): void`
    - `isMuted(): boolean`
    - `setVolume(volume: number): void`
    - `isSupported(): boolean`

- [ ] **Step 1: Write failing unit tests for `ArenaSoundEngine`**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement procedural tone generation in `src/lib/arena/sound-engine.ts`**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 3: Dynamic SVG QR Code Generator

**Files:**
- Create: `src/lib/arena/qr-generator.ts`
- Test: `tests/unit/lib/arena-qr-generator.test.ts`

**Interfaces:**
- Produces:
  - `generateArenaQrSvg(text: string, options?: { size?: number; margin?: number }): string`

- [ ] **Step 1: Write failing unit tests for SVG QR generation**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement pure SVG QR code generator in `src/lib/arena/qr-generator.ts`**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 4: Realtime Broadcast Channel Hook & Fallback

**Files:**
- Create: `src/hooks/useArenaRealtime.ts`
- Test: `tests/unit/hooks/useArenaRealtime.test.ts`

**Interfaces:**
- Produces:
  - `function useArenaRealtime(pinCode: string, onEvent: (event: ArenaRealtimeEvent) => void): { isConnected: boolean; isFallback: boolean; broadcastEvent: (event: ArenaRealtimeEvent) => Promise<void> }`

- [ ] **Step 1: Write failing unit tests for `useArenaRealtime`**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement `useArenaRealtime` with Supabase channel & polling fallback**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 5: Server Actions & Mistake Notebook SRS Sync

**Files:**
- Modify: `src/app/actions/arena.ts`
- Test: `tests/unit/actions/arena-actions.test.ts`

**Interfaces:**
- Produces:
  - `exportHardQuestionsToMistakeNotebookAction(arenaId: string): Promise<ActionResponse<{ exportedCount: number; questions: ArenaQuestion[] }>>`
  - `kickParticipantAction(arenaId: string, studentName: string): Promise<ActionResponse<void>>`

- [ ] **Step 1: Write failing unit tests for SRS export and kick participant actions**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement actions in `src/app/actions/arena.ts`**
- [ ] **Step 4: Verify unit tests pass**
- [ ] **Step 5: Commit changes**

---

### Task 6: Projector Host Screen Upgrades

**Files:**
- Modify: `src/components/admin/arena/TeacherArenaHost.tsx`
- Modify: `src/components/admin/arena/ArenaPodium.tsx`
- Test: `tests/components/arena/TeacherArenaHost.test.tsx`

**Deliverables:**
- Dynamic SVG QR code rendered on lobby screen for instant join.
- Fullscreen projector toggle.
- Web Audio procedural sound controls (mute toggle).
- Real-time answer distribution histogram during round and reveal.
- Kick disruptive student button.
- 1-Click "Lưu câu hỏi khó vào Sổ tay từ khó (SRS)" on the podium screen.
- Strict $\ge 16$px typography across all screens (0 occurrences of `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).

- [ ] **Step 1: Write failing component tests for `TeacherArenaHost`**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Update `TeacherArenaHost.tsx` and `ArenaPodium.tsx`**
- [ ] **Step 4: Verify component tests pass and verify strict typography**
- [ ] **Step 5: Commit changes**

---

### Task 7: Student Controller Client Upgrades

**Files:**
- Modify: `src/components/arena/StudentArenaPlay.tsx`
- Modify: `src/components/arena/ArenaJoinForm.tsx`
- Test: `tests/components/arena/StudentArenaPlay.test.tsx`

**Deliverables:**
- 4-Color Multiple Choice tiles with large tactile touch areas.
- 2-Color True/False mode (True = Blue Diamond, False = Red Triangle).
- Phonics Audio prompt icon and replay button.
- Haptic vibration feedback on tap (`navigator.vibrate([40, 30, 40])`).
- Web Audio chime on answer submission.
- Speed decay points display and streak multiplier badge.
- Strict $\ge 16$px typography across all student views.

- [ ] **Step 1: Write failing component tests for `StudentArenaPlay`**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Update `StudentArenaPlay.tsx` and `ArenaJoinForm.tsx`**
- [ ] **Step 4: Verify component tests pass and verify strict typography**
- [ ] **Step 5: Commit changes**

---

### Task 8: Playwright End-to-End Verification

**Files:**
- Create: `tests/e2e/live-classroom-multiplayer-arena.spec.ts`

**Deliverables:**
- E2E flow testing host creation, QR code visibility, student joining via PIN, round answering, live histogram updates, reveal, and podium celebration.
- Automated typography test asserting 0 instances of `text-xs`, `text-sm` in rendered arena screens.

- [ ] **Step 1: Write E2E test suite in `tests/e2e/live-classroom-multiplayer-arena.spec.ts`**
- [ ] **Step 2: Run Playwright test suite**
- [ ] **Step 3: Commit changes**

---

### Task 9: Quality Gate Verification, PR & Merge

**Steps:**
- [ ] **Step 1: Run full TypeScript check (`npx tsc --noEmit`)**
- [ ] **Step 2: Run ESLint (`npm run lint`)**
- [ ] **Step 3: Run all Vitest unit and component tests (`npm run test:run`)**
- [ ] **Step 4: Run production build (`npm run build`)**
- [ ] **Step 5: Push branch to GitHub, open PR, and squash-merge into `main`**
