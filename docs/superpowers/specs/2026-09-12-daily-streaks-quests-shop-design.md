# Technical Design Specification: Daily Streaks, Quests & Rewards Shop (Sub-project 7)

**Feature Branch**: `subproject-7-streaks-quests-shop`  
**Date**: 2026-09-12  
**Status**: Ready for Implementation  

---

## 1. Executive Summary & Objectives

GameHub has established a strong gamification foundation with **Stars**, **5-tier Levels**, and **Achievement Badges**. However, to turn casual plays into sticky daily learning habits, learners need continuous daily goals and immediate tangible incentives to spend their accumulated stars.

**Sub-project 7** builds a complete **Daily Habit & Rewards Ecosystem** (Gamification 2.0):
1. **Daily Streak Engine**: Tracks consecutive active learning days with streak freeze protection, animated flame badges, and milestone rewards (Day 3, 7, 14, 30).
2. **Dynamic Daily & Weekly Quests**: Date-deterministic quests generated each day and week (e.g. "Play 2 games", "Score >= 80%", "Complete a speaking or tenses practice") with star rewards.
3. **Rewards & Avatar Shop**: A storefront where students redeem their stars for unlockable avatar frames, custom titles, streak freezes, and victory celebration effects.
4. **Unified Student Profile & Game Tracking Integration**: Seamless hook into `useGameTracking`, updating streak and quest progress on every session completion with local + session storage persistence.

---

## 2. Architecture & Data Models

### 2.1 Daily Streak Engine (`src/types/streak.ts` & `src/lib/streak.ts`)

```typescript
export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  freezeCount: number;    // Available streak freezes
  totalActiveDays: number;
  unlockedMilestones: number[]; // e.g. [3, 7, 14, 30]
}

export interface StreakUpdateResult {
  nextState: StreakState;
  streakIncremented: boolean;
  freezeUsed: boolean;
  isNewDay: boolean;
  milestoneBonusStars: number;
  newMilestoneReached?: number;
}
```

#### Streak Calculation Rules:
- **Same Day (`today === lastActiveDate`)**: No streak change. `streakIncremented = false`.
- **Consecutive Day (`diffDays === 1`)**: `currentStreak += 1`, `totalActiveDays += 1`, `lastActiveDate = today`. If `currentStreak > longestStreak`, `longestStreak = currentStreak`. Milestone check triggered.
- **Missed 1 Day (`diffDays === 2`)**:
  - If `freezeCount > 0`: `freezeCount -= 1`, `freezeUsed = true`, `currentStreak += 1`, `totalActiveDays += 1`, `lastActiveDate = today`.
  - If `freezeCount === 0`: Streak reset to 1, `totalActiveDays += 1`, `lastActiveDate = today`.
- **Missed > 1 Day (`diffDays > 2`)**: Streak reset to 1, `totalActiveDays += 1`, `lastActiveDate = today`.
- **Milestones**: Day 3 (+5 stars), Day 7 (+15 stars), Day 14 (+30 stars), Day 30 (+100 stars).

---

### 2.2 Daily & Weekly Quests Engine (`src/types/quests.ts` & `src/lib/quests.ts`)

```typescript
export type QuestType = 'play_games' | 'perfect_score' | 'game_category' | 'earn_stars';

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: QuestType;
  target: number;
  current: number;
  rewardStars: number;
  rewardFreeze?: number;
  isCompleted: boolean;
  isClaimed: boolean;
  period: 'daily' | 'weekly';
  expiresAt: string; // ISO or date string
}

export interface QuestSessionInput {
  gameType: string;
  score: number;       // percentage 0-100
  starsEarned: number;
}
```

#### Generation Logic:
- Daily quests are deterministically generated from the current date string (`YYYY-MM-DD` hash or day of week):
  1. *Chăm chỉ mỗi ngày* (Play any 2 games) - Target: 2. Reward: 5 stars.
  2. *Điểm số xuất sắc* (Achieve score >= 80% in any game) - Target: 1. Reward: 10 stars.
  3. *Thử thách hôm nay* (Play a specific game/category for that day, e.g. pronunciation, vocab, grammar) - Target: 1. Reward: 10 stars.
- Weekly quest is generated from `YYYY-Www`:
  - *Chiến binh tuần lễ* (Complete 6 games throughout the week) - Target: 6. Reward: 35 stars + 1 Streak Freeze.

---

### 2.3 Rewards & Avatar Shop (`src/types/shop.ts` & `src/lib/shop.ts`)

