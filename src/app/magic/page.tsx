// src/app/magic/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { PhonicsMagicExperience } from '@/components/magic/PhonicsMagicExperience'

export const metadata: Metadata = {
  title: 'Học Viện Phép Thuật & Thần Chú Ngữ Âm | GameHub Magic Academy',
  description:
    'Gia nhập học viện phù thủy cùng Đại Pháp Sư Merlin và Cú Oliver! Niệm 12 đại thần chú nguyên tố, giải mã cổ tự ma thuật và mở khóa Sách Cổ Grimoire.',
}

export default function PhonicsMagicPage() {
  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsMagicExperience />
    </main>
  )
}
