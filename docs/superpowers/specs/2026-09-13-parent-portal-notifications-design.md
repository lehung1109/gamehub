# Technical Design Specification: Phase 10 — Parent Portal & Communication Hub

**Date:** 2026-09-13  
**Status:** Approved  
**Author:** Antigravity AI  

---

## 1. Executive Summary

Phase 10 of the autonomous GameHub master roadmap delivers the **Parent Portal & Communication Hub** (Cổng Thông Tin Phụ Huynh & Bảng Thông Báo Lớp Học). This feature bridges the home-school connection, empowering parents to track their child's English learning progress in real time without friction, while providing teachers with an elegant channel for class broadcasts, homework reminders, and learning digests.

### Key Capabilities:
1. **Frictionless Parent Access & Magic Links**:
   - Zero-password architecture: Parents access the portal via a secure Magic Link (`/parent/[token]`) or via PIN login at `/parent` using `classCode` + `studentName` + 6-digit `parentPin`.
   - Automatic session caching in browser storage (`gamehub_parent_session`).
2. **Child Progress & Learning Digest**:
   - Weekly & lifetime metrics: study time, game sessions, star collection, active streak with flame/ice freeze status.
   - Multi-skill competence radar: Vocabulary, Grammar, Pronunciation, Spelling, Tenses with clear Vietnamese labels (Xuất sắc, Thành thạo, Đang rèn luyện, Cần hỗ trợ).
   - Spaced Repetition (SRS) memory health: words safely stored in long-term memory vs. words needing practice.
   - Certificate & Badge Showcase: Direct preview and print access to awarded diplomas.
   - "Góc Phụ Huynh" (At-Home Learning Tips): Pedagogical tips automatically tailored to the child's weakest skill areas.
3. **Teacher-Parent Communication & Notice Board**:
   - Teachers broadcast announcements, weekly homework reminders, or student-specific kudos with priority flags (`normal`, `important`, `urgent`).
   - Parents can acknowledge receipt with 1-click ("Đã đọc & ghi nhận").
   - Teachers monitor read receipts and acknowledgment metrics per class.
4. **Teacher Parent Management Center**:
   - In `/admin/parents` and within Class Details: View roster of parent PINs, 1-click copy magic links, bulk export parent invite slips, and compose announcements.
5. **Strict Accessibility & Typography Standards**:
   - All text complies with $\ge 16$px font size policy (no `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`).
   - Full keyboard navigation and ARIA attributes.

---

## 2. Architecture & Data Flow

```
+---------------------------+                      +---------------------------+
|    Teacher Admin Panel    |                      |       Parent Portal       |
|  (/admin/parents or class)|                      | (/parent or /parent/[tok])|
+-------------+-------------+                      +-------------+-------------+
              |                                                  |
              | 1. Create Announcement / Manage PINs             | 4. Authenticate & View Child
              v                                                  v
+------------------------------------------------------------------------------+
|                          Supabase PostgreSQL Storage                         |
|  - student_parent_access (student_id, access_pin, access_token, phone, etc.)  |
|  - classroom_announcements (classroom_id, student_id, title, content, prio)  |
|  - announcement_acknowledgments (announcement_id, student_id, acknowledged_at)|
+------------------------------------------------------------------------------+
              |                                                  ^
              | 2. Fetch rosters & read receipts                 | 3. Query report & feed
              v                                                  |
+------------------------------------------------------------------------------+
|                         Pure Digest Engine & Actions                         |
|  - src/lib/parent/digest-generator.ts (weekly stats, tips, PIN generator)   |
|  - src/app/actions/parent.ts (verify, fetch dashboard, announce, ack)        |
+------------------------------------------------------------------------------+
```

---

## 3. Database Schema

### Table: `public.student_parent_access`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `student_id` UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE
- `classroom_id` UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE
- `access_pin` VARCHAR(8) NOT NULL
- `access_token` VARCHAR(64) NOT NULL UNIQUE
- `parent_phone` TEXT NULL
- `parent_name` TEXT NULL
- `last_accessed_at` TIMESTAMPTZ NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### Table: `public.classroom_announcements`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `classroom_id` UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE
- `teacher_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `student_id` UUID NULL REFERENCES public.students(id) ON DELETE CASCADE -- null = whole class
- `title` TEXT NOT NULL
- `content` TEXT NOT NULL
- `category` VARCHAR(32) NOT NULL DEFAULT 'announcement' -- 'announcement' | 'homework' | 'reminder' | 'kudos'
- `priority` VARCHAR(16) NOT NULL DEFAULT 'normal' -- 'normal' | 'important' | 'urgent'
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### Table: `public.announcement_acknowledgments`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `announcement_id` UUID NOT NULL REFERENCES public.classroom_announcements(id) ON DELETE CASCADE
- `student_id` UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE
- `parent_name` TEXT NULL
- `acknowledged_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- CONSTRAINT uq_announcement_student UNIQUE (announcement_id, student_id)

---

## 4. TypeScript Contracts (`src/types/parent.ts`)

```typescript
export type AnnouncementCategory = 'announcement' | 'homework' | 'reminder' | 'kudos'
export type AnnouncementPriority = 'normal' | 'important' | 'urgent'

export interface ParentAccessInfo {
  studentId: string
  studentName: string
  classroomId: string
  classroomName: string
  classCode: string
  accessPin: string
  accessToken: string
  parentPhone?: string | null
  parentName?: string | null
  lastAccessedAt?: string | null
}

export interface ClassroomAnnouncement {
  id: string
  classroomId: string
  teacherId: string
  studentId?: string | null
  title: string
  content: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  createdAt: string
  acknowledged?: boolean
  acknowledgedAt?: string | null
  acknowledgmentCount?: number
}

export interface WeeklyLearningDigest {
  totalMinutesSpent: number
  totalGamesPlayed: number
  starsEarnedThisWeek: number
  streakDays: number
  hasFreezeShield: boolean
  strongestSkill: { name: string; accuracyPercent: number }
  focusSkill: { name: string; accuracyPercent: number; suggestedActivity: string }
  recommendedHomeTips: string[]
}

export interface ParentDashboardData {
  student: {
    id: string
    name: string
    avatar?: string | null
    classroomId: string
    classroomName: string
    classCode: string
    teacherName: string
    level: number
    totalStars: number
    currentStreak: number
    longestStreak: number
  }
  digest: WeeklyLearningDigest
  skills: Array<{
    skillKey: string
    label: string
    accuracyPercent: number
    totalQuestions: number
    strengthRating: 'mastered' | 'proficient' | 'developing' | 'needs_practice'
  }>
  srsMetrics: {
    totalCards: number
    masteredCount: number
    masteryRatePercent: number
  }
  recentCertificates: Array<{
    id: string
    title: string
    certificateType: string
    issuedAt: string
    verificationCode: string
  }>
  announcements: ClassroomAnnouncement[]
}
```

---

## 5. Security & Verification

1. **Teacher RLS**:
   - Teachers can manage parent access and announcements only for classrooms they own (`teacher_id = auth.uid()`).
2. **Public Parent Verification**:
   - Parents read data securely through `createAdminClient()` strictly authenticated via matching `access_token` or `(classCode, studentName, access_pin)`.
3. **Rate Limiting & PIN Format**:
   - PINs are 6 alphanumeric characters avoiding ambiguous characters (`I, O, 0, 1`).
   - Random tokens are 32+ cryptographically random hex/base64 characters.
