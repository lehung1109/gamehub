# Sub-project 5 Design Specification: Homework & Assignment Management with Deadlines

## 1. Overview
Currently, GameHub supports free-play games and class tracking, but teachers cannot assign targeted homework with deadlines, and students cannot see which games they are required to complete.

This sub-project delivers an end-to-end Homework / Assignment Management system:
1. **Database Schema**: `assignments` table linking to `classrooms` with target scores, deadlines (`due_date`), game types, and topics.
2. **Teacher Server Actions**:
   - `createAssignment({ classroomId, title, gameType, topic, configId, targetScore, dueDate, description })`
   - `getClassAssignments(classroomId)`
   - `deleteAssignment(assignmentId)`
   - `getAssignmentProgress(assignmentId)`
3. **Student Server Action**:
   - `getStudentAssignments(classCode, studentName)`: returns active assignments with status (`completed` | `pending` | `overdue`), student's score, and direct link to play.
4. **Teacher UI**:
   - `AssignmentManager.tsx` embedded in `ClassOverview.tsx` allowing teachers to create, delete, and view completion stats for class assignments.
5. **Student UI**:
   - Dedicated "Bài tập về nhà" tab in `StudentGamificationModal.tsx` and quick access widget on the homepage for students logged into a class session.
6. **Full Test Coverage**: Unit tests for actions, UI components, and Playwright E2E tests.

---

## 2. Database & Data Model

### Migration: `supabase/migrations/20260911100000_assignments.sql`
```sql
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) <= 200),
  description text DEFAULT '',
  game_type text NOT NULL,
  topic text DEFAULT '',
  config_id text,
  target_score integer DEFAULT 0,
  due_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage assignments in their classrooms"
ON assignments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM classrooms c WHERE c.id = assignments.classroom_id AND c.teacher_id = auth.uid()
));

CREATE INDEX IF NOT EXISTS idx_assignments_classroom_id ON assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
```

---

## 3. Server Actions & Business Logic

### File: `src/app/actions/assignments.ts`
- **`createAssignment`**: Authenticates teacher, verifies classroom ownership, inserts assignment with validated due date.
- **`getClassAssignments`**: Returns list of assignments for classroom with count of completed students.
- **`deleteAssignment`**: Deletes or deactivates assignment if owned by teacher.
- **`getStudentAssignments`**:
  - Takes `{ classCode, studentName }`.
  - Queries active assignments for the class.
  - Queries student's `game_sessions` after `assignment.created_at`.
  - Determines completion: if any session matches `game_type` (and topic/config_id if set) with `score >= target_score`.
  - Evaluates status:
    - If completed: `status: 'completed'`
    - Else if `now() > due_date`: `status: 'overdue'`
    - Else: `status: 'pending'`

---

## 4. UI Components

1. **Teacher UI (`src/components/class/AssignmentManager.tsx`)**:
   - List of active & past assignments.
   - Modal / Form to create new assignment: Title, Game Type selector (19 games), Topic, Target Score, Due Date picker, Instructions.
   - Status indicators (e.g. 5/10 học sinh đã nộp).
   - Delete button with confirmation.

2. **Student UI (`src/components/student/StudentAssignmentsTab.tsx`)**:
   - Integrated into `StudentGamificationModal.tsx`.
   - Cards showing: Game icon, Title, Due date (e.g. "Hạn nộp: 23:59 15/09/2026 - Còn 2 ngày"), Target score.
   - Status badge: 🟢 Đã hoàn thành, 🟡 Đang làm, 🔴 Quá hạn.
   - "Làm bài ngay" button routing directly to `/games/[gameType]`.
