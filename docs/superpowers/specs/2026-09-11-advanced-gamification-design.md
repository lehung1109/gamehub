# Sub-project 3 Design Specification: Advanced Gamification (Class Leaderboard & Persistent Badges)

## 1. Overview
Currently, GameHub supports student level progression (Levels 1 to 5) displayed as a passive badge in the navigation bar. However:
1. Students cannot see how they rank among their classmates in their current class (no Class Leaderboard).
2. There are no milestone achievement badges (e.g. "Bách phát bách trúng", "Nhà thám hiểm từ vựng", "Thám tử đại tài", "Chuyên gia công sở").
3. `StudentProfileBadge` is static and non-interactive, offering no detailed view of accomplishments.

This sub-project delivers an end-to-end Advanced Gamification system:
- **Server Action**: `getClassLeaderboard({ classCode, currentStudentName })` securely aggregates student scores and assigns rank positions.
- **Badge Engine**: `src/lib/badges.ts` defines 8 milestone achievements, criteria evaluators, and persistent localStorage sync.
- **Student Gamification Modal**: An interactive modal accessible by clicking `StudentProfileBadge` or via a quick-access button, presenting Leaderboard (with podium for Top 3), Badges Showcase (unlocked vs locked), and Level Roadmap.
- **Full Test Coverage**: Unit tests for server action, badges engine, component UI, and Playwright E2E tests.

---

## 2. Architecture & Data Flow

### 2.1 Server Action: `getClassLeaderboard`
File: `src/app/actions/class-leaderboard.ts`
- **Input**: `{ classCode: string, studentName?: string }`
- **Database Query**:
  1. Validates classroom by code and `is_active = true`.
  2. Queries all students in classroom with their `id`, `name`, `created_at`.
  3. Queries `game_sessions` belonging to these students: `student_id`, `score`, `game_type`, `created_at`.
  4. Aggregates per student:
     - `totalStars`: sum of positive session scores.
     - `sessionsCount`: total sessions completed.
     - `levelInfo`: derived from `calculateLevel(totalStars)`.
  5. Sorts students descending by `totalStars`, then `sessionsCount`, then `created_at`.
  6. Computes `rank` (1, 2, 3...) for each student.
  7. Identifies current student's rank and entry.
- **Output**:
  ```typescript
  export interface LeaderboardEntry {
    rank: number;
    studentId: string;
    studentName: string;
    totalStars: number;
    sessionsCount: number;
    level: number;
    levelBadge: string;
    levelTitle: string;
    isCurrentStudent: boolean;
  }

  export interface ClassLeaderboardResult {
    success: boolean;
    classroomName?: string;
    classCode?: string;
    entries: LeaderboardEntry[];
    currentStudentRank?: number | null;
    error?: string;
  }
  ```

### 2.2 Badges & Achievements Engine
File: `src/lib/badges.ts`
- **Badges Catalog**:
  1. `FIRST_STEP`: 👟 "Bước đầu tiên" - Hoàn thành lượt chơi đầu tiên.
  2. `VOCAB_EXPLORER`: 📚 "Nhà thám hiểm từ vựng" - Chơi từ 3 loại game từ vựng khác nhau.
  3. `SHARP_SHOOTER`: 🎯 "Bách phát bách trúng" - Đạt điểm tối đa (100%) trong một lượt chơi.
  4. `SPEED_DEMON`: ⌨️ "Tay gõ cừ khôi" - Hoàn thành thử thách gõ từ vựng.
  5. `DETECTIVE_MASTER`: 🕵️ "Thám tử đại tài" - Giải quyết thành công vụ án ngữ pháp.
  6. `WORKPLACE_PRO`: 💼 "Chuyên gia công sở" - Hoàn thành chặng học Parts of Speech.
  7. `SUPER_STAR`: ⭐ "Ngôi sao sáng" - Tích lũy đạt từ 50 sao trở lên.
  8. `CHAMPION`: 🏆 "Chiến binh bảng vàng" - Lọt vào Top 3 bảng xếp hạng lớp.

- **Persistence**: Stored in `localStorage` under `gamehub_student_badges_v1_${classCode}_${studentName}`.
- **Evaluation**: Evaluates unlocked status based on session statistics and current leaderboard standing.

### 2.3 UI Components
1. `src/components/student/StudentGamificationModal.tsx`:
   - Accessible via clicking `StudentProfileBadge`.
   - Accessible from Home banner or Class Join success.
   - Tabs:
     - 🏆 **Bảng xếp hạng lớp**: Podium for Top 3 students (🥇, 🥈, 🥉) with highlight for current student.
     - 🎖️ **Bộ sưu tập huy hiệu**: 8 achievement cards showing unlocked status, date unlocked, or progress criteria.
     - 🌟 **Hành trình cấp độ**: Visual roadmap of levels 1 to 5 with progress bars.
2. `src/components/StudentProfileBadge.tsx`:
   - Updated to be interactive with `role="button"`, keyboard accessibility (`Enter`/`Space`), hover glow, and onClick opening the Gamification Modal.

---

## 3. Testing Strategy
- **Unit Tests**:
  - `tests/unit/actions/class-leaderboard.test.ts`: Classroom validation, ranking, score aggregation, tie-breaking, current student highlighting.
  - `tests/unit/lib/badges.test.ts`: Evaluation of badge unlock criteria, persistence, and retrieval.
  - `tests/unit/components/student/StudentGamificationModal.test.tsx`: Tab switching, podium rendering, badge lock/unlock display.
- **E2E Playwright Tests**:
  - `tests/e2e/student-gamification.spec.ts`: Logging in as a class student, clicking profile badge, viewing leaderboard, inspecting achievements.
