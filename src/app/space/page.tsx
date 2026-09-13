// src/app/space/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsSpaceExperience } from '@/components/space/PhonicsSpaceExperience'

export const metadata: Metadata = {
  title: 'Thám Hiểm Vũ Trụ Phonics & Khám Phá Hành Tinh | GameHub Space Odyssey',
  description:
    'Gia nhập phi hành đoàn cùng Chỉ huy Cosmo! Điều khiển tàu vũ trụ, giải mã tần số âm vị, hạ cánh robot thám hiểm và mở khóa Bách khoa Thiên văn.',
}

export default function PhonicsSpacePage() {
  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsSpaceExperience />
    </main>
  )
}
