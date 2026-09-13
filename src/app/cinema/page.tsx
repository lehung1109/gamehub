// src/app/cinema/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { getAllEpisodes } from '@/lib/phonics-cinema-engine'
import { PhonicsCinemaHub } from '@/components/cinema/PhonicsCinemaHub'

export const metadata: Metadata = {
  title: 'Rạp Chiếu Phim Hoạt Hình Phonics Tương Tác | GameHub',
  description:
    'Thưởng thức các tập phim hoạt hình ngắn sinh động, tương tác giải đố ngữ âm phím kịch tính tại các điểm dừng và thu thập bắp rang bơ vàng!',
}

export default function PhonicsCinemaPage() {
  const episodes = getAllEpisodes()

  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsCinemaHub episodes={episodes} />
    </main>
  )
}
