# Implementation Plan: Phase 20 - Student Learning Passport, Audio-Visual Portfolio & Digital Graduation Ceremony

**Target Milestone**: Phase 20  
**Branch**: `feat/phase-20-student-learning-passport-portfolio`  
**Specification**: `docs/superpowers/specs/2026-09-13-student-learning-passport-portfolio-design.md`  

---

## Proposed Tasks

### Task 1: TypeScript Contracts & Data Models
- **Files**:
  - `src/types/passport.ts`
  - `tests/unit/types/passport-types.test.ts`
- **Details**:
  - Define `StampCategory`, `PassportStamp`, `VoicePortfolioItem`, `GraduationCertificate`, `StudentPassport`.
  - Validate stamp categories, unlocking rules, and graduation data model.
- **Verification**: `npm run test:run tests/unit/types/passport-types.test.ts`

### Task 2: Starter Passport Data & Pure Passport Engine
- **Files**:
  - `src/data/passport/sample-passport.ts`
  - `src/lib/passport-engine.ts`
  - `tests/unit/lib/passport-engine.test.ts`
- **Details**:
  - Starter collection of 6 stamps (Mini-Game Master, AI Speaking Prodigy, Comic Voice-Actor, Phonics Singer, Clan Boss Slayer, Daily Streak Champion).
  - Pure functions: `getStarterStamps()`, `calculatePassportCompletion()`, `evaluateNewStamps()`, `createGraduationCertificate()`.
- **Verification**: `npm run test:run tests/unit/lib/passport-engine.test.ts`

### Task 3: Server Actions for Passport & Graduation
- **Files**:
  - `src/app/actions/passport.ts`
  - `tests/unit/actions/passport.test.ts`
- **Details**:
  - `getStudentPassportAction(studentId: string)`
  - `claimPassportStampAction(studentId: string, stampId: string)`
  - `triggerGraduationAction(studentId: string, studentName: string)`
  - `getSharedPassportAction(shareToken: string)`
- **Verification**: `npm run test:run tests/unit/actions/passport.test.ts`

### Task 4: Passport Components (StampBook, VoicePortfolioPlayer, GraduationModal)
- **Files**:
  - `src/components/passport/PassportStampBook.tsx`
  - `src/components/passport/VoicePortfolioPlayer.tsx`
  - `src/components/passport/DigitalGraduationModal.tsx`
  - `src/components/passport/PassportHub.tsx`
  - `tests/components/passport/PassportHub.test.tsx`
- **Details**:
  - Interactive booklet visual layout with golden unlocked stamps.
  - Voice recording player with speech replay and accuracy badge.
  - Graduation modal with celebration confetti and printable certificate.
  - Strict kid-friendly typography ($\ge 16$px).
- **Verification**: `npm run test:run tests/components/passport/PassportHub.test.tsx`

### Task 5: Passport Routes & Homepage Integration
- **Files**:
  - `src/app/passport/page.tsx`
  - `src/app/passport/[shareToken]/page.tsx`
  - `src/app/page.tsx`
  - `tests/app/page.test.tsx`
- **Details**:
  - Student learning passport hub route.
  - Public shareable showcase route with `generateStaticParams()`.
  - Homepage topbar navigation link **🎓 Hộ chiếu**.
- **Verification**: `npm run test:run tests/app/page.test.tsx`

### Task 6: Playwright E2E Integration & Strict Typography Audit
- **Files**:
  - `tests/e2e/student-learning-passport.spec.ts`
- **Details**:
  - E2E flow: Navigate to `/passport`, view stamp book, play voice portfolio clip, trigger digital graduation ceremony, verify typography ($\ge 16$px).
- **Verification**: `npx playwright test tests/e2e/student-learning-passport.spec.ts`

### Task 7: Whole-Branch Quality Gate, Pull Request & Merge
- **Commands**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - `git push -u origin feat/phase-20-student-learning-passport-portfolio`
  - Squash merge into `main` and clean working tree.
