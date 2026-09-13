// src/app/safari/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsSafariExperience } from '@/components/safari/PhonicsSafariExperience'

export const metadata: Metadata = {
  title: 'Thám Hiểm Safari Ngữ Âm & Bách Khoa Động Vật | GameHub Phonics Safari',
  description:
    'Tham gia chuyến thám hiểm Safari cùng Ranger Leo! Ngắm qua ống nhòm, giải mã âm vị tiếng Anh, chụp ảnh động vật hoang dã và lấp đầy Sổ tay Bách khoa.',
}

export default function PhonicsSafariPage() {
  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsSafariExperience />
    </main>
  )
}
