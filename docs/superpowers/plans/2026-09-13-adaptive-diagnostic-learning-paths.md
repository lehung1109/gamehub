# Phase 15: Adaptive Diagnostic Knowledge Graph & Differentiated Learning Pathways Implementation Plan

## Overview
Implement the Adaptive Diagnostic Knowledge Graph, Dynamic Difficulty Adjustment (DDA) engine, student Daily 3-Step Power Pack, and teacher Class Diagnostic Heatmap with strict TypeScript 5, Kid-Friendly Typography ($\ge 16$px), and zero regressions.

---

## Tasks

### Task 1: TypeScript Contracts & Adaptive Learning Types
- Files:
  - `src/types/adaptive-learning.ts`
  - `tests/unit/types/adaptive-learning-types.test.ts`
- Scope:
  - Define `SkillDomain` (`'phonics' | 'vocabulary' | 'grammar' | 'listening'`).
  - Define `CefrLevel` (`'Pre-A1' | 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2'`).
  - Define `SkillNode` (id, domain, nameVi, descriptionVi, targetGameId, defaultThreshold).
  - Define `StudentSkillMastery` (skillId, score, accuracyPercentage, totalAttempts, lastPracticedAt).
  - Define `StudentDiagnosticProfile` (studentId, studentName, domainScores, weakNodes, strongNodes, estimatedCefrLevel, ddaMultiplier).
  - Define `AdaptiveDailyPackStep` (stepNumber, titleVi, descriptionVi, gameType, targetUrl, targetTopic, isCompleted).
  - Define `AdaptiveDailyPlan` (id, date, studentId, steps, totalExpReward, isFullyCompleted).
  - Define `ClassDiagnosticSummary` (classId, className, studentCount, domainAverages, weakSkillFrequency, studentRows).
- Verification: Vitest unit tests verifying type consistency and valid structures.

### Task 2: Adaptive Diagnostic Engine & DDA Calculator
- Files:
  - `src/lib/adaptive-learning-engine.ts`
  - `tests/unit/lib/adaptive-learning-engine.test.ts`
- Scope:
  - Curate comprehensive skill node taxonomy mapping across the 4 domains and 14 mini-games.
  - Implement `calculateDdaMultiplier(recentAccuracy: number): number`.
  - Implement `evaluateStudentSkillProfile(attempts: Array<{ skillId: string; isCorrect: boolean }>): StudentDiagnosticProfile`.
  - Implement `estimateCefrLevel(overallScore: number): CefrLevel`.
  - Implement `generateAdaptiveDailyPlan(profile: StudentDiagnosticProfile): AdaptiveDailyPlan`.
  - Implement `generateClassDiagnosticSummary(profiles: StudentDiagnosticProfile[], classId: string, className: string): ClassDiagnosticSummary`.
- Verification: Vitest unit tests covering accuracy ranges, edge cases (no attempts, 100% accuracy, extreme low scores), and step sequencing.

### Task 3: Server Actions for Adaptive Learning
- Files:
  - `src/app/actions/adaptive-learning.ts`
  - `tests/unit/actions/adaptive-learning.test.ts`
- Scope:
  - `getStudentAdaptivePlanAction(studentId: string): Promise<ActionResponse<AdaptiveDailyPlan>>`.
  - `completeAdaptiveStepAction(studentId: string, stepNumber: number): Promise<ActionResponse<{ success: boolean; expGained: number }>>`.
  - `getClassDiagnosticHeatmapAction(classId: string): Promise<ActionResponse<ClassDiagnosticSummary>>`.
  - Mock resilient fallbacks for offline and unseeded classrooms.
- Verification: Vitest unit tests with mocked Supabase/session responses.

### Task 4: Student Adaptive Power Pack Component
- Files:
  - `src/components/student/adaptive/AdaptivePowerPack.tsx`
  - `tests/components/student/AdaptivePowerPack.test.tsx`
- Scope:
  - Interactive 3-step timeline card with progress gauge, step status indicators (Warm-up, Core Drill, Mastery Boss), and 1-click action buttons.
  - Strict $\ge 16$px typography (zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
  - Tactile micro-animations and celebratory badges.
- Verification: Vitest component tests verifying step progression, button clicks, and typography audit.

### Task 5: Teacher Diagnostic Skill Heatmap Component & Route
- Files:
  - `src/components/admin/diagnostics/ClassSkillHeatmap.tsx`
  - `src/app/admin/diagnostics/page.tsx`
  - `src/app/admin/layout.tsx` (add navigation link)
  - `tests/components/admin/ClassSkillHeatmap.test.tsx`
- Scope:
  - Class domain average radar cards.
  - Student skill matrix table with color-coded mastery cells (Green $\ge 80\%$, Yellow $50-79\%$, Red $< 50\%$).
  - Cohort categorization (Cần phụ đạo / Đạt chuẩn / Nâng cao).
  - Admin page route `/admin/diagnostics` with auth redirect protection.
- Verification: Vitest component tests verifying data rendering and tier filters.

### Task 6: Playwright E2E Tests
- Files:
  - `tests/e2e/adaptive-learning-paths.spec.ts`
- Scope:
  - Unauthenticated access to `/admin/diagnostics` redirects to `/login`.
  - Student adaptive hub renders 3-step cards.
  - Typography compliance audit on student and teacher diagnostic interfaces.
- Verification: Playwright test execution across all desktop and mobile targets.

### Task 7: Whole-Branch Quality Gate & PR Merge
- Steps:
  1. `npx tsc --noEmit` (0 errors).
  2. `npm run lint` (0 errors/warnings).
  3. `npm run test:run` (all tests passing).
  4. `npm run build` (Turbopack production build passing).
  5. Push branch `feat/phase-15-adaptive-diagnostic-learning-paths`.
  6. Create Pull Request and squash-merge into `main`.
  7. Switch to `main` and pull.
