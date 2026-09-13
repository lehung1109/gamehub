// src/app/admin/ai-copilot/page.tsx

import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AiClassroomCopilot } from '@/components/admin/ai/AiClassroomCopilot'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'AI Classroom Co-Pilot | GameHub Admin',
  description: 'Trợ lý AI đồng hành lớp học: Soạn đề Live Arena tức thì và kiến tạo giáo án can thiệp lỗi âm',
}

export default async function AdminAiCopilotPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6">
      <AiClassroomCopilot />
    </div>
  )
}