```typescript
export type ShopCategory = 'frame' | 'title' | 'utility';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  cost: number;
  icon: string;
  cssClass?: string; // Special frame border or gradient
}

export interface StudentInventory {
  ownedItemIds: string[];
  equippedFrameId?: string;
  equippedTitleId?: string;
}
```

#### Catalog of Shop Items:
1. **Avatar Frames**:
   - `frame_gold`: "Khung Vàng Hoàng Gia" (Cost: 30 stars, icon: 👑)
   - `frame_neon`: "Khung Neon Tương Lai" (Cost: 40 stars, icon: ⚡)
   - `frame_fire`: "Khung Lửa Rực Cháy" (Cost: 50 stars, icon: 🔥)
   - `frame_rainbow`: "Khung Cầu Vồng Kỳ Diệu" (Cost: 60 stars, icon: 🌈)
   - `frame_galaxy`: "Khung Vũ Trụ Huyền Ảo" (Cost: 80 stars, icon: 🌌)
2. **Custom Titles**:
   - `title_speed`: "Thần Tốc Độ" (Cost: 20 stars, icon: ⚡)
   - `title_master`: "Bậc Thầy Tiếng Anh" (Cost: 35 stars, icon: 🎓)
   - `title_voice`: "Giọng Ca Vàng" (Cost: 35 stars, icon: 🎙️)
   - `title_legend`: "Huyền Thoại GameHub" (Cost: 75 stars, icon: 🌟)
3. **Utilities**:
   - `streak_freeze`: "Băng Bảo Vệ Chuỗi" (+1 Freeze) (Cost: 25 stars, icon: 🧊)

---

## 3. UI Component Specifications

### 3.1 `DailyStreakBadge.tsx`
- Displayed in the top bar header next to `StudentProfileBadge`.
- Shows flame icon with current streak count: `🔥 5 ngày`.
- If active today, vibrant orange flame with pulse animation; if not active today, subtle warm flame reminding the learner to play.
- Click opens a streak popover/modal detailing streak history, longest streak, and freezes remaining.

### 3.2 `StudentGamificationModal.tsx` Tab Extensions
Expand `StudentGamificationModal` tab list from 4 tabs to 6 tabs:
- `leaderboard` (Bảng xếp hạng)
- `badges` (Huy hiệu)
- `levels` (Cấp độ)
- `assignments` (Bài tập)
- `quests` (Nhiệm vụ 🎯 - showing active daily/weekly quests with claim buttons)
- `shop` (Cửa hàng 🛍️ - showing avatar frames, titles, streak freezes, and equip controls)

### 3.3 `StudentProfileBadge.tsx` & `StudentBadge.tsx` Frame & Title Rendering
- Renders `equippedFrameId` around the user avatar/emoji.
- Renders `equippedTitleId` next to or below student name.

---

## 4. Game Loop Integration

In `src/components/game/GameTrackingProvider.tsx` / `useGameTracking`:
- When `submitSession` or `recordSession` is invoked upon game completion:
  1. Call `updateStreak(today)` -> Returns streak increment, milestone bonuses.
  2. Call `updateQuestProgress({ gameType, score, starsEarned })` -> Updates quest targets.
  3. If quest completed or streak milestone hit, trigger celebratory feedback toast.

---

## 5. Persistence Strategy

- Keys:
  - `gamehub_streak_v1_${code}_${student}`: Stores `StreakState`.
  - `gamehub_quests_v1_${code}_${student}`: Stores `Quest[]`.
  - `gamehub_inventory_v1_${code}_${student}`: Stores `StudentInventory`.
- Anonymous / Guest support:
  - Supports `code = 'ANON'`, `student = 'anon'` seamlessly in `localStorage` so non-logged-in students also enjoy streaks, quests, and rewards!
- Dual fallback:
  - In-memory map fallback for SSR or restricted storage environments.

---

## 6. Testing & Quality Constraints
- Vitest unit tests for streak evaluation (`tests/lib/streak.test.ts`).
- Vitest unit tests for quests generator & progression (`tests/lib/quests.test.ts`).
- Vitest unit tests for shop purchases & equipping (`tests/lib/shop.test.ts`).
- React Testing Library unit tests for UI components (`DailyStreakBadge`, `QuestsTab`, `ShopTab`).
- Minimum Font Size >= 16px constraint strictly enforced.
- 0 TypeScript errors (`npx tsc --noEmit`), 0 ESLint errors (`npm run lint`).
