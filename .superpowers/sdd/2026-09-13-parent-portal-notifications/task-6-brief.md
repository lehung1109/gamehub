# Task 6 Brief: Parent Portal Authentication & Mobile-Friendly Dashboard Views

## Requirements
- Files created:
  - `src/components/parent/ParentAuthForm.tsx` (PIN & Token login, form validation, error states).
  - `src/components/parent/WeeklyDigestCard.tsx` (4 stat cards, strongest & focus skill, home learning tips).
  - `src/components/parent/ParentNoticeBoard.tsx` (announcement list, category/priority badges, optimistic/async acknowledgment).
  - `src/components/parent/ParentDashboardView.tsx` (responsive child hero banner, quick jump navigation, digest, announcements, SRS metrics & skills, honor certificates).
  - `src/app/parent/page.tsx` (public landing page with pedagogical highlights and auth form).
  - `src/app/parent/[token]/page.tsx` (authenticated dashboard loader via `getParentStudentDashboardAction(cleanToken)`).
- Constraints:
  - Strict typography policy: NO sub-16px font sizes (`text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
  - Strict TypeScript 5 without `any`.
  - Comprehensive unit testing: `tests/unit/components/ParentDashboardView.test.tsx` verifying components and typography scanning.
