# Phase 16: Classroom Team Battles & Guild Tournaments Implementation Plan

## Overview
Implement Classroom Team Battle Mode for Live Arena, enabling teachers to divide classes into 2–4 mascot teams (Dragons, Eagles, Sharks, Tigers), calculate team combo bonuses, visualize live Tug-of-War power meters, and celebrate team victories and MVPs.

---

## Tasks

### Task 1: TypeScript Contracts & Team Battle Models
- Files:
  - `src/types/team-battle.ts`
  - `tests/unit/types/team-battle-types.test.ts`
- Scope:
  - Define `TeamId` (`'dragons' | 'eagles' | 'sharks' | 'tigers'`).
  - Define `TeamMascotConfig` (id, nameVi, mascotEmoji, primaryColorHex, bgGradientClass).
  - Define `TeamMember` (id, name, avatar, points, streak, isOnline).
  - Define `TeamState` (id, config, members, totalScore, rank, comboMultiplier).
  - Define `TeamRoundAnswerResult` (teamId, correctCount, totalMembers, accuracyPercentage, bonusApplied).
  - Define `TeamBattleSummary` (winningTeam, teamRankings, mvpList).
- Verification: Vitest unit tests verifying type consistency.

### Task 2: Team Balancing & Scoring Engine
- Files:
  - `src/lib/team-battle-engine.ts`
  - `tests/unit/lib/team-battle-engine.test.ts`
- Scope:
  - Curate `TEAM_CONFIGS` array for the 4 mascots.
  - Implement `autoAssignTeam(students: Array<{ id: string; name: string }>, activeTeamIds: TeamId[]): Map<TeamId, TeamMember[]>`.
  - Implement `calculateTeamComboBonus(correctCount: number, totalMembers: number): number`.
  - Implement `computeTeamRoundScore(answers: Array<{ studentId: string; teamId: TeamId; isCorrect: boolean; score: number }>, teams: Map<TeamId, TeamMember[]>): Map<TeamId, { pointsEarned: number; bonusRate: number }>`.
  - Implement `resolveTeamMvps(teams: Map<TeamId, TeamMember[]>): Array<{ teamId: TeamId; student: TeamMember }>`.
- Verification: Vitest unit tests covering round-robin balancing, 0% vs 50% vs 100% combo bonus rates, and MVP determination.

### Task 3: Server Actions for Team Battles
- Files:
  - `src/app/actions/team-battle.ts`
  - `tests/unit/actions/team-battle.test.ts`
- Scope:
  - `initTeamBattleSessionAction(arenaSessionId: string, teamCount: 2 | 4): Promise<ActionResponse<{ teams: TeamState[] }>>`.
  - `joinTeamAction(arenaSessionId: string, studentId: string, studentName: string, preferredTeamId?: TeamId): Promise<ActionResponse<{ assignedTeamId: TeamId }>>`.
  - `recordTeamAnswersAction(arenaSessionId: string, questionId: string, answers: Array<{ studentId: string; teamId: TeamId; score: number; isCorrect: boolean }>): Promise<ActionResponse<{ updatedTeams: TeamState[]; roundSummary: TeamRoundAnswerResult[] }>>`.
- Verification: Vitest unit tests for server actions.

### Task 4: Team Battle Big-Screen & Tug-of-War Component
- Files:
  - `src/components/arena/TeamBattleScreen.tsx`
  - `tests/components/arena/TeamBattleScreen.test.tsx`
- Scope:
  - Projector display showing team power bars (Tug-of-War layout for 2 teams, or Quad split for 4 teams).
  - Real-time score ticker, member counters, and rank badges.
  - Strict $\ge 16$px typography.
- Verification: Vitest component tests verifying rendering, progress bar calculations, and typography audit.

### Task 5: Team Selection & MVP Podium Component
- Files:
  - `src/components/arena/TeamPickerModal.tsx`
  - `src/components/arena/TeamPodiumModal.tsx`
  - `tests/components/arena/TeamPodiumModal.test.tsx`
- Scope:
  - `TeamPickerModal.tsx`: student modal to choose or view mascot assignment.
  - `TeamPodiumModal.tsx`: 1st/2nd/3rd place celebration with team trophies, confetti, and MVP spotlights.
  - Strict $\ge 16$px typography.
- Verification: Vitest component tests verifying winner display, MVP cards, and typography audit.

### Task 6: Playwright E2E Tests
- Files:
  - `tests/e2e/classroom-team-battles.spec.ts`
- Scope:
  - Verify team battle screens render without layout breakage.
  - Typography compliance audit ensuring zero forbidden small text classes.
- Verification: Playwright test execution across desktop and mobile.

### Task 7: Whole-Branch Quality Gate & PR Merge
- Steps:
  1. `npx tsc --noEmit` (0 errors).
  2. `npm run lint` (0 errors/warnings).
  3. `npm run test:run` (100% passing).
  4. `npm run build` (Turbopack production build passing).
  5. Push branch `feat/phase-16-classroom-team-battles`.
  6. Create Pull Request and squash-merge into `main`.
  7. Switch to `main` and pull.
