// src/app/spelling-bee/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { getAllDivisions } from '@/lib/spelling-bee-engine'
import { SpellingBeeHub } from '@/components/spelling-bee/SpellingBeeHub'

export const metadata: Metadata = {
  title: 'Đấu Trường Đánh Vần Phonics Spelling Bee | GameHub',
  description:
    'Tham gia giải đấu đánh vần tiếng Anh Phonics Spelling Bee: Lắng nghe phát âm chuẩn bản xứ, nhận diện ngữ âm IPA và đoạt cúp vàng vô địch!',
}

export default function SpellingBeePage() {
  const divisions = getAllDivisions()

  return (
    <main className="min-h-screen bg-slate-50/60">
      <SpellingBeeHub divisions={divisions} />
    </main>
  )
}
