# Implementation Plan: Phase 19 - Student Learning Guilds & Cooperative Clan Quests (Bang Hội Học Tập & Đại Chiến Thử Thách Tuần)

**Target Milestone**: Phase 19  
**Branch**: `feat/phase-19-student-learning-guilds`  
**Specification**: `docs/superpowers/specs/2026-09-13-student-learning-guilds-design.md`  

---

## Proposed Tasks

### Task 1: TypeScript Contracts & Data Models
- **Files**:
  - `src/types/guild.ts`
  - `tests/unit/types/guild-types.test.ts`
- **Details**:
  - Define `GuildRole`, `GuildMascot`, `GuildMember`, `GuildBossRaid`, `GuildCheerMessage`, `StudentGuild`.
  - Validate role assignments, member contributions, and boss health integrity.
- **Verification**: `npm run test:run tests/unit/types/guild-types.test.ts`

### Task 2: Starter Guilds & Pure Guild Engine
- **Files**:
  - `src/data/guilds/starter-guilds.ts`
  - `src/lib/guild-engine.ts`
  - `tests/unit/lib/guild-engine.test.ts`
- **Details**:
  - 3 pre-seeded active guilds (*Fire Dragons*, *Wise Owls*, *Swift Foxes*).
  - Pure functions: `getAllGuilds()`, `getGuildById()`, `getGuildByCode()`, `calculateGuildLevel()`, `contributeExpToGuild()`, `damageBossRaid()`.
- **Verification**: `npm run test:run tests/unit/lib/guild-engine.test.ts`

### Task 3: Server Actions for Guild Operations
- **Files**:
  - `src/app/actions/guilds.ts`
  - `tests/unit/actions/guilds.test.ts`
- **Details**:
  - `getAllGuildsAction()`
  - `getGuildDetailsAction(guildId: string)`
  - `joinGuildByCodeAction(studentId: string, studentName: string, code: string)`
  - `contributeGuildExpAction(guildId: string, studentId: string, exp: number)`
  - `postGuildCheerAction(guildId: string, senderName: string, messageVi: string, stickerKey: string)`
- **Verification**: `npm run test:run tests/unit/actions/guilds.test.ts`

### Task 4: Interactive Guild Detail View & Cheer Wall Components
- **Files**:
  - `src/components/guild/GuildDetailView.tsx`
  - `tests/components/guild/GuildDetailView.test.tsx`
- **Details**:
  - Big Guild Banner with level badge and clan mascot.
  - Weekly Boss Raid arena card with interactive HP depletion and reward preview.
  - Members contribution leaderboard.
  - Social Cheer Wall with pre-approved quick cheer buttons.
  - Strict kid-friendly typography ($\ge 16$px).
- **Verification**: `npm run test:run tests/components/guild/GuildDetailView.test.tsx`

### Task 5: Guild Hub, Join Modal & Page Routes
- **Files**:
  - `src/components/guild/JoinGuildModal.tsx`
  - `src/components/guild/GuildHub.tsx`
  - `src/app/guilds/page.tsx`
  - `src/app/guilds/[guildId]/page.tsx`
  - `tests/components/guild/GuildHub.test.tsx`
- **Details**:
  - Guild catalog with search, filter, and quick join modal.
  - App routes `/guilds` and dynamic SSG route `/guilds/[guildId]`.
  - Homepage top bar quick link integration.
- **Verification**: `npm run test:run tests/components/guild/GuildHub.test.tsx`

### Task 6: Playwright E2E Integration & Strict Typography Audit
- **Files**:
  - `tests/e2e/student-learning-guilds.spec.ts`
- **Details**:
  - Full flow: Visit `/guilds`, view guild card, open guild details, attack weekly boss, send cheer message, verify typography ($\ge 16$px).
- **Verification**: `npx playwright test tests/e2e/student-learning-guilds.spec.ts`

### Task 7: Whole-Branch Quality Gate, Pull Request & Merge
- **Commands**:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`
  - `git push -u origin feat/phase-19-student-learning-guilds`
  - `gh pr create` and `gh pr merge --squash --delete-branch`
  - `git checkout main; git pull origin main`
