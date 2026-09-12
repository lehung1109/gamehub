# Technical Design Specification: Phase 5 — Student Progress Reports & Printable Certificates

**Date:** 2026-09-12  
**Status:** Approved  
**Author:** Antigravity AI  

---

## 1. Executive Summary

Phase 5 of the autonomous GameHub master roadmap introduces **Student Progress Reports & Printable Certificates** (Báo cáo Tiến độ Học tập & Giấy khen / Chứng chỉ Tự động). This feature bridges digital gamified practice with tangible academic recognition for students, teachers, and parents.

Key capabilities:
1. **Comprehensive Student Progress Report Cards**:
   - Detailed analytics per student: total stars, level, longest streak, total sessions, overall accuracy %.
   - Multi-skill breakdown: Vocabulary, Grammar, Pronunciation, Spelling, Tenses, Reading, Listening.
   - Spaced Repetition (SRS) mastery progress: distribution across Leitner boxes 1 to 5.
   - Automated pedagogical feedback with teacher override/remarks.
2. **High-Fidelity Printable Certificates & Diplomas**:
   - Premium A4 landscape certificate layout with ornate gold guilloche-style borders, official GameHub seal, ribbon insignia, dynamic student calligraphy, achievement citation, and teacher signature block.
   - 4 specialized award templates:
     - **Chiến Binh Từ Vựng (Vocabulary Master)**
     - **Ngôi Sao Chăm Chỉ (Streak & Persistence Hero)**
     - **Bậc Thầy Đấu Trường (Live Arena Victor)**
     - **Chứng Nhận Hoàn Thành Khóa Học (Course Completion & Excellence)**
   - Native browser 1-click printing (`window.print()`) with print CSS (`@media print`) that removes web navigation, sidebars, and buttons for clean PDF generation.
3. **Public Verification System**:
   - Unique tamper-resistant verification code (e.g. `GH-CERT-7X8K2M`) and route `/verify/certificate/[code]` for parents and administrators to verify certificate authenticity.
4. **Teacher Command Center & Student Modal Integration**:
   - Teachers can issue certificates individually or review class progress reports directly in `/admin/dashboard/classes/[id]`.
   - Students can view their earned certificates directly within the Student Profile modal and download/print them at home.

---

## 2. Architecture & Data Flow

```
+---------------------------+                      +---------------------------+
|    Teacher Admin Panel    |                      |   Student Profile / Web   |
| (/admin/classes/.../cert) |                      | (/verify/cert/[code])     |
+-------------+-------------+                      +-------------+-------------+
              |                                                  |
              | 1. Generate Report / Issue Certificate           | 4. Verify / View / Print
              v                                                  v
+------------------------------------------------------------------------------+
|                          Supabase PostgreSQL Storage                         |
|  - public.students, public.game_sessions, public.classrooms                  |
|  - public.student_certificates (verification_code, type, citation, note)     |
+------------------------------------------------------------------------------+
              |                                                  ^
              | 2. Fetch history, aggregate metrics              | 3. Query cert details
              v                                                  |
+------------------------------------------------------------------------------+
|                         Pure Reports Engine & Actions                        |
|  - src/lib/reports/generator.ts (skill breakdown, cert templates, remarks)   |
|  - src/app/actions/reports.ts (CRUD, aggregation, verification)              |
+------------------------------------------------------------------------------+
```

---

## 3. Database Schema Migration

### `supabase/migrations/20260912200000_student_certificates.sql`

```sql
CREATE TABLE IF NOT EXISTS public.student_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('vocab_master', 'streak_champion', 'arena_victor', 'course_completion', 'custom')),
  title TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  achievement_text TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  teacher_note TEXT,
  verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_certificates_student ON public.student_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_classroom ON public.student_certificates(classroom_id);
CREATE INDEX IF NOT EXISTS idx_student_certificates_code ON public.student_certificates(verification_code);

-- RLS
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

-- Teachers can manage certificates for their classrooms
CREATE POLICY "Teachers can manage certificates for their classrooms"
  ON public.student_certificates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = student_certificates.classroom_id
        AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classrooms c
      WHERE c.id = student_certificates.classroom_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Public can read certificates by verification code or for student verification
CREATE POLICY "Public can view valid certificates"
  ON public.student_certificates
  FOR SELECT
  TO public
  USING (true);
```

---

## 4. Typography & Print Design Rules
- Standard Tailwind utility classes (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`) must be used to comply with `tests/components/min-font-size-scan.test.ts`.
- The Certificate layout will use high-contrast borders and gold gradients with fallback colors for monochrome printer fidelity.
- `@media print` style overrides will ensure page breaks avoid cutting content and hide non-printable navigation bars.
