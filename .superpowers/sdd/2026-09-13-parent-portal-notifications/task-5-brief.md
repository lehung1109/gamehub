# Task 5 Brief: Server Actions for Teacher Parent Management & Announcements

## Objectives
- Implement teacher parent management server actions in `src/app/actions/parent.ts`:
  - `getClassParentsListAction(classroomId: string)`:
    - Verifies teacher authenticated access and classroom ownership.
    - Returns all students' parent access PINs and magic links.
    - Automatically provisions credentials (`generateParentPin()`, `generateParentAccessToken()`) for any student without an existing access record.
  - `createClassAnnouncementAction(input: CreateAnnouncementInput)`:
    - Verifies teacher authentication, classroom ownership, input validation.
    - Inserts into `classroom_announcements` with category, priority, and optional student targeting.
    - Revalidates paths.
  - `deleteClassAnnouncementAction(announcementId: string)`:
    - Verifies teacher ownership of the announcement.
    - Deletes record and cascades acknowledgments.
  - `regenerateStudentParentPinAction(studentId: string, classroomId: string)`:
    - Generates and upserts fresh PIN and token for a student.
- Unit tests: `tests/unit/actions/parent-management.test.ts` (100% passing, strictly typed mocks, no `any`).
- Clean `npx tsc --noEmit`.
