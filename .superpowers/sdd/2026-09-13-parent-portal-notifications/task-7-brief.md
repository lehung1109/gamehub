# Task 7 Brief: Teacher Admin Parent Management UI & Navigation Entry Points

## Requirements
- Files created/modified:
  - `src/components/admin/ParentAccessManager.tsx` (table of parent PINs, magic links, compose announcement modal, read receipt counters, delete action, regenerate PIN).
  - `src/components/admin/ParentsClientContainer.tsx` (classroom selector dropdown, wiring server actions for publishing, deleting, and PIN regenerating).
  - `src/app/admin/parents/page.tsx` (teacher admin page fetching classrooms and parent access data).
  - `src/app/admin/layout.tsx` (added "Phụ huynh" navigation link).
  - `src/app/admin/dashboard/page.tsx` (added "Quản lý Phụ huynh" quick access card).
  - `src/app/actions/parent.ts` (added `getClassAnnouncementsAction` with read receipt counters).
  - Unit tests: `tests/unit/components/ParentAccessManager.test.tsx` (5/5 passing).
- Constraints:
  - Strict typography policy: NO sub-16px font sizes (`text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`) in all new components.
  - Strict TypeScript 5 with zero `any`.
  - Next.js 15 async searchParams handling.
