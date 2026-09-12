# Implementation Plan: Phase 5 — Student Progress Reports & Printable Certificates

**Specification:** `docs/superpowers/specs/2026-09-12-student-reports-certificates-design.md`  
**Branch:** `feat/student-progress-reports-certificates`  
**Framework:** Next.js 16 App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL  

---

## Tasks Overview

| Task | Title | Output |
| :--- | :--- | :--- |
| **Task 1** | Certificates DB Migration & TypeScript Definitions | `supabase/migrations/20260912200000_student_certificates.sql`, `src/types/reports.ts`, `src/types/certificates.ts`, `tests/unit/migrations/student-certificates-schema.test.ts` |
| **Task 2** | Reports & Certificate Generator Pure Engine | `src/lib/reports/generator.ts`, `tests/unit/lib/reports-generator.test.ts` |
| **Task 3** | Server Actions for Reports, Certificates & Verification | `src/app/actions/reports.ts`, `tests/unit/actions/reports.test.ts` |
| **Task 4** | Printable Certificate UI & Public Verification Page | `src/components/admin/reports/CertificatePreview.tsx`, `src/app/verify/certificate/[code]/page.tsx`, `tests/components/admin/CertificatePreview.test.tsx` |
| **Task 5** | Student Progress Report Card UI & Teacher Issuance Modal | `src/components/admin/reports/StudentReportCard.tsx`, `src/components/admin/reports/IssueCertificateModal.tsx`, `src/app/admin/classes/[classId]/reports/[studentId]/page.tsx`, `tests/components/admin/StudentReportCard.test.tsx` |
| **Task 6** | E2E Playwright Specs, Verification & Master Integration | `tests/e2e/student-reports-certificates.spec.ts`, full regression check, merge to `main`, push to `origin/main` |

---

### Task 1: Certificates DB Migration & TypeScript Definitions
**Files:**
- Create: `supabase/migrations/20260912200000_student_certificates.sql`
- Create: `src/types/certificates.ts`
- Create: `src/types/reports.ts`
- Modify: `src/types/database.ts`
- Create: `tests/unit/migrations/student-certificates-schema.test.ts`

- [ ] **Step 1: Write failing schema test for `student_certificates` table**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement migration SQL, TypeScript types, and database interfaces**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Reports & Certificate Generator Pure Engine
**Files:**
- Create: `src/lib/reports/generator.ts`
- Create: `tests/unit/lib/reports-generator.test.ts`

- [ ] **Step 1: Write failing unit tests for skill aggregation, citation generation, and teacher remarks**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/lib/reports/generator.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Server Actions for Reports, Certificates & Verification
**Files:**
- Create: `src/app/actions/reports.ts`
- Create: `tests/unit/actions/reports.test.ts`

- [ ] **Step 1: Write failing unit tests for `getStudentDetailedReportAction`, `issueStudentCertificateAction`, and `verifyCertificateAction`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `src/app/actions/reports.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Printable Certificate UI & Public Verification Page
**Files:**
- Create: `src/components/admin/reports/CertificatePreview.tsx`
- Create: `src/app/verify/certificate/[code]/page.tsx`
- Create: `tests/components/admin/CertificatePreview.test.tsx`

- [ ] **Step 1: Write failing component tests for certificate rendering, citations, and print styles**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `CertificatePreview.tsx` and `/verify/certificate/[code]`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Student Progress Report Card UI & Teacher Issuance Modal
**Files:**
- Create: `src/components/admin/reports/StudentReportCard.tsx`
- Create: `src/components/admin/reports/IssueCertificateModal.tsx`
- Create: `src/app/admin/classes/[classId]/reports/[studentId]/page.tsx`
- Modify: `src/components/admin/classes/StudentList.tsx` or class details page to add "Xem Báo Cáo / In Giấy Khen" button
- Create: `tests/components/admin/StudentReportCard.test.tsx`

- [ ] **Step 1: Write failing component tests for report card and issuance dialog**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement report card and issuance components**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: E2E Playwright Specs, Verification & Master Integration
**Files:**
- Create: `tests/e2e/student-reports-certificates.spec.ts`

- [ ] **Step 1: Write Playwright E2E tests for certificate verification route, report card display, and print trigger**
- [ ] **Step 2: Run full regression test suite (`npm run test:run`)**
- [ ] **Step 3: Run TypeScript (`npx tsc --noEmit`) and ESLint (`npm run lint`)**
- [ ] **Step 4: Commit and merge `feat/student-progress-reports-certificates` into `main`, push to `origin/main`**
