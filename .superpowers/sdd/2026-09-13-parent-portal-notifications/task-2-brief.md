# Task 2 Brief: Pure Parent Digest & PIN Generation Engine

## Objectives
- Create pure utility functions in `src/lib/parent/digest-generator.ts`:
  - `generateParentPin(): string` (generates `P-XXXXXX` avoiding 0, O, 1, I, L)
  - `generateParentAccessToken(): string` (secure 32+ hex char token)
  - `computeWeeklyDigest(options): WeeklyLearningDigest` (aggregates sessions from past 7 days, calculates minutes, streak, freeze shields, identifies strongest and focus skills)
  - `generateHomeLearningTips(weakSkills): string[]` (Vietnamese pedagogical suggestions tailored to weakness areas)
- Comprehensive unit tests: `tests/unit/lib/parent-digest-generator.test.ts` (100% passing).
- Zero TypeScript errors (`npx tsc --noEmit`).
