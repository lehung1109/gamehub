// src/app/admin/ai-generator/page.tsx

import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AiContentStudio } from '@/components/admin/AiContentStudio'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'AI Content Studio | GameHub Admin',
  description: 'Tự động tạo học liệu tiếng Anh chuẩn CEFR với AI và xuất trực tiếp sang mini-games',
}

export default async function AdminAiGeneratorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <AiContentStudio />
    </div>
  )
}
