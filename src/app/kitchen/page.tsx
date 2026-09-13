// src/app/kitchen/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsKitchenExperience } from '@/components/kitchen/PhonicsKitchenExperience'

export const metadata: Metadata = {
  title: 'Bếp Trưởng Nhí Phonics & Học Viện Nấu Ăn Ngữ Âm | GameHub MasterChef',
  description:
    'Tham gia lớp học nấu ăn của Bếp trưởng Pierre! Chọn nguyên liệu ngữ âm, nấu nướng món ăn quốc tế và làm chủ 12 công thức ẩm thực MasterChef.',
}

export default function PhonicsKitchenPage() {
  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsKitchenExperience />
    </main>
  )
}
