// src/app/escape-room/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { getAllEscapeRooms } from '@/lib/phonics-escape-room-engine'
import { PhonicsEscapeRoomHub } from '@/components/escape-room/PhonicsEscapeRoomHub'

export const metadata: Metadata = {
  title: 'Phòng Thoát Hiểm Bí Mật & Thám Tử Ngữ Âm | GameHub',
  description:
    'Hóa thân thành thám tử nhí, khám phá mật thất cổ đại và trạm không gian bí ẩn. Giải mã câu đố Phonics để mở khóa cửa thoát hiểm an toàn!',
}

export default function PhonicsEscapeRoomPage() {
  const rooms = getAllEscapeRooms()

  return (
    <main className="min-h-screen bg-slate-950/5">
      <PhonicsEscapeRoomHub rooms={rooms} />
    </main>
  )
}
