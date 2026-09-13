# Task 3 Brief: Supabase Migration & Database Custom Types

## Objectives
- Create Supabase migration `supabase/migrations/20260913120000_parent_portal_tables.sql`:
  - `public.student_parent_access` table with student cascade delete, unique student constraint, PIN, and token.
  - `public.classroom_announcements` table with classroom/teacher/student cascade deletes, category and priority check constraints.
  - `public.announcement_acknowledgments` table with cascade deletes and unique constraint on `(announcement_id, student_id)`.
  - Enable RLS on all three tables with teacher policies using `(SELECT auth.uid())` subselects for optimal execution performance.
  - Index all foreign keys, pins, and tokens.
- Update `scripts/append-database-types.mjs` and `src/types/database.ts` with table Row/Insert/Update definitions.
- Unit tests: `tests/unit/migrations/parent-portal-schema.test.ts` (100% passing).
- Clean `npx tsc --noEmit`.
