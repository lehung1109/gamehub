// src/app/timetravel/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsTimeExperience } from '@/components/time/PhonicsTimeExperience'

export const metadata: Metadata = {
  title: 'Cỗ Máy Thời Gian & Cuộc Du Hành Lịch Sử | GameHub Time Machine',
  description:
    'Đồng hành cùng Giáo Sư Chronos 🕰️ và hoa tiêu Mèo Pip 🐱! Du hành xuyên qua 4 thời kỳ lịch sử, ghép nối các mảnh rune ngữ âm và khôi phục 12 bảo vật cổ đại.',
}

export default function PhonicsTimePage() {
  return (
    <main className="min-h-screen bg-stone-950/5">
      <PhonicsTimeExperience />
    </main>
  )
}
