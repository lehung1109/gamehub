// tests/unit/migrations/student-certificates-schema.test.ts

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import type { StudentCertificate } from '@/types/certificates'
import type { Database } from '@/types/database'

describe('student_certificates migration and TypeScript definitions', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20260912200000_student_certificates.sql'
  )

  it('migration file exists and contains table, indexes, constraints, and RLS policies', () => {
    expect(fs.existsSync(migrationPath)).toBe(true)
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Table creation
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.student_certificates')

    // Columns
    expect(sql).toContain('student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE')
    expect(sql).toContain('classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE')
    expect(sql).toContain('certificate_type TEXT NOT NULL')
    expect(sql).toContain("CHECK (certificate_type IN ('vocab_master', 'streak_champion', 'arena_victor', 'course_completion', 'custom'))")
    expect(sql).toContain('title TEXT NOT NULL')
    expect(sql).toContain('recipient_name TEXT NOT NULL')
    expect(sql).toContain('achievement_text TEXT NOT NULL')
    expect(sql).toContain('teacher_name TEXT NOT NULL')
    expect(sql).toContain('teacher_note TEXT')
    expect(sql).toContain('verification_code TEXT NOT NULL UNIQUE')
    expect(sql).toContain('issued_at TIMESTAMPTZ NOT NULL DEFAULT')

    // Indexes
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_student_certificates_student')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_student_certificates_classroom')
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_student_certificates_code')

    // RLS
    expect(sql).toContain('ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('CREATE POLICY "Teachers can manage certificates for their classrooms"')
    expect(sql).toContain('CREATE POLICY "Public can view valid certificates"')
  })

  it('types compile cleanly and match database schema', () => {
    const cert: StudentCertificate = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      studentId: '550e8400-e29b-41d4-a716-446655440001',
      classroomId: '550e8400-e29b-41d4-a716-446655440002',
      certificateType: 'vocab_master',
      title: 'Chiến Binh Từ Vựng',
      recipientName: 'Nguyễn Văn A',
      achievementText: 'Đạt thành tích xuất sắc 100 từ vựng',
      teacherName: 'Cô Linh',
      teacherNote: 'Học rất chăm chỉ',
      verificationCode: 'GH-CERT-ABC123',
      issuedAt: '2026-09-12T20:00:00Z',
      createdAt: '2026-09-12T20:00:00Z',
    }

    expect(cert.certificateType).toBe('vocab_master')
    expect(cert.verificationCode).toBe('GH-CERT-ABC123')

    type DBRow = Database['public']['Tables']['student_certificates']['Row']
    const dbRow: DBRow = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      classroom_id: '550e8400-e29b-41d4-a716-446655440002',
      certificate_type: 'streak_champion',
      title: 'Ngôi Sao Chăm Chỉ',
      recipient_name: 'Trần Thị B',
      achievement_text: 'Duy trì chuỗi học 14 ngày liên tiếp',
      teacher_name: 'Thầy Hưng',
      teacher_note: null,
      verification_code: 'GH-CERT-XYZ789',
      issued_at: '2026-09-12T20:00:00Z',
      created_at: '2026-09-12T20:00:00Z',
    }
    expect(dbRow.title).toBe('Ngôi Sao Chăm Chỉ')
  })
})
