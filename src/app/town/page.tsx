// src/app/town/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsTownGrid } from '@/components/town/PhonicsTownGrid'

export const metadata: Metadata = {
  title: 'Thành Phố Ngữ Âm & Xây Dựng Thế Giới | GameHub Phonics Town',
  description:
    'Trở thành Thị trưởng Phonics Town! Xây dựng tiệm bánh, vườn thú, bệnh viện và trạm vũ trụ bằng gạch tích lũy, giao lưu cùng cư dân và hoàn thành nhiệm vụ từ vựng mỗi ngày.',
}

export default function PhonicsTownPage() {
  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsTownGrid />
    </main>
  )
}
