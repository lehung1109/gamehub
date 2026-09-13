// src/app/ocean/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsOceanExperience } from '@/components/ocean/PhonicsOceanExperience'

export const metadata: Metadata = {
  title: 'Thám Hiểm Đại Dương & Tàu Ngầm Ngữ Âm | GameHub Phonics Ocean Explorer',
  description:
    'Lặn sâu vào lòng biển cả cùng Thuyền trưởng Coral và Tàu ngầm Nautilus! Giải mã sóng âm sonar, khám phá 12 sinh vật biển độc đáo và sưu tầm ngọc trai đại dương.',
}

export default function PhonicsOceanPage() {
  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsOceanExperience />
    </main>
  )
}
