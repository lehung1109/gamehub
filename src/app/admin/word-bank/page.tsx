// src/app/admin/word-bank/page.tsx

import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getWordBankWordsAction } from '@/app/actions/word-bank'
import { WordBankList } from '@/components/admin/WordBankList'
import type { WordBankItem } from '@/types/word-bank'

export const dynamic = 'force-dynamic'

export default async function AdminWordBankPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await getWordBankWordsAction({ page: 1, pageSize: 50 })
  const words: WordBankItem[] = result.success && result.data ? result.data : []
  const totalCount = result.total || words.length

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Ngân hàng Từ vựng (Centralized Word Bank)
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý tập trung kho từ vựng chuẩn CEFR, phiên âm chuẩn IPA và tích hợp phát âm đa game
        </p>
      </div>

      <WordBankList
        initialWords={words}
        totalCount={totalCount}
        currentUserId={user?.id}
      />
    </div>
  )
}
