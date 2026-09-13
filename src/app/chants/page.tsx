// src/app/chants/page.tsx

import type { Metadata } from 'next'
import { getAllChants } from '@/lib/phonics-chant-engine'
import { ChantCatalog } from '@/components/chant/ChantCatalog'

export const metadata: Metadata = {
  title: 'Phòng Thu Vè Phonics & Karaoke Nhịp Điệu | GameHub Tiếng Anh',
  description:
    'Học phát âm phonics, nối âm và ngữ điệu tự nhiên qua các bài vè nhịp điệu (Jazz Chants) tương tác vui nhộn cho học sinh lớp 1-2.',
}

export default function ChantsPage() {
  const chants = getAllChants()

  return (
    <main className="min-h-screen bg-slate-50">
      <ChantCatalog chants={chants} />
    </main>
  )
}
