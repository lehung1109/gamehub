// src/app/dino/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsDinoExperience } from '@/components/dino/PhonicsDinoExperience'

export const metadata: Metadata = {
  title: 'Vương Quốc Khủng Long & Khảo Cổ Tiền Sử | GameHub Dino Kingdom',
  description:
    'Đồng hành cùng Tiến Sĩ Rex 🦖 và robot trợ lý Chippy 🤖! Khai quật xương hóa thạch qua 4 kỷ nguyên địa chất, giải mã mảnh vỡ ngữ âm và phục sinh 12 loài khủng long huyền thoại.',
}

export default function PhonicsDinoPage() {
  return (
    <main className="min-h-screen bg-stone-950/5">
      <PhonicsDinoExperience />
    </main>
  )
}
