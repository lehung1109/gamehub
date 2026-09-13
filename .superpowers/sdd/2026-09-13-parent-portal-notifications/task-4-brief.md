# Task 4 Brief: Server Actions for Parent Authentication, Dashboard Data & Acknowledgments

## Objectives
- Implement parent portal server actions in `src/app/actions/parent.ts`:
  - `verifyParentAccessAction(input: VerifyParentAccessInput)`:
    - Supports magic link token verification and credentials verification (classCode, studentName, PIN).
    - Updates `last_accessed_at` on successful verification.
  - `getParentStudentDashboardAction(token: string)`:
    - Queries student, classroom, and teacher.
    - Aggregates game sessions, gamification streak/stars, SRS metrics, certificates, and announcements.
    - Resolves read acknowledgment state for announcements.
  - `acknowledgeAnnouncementAction(announcementId: string, studentId: string, parentName?: string)`:
    - Upserts acknowledgment into `announcement_acknowledgments`.
- Unit tests: `tests/unit/actions/parent-portal.test.ts` (100% passing).
- Zero TypeScript errors (`npx tsc --noEmit`).
