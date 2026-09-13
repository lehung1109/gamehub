// src/app/guilds/page.tsx

import type { Metadata } from 'next'
import { getAllGuilds } from '@/lib/guild-engine'
import { GuildHub } from '@/components/guild/GuildHub'

export const metadata: Metadata = {
  title: 'Đại Sảnh Bang Hội Học Tập (Student Guilds) | GameHub Tiếng Anh',
  description:
    'Tham gia bang hội học tập, cùng bạn bè săn Boss từ vựng tuần, tích lũy điểm kinh nghiệm và vinh danh tinh thần đồng đội!',
}

export default function GuildsPage() {
  const guilds = getAllGuilds()

  return (
    <main className="min-h-screen bg-slate-50">
      <GuildHub guilds={guilds} />
    </main>
  )
}
