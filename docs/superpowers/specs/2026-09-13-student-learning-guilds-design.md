# Design Spec: Phase 19 - Student Learning Guilds & Cooperative Clan Quests (Bang Hội Học Tập & Đại Chiến Thử Thách Tuần)

**Date**: 2026-09-13  
**Status**: Approved (Autonomous Roadmap Execution)  
**Target Milestone**: Phase 19  

---

## 1. Overview & Pedagogical Value

While solo practice builds core literacy and 1v1 PvP creates competitive excitement, **cooperative social learning (Student Guilds / Clans)** fosters long-term intrinsic motivation, peer encouragement, and classroom camaraderie.

**Key Objectives of Phase 19**:
1. **Student Guilds System (`/guilds`)**: Students belong to themed learning clans (e.g. *Hiệp Sĩ Rồng Lửa*, *Biệt Đội Cú Thông Thái*, *Chiến Binh Cáo Nhanh Trí*) with mascots, banners, and member rosters.
2. **Weekly Cooperative Boss Raids (Đại Chiến Boss Vựng Tuần)**:
   - All XP earned by members from any GameHub activity (mini-games, comic stories, phonics chants, speaking) also attacks the weekly Guild Boss (e.g. *Rồng Ngữ Pháp*, *Khổng Lồ Từ Vựng*).
   - Defeating the Boss rewards every member with bonus trophies, gold, and clan badge flair.
3. **Encouraging Cheer Wall (Bức Tường Cổ Vũ Nhí)**:
   - Kid-friendly social interaction using pre-approved uplifting cheering stickers and messages (e.g. "Cùng cố lên nhé!", "Tớ vừa hạ 500 HP của Boss!", "Chúc bạn học tốt!").
   - Zero toxicity by design: only vetted supportive phrases and emojis.
4. **Classroom & Public Guilds**:
   - Easy 6-character clan code sharing (e.g. `DRAGON-99`, `OWL-101`) for quick student joining.
5. **Strict Kid-Friendly Typography**:
   - Minimum font size $\ge 16$px across all guild views (strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).

---

## 2. Core Architecture & Data Models

### 2.1 TypeScript Contracts (`src/types/guild.ts`)
```ts
export type GuildRole = 'leader' | 'officer' | 'member'
export type GuildMascot = 'fox' | 'dragon' | 'owl' | 'lion' | 'tiger'

export interface GuildMember {
  studentId: string
  studentName: string
  role: GuildRole
  avatar: string
  weeklyExpContributed: number
  totalExpContributed: number
  joinedAt: string
}

export interface GuildBossRaid {
  id: string
  bossName: string
  bossAvatar: string
  maxHp: number
  currentHp: number
  targetWeek: string
  rewardsExp: number
  isDefeated: boolean
}

export interface GuildCheerMessage {
  id: string
  senderName: string
  senderAvatar: string
  stickerKey: string
  messageVi: string
  createdAt: string
}

export interface StudentGuild {
  id: string
  name: string
  code: string
  description: string
  mascot: GuildMascot
  mascotAvatar: string
  bannerColor: string
  level: number
  currentExp: number
  weeklyQuestGoalExp: number
  currentWeeklyExp: number
  members: GuildMember[]
  activeBossRaid: GuildBossRaid
  cheerWall: GuildCheerMessage[]
}
```

### 2.2 Pure Engine Functions (`src/lib/guild-engine.ts`)
- `getAllGuilds()`: List all active guilds.
- `getGuildById(id: string)`: Retrieve a guild by unique ID.
- `getGuildByCode(code: string)`: Find guild by short invite code.
- `calculateGuildLevel(totalExp: number)`: Computes level (every 1,000 EXP = 1 level).
- `contributeExpToGuild(guild, studentId, exp)`: Updates member contribution, clan level progress, and applies HP damage to the weekly Boss Raid.
- `damageBossRaid(boss, expDamage)`: Clamps boss HP and triggers `isDefeated` when HP reaches 0.

---

## 3. Server Actions (`src/app/actions/guilds.ts`)
- `getAllGuildsAction()`: Returns list of available guilds.
- `getGuildDetailsAction(guildId: string)`: Returns detailed guild state with members, boss raid, and cheer messages.
- `joinGuildByCodeAction(studentId: string, studentName: string, code: string)`: Adds a student to the guild roster.
- `contributeGuildExpAction(guildId: string, studentId: string, exp: number)`: Updates guild XP and boss HP.
- `postGuildCheerAction(guildId: string, senderName: string, messageVi: string, stickerKey: string)`: Adds a cheer to the guild wall.

---

## 4. UI Components & Pages

1. **`src/components/guild/GuildHub.tsx`**:
   - Header with guild stats, search/filter bar, and "Nhập Mã Vào Bang" button.
   - Guild cards showcasing mascot, level, member count, and current weekly Boss progress.
2. **`src/components/guild/GuildDetailView.tsx`**:
   - Big Guild Banner with clan motto, level badge, and total XP progress.
   - **Weekly Boss Raid Arena card**: Boss portrait, animated HP bar, and "Tấn Công Boss Bằng Điểm Bài Học" button.
   - **Top Clan Contributors Leaderboard**: Weekly contribution ranking among clan members.
   - **Cheer Wall & Quick Cheer Bar**: Pre-selected friendly cheer buttons that immediately broadcast cheer stickers.
3. **`src/components/guild/JoinGuildModal.tsx`**:
   - Kid-friendly pop-up modal for entering 6-character clan codes.
4. **App Routes**:
   - `/guilds`: Main guild directory & hub.
   - `/guilds/[guildId]`: Guild headquarters view with SSG `generateStaticParams()`.

---

## 5. Strict Quality Gates
- Typography: $\ge 16$px (`text-base` minimum; zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- TypeScript 5: Zero `any`.
- Vitest: 100% test pass rate across types, engine, server actions, and React components.
- Playwright: E2E test verifying catalog navigation, opening guild details, damaging boss raid, posting cheer, and typography compliance.
