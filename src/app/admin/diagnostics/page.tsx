// src/app/admin/diagnostics/page.tsx

import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClassDiagnosticHeatmapAction } from '@/app/actions/adaptive-learning'
import { ClassSkillHeatmap } from '@/components/admin/diagnostics/ClassSkillHeatmap'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Chẩn Đoán Năng Lực & Phân Tuyến | GameHub Admin',
  description: 'Bản đồ năng lực học sinh 4 kỹ năng và đề xuất bài tập phân hóa thích ứng',
}

export default async function AdminDiagnosticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const res = await getClassDiagnosticHeatmapAction('class-demo', 'Lớp Tiếng Anh 3A')
  const summary = res.data || {
    classId: 'class-demo',
    className: 'Lớp Tiếng Anh 3A',
    studentCount: 0,
    domainAverages: { phonics: 70, vocabulary: 75, grammar: 70, listening: 72 },
    weakSkillFrequencies: [],
    studentRows: [],
  }

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6">
      <ClassSkillHeatmap summary={summary} />
    </div>
  )
}
