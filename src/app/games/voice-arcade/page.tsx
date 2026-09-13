// src/app/games/voice-arcade/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { getAllArcadeStages } from '@/lib/voice-arcade-engine'
import { VoiceArcadeHub } from '@/components/arcade/VoiceArcadeHub'

export const metadata: Metadata = {
  title: 'Khu Trò Chơi Giọng Nói - Phonics Voice Arcade | GameHub',
  description:
    'Thế giới trò chơi điều khiển bằng giọng nói độc đáo: Hô to từ vựng Phonics tiếng Anh để vượt chướng ngại vật, phóng tên lửa và bắn hạ thiên thạch!',
}

export default function VoiceArcadePage() {
  const stages = getAllArcadeStages()

  return (
    <main className="min-h-screen bg-slate-50/50">
      <VoiceArcadeHub stages={stages} />
    </main>
  )
}
