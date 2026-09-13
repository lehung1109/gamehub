// src/app/escape-room/[roomId]/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getAllEscapeRooms,
  getEscapeRoomById,
} from '@/lib/phonics-escape-room-engine'
import { EscapeRoomPlayer } from '@/components/escape-room/EscapeRoomPlayer'

interface EscapeRoomPageProps {
  params: Promise<{ roomId: string }>
}

export async function generateStaticParams() {
  const rooms = getAllEscapeRooms()
  return rooms.map((room) => ({
    roomId: room.id,
  }))
}

export async function generateMetadata({
  params,
}: EscapeRoomPageProps): Promise<Metadata> {
  const { roomId } = await params
  const room = getEscapeRoomById(roomId)

  if (!room) {
    return {
      title: 'Không tìm thấy phòng thoát hiểm | GameHub',
    }
  }

  return {
    title: `${room.titleVi} (${room.titleEn}) | Phonics Mystery Escape Room GameHub`,
    description: room.synopsisVi,
  }
}

export default async function EscapeRoomDetailPage({
  params,
}: EscapeRoomPageProps) {
  const { roomId } = await params
  const room = getEscapeRoomById(roomId)

  if (!room) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-950/5">
      <EscapeRoomPlayer room={room} />
    </main>
  )
}
