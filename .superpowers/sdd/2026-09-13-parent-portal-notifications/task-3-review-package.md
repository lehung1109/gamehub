# Task 3 Review Package

## Files Added / Modified
- `supabase/migrations/20260913120000_parent_portal_tables.sql` (created)
- `src/types/database.ts` (modified - added 3 tables + helper types)
- `scripts/append-database-types.mjs` (modified - added helper types)
- `tests/unit/migrations/parent-portal-schema.test.ts` (created)

## Migration SQL Highlights:
- Strict foreign key constraints with `ON DELETE CASCADE`.
- Unambiguous constraints: `CHECK (category IN ('announcement', 'homework', 'reminder', 'kudos'))`, `CHECK (priority IN ('normal', 'important', 'urgent'))`.
- `CONSTRAINT uq_announcement_student UNIQUE (announcement_id, student_id)`.
- RLS enabled on all 3 tables with subselected `(SELECT auth.uid())` policies.
- Full index coverage for all foreign keys and lookups (`token`, `pin`, `student_id`, `classroom_id`).

## Tests & Compilation
- `npx vitest run tests/unit/migrations/parent-portal-schema.test.ts` -> 4/4 passing.
- `npx tsc --noEmit` -> 0 errors.
